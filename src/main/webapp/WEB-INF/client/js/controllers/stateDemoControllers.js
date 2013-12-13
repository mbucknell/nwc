/*global angular*/
(function(){
    var stateDemoControllers = angular.module('nwc.controllers', []);
    /**
     * @param config
     *      @param config.name Human-facing workflow name
     *      @param config.description Human-facing workflow description
     *      @param {Function} customControllerFunction custom behavior
     * @returns controller function to be used in a call to <module>.controller()
     */
    var WorkflowController = function(config, customControllerFunction){
        if(!config || !config.name || !config.description){
            throw new Error("Mandatory Step variables not Defined.");
        }
        return function($scope, sharedState){
            $scope.name = config.name;
            $scope.description = config.description;

            customControllerFunction.apply(arguments);
        };
    };

stateDemoControllers.controller('WaterBudget', ['$scope', 
    function ($scope) {
        $scope.name = "Water Budget";
        $scope.description = "Retrieve water data comprising all components of a water budget.";
    }
]);

/**
 * 
 * @param config
 *  @param config.name the human-facing step name
 *  @param config.description the human-facing description
 * @param {Function} customControllerFunction
 * @returns controller function for use in a call to <module>.controller()
 */

var StepController = function(config, customControllerFunction){
    if(!config || !config.name || !config.description){
        throw new Error("Mandatory Step variables not Defined.");
    }
    return function($scope, StoredState){
      $scope.name = config.name;
      $scope.description = config.description;
      $scope.state = StoredState;
      customControllerFunction.apply({}, arguments);
  };
};

stateDemoControllers.controller('PlotData', ['$scope', 'StoredState', 'CommonState',
    StepController(
        {
            name: 'Plot Water Budget Data',
            description: 'Visualize the data for your HUC of interest.'
        },
        function ($scope, StoredState, CommonState) {
            $scope.CommonState = CommonState;
        })
]);

stateDemoControllers.controller('SelectHuc', ['$scope', 'StoredState', 'CommonState',
    StepController(
        {
            name: 'HUC Selection',
            description: 'Find your Hydrologic Unit of interest.'
        },
        function ($scope, StoredState, CommonState) {
            $scope.StoredState = StoredState;
            $scope.CommonState = CommonState;
            
            var config = {};
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
                        isBaseLayer : false
                    };

            var hucLayer = new OpenLayers.Layer.WMS("National WBD Snapshot",
                    CONFIG.endpoint.geoserver + 'wms',
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

stateDemoControllers.controller('DisambiguateClick', ['$scope', 'StoredState', 'CommonState',
    StepController(
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

stateDemoControllers.controller('FinalStep', ['$scope', 'StoredState', '$state', 'CommonState',
    StepController(
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

stateDemoControllers.controller('Restore', [
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