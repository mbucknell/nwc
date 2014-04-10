/*global angular*/
if(typeof NWC === 'undefined'){
    NWC = {};
}
NWC.ControllerHelpers = {};
(function (ControllerHelpers) {
    /**
     * @param config
     *      @param config.name Human-facing workflow name
     *      @param config.description Human-facing workflow description
     *      @param {Function} customControllerFunction custom behavior
     * @returns controller function to be used in a call to <module>.controller()
     */
    ControllerHelpers.WorkflowController = function (config, customControllerFunction) {
        if (!config || !config.name || !config.description) {
            throw new Error("Mandatory Workflow variables not Defined.");
        }
        return function ($scope, StoredState) {
            $scope.name = config.name;
            $scope.description = config.description;
            if (config.disclaimer) {
                $scope.disclaimer = config.disclaimer;
            }

            customControllerFunction.apply({}, arguments);
        };
    };

    /**
     * 
     * @param config
     *  @param config.name the human-facing step name
     *  @param config.description the human-facing description
     * @param {Function} customControllerFunction
     * @returns controller function for use in a call to <module>.controller()
     */

    ControllerHelpers.StepController = function (config, customControllerFunction) {
        if (!config || !config.name || !config.description) {
            throw new Error("Mandatory Step variables not Defined.");
        }
        return function ($scope, StoredState) {
            $scope.name = config.name;
            $scope.description = config.description;
            $scope.state = StoredState;
            customControllerFunction.apply({}, arguments);
        };
    };

    
}(NWC.ControllerHelpers));
