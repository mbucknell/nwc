/*global angular,OpenLayers,CONFIG*/
(function () {
    var streamflowMap = angular.module('nwc.map.streamflow', []);
    streamflowMap.factory('StreamflowMap', ['StoredState', 'CommonState', '$state', 'BaseMap', '$log',
        function (StoredState, CommonState, $state, BaseMap, $log) {
            var map;
            
            var streamOrderClipValue = 0,
            streamOrderTable = new Array(21),
            streamOrderSlider = undefined,
            streamOrderLock = true,
            streamOrderClipValues = undefined;

            var getClipValueForZoom = function (zoom) {
                return streamOrderClipValues[zoom];
            };
            var setClipValueForZoom = function (zoom, value) {
                if (streamOrderLock === true) {
                    var zoomIndex;
                    for (zoomIndex = 0; zoomIndex < streamOrderTable.length; ++zoomIndex) {
                        if (zoomIndex < zoom) {
                            if (streamOrderTable[zoomIndex].getValue() < value) {
                                streamOrderTable[zoomIndex].setValue(value);
                            }
                        } else if (zoomIndex > zoom) {
                            if (streamOrderTable[zoomIndex].getValue() > value) {
                                streamOrderTable[zoomIndex].setValue(value);
                            }
                        } else {
                            streamOrderTable[zoomIndex].setValue(value);
                        }
                    }
                } else {
                    streamOrderTable[zoom].setValue(value);
                }
            };
            var updateFromClipValue = function (val) {
                this.streamOrderClipValue = val;
                var layerIdx;
                for (layerIdx = 0; layerIdx < map.layers.length; layerIdx++) {
                    var mapLayer = map.layers[layerIdx];
                    if (typeof mapLayer.updateFromClipValue === 'function') {
                        mapLayer.updateFromClipValue(val);
                    }
                }
            };
            
            
            var initMap = function () {
                var mapLayers = [];
                var initialControls = [];
                
                // ////////////////////////////////////////////// FLOWLINES
                var flowlinesData = new OpenLayers.Layer.FlowlinesData(
                        "Flowline WMS (Data)",
                        CONFIG.endpoint.geoserver + 'gwc/service/wms'
                        );
                flowlinesData.id = 'nhd-flowlines-data-layer';

                var flowlineRaster = new OpenLayers.Layer.FlowlinesRaster({
                    name: "NHD Flowlines",
                    dataLayer: flowlinesData,
                    streamOrderClipValue: streamOrderClipValue,
                    displayInLayerSwitcher: false
                });
                flowlineRaster.id = 'nhd-flowlines-raster-layer';

                // ////////////////////////////////////////////// GAGES
                var gageFeatureLayer = new OpenLayers.Layer.WMS(
                    "Gage Location",
                    CONFIG.endpoint.geoserver + 'NWC/wms',
                    {
                        LAYERS: 'NWC:gagesII',
                        STYLES: '',
                        format: 'image/png',
                        tiled: true
                    },
                    {
                        isBaseLayer: false,
                        displayInLayerSwitcher: false
                    }
                );

                gageFeatureLayer.id = 'gage-feature-layer';

                var gageData = new OpenLayers.Layer.GageData(
                    "Gage WMS (Data)",
                    CONFIG.endpoint.geoserver + 'wms'
                );
                gageData.id = 'gage-location-data';

                mapLayers.push(gageData);
                mapLayers.push(gageFeatureLayer);

                mapLayers.push(flowlinesData);
                mapLayers.push(flowlineRaster);   
                
                var waterCensusToolbar = new OpenLayers.Control.WaterCensusToolbar({});
                initialControls.push(waterCensusToolbar);
                
                var wmsGetFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
                    title: 'gage-identify-control',
                    hover: false,
                    autoActivate: true,
                    layers: [
                        gageFeatureLayer
                    ],
                    queryVisible: true,
                    output: 'object',
                    drillDown: true,
                    infoFormat: 'application/vnd.ogc.gml',
                    vendorParams: {
                        radius: 5
                    }
                });

                //removes the 'geometry' property of the OpenLayers features so that
                //the features will be serializable
                var stripGeometryProperty = function (realFeature) {
                    return Object.reject(realFeature, 'geometry');
                };
                
                var wmsGetFeatureInfoHandler = function(responseObject){
                    if(responseObject.features && responseObject.features.length){
                        //OpenLayers stores the actual features in a weird spot of the response
                        if(responseObject.features[0].features && responseObject.features[0].features.length){
                            var realFeatures = responseObject.features[0].features;
                            realFeatures = realFeatures.map(stripGeometryProperty);
                            CommonState.ambiguousGages = realFeatures;
                            $state.go('workflow.streamflowStatistics.disambiguateGages');
                        }
                    }
                };
                
                wmsGetFeatureInfoControl.events.register("getfeatureinfo", {}, wmsGetFeatureInfoHandler);
                initialControls.push(wmsGetFeatureInfoControl);
                
                
                map = BaseMap.new({
                    layers: mapLayers,
                    controls: initialControls
                });
                
                var clipCount = 7;
                var zoomLevels = map.getNumZoomLevels();
                streamOrderClipValues = new Array(zoomLevels);
                var tableLength = streamOrderClipValues.length;
                var cInd;
                for (cInd = 0; cInd < tableLength; cInd++) {
                    streamOrderClipValues[cInd] = Math.ceil((tableLength - cInd) * (clipCount / tableLength));
                }
                
                map.events.register(
                        'zoomend',
                        map,
                        function () {
                            var zoom = map.zoom;
                            $log.info('Current map zoom: ' + zoom);
                            updateFromClipValue(getClipValueForZoom(zoom));
                        },
                        true
                );

                var mapZoomForExtent = map.getZoomForExtent(map.restrictedExtent);
                map.setCenter(map.restrictedExtent.getCenterLonLat(), mapZoomForExtent);
                updateFromClipValue(streamOrderClipValues[map.zoom]);

                
                return map;
            };
            var getMap = function () {
                if (!map) {
                    initMap();
                }
                return map;
            };
            return {
                initMap: initMap,
                getMap: getMap
            };
        }
    ]);

}());