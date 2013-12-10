/*global angular*/
(function(){
    var stateDemoControllers = angular.module('nwcui.controllers', []);
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



stateDemoControllers.controller('SelectHuc', ['$scope', 'StoredState', 'CommonState',
    StepController(
        {
            name: 'HUC Selection',
            description: 'Find your Hydrologic Unit of interest.'
        },
        function ($scope, StoredState) {
            
            console.dir(StoredState);
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
            //<mocking huc objects>
            CommonState.ambiguousHucs = [
                {
                    id: 42,
                    name: 'Best HUC',
                    area: 423556
                },
                {
                    id: 2,
                    name: 'Better HUC',
                    area: 496
                },
                {
                    id: 4,
                    name: 'My very own long-named HUC',
                    area: 1.9878
                }
            ];
            //</mocking huc objects>
            
            $scope.hucs = CommonState.ambiguousHucs;
            
            //your list of huc objects is in CommonState.ambiguousHucs
            
            //@todo bind CommonState.ambiguousHucs and scope
            
            //@todo bind StoredState.hucId to scope's hucId            
            console.dir(StoredState);
        }
    )
]);

stateDemoControllers.controller('FinalStep', ['$scope', 'StoredState', '$state',
    StepController(
        {
            name: 'Final Step',
            description: "You're all done!"
        },
        function ($scope, StoredState, $state) {
            StoredState._clientState.name = $state.current.name;
            StoredState._clientState.params = $state.params;
            console.dir(StoredState);
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