/*jslint browser:true*/

var NWC = NWC || {};
NWC.view = NWC.view || {}

(function() {
	"use strict";

	NWC.view.WaterbudgetPlotView = NWC.BaseView.extend({

		templateName : 'waterBudgetPlot',

		events : {
			'click .download-evapotranspiration-btn' : 'downloadEvapotranspiration',
			'click .download-precipitation-btn' : 'downloadPrecipitation'
		},

		initialize : function(options) {
			this.hucId = options.hucId;

			this.dataSeriesStore = new NWC.util.DataSeriesStore();

			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		},

		/**
		 * This makes a Web service call to get huc data
		 * then makes call to render the data on a plot
		 * @param {String} huc 12 digit identifier for the hydrologic unit
		 * @returns a resolved promise when both ETA and DAYMET data has been retrieved and the dataSeriesStore updated. If
		 * either call fails the promise will be rejected with either one or two error messages. The datasSeriesStore object will
		 * contain the data for any successful calls
		 */
		getHucData: function(huc) {
			var dataSeries = {};
			var getDataDeferreds = [];
			//grab the sos sources that will be used to display the initial data
			//series. ignore other data sources that the user can add later.
			var initialSosSourceKeys = [this.ETA, this.DAY_MET];
			var initialSosSources = Object.select(NWC.util.SosSources, initialSosSourceKeys);
			Object.keys(initialSosSources, function (sourceId, source) {
				var d = $.Deferred();
				var url = NWC.util.buildSosUrlFromSource(huc, source);

				dataSeries[sourceId] = NWC.util.DataSeries.newSeries();
				getDataDeferred.push(d);

				$.ajax({
					url : url,
					context : {
						sourceId : sourceId,
						dataSeries : dataSeries[sourceId]
					},
					dataType : "xml",
					success : function(data, textStatus, jqXHR) {
						var parsedValues = NWC.util.SosResponseFormatter.formatSosResponse(data);
						this.dataSeries.metadata.seriesLabels.push({
							seriesName: NWC.util.SosSources[this.sourceId].propertyLongName,
							seriesUnits: NWC.util.SosSources[this.sourceId].units
						});

						this.dataSeries.metadata.downloadHeader = NWC.util.SosSources[label].downloadMetadata;
						this.dataseries.data = parsedValues;
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
	//STOPPED HERE still need to return the resolved promise correctly.
			var dataHandler = function() {
				this.dataSeriesStore.updateHucSeries(labeledResponses);
				this.plotPTandETaData(this.hucPlotModel.get('timeScale'), this.hucPlotModel.get('units'));
			}.bind(this);
			$.when.apply(null, labeledAjaxCalls).then(dataHandler);
			return;
		},

		/**
		 * @param {String} time - the time scale of data to plot (daily or monthly)
		 * @param {String} measurement - the quantity scale of data to plot (usCustomary or metric)
		 */
		plotPTandETaData : function(time, measurement) {

			var normalization = 'normalizedWater';
			var plotTimeDensity  = time;
			var measurementSystem =  measurement;
			var values = this.dataSeriesStore[plotTimeDensity].getDataAs(measurementSystem, normalization);
			var labels = this.dataSeriesStore[plotTimeDensity].getSeriesLabelsAs(
					measurementSystem, normalization, plotTimeDensity);
			var ylabel = NWC.util.Units[measurementSystem][normalization][plotTimeDensity];
			NWC.util.Plotter.getPlot($('#waterBudgetPlot'), $('#waterBudgetLegend'), values, labels, ylabel);
			return;
		}
	});

}());

