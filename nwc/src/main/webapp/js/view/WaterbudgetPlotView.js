/*jslint browser:true*/

var NWC = NWC || {};
NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.WaterbudgetPlotView = NWC.view.BaseView.extend({

		templateName : 'waterbudgetPlot',

		ETA : "eta",
		DAY_MET : "dayMet",

		events : {
			'click .download-evapotranspiration-btn' : 'downloadEvapotranspiration',
			'click .download-precipitation-btn' : 'downloadPrecipitation'
		},

		/*
		 * @param {Object} options
		 *      @prop {String} hucId - Id of the huc whose waterbudget data is plotted.
		 *      @prop {Jquery element} el - Jquery element where this view should be rendered
		 *      @prop {WaterBudgetHucPlotModel} model - Used to set the units and timeScaled of the plot.t
		 * @returns {undefined}
		 */
		initialize : function(options) {
			var self = this;
			this.hucId = options.hucId;

			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
			this.getHucDataPromise = this.getHucData(options.hucId).done(function() {
				self.$el.find('.download-btn-container button').prop('disabled', false);
			});

			this.plotPTandETaData();
			// Set up model change events
			this.listenTo(this.model, 'change', this.plotPTandETaData);
		},

		/**
		* This makes a Web service call to get huc data and transform it into a data series object.
		*
		* @param {String} huc 12 digit identifier for the hydrologic unit
		* @returns a resolved promise when both ETA and DAYMET data has been retrieved and the dataSeriesStore updated. If
		*      either call fails the promise will be rejected with either one or two error messages. The datasSeriesStore object will
		*      contain the data for any successful calls
		*/
		getHucData: function(huc) {
			var self = this;
			var deferred = $.Deferred();
			var dataSeries = {};
			var getDataDeferreds = [];
			//grab the sos sources that will be used to display the initial data
			//series. ignore other data sources that the user can add later.
			var initialSosSourceKeys = [this.ETA, this.DAY_MET];
			var initialSosSources = Object.select(NWC.util.SosSources, initialSosSourceKeys);

			this.dataSeriesStore = new NWC.util.DataSeriesStore();

			Object.keys(initialSosSources, function (sourceId, source) {
				var d = $.Deferred();
				var url = NWC.util.buildSosUrlFromSource(huc, source);

				dataSeries[sourceId] = NWC.util.DataSeries.newSeries();
				getDataDeferreds.push(d);

				$.ajax({
					url : url,
					dataType : "xml",
					success : function(data, textStatus, jqXHR) {
						var parsedValues = NWC.util.SosResponseFormatter.formatSosResponse(data);
						var thisDataSeries = dataSeries[sourceId];

						thisDataSeries.metadata.seriesLabels.push({
							seriesName: NWC.util.SosSources[sourceId].propertyLongName,
							seriesUnits: NWC.util.SosSources[sourceId].units
						});

						thisDataSeries.metadata.downloadHeader = NWC.util.SosSources[sourceId].downloadMetadata;
						thisDataSeries.data = parsedValues;

						d.resolve();
					},
					error : function() {
						//@todo - setup app level error handling
						var errorMessage = 'Error retrieving time series data for ' + this.sourceId;
						alert(errorMessage);
						d.reject(errorMessage);
					}
				});
			});

			$.when.apply(null, getDataDeferreds).done(function() {
				self.dataSeriesStore.updateHucSeries(dataSeries);
				deferred.resolve(dataSeries);
			}).fail(function() {
				deferred.reject();
			});

			return deferred.promise();
		},


		/**
		 * Update the plot with the current dataSeriesStore and model.
		 */
		plotPTandETaData : function() {
			var self = this;
			this.getHucDataPromise.done(function() {
				var normalization = 'normalizedWater';
				var plotTimeDensity  = self.model.get('timeScale');
				var measurementSystem =  self.model.get('units');

				var values = self.dataSeriesStore[plotTimeDensity].getDataAs(measurementSystem, normalization);
				var labels = self.dataSeriesStore[plotTimeDensity].getSeriesLabelsAs(measurementSystem, normalization, plotTimeDensity);
				var ylabel = NWC.util.Units[measurementSystem][normalization][plotTimeDensity];
				var title = 'HUC ' + self.hucId;

				NWC.util.Plotter.getPlot(self.$el.find('.waterbudget-plot'), self.$el.find('.waterbudget-legend'), values, labels, ylabel, title);
			});
		},

		downloadEvapotranspiration : function() {
			var blob = new Blob([this.dataSeriesStore.eta.toCSV()], {type:'text/csv'});
			saveAs(blob, this.getHucFilename('eta'));
		},

		downloadPrecipitation : function() {
			var blob = new Blob([this.dataSeriesStore.dayMet.toCSV()], {type:'text/csv'});
			saveAs(blob, this.getHucFilename('dayMet'));
		},

		getHucFilename : function (series) {
			var filename = series + '_data.csv';
			if (this.hucId) {
				filename = this.buildName(this.hucId, series);
			}
			return filename;
		},

		buildName : function(selectionId, series) {
			var filename = selectionId;
			filename += '_' + series;
			filename += '.csv';
			filename = filename.replace(/ /g, '_');
			filename = encodeURIComponent(filename);
			return filename;
		}
	});

}());

