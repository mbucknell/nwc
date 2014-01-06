/*global angular,NWC,OpenLayers,$,CONFIG*/
(function(){
    var waterBudgetControllers = angular.module('nwc.controllers.waterBudget', []);
    
    waterBudgetControllers.controller('WaterBudget', ['$scope',
        function ($scope) {
            $scope.name = "Water Budget";
            $scope.description = "Retrieve water data comprising all components of a water budget.";
        }
    ]);
waterBudgetControllers.controller('PlotData', ['$scope', 'StoredState', 'CommonState', 'WaterBudgetPlot',
    NWC.ControllerHelpers.StepController(
        {
            name: 'Plot Water Budget Data',
            description: 'Visualize the data for your HUC of interest.'
        },
        function ($scope, StoredState, CommonState, WaterBudgetPlot) {
            var plotDivSelector = '#waterBudgetPlot';
            var legendDivSelector = '#waterBudgetLegend';
            $scope.plotType = StoredState.plotType || 'daily';
            $scope.$watch('plotType', function(newValue, oldValue){
               plotData(newValue);
            });
            /**
             * {String} category the category of data to plot (daily or monthly)
             */
            var plotData = function(category){
                var values = CommonState.DataSeriesStore[category].data;
                var labels = CommonState.DataSeriesStore[category].metadata.seriesLabels;
                WaterBudgetPlot.setPlot(plotDivSelector, legendDivSelector, values, labels);
            };
            //boolean property is cheaper to watch than deep object comparison
            $scope.$watch('CommonState.newDataSeriesStore', function(newValue, oldValue){
                if(newValue){
                    CommonState.newDataSeriesStore = false;
                    plotData($scope.plotType);
                }
            });
            $scope.CommonState = CommonState;
        })
]);

waterBudgetControllers.controller('SelectHuc', ['$scope', 'StoredState', 'CommonState',
    NWC.ControllerHelpers.StepController(
        {
            name: 'HUC Selection',
            description: 'Find your Hydrologic Unit of interest.'
        },
        function ($scope, StoredState, CommonState) {
            $scope.StoredState = StoredState;
            $scope.CommonState = CommonState;
            
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
                    {isBaseLayer: true, units: "m"}));
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Imagery",
                    "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery" + zyx,
                    {isBaseLayer: true, units: "m"}));
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Street Map",
                    "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map" + zyx,
                    {isBaseLayer: true, units: "m"}));
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Terrain Base",
                    "http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief" + zyx,
                    Object.merge(EPSG900913Options, {numZoomLevels: 14})
                    ));
            var workflowLayerOptions = {
                        opacity: 0.6,
                        displayInLayerSwitcher: false,
                        visibility: true,
                        isBaseLayer : false,
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

            var map = new OpenLayers.Map('hucSelectMap', {
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
            var featureInfoHandler = function(responseObject){
            //for some reason the real features are inside an array
                var actualFeatures = responseObject.features[0].features;
                var hucCount = actualFeatures.length;
                if(0 === hucCount){
                    //nothing
                }
                else if(1 === hucCount){
                    StoredState.hucId = actualFeatures[0].attributes.HUC_12;
                    $('#goToNonAmbiguousClick').click();
                }
                else{
                    CommonState.ambiguousHucs = actualFeatures;
                    $('#goToDisabiguateClick').click();
                }


            };
            hucsGetFeatureInfoControl.events.register("getfeatureinfo", {}, featureInfoHandler);
            map.addControl(hucsGetFeatureInfoControl);

            map.zoomToExtent(extent, true);
        
        
        
            
            
            console.dir(CommonState);
        }
    )
]);

waterBudgetControllers.controller('DisambiguateClick', ['$scope', 'StoredState', 'CommonState',
    NWC.ControllerHelpers.StepController(
        {
            name: 'HUC Disambiguation',
            description: 'Your click fell near multiple HUCs. Select one from the list to continue.'
        },
        function ($scope, StoredState, CommonState) {             
            $scope.hucs = CommonState.ambiguousHucs;
            
			$scope.setHuck = function(huc) {
				StoredState.hucId = huc.attributes.HUC_12;
			};
			
            console.dir(StoredState);
        }
    )
]);

waterBudgetControllers.controller('FinalStep', ['$scope', 'StoredState', '$state', 'CommonState',
    NWC.ControllerHelpers.StepController(
        {
            name: 'Final Step',
            description: "You're all done!"
        },
        function ($scope, StoredState, $state, CommonState) {
            StoredState._clientState.name = $state.current.name;
            StoredState._clientState.params = $state.params;
            
            
            console.dir(CommonState);
        }
    )
]);

waterBudgetControllers.controller('Restore', [
            '$scope',  'StoredState',  '$state',   '$timeout', '$http',    '$modal',
    function($scope,    StoredState,    $state,     $timeout,   $http,      $modal){
        $scope.stateId = $state.params.stateId;
        var retrieveState = function(){
            $http.get('../../misc/' + $scope.stateId + '.json')
                    .success(function(data){
                        Object.merge(StoredState, data);
                        $state.go(StoredState._clientState.name, StoredState._clientState.params);
                    })
                    .error(function(){
                        $modal.open({
                            template: 'Error Retrieving State'
                        });
                    });
        };
        $timeout(retrieveState, 3000);
        
    }
]);
}());
