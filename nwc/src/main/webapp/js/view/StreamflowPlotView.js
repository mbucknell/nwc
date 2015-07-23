/*jslint browser: true*/

var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";
	NWC.view.StreamflowPlotView = NWC.view.BaseView.extend({

		templateName : 'streamflowPlot',

		TIME_DENSITY : 'daily',
		MEASUREMENT_SYSTEM : 'usCustomary',
		/*
		 * @constructs
		 * @param {Object} options
		 */
		initialize : function(options) {
			this.getDataSeriesPromise = options.getDataSeriesPromise;
			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		},

		plotStreamflowData : function(plotTitle) {
			var self = this;
			var deferred = $.Deferred();
			var $loadingIndicator = this.$el.find('.plot-loading-indicator');

			$loadingIndicator.show();

			this.getDataSeriesPromise().done(function(dataSeries) {
				var values = dataSeries.getDataAs(self.MEASUREMENT_SYSTEM, 'streamflow');
				var labels = dataSeries.getSeriesLabelsAs(self.MEASUREMENT_SYSTEM, 'streamflow', self.TIME_DENSITY);
				var ylabel = NWC.util.Units[self.MEASUREMENT_SYSTEM].streamflow[self.TIME_DENSITY];
				var $plotDiv = self.$el.find('.plot-div');
				var $legendDiv = self.$el.find('.legend-div');

				self.$el.find('.plot-legend-div').show();
				NWC.util.Plotter.getPlot($plotDiv, $legendDiv, values, labels, ylabel, plotTitle);
				deferred.resolve(dataSeries);
			}).fail(function() {
				deferred.reject(arguments);
			}).always(function() {
				$loadingIndicator.hide();
			});

			return deferred.promise();
		}

	});
}());


