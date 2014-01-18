/*global angular,NWC,OpenLayers,$,CONFIG*/
(function(){
    var waterBudgetControllers = angular.module('nwc.controllers.waterBudget', []);
    
    
    waterBudgetControllers.controller('WaterBudget', ['$scope',
        function ($scope) {
            $scope.name = "Water Budget";
            $scope.description = "Retrieve water data comprising all components of a water budget.";
        }
    ]);
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
            
            $scope.CommonState = CommonState;
            $scope.StoredState = StoredState;
        })
]);

waterBudgetControllers.controller('SelectHuc', ['$scope', 'StoredState', 'CommonState', 'WaterBudgetMap', '$log',
    NWC.ControllerHelpers.StepController(
        {
            name: 'HUC Selection',
            description: 'Find your Hydrologic Unit of interest.'
        },
        function ($scope, StoredState, CommonState, WaterBudgetMap, $log) {
            $scope.StoredState = StoredState;
            $scope.CommonState = CommonState;
            
            var map = WaterBudgetMap.getMap();
            
            
                map.render('hucSelectMap');
                map.zoomToExtent(map.restrictedExtent, true);
        
            
            
            $log.info(CommonState);
        }
    )
]);

waterBudgetControllers.controller('SelectCounty', ['$scope', 'StoredState', 'CommonState', 'WaterBudgetMap', 'SosSources', '$http',
    NWC.ControllerHelpers.StepController(
            {
                name: 'County Selection',
                description: 'Select water use data for a county that intersects with your HUC'
            },
    function ($scope, StoredState, CommonState, WaterBudgetMap) {
        var map = WaterBudgetMap.getMap();
        map.render('hucSelectMap');
        var setCountyInfo = function(countyFeature){
            var countyInfo = {};
            countyInfo.offeringId = countyFeature.attributes.FIPS;
            countyInfo.area = countyFeature.attributes.AREA_SQMI;
            countyInfo.name = countyFeature.attributes.FULL_NAME.capitalize(true);
            
            StoredState.countyInfo = countyInfo;
        };
        map.getCountyThatIntersectsWithHucFeature(StoredState.huc, setCountyInfo);
    })
]);

waterBudgetControllers.controller('DisambiguateClick', ['$scope', 'StoredState', 'CommonState', '$log',
    NWC.ControllerHelpers.StepController(
        {
            name: 'HUC Disambiguation',
            description: 'Your click fell near multiple HUCs. Select one from the list to continue.'
        },
        function ($scope, StoredState, CommonState, $log) {             
            $scope.hucs = CommonState.ambiguousHucs;
            
			$scope.setHuck = function(huc) {
                                StoredState.huc = huc;
				StoredState.hucId = huc.attributes.HUC_12;
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


waterBudgetControllers.controller('DemoWaterUsagePlot', ['$scope', 'StoredState', '$state', 'CommonState', '$log',
    NWC.ControllerHelpers.StepController(
        {
            name: 'Demo Water Usage Plot',
            description: "A Plot for experimenting with flotcharts"
        },
        function ($scope, StoredState, $state, CommonState, $log) {
            StoredState._clientState.name = $state.current.name;
            StoredState._clientState.params = $state.params;

            var d1 = [];
            var d2 = [];
            
            var d3 = [];
            var blankTimes = [2, 5, 6];
            (10).times(function(i){;
                if(blankTimes.any(i)){
                    return;
                }
                var date = (new Date("2001/"+ i +"/01")).getTime();
                d1.push([date, parseInt(Math.random() * 30)]);
                d2.push([date, parseInt(Math.random() * 30)]);
                d3.push([date, parseInt(Math.random() * 30)]);
            });
            var Data = function(data, label) {
                this.data = data;
                this.label = label;
            };
            

            
            var waterUsageUnitName = 'mm per day'; 
            var dateFormat = '{yyyy}-{MM}-{dd}';
            var stack = true,
                    bars = true;


            function plotWithOptions () {
                var plot = $.plot("#placeholder", [new Data(d1, 'Agricultural'), new Data(d2, 'Industrial'), new Data(d3, 'Municipal')], {
                    series: {
                        stack: stack,
                        bars: {
                            show: bars,
                            barWidth: 84000000 * 30 //garbage magic number just for show
                        }
                    },
                    xaxis: {
                        mode: "time",
                        tickSize: [1, "month"],
                        tickLength: 10,
                        color: "black",
                        axisLabel: "Date",
                        axisLabelPadding: 10
                    },
                    yaxis: {
                        color: "black",
                        axisLabel: waterUsageUnitName,
                        axisLabelPadding: 3
                    },
                    grid: {
                        hoverable: true,
                        borderWidth: 2
                    },
                    tooltip: true,
                    tooltipOpts: {
                          content: function(label, xval, yval, flotItem){
                              var offsetIndex = flotItem.datapoint.length - 1;
                              var offset = flotItem.datapoint[offsetIndex];
                              var realValue = yval - offset;
                              var dateDisplay = Date.create(xval).format(dateFormat);
                              var tooltipText = "Date: " + dateDisplay + ", " + label + ": " + realValue + " " + waterUsageUnitName;
                              return tooltipText;
                          }
                    }
                });
            }
            plotWithOptions();
            
        }
    )
]);
}());
