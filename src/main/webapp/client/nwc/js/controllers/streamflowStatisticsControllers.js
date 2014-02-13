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
    streamflowStatistics.controller('SelectGages', ['$scope', 'StoredState', 'CommonState', 'StoredState', 'StreamflowMap', 'wps',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Select Stream Gage',
                description: 'Select a gage to retrieve its statistics.'
            },
            function ($scope, StoredState, CommonState, StoredState, StreamflowMap, wps) {
                var doc = wps.createWpsExecuteRequestDocument('org.n52.wps.server.r.stats_nwis',
                    [
                        {
                            name: 'sites',
                            value: '06915000'
                        }, 
                        {
                            name: 'startdate',
                            value: '1990-01-01'
                        }, 
                        {
                            name: 'enddate',
                            value: '2000-01-01'
                        }, 
                        {
                            name: 'stats',
                            value: 'rateStat,otherStat'
                        }
                    ],
                    wps.defaultAsynchronousResponseForm
                );
            wps.executeAsynchronousRequest({
                    wpsRequestDocument : doc,
                    url: 'http://cida-eros-wsdev.er.usgs.gov:8081/wps/WebProcessingService',
                    callbacks:{
                        result:{
                            success: function(response){
                                console.dir(response);
                                debugger;
                            }
                        }
                    }
                });
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
