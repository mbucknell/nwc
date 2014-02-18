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
                };
            }
        )
    ]);
    
    streamflowStatistics.controller('SetGageStatisticsParameters', ['$scope', 'StoredState', 'CommonState', 'StoredState', '$state', 'StreamStats',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Select Gage Statistics Parameters',
                description: 'Select a subset of the time series for which you would like to calculate statistics.'
            },
            function ($scope, StoredState, CommonState, StoredState, $state, StreamStats) {
                CommonState.streamflowStatsParamsReady = false;
                if (!StoredState.gage) {
                    $state.go('^.selectGage');
                }
                $scope.streamStatsOptions = StreamStats.getAllStatTypes();
                $scope.CommonState = CommonState;
                $scope.StoredState = StoredState;
                StoredState.gageStatisticsParameters = StoredState.gageStatisticsParameters || {};
                var gageStatisticsParameters = StoredState.gageStatisticsParameters;
                $scope.gageStatisticsParameters = gageStatisticsParameters;
                gageStatisticsParameters.statGroups = gageStatisticsParameters.statGroups || [];
                gageStatisticsParameters.startDate =  new Date(CommonState.streamFlowStatStartDate);
                gageStatisticsParameters.endDate =  new Date(CommonState.streamFlowStatEndDate);

                $scope.dateFormat = 'yyyy-MM-dd';
                $scope.minDate = CommonState.streamFlowStatStartDate;
                $scope.maxDate = CommonState.streamFlowStatEndDate;
                
                $scope.openMinDatePicker = function($event){
                    openDatePickerPopup($event, 'minDateOpened');
                };
                $scope.openMaxDatePicker = function($event){
                    openDatePickerPopup($event, 'maxDateOpened');
                };
                
                var openDatePickerPopup = function ($event, openedPropertyName) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope[openedPropertyName] = true;
                };
                $scope.calculateStats = function(){
                  StoredState.streamflowStatsParamsReady = true;
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
