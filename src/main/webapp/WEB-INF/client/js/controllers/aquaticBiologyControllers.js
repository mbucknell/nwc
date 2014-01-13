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
    aquaticBiologyControllers.controller('SelectBioDataSite', [ '$scope', 'StoredState', 'AquaticBiologyMap',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Aquatic Biology Site Selection Map',
                description: 'Via the map interface, explore aquatic biology sites across the nation and select them to pursue further investigation in BioData'
            },
            function($scope, StoredState, AquaticBiologyMap){
            
                var map = AquaticBiologyMap.getMap();
                map.render('bioSiteSelectMap');
                map.zoomToExtent(map.restrictedExtent, true);
                
            }
        )
    ]);
}());
