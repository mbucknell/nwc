/*global angular,NWC,OpenLayers,$,CONFIG*/
(function(){
    var waterBudgetControllers = angular.module('nwc.controllers.waterBudget', []);
    
    waterBudgetControllers.controller('WaterBudget', ['$scope', 'StoredState', '$sce',
        NWC.ControllerHelpers.WorkflowController(
            {
                name: "Available Water Budget Components",
                description: "Discover and access water budget data for watersheds\n\
                    and counties. Select a watershed of interest for precipitation and\n\
                    evapotranspiration data. County water use data for counties intersecting\n\
                    the watershed is also available."
            },
            function ($scope, SharedState, $sce) {
                $scope.description = $sce.trustAsHtml($scope.description);
            }
    )]);
waterBudgetControllers.controller('PlotData', ['$scope', 'StoredState', 'CommonState', 'WaterBudgetPlot', 'WaterUsageChart',
    NWC.ControllerHelpers.StepController(
        {
            name: 'Plot Water Budget Data',
            description: 'Visualize the data for your HUC of interest.'
        },
        function ($scope, StoredState, CommonState, WaterBudgetPlot, WaterUsageChart) {
            var plotDivSelector = '#waterBudgetPlot';
            var legendDivSelector = '#waterBudgetLegend';
            StoredState.plotTimeDensity  = StoredState.plotTimeDensity || 'daily';
            $scope.$watch('StoredState.plotTimeDensity', function(newValue, oldValue){
                if(newValue !== oldValue){
                    plotPTandETaData(newValue);
                }
            });
            /**
             * {String} category the category of data to plot (daily or monthly)
             */
            var plotPTandETaData = function(category){
                var values = CommonState.DataSeriesStore[category].data;
                var labels = CommonState.DataSeriesStore[category].metadata.seriesLabels;
                WaterBudgetPlot.setPlot(plotDivSelector, legendDivSelector, values, labels);
            };
            //boolean property is cheaper to watch than deep object comparison
            $scope.$watch('CommonState.newDataSeriesStore', function(newValue, oldValue){
                if(newValue){
                    CommonState.newDataSeriesStore = false;
                    plotPTandETaData(StoredState.plotTimeDensity);
                    //hack: non-obviously trigger re-rendering of the other graph
                    if(CommonState.WaterUsageDataSeries){
                       CommonState.newWaterUseData = true;
                    }
                }
            });
            
            var chartDivSelector = '#waterUsageChart';
            
            var chartWaterUsage= function(){
                var values = CommonState.WaterUsageDataSeries.data;
                var labels = CommonState.WaterUsageDataSeries.metadata.seriesLabels;
                WaterUsageChart.setChart(chartDivSelector, values, labels);
            };
            
            //boolean property is cheaper to watch than deep object comparison
            $scope.$watch('CommonState.newWaterUseData', function(newValue, oldValue){
                if(newValue){
                    CommonState.newWaterUseData = false;
                    chartWaterUsage();
                    //hack: non-obviously trigger re-rendering of the other graph
                    CommonState.newDataSeriesStore = true;
                }
            });
            
            $scope.hideUse = function () {
                return (!CommonState.WaterUsageDataSeries) || !(CommonState.WaterUsageDataSeries.data) || !(CommonState.WaterUsageDataSeries.data.length);
            };
            
            $scope.getName = function (series) {
                var filename = 'huc name';
                filename += '_' + series;
                filename += '.csv';
                filename = filename.replace(/ /g, '_');
                filename = escape(filename);
                return filename;
            };
            
            $scope.CommonState = CommonState;
            $scope.StoredState = StoredState;
        })
]);

waterBudgetControllers.controller('SelectHuc', ['$scope', 'StoredState', 'CommonState', 'WaterBudgetMap', '$log', 'MapControlDescriptions',
    NWC.ControllerHelpers.StepController(
        {
            name: 'HUC Selection',
            description: 'Find your Hydrologic Unit of interest.'
        },
        function ($scope, StoredState, CommonState, WaterBudgetMap, $log, MapControlDescriptions) {
            $scope.StoredState = StoredState;
            $scope.CommonState = CommonState;
            
            var map = WaterBudgetMap.getMap();

            map.render('hucSelectMap');
            StoredState.mapExtent = StoredState.mapExtent || map.getMaxExtent();
            map.zoomToExtent(StoredState.mapExtent, true);
            map.events.register(
                'moveend',
                map,
                function() {
                    StoredState.mapExtent = map.getExtent();
                },
                false
            );
            
            $scope.$watch('CommonState.activatedMapControl', function(newControl, oldControl) {
                var controlId;
                if (newControl === 'zoom') {
                    controlId = 'nwc-zoom';
                } else if (newControl === 'pan') {
                    controlId = 'nwc-navigation';
                } else {
                    controlId = 'nwc-hucs';
                }
                if (newControl !== oldControl) {
                    var controls = WaterBudgetMap.getMap().getControlsBy('id', /nwc-.*/);
                    angular.forEach(controls, function(control) {
                        control.deactivate();
                    });
                }
                var activeControl = WaterBudgetMap.getMap().getControlsBy('id', controlId)[0];
                activeControl.activate();
                CommonState.mapControlDescription = MapControlDescriptions[newControl].description;
                CommonState.mapControlCursor = MapControlDescriptions[newControl].cursor;
            });
        
            // when there is more than select, logic for additional buttons can go here
        
            CommonState.activatedMapControl = 'select';
            CommonState.mapControlDescription = MapControlDescriptions.select.description;
            CommonState.mapControlCursor = MapControlDescriptions.select.cursor;
            
            $log.info(CommonState);
        }
    )
]);

waterBudgetControllers.controller('SelectCounty', ['$scope', 'StoredState', 'CommonState', 'WaterBudgetMap', 'MapControlDescriptions',
    NWC.ControllerHelpers.StepController(
            {
                name: 'County Selection',
                description: 'Select water use data for a county that intersects with your HUC'
            },
    function ($scope, StoredState, CommonState, WaterBudgetMap, MapControlDescriptions) {
        $scope.StoredState = StoredState;
        $scope.CommonState = CommonState;
        
        var map = WaterBudgetMap.getMap();
        map.render('hucSelectMap');

        var setCountyInfo = function(countyFeature){
            var countyInfo = {};
            countyInfo.offeringId = countyFeature.attributes.FIPS;
            countyInfo.area = countyFeature.attributes.AREA_SQMI;
            countyInfo.name = countyFeature.attributes.FULL_NAME.capitalize(true);
            
            StoredState.countyInfo = countyInfo;
        };
        map.getCountyThatIntersectsWithHucFeature(StoredState.hucFeature, setCountyInfo);
        
        map.zoomToExtent(StoredState.mapExtent, true);
        map.events.register(
            'moveend',
            map,
            function() {
                StoredState.mapExtent = map.getExtent();
            },
            false
        );

        $scope.$watch('CommonState.activatedMapControl', function(newControl, oldControl) {
            var controlId;
            if (newControl === 'zoom') {
                controlId = 'nwc-zoom';
            } else if (newControl === 'pan') {
                controlId = 'nwc-navigation';
            } else {
                controlId = 'nwc-counties';
            }
            if (newControl !== oldControl) {
                var controls = WaterBudgetMap.getMap().getControlsBy('id', /nwc-.*/);
                angular.forEach(controls, function(control) {
                    control.deactivate();
                });
            }
            var activeControl = WaterBudgetMap.getMap().getControlsBy('id', controlId)[0];
            activeControl.activate();
            CommonState.mapControlDescription = MapControlDescriptions[newControl].description;
            CommonState.mapControlCursor = MapControlDescriptions[newControl].cursor;
        });

        // when there is more than select, logic for additional buttons can go here

        CommonState.activatedMapControl = 'select';
        CommonState.mapControlDescription = MapControlDescriptions.select.description;
        CommonState.mapControlCursor = MapControlDescriptions.select.cursor;
    })
]);

waterBudgetControllers.controller('DisambiguateClick', ['$scope', 'StoredState', 'CommonState', '$log', '$state',
    NWC.ControllerHelpers.StepController(
        {
            name: 'HUC Disambiguation',
            description: 'Your click fell near multiple HUCs. Select one from the list to continue.'
        },
        function ($scope, StoredState, CommonState, $log, $state) {
            $scope.hucs = CommonState.ambiguousHucs;
            
            /**
             * @param {OpenLayers.Feature} huc
             */
            $scope.setHuc = function (huc) {
                StoredState.hucFeature = huc;
                $state.go('^.plotData');
            };
			
            $log.info(StoredState);
        }
    )
]);

waterBudgetControllers.controller('FinalStep', ['$scope', 'StoredState', '$state', 'CommonState', '$log',
    NWC.ControllerHelpers.StepController(
        {
            name: 'Final Step',
            description: "You're all done!"
        },
        function ($scope, StoredState, $state, CommonState, $log) {
            StoredState._clientState.name = $state.current.name;
            StoredState._clientState.params = $state.params;
            
            
            $log.info(CommonState);
        }
    )
]);

waterBudgetControllers.controller('Restore', [
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
