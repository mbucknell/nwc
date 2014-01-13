/*global angular,OpenLayers,CONFIG*/
(function () {
    var aquaticBiologyMap = angular.module('nwc.map.aquaticBiology', []);
    aquaticBiologyMap.factory('AquaticBiologyMap', ['StoredState', 'CommonState', '$state', 'BaseMap', '$log',
        function (StoredState, CommonState, $state, BaseMap, $log) {
            var privateMap;

            var initMap = function () {
                var mapLayers = [];
                var initialControls = [];
                var bioDataSitesLayer = new OpenLayers.Layer.WMS(
                        "BioData Sites",
                        CONFIG.endpoint.geoserver + 'wms',
                        {
                            layers: 'BioData:SiteInfo',
                            transparent: true
                        },
                        BaseMap.getWorkflowLayerOptions()
                        );
                bioDataSitesLayer.id = 'biodata-sites-feature-layer';
                mapLayers.push(bioDataSitesLayer);
                
                var waterCensusToolbar = new OpenLayers.Control.WaterCensusToolbar({}, new OpenLayers.Control.BioSitesSelectionTool());
                initialControls.push(waterCensusToolbar);
                                var bioDataGetFeatureControl = new OpenLayers.Control.GetFeature({
                    protocol: new OpenLayers.Protocol.WFS({
                        version: "1.1.0",
                        url: CONFIG.endpoint.geoserver + 'wfs',
                        featureType: 'SiteInfo',
                        featureNS: 'gov.usgs.biodata.aquatic',
                        srsName: 'EPSG:900913'
                    }),
                    box: true,
                    id: 'bioDataSites'
                });
                initialControls.push(bioDataGetFeatureControl);
                bioDataGetFeatureControl.events.register('featuresselected', {}, function (e) {
                    CommonState.aquaticBiologySites = e.features;
                    $log.info(CommonState);
                });
                
                var map = BaseMap.new({
                    layers: mapLayers,
                    controls: initialControls
                });

                //stash it in a closure var
                privateMap = map;
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