/*global angular,OpenLayers,CONFIG*/
(function () {
    var waterBudgetMap = angular.module('nwc.waterBudgetMap', []);
    waterBudgetMap.factory('WaterBudgetMap', [ 'StoredState', 'CommonState', '$state',
       function(StoredState, CommonState, $state){
           var privateMap;
    
        var initMap = function () {
            var mapLayers = [];
            var WGS84_GOOGLE_MERCATOR = new OpenLayers.Projection("EPSG:900913");
            var EPSG900913Options = {
                sphericalMercator: true,
                layers: "0",
                isBaseLayer: true,
                projection: WGS84_GOOGLE_MERCATOR,
                units: "m",
                buffer: 3,
                transitionEffect: 'resize',
                wrapDateLine: false
            };
            // ////////////////////////////////////////////// BASE LAYERS
            var zyx = '/MapServer/tile/${z}/${y}/${x}';
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Light Gray Base",
                    "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base" + zyx,
                    Object.merge(EPSG900913Options, {numZoomLevels: 14})
                    ));
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Topo Map",
                    "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map" + zyx,
                    {isBaseLayer: true,
                        units: "m"
                    }));
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Imagery",
                    "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery" + zyx,
                    {isBaseLayer: true,
                        units: "m"
                    }));
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Street Map",
                    "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map" + zyx,
                    {isBaseLayer: true,
                        units: "m"
                    }));
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Terrain Base",
                    "http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief" + zyx,
                    Object.merge(EPSG900913Options, {numZoomLevels: 14})
                    ));
            var workflowLayerOptions = {
                opacity: 0.6,
                displayInLayerSwitcher: false,
                visibility: true,
                isBaseLayer: false,
                tiled: true
            };

            var hucLayer = new OpenLayers.Layer.WMS("National WBD Snapshot",
                    CONFIG.endpoint.geoserver + 'gwc/service/wms',
                    {
                        layers: 'NHDPlusHUCs:NationalWBDSnapshot',
                        transparent: true,
                        styles: ['polygon']
                    },
            workflowLayerOptions
                    );
            mapLayers.push(hucLayer);
            var controls = [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.MousePosition({
                    prefix: 'POS: '
                }),
                new OpenLayers.Control.ScaleLine({
                    geodesic: true
                }),
                new OpenLayers.Control.LayerSwitcher({
                    roundedCorner: true
                }),
                new OpenLayers.Control.Zoom()
            ];
            var extent = new OpenLayers.Bounds(-146.0698, 19.1647, -42.9301, 52.8949).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));

            var map = new OpenLayers.Map({
                layers: mapLayers,
                restrictedExtent: extent,
                projection: WGS84_GOOGLE_MERCATOR,
                controls: controls
            });
            
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
                        StoredState.hucId = actualFeatures[0].attributes.HUC_12;
                        $state.go('workflow.waterBudget.plotData');
                    }
                    else {
                        CommonState.ambiguousHucs = actualFeatures;
                        $state.go('workflow.waterBudget.disambiguateClick');
                    }


                };
                hucsGetFeatureInfoControl.events.register("getfeatureinfo", {}, featureInfoHandler);
                map.addControl(hucsGetFeatureInfoControl);
            
            
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