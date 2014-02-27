/*global angular*/
(function () {
    var streamflowStatistics = angular.module('nwc.controllers.streamflowStatistics', ['nwc.streamStats', 'nwc.wps']);
    streamflowStatistics.controller('StreamflowStatistics', [ '$scope', 'StoredState',
        NWC.ControllerHelpers.WorkflowController(
            {
                name: 'Streamflow Statistics',
                description: 'Retrieve streamflow statistics for streams and gages across the nation'
            },
            function($scope, StoredState){
                
            }
        )
    ]);
    streamflowStatistics.controller('SelectSite', ['$scope', 'StoredState', 'CommonState', 'StoredState', 'StreamflowMap',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Select Gage or HUC',
                description: 'Select a gage or a HUC to retrieve its statistics.'
            },
            function ($scope, StoredState, CommonState, StoredState, StreamflowMap) {
                $scope.CommonState = CommonState;
                $scope.StoredState = StoredState;
                var mapId = 'siteSelectMap';
                var map = StreamflowMap.getMap();
                map.render(mapId);
                map.zoomToExtent(map.restrictedExtent, true);
                
                StoredState.interestType = StoredState.interestType || 'observed' ;
                $scope.$watch('StoredState.interestType', function(newInterest, oldInterest){
                    if(newInterest !== oldInterest){
                        StreamflowMap.getMap().switchToInterest(newInterest);
                    }
                });
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
                    StoredState.siteStatisticsParameters = {};
                };
                
            }
        )
    ]);
    
    streamflowStatistics.controller('SetSiteStatisticsParameters', ['$scope', 'StoredState', 'CommonState', 'StoredState', '$state', 'StreamStats',
        NWC.ControllerHelpers.StepController(
            {
                name: 'Select Streamflow Statistics Parameters',
                description: 'Select a subset of the time series for which you would like to calculate various statistics.'
            },
            function ($scope, StoredState, CommonState, StoredState, $state, StreamStats) {
                CommonState.streamflowStatsParamsReady = false;
                if (!StoredState.gage && !StoredState.streamFlowStatsHuc) {
                    $state.go('^.selectSite');
                }
                $scope.streamStatsOptions = StreamStats.getAllStatTypes();
                $scope.CommonState = CommonState;
                $scope.StoredState = StoredState;
                StoredState.siteStatisticsParameters = StoredState.siteStatisticsParameters || {};
                var siteStatisticsParameters = StoredState.siteStatisticsParameters;
                $scope.siteStatisticsParameters = siteStatisticsParameters;
                siteStatisticsParameters.statGroups = siteStatisticsParameters.statGroups || [];
                siteStatisticsParameters.startDate =  siteStatisticsParameters.startDate || new Date(CommonState.streamFlowStatMinDate);
                siteStatisticsParameters.endDate =  siteStatisticsParameters.endDate || new Date(CommonState.streamFlowStatMaxDate);

                $scope.dateFormat = 'yyyy-MM-dd';
                $scope.minDate = CommonState.streamFlowStatMinDate;
                $scope.maxDate = CommonState.streamFlowStatMaxDate;
                
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
                $scope.calculateStats = function () {
                  StoredState.streamflowStatsParamsReady = true;
                  $state.go('^.displayStatistics');
                };
            }
        )
    ]);
    
    streamflowStatistics.controller('DisplayStatistics', ['$scope', 'StoredState', 'CommonState', 'StoredState', '$state', 'StreamStats',
        NWC.ControllerHelpers.StepController(
            {
                name: 'View Statistics',
                description: 'Visualize and export the statistics for the selected site.'
            },
            function ($scope, StoredState, CommonState, StoredState, $state, StreamStats) {
                $scope.CommonState = CommonState;
                $scope.StoredState = StoredState;
                
                if(!StoredState.gage && !StoredState.streamFlowStatsHuc){
                    $state.go('^.selectSite');
                }
            }
        )
    ]);

}());
