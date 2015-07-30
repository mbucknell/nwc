var NWC = NWC || {};

NWC.util = NWC.util || {};

NWC.util.Plotter = function () {
	return {
		/**
		 * Constructs a plot instance against the provided selectors
		 * @param {String} $graphEl - a jQuery Element in which to render the Dygraph
		 * @param {String} $legendEl - a jQuery Element in which to render the legend
		 * @param {array<array>} values - the values to plot
		 * @param {array<string>} labels - the labels for the series
		 */
		getPlot : function ($graphEl, $legendEl, values, labels, ylabel, title) {

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
				labelsDiv: $legendEl[0],
				labelsSeparateLines: true,
				legend: 'always',
				axes : {
					y : {
						axisLabelWidth: 100
					}
				}
			};
			var privatePlot = new Dygraph($graphEl[0], values, opts);
			//attach some additional properties
			privatePlot.customFormatters = {};
			privatePlot.customFormatters.dateToStringWithoutDay = dateToStringWithoutDay;
			privatePlot.customFormatters.dateToOnlyMonthString = dateToStringMonthOnly;
			return privatePlot;
		}
	};
}();
