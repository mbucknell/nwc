/*global angular,OpenLayers,CONFIG*/
(function () {
    var aquaticBiologyMap = angular.module('nwc.map.aquaticBiology', []);
    aquaticBiologyMap.factory('AquaticBiologyMap', ['StoredState', 'CommonState', '$state', 'BaseMap', '$log',
        function (StoredState, CommonState, $state, BaseMap, $log) {
            var privateMap;

            var initMap = function () {
                var mapLayers = [];
                var initialControls = [];
                
                // ///////////////////////////////////////// BIODATA SITES
                var bioDataSitesLayer = new OpenLayers.Layer.WMS(
                        "BioData Sites",
                        CONFIG.endpoint.geoserver + 'wms',
                        {
                            layers: 'BioData:SiteInfo',
                            transparent: true
                        },
                        BaseMap.getWorkflowLayerOptions()
                );

                // WATERSMART-398 - Due to page shifting on load, the streamgage locations shift and the 
                // click event doesn't seem to line up with where the gages actually are. Updating the map's size
                // after the layer loads fixes the issue
                bioDataSitesLayer.events.register('loadend', {}, function(event) {
                    event.object.map.updateSize();
                });
				
                bioDataSitesLayer.id = 'biodata-sites-feature-layer';
                mapLayers.push(bioDataSitesLayer);
                
                // ////////////////////////////////////////////// GAGES
                var gageFeatureLayer = new OpenLayers.Layer.WMS(
                        "Gage Location",
                        CONFIG.endpoint.geoserver + 'NWC/wms',
                        {
                            LAYERS: "NWC:gagesII",
                            STYLES: 'blue_circle',
                            format: 'image/png',
                            transparent: true,
                            tiled: true
                        },
                {
                    isBaseLayer: false,
                    displayInLayerSwitcher: false,
                    visibility: CommonState.activatedStreamflowTypes.nwis
                });
                gageFeatureLayer.id = 'gage-feature-layer';
                
                // ////////////////////////////////////////////// SE HUC12 BASINS
                var hucLayerOptions = BaseMap.getWorkflowLayerOptions();
                hucLayerOptions.visibility = CommonState.activatedStreamflowTypes.sehuc12;
                var hucLayer = new OpenLayers.Layer.WMS("National WBD Snapshot",
                        CONFIG.endpoint.geoserver + 'gwc/service/wms',
                        {
                            layers: 'NWC:huc12_SE_Basins_v2',
                            transparent: true,
                            styles: ['polygon']
                        },
                hucLayerOptions
                        );
                hucLayer.id = 'hucs';
                
                // ////////////////////////////////////////////// FLOWLINES
                var flowlinesData = new OpenLayers.Layer.FlowlinesData(
                        "Flowline WMS (Data)",
                        CONFIG.endpoint.geoserver + 'gwc/service/wms'
                );
                flowlinesData.id = 'nhd-flowlines-data-layer';

                var flowlineRaster = new OpenLayers.Layer.FlowlinesRaster({
                    name: "NHD Flowlines",
                    dataLayer: flowlinesData,
                    streamOrderClipValue: 0,
                    displayInLayerSwitcher: false
                });
                flowlineRaster.id = 'nhd-flowlines-raster-layer';
                
                mapLayers.push(flowlinesData);
                mapLayers.push(flowlineRaster);
                mapLayers.push(gageFeatureLayer);
                mapLayers.push(hucLayer);
                
//                var waterCensusToolbar = new OpenLayers.Control.WaterCensusToolbar({}, new OpenLayers.Control.BioSitesSelectionTool());
//                initialControls.push(waterCensusToolbar);
                initialControls.push(new OpenLayers.Control.Navigation({
                    id: 'nwc-navigation'
                }));
                initialControls.push(new OpenLayers.Control.ZoomBox({
                    id: 'nwc-zoom'
                }));
                

                var biodataProtocol  = new OpenLayers.Protocol.WFS({
                    version: "1.1.0",
                    url: CONFIG.endpoint.geoserver + 'wfs',
                    featureType: 'SiteInfo',
                    featureNS: 'http://cida.usgs.gov/BioData',
                    srsName: 'EPSG:900913'
                });
                
                var gageProtocol = OpenLayers.Protocol.WFS.fromWMSLayer(gageFeatureLayer, {
                    url : CONFIG.endpoint.geoserver + "wfs",
                    srsName : "EPSG:3857",
                    propertyNames: ["STAID","STANAME","CLASS","AGGECOREGI",
                        "DRAIN_SQKM","HUC02","LAT_GAGE","LNG_GAGE","STATE",
                        "HCDN_2009","ACTIVE09","FLYRS1900","FLYRS1950","FLYRS1990"]
                });
                
                var hucProtocol = OpenLayers.Protocol.WFS.fromWMSLayer(hucLayer, {
                    url : CONFIG.endpoint.geoserver + "wfs",
                    srsName : "EPSG:3857",
                    //TODO! I really don't like this. I'd like to only ask for what I need at this moment, but
                    //this is given to the next step of the workflow, so it relys on this...
                    propertyNames : ["OBJECTID","HUC12","mi2","DRAIN_SQKM",
                        "SLOPE_PCT","RFACT","SILTAVE","ROCKDEPAVE","PPTAVG_BAS",
                        "PLANTNLCD0","HUC4","Outlet_X","Outlet_Y","Centroid_X",
                        "Centroid_Y","Shape_Leng","Shape_Area","site_no","HU_12_NAME"]
                });
                
                //TODO create a subclass of protocol
                //set up protocols based on map layer selections
                var joinedProtocol = new (function(protocols) {
                    this.protocols = protocols;
                    this.read = function(request) {
                        console.log("read joined called");
                        this.protocols.each(function(el) {
                            console.log("Calling read");
                            el.read(request);
                        });
                    };
                    this.abort = function(abortParam) {
                        console.log("abort joined called");
                        this.protocols.each(function(el) {
                            console.log("Calling abort");
                            el.abort(abortParam);
                        });
                    };
                })([gageProtocol, hucProtocol, biodataProtocol]);
                

                var featuresSelected = function (e) {
                	console.log(e);
                	//TODO This gets called 3 times if all three layers find features,
                	//if any of hte features does not find a feature, I only get 2 calls.
                	
                	//Wait for all 3 calls to return, then move onto next state.
//                    //reset user selections to 0
//                    StoredState.selectedAquaticBiologySites = [];
//                    
//                    //let user pick between sites in the dragged box
//                    StoredState.aquaticBiologySites = e.features;
//                    $state.go('workflow.aquaticBiology.showSelectedBioDataSites');
//                    $log.info(CommonState);
                };
                
                var bioDataGetFeatureControl = new OpenLayers.Control.GetFeature({
                    id: 'nwc-biodata-sites',
                    protocol: joinedProtocol,
                    box: true
                });
                initialControls.push(bioDataGetFeatureControl);
                bioDataGetFeatureControl.events.register('featuresselected', {}, featuresSelected);
                
                var map = BaseMap.new({
                    layers: mapLayers,
                    controls: initialControls
                });
                
                map.events.register(
                        'zoomend',
                        map,
                        function () {
                            var zoom = map.zoom;
                            $log.info('Current map zoom: ' + zoom);
                            flowlineRaster.updateFromClipValue(flowlineRaster.getClipValueForZoom(zoom));
                        },
                        true
                );
                
                flowlineRaster.setStreamOrderClipValues(map.getNumZoomLevels());
                flowlineRaster.updateFromClipValue(flowlineRaster.getClipValueForZoom(map.zoom));

                //stash it in a closure var
                privateMap = map;
                return privateMap;
            };
            var getMap = function () {
                if (!privateMap || !privateMap.viewPortDiv.parentNode) {
                    initMap();
                }
                return privateMap;
            };
            
            var toggleSiteType = function(siteTypeObject) {
                var nwisTypeActive = siteTypeObject.nwis;
                var sehuc12TypeActive = siteTypeObject.sehuc12;
                var gageLayer = privateMap.getLayersByName('Gage Location')[0];
                var hucLayer = privateMap.getLayersByName('National WBD Snapshot')[0];
                
                gageLayer.setVisibility(nwisTypeActive);
                hucLayer.setVisibility(sehuc12TypeActive);
            };
            
            return {
                initMap: initMap,
                getMap: getMap,
                toggleSiteType : toggleSiteType
            };
        }
    ]);

}());
