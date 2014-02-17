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
                    $state.go('^.setGageStatisticsParameters');
                };
            }
        )
    ]);
    
    var minStatDate = new Date('1980-10-01');
    var maxStatDate = new Date('2010-09-29');
    streamflowStatistics.controller('SetGageStatisticsParameters', ['$scope', 'StoredState', 'CommonState', 'StoredState', '$state',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Select Gage Statistics Parameters',
                description: 'Select a subset of the time series for which you would like to calculate statistics.'
            },
            function ($scope, StoredState, CommonState, StoredState, $state) {
//                if (!StoredState.gage) {
//                    $state.go('^.selectGage');
//                }
                
                $scope.CommonState = CommonState;
                $scope.StoredState = StoredState;
                CommonState.gageStatisticsParameters = CommonState.gageStatisticsParameters || {};
                var gageStatisticsParameters = CommonState.gageStatisticsParameters;
                $scope.gageStatisticsParameters = gageStatisticsParameters;
                gageStatisticsParameters.statGroups = gageStatisticsParameters.statGroups || [];
                gageStatisticsParameters.startDate = Date.create(minStatDate);//clone
                gageStatisticsParameters.endDate = Date.create(maxStatDate);//clone

                $scope.dateFormat = 'yyyy-MM-dd';
                $scope.minDate = minStatDate;
                $scope.maxDate = maxStatDate;
                
                $scope.openMinDatePicker = function($event){
                    open($event, 'minDateOpened');
                };
                $scope.openMaxDatePicker = function($event){
                    open($event, 'maxDateOpened');
                };
                
                var open = function ($event, openedPropertyName) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope[openedPropertyName] = true;
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
