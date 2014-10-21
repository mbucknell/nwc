/*global angular,NWC,OpenLayers,$,CONFIG*/
(function(){
    var waterBudgetControllers = angular.module('nwc.controllers.waterBudget', ['nwc.conversion']);

    waterBudgetControllers.controller('WaterBudget', ['$scope', 'StoredState', '$sce', 'WaterBudgetMap',
        NWC.ControllerHelpers.WorkflowController(
            {
                name: "Available Water Budget Components",
                description: "Discover and access water budget data for watersheds\n\
                    and counties. Select a watershed of interest for precipitation and\n\
                    evapotranspiration data. County water use data for counties intersecting\n\
                    the watershed is also available."
            },
            function ($scope, SharedState, $sce, WaterBudgetMap) {
                $scope.description = $sce.trustAsHtml($scope.description);

				//get map and layer info
				var map = WaterBudgetMap.getMap();
				var hucLayerName = WaterBudgetMap.hucLayerName;
				var layer = map.getLayersByName(hucLayerName)[0];

				//function for toggling HUC layer
				$scope.toggleHUC = function () {
					var currentVisibility = layer.getVisibility();
					layer.setVisibility(!currentVisibility);
				};
            }
    )]);

waterBudgetControllers.controller('PlotData', ['$scope', '$state', 'StoredState', 'CommonState',
    'Plotter', 'WaterUsageChart', 'Units', 'Convert',
    NWC.ControllerHelpers.StepController(
        {
            name: 'Plot Water Budget Data',
            description: 'Visualize the data for your HUC of interest.'
        },
        function ($scope, $state, StoredState, CommonState, Plotter, WaterUsageChart, Units, Convert) {
			// Create vector layer to show HUC
            var layer_style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
            layer_style.fillOpacity = 0.2;
            layer_style.graphicOpacity = 1;
        	var vectorLayer = new OpenLayers.Layer.Vector("Simple Geometry", {
               	style: layer_style
            });

        	var polygonFeature = new OpenLayers.Feature.Vector(StoredState.waterBudgetHucFeature.geometry);
        	vectorLayer.addFeatures([polygonFeature]);

			$scope.hucLayer = vectorLayer;
			$scope.featureBounds = vectorLayer.getDataExtent();

            var selectionInfo = {};
            if (StoredState.waterBudgetHucFeature) {
                selectionInfo.hucId = StoredState.waterBudgetHucFeature.data.HUC_12;
                selectionInfo.hucName = StoredState.waterBudgetHucFeature.data.HU_10_NAME;
            } else {
                $state.go("^.selectHuc");
                return;
            }
            $scope.selectionInfo = selectionInfo;

            var plotDivSelector = '#waterBudgetPlot';
            var legendDivSelector = '#waterBudgetLegend';
            StoredState.plotNormalization = StoredState.plotNormalization || 'totalWater';
            StoredState.plotTimeDensity  = StoredState.plotTimeDensity || 'daily';
            StoredState.measurementSystem = StoredState.measurementSystem || 'usCustomary';
            $scope.$watch('StoredState.plotNormalization', function(newValue, oldValue){
                if(newValue !== oldValue) {
                    chartWaterUse();
                }
            });
            $scope.$watch('StoredState.measurementSystem', function(newValue, oldValue){
                if(newValue !== oldValue) {
                    plotPTandETaData();
                    chartWaterUse();
                }
            });
            $scope.$watch('StoredState.plotTimeDensity', function(newValue, oldValue){
                if(newValue !== oldValue){
                    plotPTandETaData();
                }
            });
            /**
             * {String} category the category of data to plot (daily or monthly)
             */
            var plotPTandETaData = function(){
                var normalization = 'normalizedWater';
                var values = CommonState.DataSeriesStore[StoredState.plotTimeDensity].getDataAs(StoredState.measurementSystem, normalization);
                var labels = CommonState.DataSeriesStore[StoredState.plotTimeDensity].getSeriesLabelsAs(
                        StoredState.measurementSystem, normalization, StoredState.plotTimeDensity);
                var ylabel = Units[StoredState.measurementSystem][normalization][StoredState.plotTimeDensity];
                Plotter.getPlot(plotDivSelector, legendDivSelector, values, labels, ylabel);
            };
            //boolean property is cheaper to watch than deep object comparison
            $scope.$watch('CommonState.newDataSeriesStore', function(newValue, oldValue){
                if(newValue){
                    CommonState.newDataSeriesStore = false;
                    plotPTandETaData();
                    //hack: non-obviously trigger re-rendering of the other graph
                    if(CommonState.WaterUsageDataSeries){
                       CommonState.newWaterUseData = true;
                    }
                }
            });

            var chartDivSelector = '#waterUsageChart';

            var chartWaterUse = function() {
                var normalizationFn = Convert.noop;
                if ('normalizedWater' === StoredState.plotNormalization) {
                    normalizationFn = Convert.normalize.fill(undefined, StoredState.countyInfo.area);
                }
                var values = CommonState.WaterUsageDataSeries.getDataAs(StoredState.measurementSystem, StoredState.plotNormalization, normalizationFn);
                // get modified Series labels and throw away "Date"
                var labels = CommonState.WaterUsageDataSeries.getSeriesLabelsAs(
                    StoredState.measurementSystem, StoredState.plotNormalization, StoredState.plotTimeDensity).from(1);
                var ylabel = Units[StoredState.measurementSystem][StoredState.plotNormalization].daily;
                WaterUsageChart.setChart(chartDivSelector, values, labels, ylabel,
                    Units[StoredState.measurementSystem][StoredState.plotNormalization].precision);
            };

            //boolean property is cheaper to watch than deep object comparison
            $scope.$watch('CommonState.newWaterUseData', function(newValue, oldValue){
                if(newValue){
                    CommonState.newWaterUseData = false;
                    chartWaterUse();
                    //hack: non-obviously trigger re-rendering of the other graph
                    CommonState.newDataSeriesStore = true;
                }
            });

            $scope.hideUse = function () {
                return (!CommonState.WaterUsageDataSeries) || !(CommonState.WaterUsageDataSeries.data) || !(CommonState.WaterUsageDataSeries.data.length);
            };

            $scope.hideNormalizationWarning = function() {
                return (StoredState.plotNormalization !== 'normalizedWater')
            }

            var buildName = function(selectionName, selectionId, series) {
                var filename = selectionName;
                filename += '_' + selectionId;
                filename += '_' + series;
                filename += '.csv';
                filename = filename.replace(/ /g, '_');
                filename = escape(filename);
                return filename;
            };

            $scope.getHucFilename = function (series) {
                var filename = 'data.csv';
                if (StoredState.waterBudgetHucFeature) {
                    filename = buildName(StoredState.waterBudgetHucFeature.data.HU_12_NAME,
                        StoredState.waterBudgetHucFeature.data.HUC_12, series);
                }
                return filename;
            };

            $scope.getCntyFilename = function (series) {
                var filename = 'data.csv';
                if (StoredState.countyInfo) {
                    filename = buildName(StoredState.countyInfo.name,
                        StoredState.countyInfo.offeringId, series);
                }
                return filename;
            };

            $scope.getCombinedWaterUse = function(dataSeries) {
                var result = Object.clone(dataSeries);
                result.data = WaterUsageChart.combineData(result.data);
                return result;
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
        $scope.showCountyCitation = true;

        var map = WaterBudgetMap.getMap();
        map.render('hucSelectMap');

        var setCountyInfo = function(countyFeature){
            var countyInfo = {};
            countyInfo.offeringId = countyFeature.attributes.FIPS;
            countyInfo.area = countyFeature.attributes.AREA_SQMI;
            countyInfo.name = countyFeature.attributes.FULL_NAME.capitalize(true);

            StoredState.countyInfo = countyInfo;
        };
        map.getCountyThatIntersectsWithHucFeature(StoredState.waterBudgetHucFeature, setCountyInfo);

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
                StoredState.waterBudgetHucFeature = huc;
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
