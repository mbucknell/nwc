/*global angular SCE */
(function () {
    var streamflowStatistics = angular.module('nwc.directives.streamflowStatistics', ['nwc.sharedStateServices', 'nwc.plotter', 'nwc.conversion']);
    streamflowStatistics.directive('plotData', ['CommonState', 'StoredState', 'Plotter', 'Units',
        function(CommonState, StoredState, Plotter, Units) {
            var plotDivSelector = '#modeledQPlot';
            var legendDivSelector = '#modeledQLegend';
            var plotTimeDensity  = 'daily';
            var measurementSystem = 'usCustomary';

            /**
             * {String} category the category of data to plot (daily or monthly)
             */
            var plotModeledQ = function(){
                var values = CommonState.ModeledHucDataSeries.getDataAs(measurementSystem, "streamflow");
                var labels = CommonState.ModeledHucDataSeries.getSeriesLabelsAs(
                        measurementSystem, "streamflow", plotTimeDensity);
                var ylabel = Units[measurementSystem].streamflow[plotTimeDensity];
                Plotter.setPlot(plotDivSelector, legendDivSelector, values, labels, ylabel);
            };

            var buildName = function(selectionName, selectionId, series) {
                var filename = selectionName;
                filename += '_' + selectionId;
                filename += '_' + series;
                filename += '.csv';
                filename = filename.replace(/ /g, '_');
                filename = escape(filename);
                return filename;
            };

            return {
                restrict: 'E',
                link: function(scope, element, attrs) {
                    var getFilename = function (series) {
                        var filename = 'data.csv';
                        if (StoredState.streamFlowStatHucFeature) {
                            filename = buildName(StoredState.streamFlowStatHucFeature.data.HU_12_NAME,
                                StoredState.streamFlowStatHucFeature.data.HUC12, series);
                        }
                        return filename;
                    };

                    scope.getFilename = getFilename;

                    scope.$watch('CommonState.newModeledHucData', function(newValue, oldValue){
                        if(newValue){
                            CommonState.newModeledHucData = false;
                            plotModeledQ(scope);
                        }
                    });
                },
                templateUrl: '../client/nwc/workflows/streamflowStatistics/plotData.html'
            };
        }]);
}());