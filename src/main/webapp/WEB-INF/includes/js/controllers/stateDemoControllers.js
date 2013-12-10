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

stateDemoControllers.controller('WorkflowA', ['$scope', 
    function ($scope) {
        $scope.name = "The \"A\" Workflow!";
        $scope.description = "A wonderful workflow in which we make selections and demostrate the ability to store and restore state.";

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



stateDemoControllers.controller('ColorSelectionStep', ['$scope', 'StoredState', 'CommonState',
    StepController(
        {
            name: 'My name is: color selection',
            description: 'In this step, you can pick your favorite color'
        },
        function ($scope, StoredState) {
            $scope.form = {};
            $scope.$watch('form.favoriteColor', function(newValue, oldValue){
               if( (newValue !== oldValue) && (StoredState.favoriteColor !== newValue) ){
                   $scope.state.favoriteColor = newValue;
               } 
            });
            $scope.$watch('state.favoriteColor', function(newValue, oldValue){
                if($scope.form.favoriteColor !== newValue ){    
                    $scope.form.favoriteColor = newValue;
                }
            });
            $scope.colors = [
                'yellow',
                'blue'
            ];
            
            console.dir(StoredState);
        }
    )
]);
stateDemoControllers.controller('NumberSelectionStep', ['$scope', 'StoredState', 'CommonState',
    StepController(
        {
            name: 'My name is: number selection',
            description: 'In this step you can pick your very own favorite number'
        },
        function ($scope, StoredState, CommonState) {
            $scope.CommonState = CommonState;
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