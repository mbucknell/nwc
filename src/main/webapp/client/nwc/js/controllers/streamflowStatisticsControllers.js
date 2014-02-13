/*global angular*/
(function () {
    var streamflowStatistics = angular.module('nwc.controllers.streamflowStatistics', ['nwc.streamStats', 'nwc.wps']);
    streamflowStatistics.controller('StreamflowStatistics', [ '$scope', 'StoredState',
        NWC.ControllerHelpers.WorkflowController(
            {
                name: 'Streamflow Statstics',
                description: 'Retrieve streamflow statistics for streams and gages across the nation'
            },
            function($scope, StoredState){
                
            }
        )
    ]);
    streamflowStatistics.controller('SelectGages', ['$scope', 'StoredState', 'CommonState', 'StoredState', 'StreamflowMap',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Select Stream Gage',
                description: 'Select a gage to retrieve its statistics.'
            },
            function ($scope, StoredState, CommonState, StoredState, StreamflowMap) {
                $scope.CommonState = CommonState;
                $scope.StoredState = StoredState;
                var mapId = 'gageSelectMap';
                var map = StreamflowMap.getMap();
                map.render(mapId);
                map.zoomToExtent(map.restrictedExtent, true);
            }
        )
    ]);
    streamflowStatistics.controller('DisambiguateGages', ['$scope', 'StoredState', 'CommonState', 'StoredState', '$state',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Disambiguate Stream Gages',
                description: 'Your selection landed near multiple gages. Select one of the following gages to proceed.'
            },
            function ($scope, StoredState, CommonState, StoredState, $state) {
                $scope.CommonState = CommonState;
                $scope.StoredState = StoredState;
                $scope.gages = CommonState.ambiguousGages;
                $scope.affirmGage = function(gage){
                    StoredState.gage = gage;
                    $state.go('^.displayGageStatistics');
                };
            }
        )
    ]);
    streamflowStatistics.controller('DisplayGageStatistics', ['$scope', 'StoredState', 'CommonState', 'StoredState', '$state', 'StreamStats',
        NWC.ControllerHelpers.StepController(
            {
                name: 'View Gage Statistics',
                description: 'Visualize and export the statistics for this gage.'
            },
            function ($scope, StoredState, CommonState, StoredState, $state, StreamStats) {
                $scope.CommonState = CommonState;
                $scope.StoredState = StoredState;
                
                if(!StoredState.gage){
                    $state.go('^.selectGage');
                }
            }
        )
    ]);
    
}());
