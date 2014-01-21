/*global angular,OpenLayers,CONFIG*/
(function () {
    var waterBudgetMap = angular.module('nwc.map.waterBudget', []);
    waterBudgetMap.factory('WaterBudgetMap', [ 'StoredState', 'CommonState', '$state', 'BaseMap', 'DataSeries',
       function(StoredState, CommonState, $state, BaseMap, DataSeries){
           var privateMap;
    
        var initMap = function () {
            var mapLayers = [];
            var controls = [];
            var hucLayer = new OpenLayers.Layer.WMS("National WBD Snapshot",
                    CONFIG.endpoint.geoserver + 'gwc/service/wms',
                    {
                        layers: 'NHDPlusHUCs:NationalWBDSnapshot',
                        transparent: true,
                        styles: ['polygon']
                    },
            BaseMap.getWorkflowLayerOptions()
                    );
            mapLayers.push(hucLayer);
            
            
            
            var hucsGetFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
                    title: 'huc-identify-control',
                    hover: false,
                    layers: [
                        hucLayer
                    ],
                    queryVisible: true,
                    output: 'object',
                    drillDown: true,
                    infoFormat: 'application/vnd.ogc.gml',
                    vendorParams: {
                        radius: 5
                    },
                    id: 'hucs',
                    autoActivate: true
                });
                
                
                var featureInfoHandler = function (responseObject) {
                    //for some reason the real features are inside an array
                    var actualFeatures = responseObject.features[0].features;
                    var hucCount = actualFeatures.length;
                    if (0 === hucCount) {
                        //nothing
                    }
                    else if (1 === hucCount) {
                        StoredState.huc = actualFeatures[0];
                        StoredState.hucId = actualFeatures[0].attributes.HUC_12;
                        CommonState.WaterUsageDataSeries = DataSeries.new();
                        $state.go('workflow.waterBudget.plotData');
                    }
                    else {
                        CommonState.ambiguousHucs = actualFeatures;
                        $state.go('workflow.waterBudget.disambiguateClick');
                    }


                };
                hucsGetFeatureInfoControl.events.register("getfeatureinfo", {}, featureInfoHandler);
                controls.push(hucsGetFeatureInfoControl);
                
                var map = BaseMap.new({
                    layers: mapLayers,
                    controls: controls
                });
            
            
            ///map object methods
            
            //convenience accessor
            var getHucLayer = function () {
                return hucLayer;
            };
            
            /**
             * @param {Openlayers.Geometry} geometry The geom of the huc that will be 
             * used to search for intersections with the counties layer
             * @returns {Openlayers.Layer.Vector} the vector layer containing the 
             * intersecting counties
             */
            var addCountiesThatIntersectWith = function (geometry) {
                console.debug('Adding Filtered Counties WFS layer based on HUC geometry');
                var intersectionFilter = new OpenLayers.Filter.Spatial({
                    type: OpenLayers.Filter.Spatial.INTERSECTS,
                    property: 'the_geom',
                    value: geometry
                });
                var intersectingCountiesLayer = new OpenLayers.Layer.Vector(
                        'Historical Counties',
                        {
                            opacity: 0.6,
                            displayInLayerSwitcher: false,
                            strategies: [new OpenLayers.Strategy.BBOX()],
                            styleMap: new OpenLayers.StyleMap({
                                strokeWidth: 3,
                                strokeColor: '#333333',
                                fillColor: '#FF9900',
                                fillOpacity: 0.4,
                                //Display County Name
                                label: '${NAME}',
                                fontSize: '2em',
                                fontWeight: 'bold',
                                labelOutlineColor: "white",
                                labelOutlineWidth: 1,
                                labelAlign: 'cm',
                                cursor: 'pointer'
                            }),
                            filter: intersectionFilter,
                            projection: new OpenLayers.Projection("EPSG:4326"),
                            protocol: new OpenLayers.Protocol.WFS({
                                version: '1.0.0',
                                url: CONFIG.endpoint.geoserver + 'ows',
                                featureType: "US_Historical_Counties",
                                featureNS: 'http://cida.usgs.gov/nwc',
                                geometryName: 'the_geom',
                                srsName: 'EPSG:900913'
                            })
                        }
                );
                intersectingCountiesLayer.id = 'counties-feature-layer';
                map.addLayer(intersectingCountiesLayer);
                var countiesExtent = intersectingCountiesLayer.getExtent();
                map.zoomToExtent(countiesExtent);
                return intersectingCountiesLayer;
            };
            /**
             * @param {OpenLayers.Feature.Vector} feature
             * @returns {Openlayers.Layer.Vector} the vector layer added to the map.
             */
            var addHighlightedFeature = function (feature) {
                var highlightedLayer = new OpenLayers.Layer.Vector(
                        'Highlighted HUC',
                        {
                            displayInLayerSwitcher: false,
                            isBaseLayer: false,
                            opacity: 0.6,
                            projection: new OpenLayers.Projection("EPSG:900913"),
                            style: {
                                fillColor: '#00FF00'
                            }
                        }
                );
                highlightedLayer.addFeatures([feature]);

                highlightedLayer.id = 'highlighted-layer';
                map.addLayer(highlightedLayer);
                return highlightedLayer;
            };
            var addCountySelectControl = function (options) {
                var selectionLayer = options.selectionLayer;
                var layersToRemove = [selectionLayer];
                layersToRemove.push(options.highlightedLayer);
                var hucControl = hucsGetFeatureInfoControl;
                var control = new OpenLayers.Control.SelectFeature(
                        selectionLayer,
                        {
                            onSelect: function (feature) {
                                map.removeControl(control);
                                hucControl.activate();
                                layersToRemove.each(function (layer) {
                                    map.removeLayer(layer);
                                });
                                options.countySelectedCallback(feature);
                            }
                        }
                );

                hucControl.deactivate();
                map.addControl(control);
                control.activate();
            };
            
            /**
             * @param {Openlayers.Feature.Vector} hucFeature The huc that a user has selected.
             * @param {Function} countySelectedCallback The callback fired once a user 
             * has selected a representative county for water use. The callback's only 
             * parameter is a Openlayers.Feature.Vector for the county the user selected.
             */
            var getCountyThatIntersectsWithHucFeature = function (hucFeature, countySelectedCallback) {
                var highlightedFeatureLayer = addHighlightedFeature(hucFeature);
                var intersectingCountiesLayer = addCountiesThatIntersectWith(hucFeature.geometry);
                addCountySelectControl(
                        {
                            highlightedLayer: highlightedFeatureLayer,
                            selectionLayer: intersectingCountiesLayer,
                            countySelectedCallback: countySelectedCallback
                        }
                );
            };
            
            map.getHucLayer = getHucLayer;
            map.getCountyThatIntersectsWithHucFeature = getCountyThatIntersectsWithHucFeature;
            map.addCountySelectControl = addCountySelectControl;
            map.addHighlightedFeature = addHighlightedFeature;
            
            //stash it in a closure var
            privateMap = map;
            privateMap.getCountyThatIntersectsWithHucFeature = getCountyThatIntersectsWithHucFeature;
            return privateMap;
        };
        var getMap = function () {
            if (!privateMap) {
                initMap();
            }
            return privateMap;
        };
        return {
            initMap: initMap,
            getMap: getMap
        };
       } 
    ]);
    
}());
