/*global angular,Dygraph*/
(function () {
    var generalPlotter = angular.module('nwc.plotter', []);
    /**
     * Constructs a plot instance against the provided selectors
     * @param {String} graphEltSelector - a jQuery Selector in which to render the Dygraph
     * @param {String} legendEltSelector - a jQuery Selector in which to render the legend
     * @param {array<array>} values - the values to plot
     * @param {array<string>} labels - the labels for the series
     */
    var getPlot = function (graphEltSelector, legendEltSelector, values, labels, ylabel, title) {
        var privateGraphEltSelector = graphEltSelector;
        var privateLegendEltSelector = legendEltSelector;
        $([graphEltSelector, legendEltSelector]).addClass('generous_left_margin');
        var graphElt = $(graphEltSelector)[0];
        var legendElt = $(legendEltSelector)[0];
        //functions to customize the display of dates on the Dygraph
        //these will be attached as public properties of the Graph
        var dateToStringWithoutDay = function (ms) {
            return Date.create(ms).utc().format('{Mon}. {yyyy}');
        };
        var dateToStringMonthOnly = function (ms) {
            return Date.create(ms).utc().format('{Mon}.');
        };
        var opts = {
            title: title,
            labels: labels,
            connectSeparatedPoints: true,
            showRangeSelector: true,
            highlightCircleSize: 0,
            ylabel: ylabel,
            xlabel: 'Date',
            labelsDiv: legendElt,
            labelsSeparateLines: true,
            legend: 'always',
            yAxisLabelWidth: 100
        };
        var privatePlot = new Dygraph(graphElt, values, opts);
        //attach some additional properties
        privatePlot.customFormatters = {};
        privatePlot.customFormatters.dateToStringWithoutDay = dateToStringWithoutDay;
        privatePlot.customFormatters.dateToOnlyMonthString = dateToStringMonthOnly;
        return privatePlot;
    };
    
    var plotter = function () {
        return {
            getPlot: getPlot
        };
    };
    generalPlotter.service('Plotter', [
        plotter
    ]);
}());
