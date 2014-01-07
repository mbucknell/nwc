/*global angular,Dygraph*/
(function () {
    var waterBudgetPlot = angular.module('nwc.waterBudgetPlot', []);
    //set via WaterBudgetPlot.createPlot
    var privatePlot;
    var privateGraphEltSelector;
    var privateLegendEltSelector;
    /**
     * Sets the singleton WaterBudgetPlot object
     * @param {String} graphEltSelector - a jQuery Selector in which to render the Dygraph
     * @param {String} legendEltSelector - a jQuery Selector in which to render the legend
     * @param {array<array>} values - the values to plot
     * @param {array<string>} labels - the labels for the series
     */
    var setPlot = function (graphEltSelector, legendEltSelector, values, labels) {
        privateGraphEltSelector = graphEltSelector;
        privateLegendEltSelector = legendEltSelector;
        $([graphEltSelector, legendEltSelector]).addClass('generous_left_margin');
        var graphElt = $(graphEltSelector)[0];
        var legendElt = $(legendEltSelector)[0];
        //functions to customize the display of dates on the Dygraph
        //these will be attached as public properties of the Graph
        var dateToStringWithoutDay = function (ms) {
            return new Date(ms).format('{Mon}. {yyyy}');
        };
        var dateToStringMonthOnly = function (ms) {
            return new Date(ms).format('{Mon}.');
        };
        var opts = {
            labels: labels,
            connectSeparatedPoints: true,
            showRangeSelector: true,
            highlightCircleSize: 0,
            ylabel: 'Precipitation (mm)',
            xlabel: 'Date',
            labelsDiv: legendElt,
            labelsSeparateLines: true,
            legend: 'always'
        };
        privatePlot = new Dygraph(graphElt, values, opts);
        //attach some additional properties
        privatePlot.customFormatters = {};
        privatePlot.customFormatters.dateToStringWithoutDay = dateToStringWithoutDay;
        privatePlot.customFormatters.dateToOnlyMonthString = dateToStringMonthOnly;
        return privatePlot;
    };
    var getPlot = function () {
        return privatePlot;
    };
    var updateSeries = function (values, labels) {
        if (privateGraphEltSelector && privateLegendEltSelector) {
            return setPlot(privateGraphEltSelector, privateLegendEltSelector, values, labels);
        }
        else {
            throw new Error("Cannot update plot - plot not yet constructed.");
        }
    };
    var plotter = function () {
        return {
            setPlot: setPlot,
            getPlot: getPlot,
            updateSeries: updateSeries
        };
    };
    waterBudgetPlot.service('WaterBudgetPlot', [
        plotter
    ]);
}());
