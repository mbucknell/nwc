/*global angular*/
(function () {
    var aquaticBiologyControllers = angular.module('nwc.controllers.aquaticBiology', []);
    aquaticBiologyControllers.controller('AquaticBiology', [ '$scope', 'StoredState',
        NWC.ControllerHelpers.WorkflowController(
            {
                name: 'Aquatic Biology',
                description: 'Explore aquatic biology sites across the nation.'
            },
            function($scope, StoredState){
                
            }
        )
    ]);
    aquaticBiologyControllers.controller('SelectBioDataSite', [ '$scope', 'StoredState',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Aquatic Biology',
                description: 'Via the map interface, explore aquatic biology sites across the nation and select them to pursue further investigation in BioData'
            },
            function($scope, StoredState){
                
            }
        )
    ]);
}());
