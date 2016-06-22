/*jslint browser:true*/

var NWC = NWC || {};
NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.WaterbudgetPlotView = NWC.view.BaseView.extend({

		templateName : 'waterbudgetPlot',

		events : {
			'click .download-evapotranspiration-btn' : 'downloadEvapotranspiration',
			'click .download-precipitation-btn' : 'downloadPrecipitation'
		},

		/*
		 * @param {Object} options
		 *      @prop {String} hucId - Id of the huc whose waterbudget data is plotted.
		 *      @prop {Jquery element} el - Jquery element where this view should be rendered
		 *      @prop {WaterBudgetHucPlotModel} model - Used to set the units and timeScaled of the plot.t
		 *      @prop {String} gageId (optional)
		 *      @prop {Boolean} accumulated - false indicates if this is local watershed, true indicates accumulated.
		 *      @prop {Boolean} compare - True if this plot should use compareWatershedAcres rather than watershedAcres
		 *		@prop {WaterBudgetHucPlotModel} model - Used to get the watershed acres
		 * @returns {undefined}
		 */
		initialize : function(options) {
			var self = this;
			this.hucId = options.hucId;
			this.gageId = options.gageId ? options.gageId : null;
			this.accumulated = options.accumulated ? options.accumulated : false;

			if (this.accumulated) {
				this.watershedVariables = NWC.config.get('accumulated').attributes.variables;
			}
			else {
				this.watershedVariables = NWC.config.getWatershed(options.hucId).variables;
			}

			this.compare = options.compare ? options.compare : false;

			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
			this.getPlotData(options.hucId, this.gageId).done(function() {
				self.$el.find('.download-btn-container button').prop('disabled', false);
				self.plotData.bind(self)();
			});

			// Set up model change events
			this.listenTo(this.model, 'change', this.plotData);
		},

		/**
		* This makes a Web service call to get huc data and transform it into a data series object.
		* This will also make a web service call to get streamflow data if it is created as an
		* accumulated type of view from the WaterBudgetHucDataView and there is an associated gage
		* with the selected watershed.
		*
		* @param {String} huc 12 digit identifier for the hydrologic unit
		* @param {String} gage (optional) identifier for the streamflow gage
		* @returns a resolved promise when both ETA and DAYMET data has been retrieved and the dataSeriesStore updated. If
		*      either call fails the promise will be rejected with either one or two error messages. The datasSeriesStore object will
		*      contain the data for any successful calls
		*/
		getPlotData: function(huc, gage) {
			var self = this;
			var deferred = $.Deferred();
			var dataSeries = {};
			var getDataDeferreds = [];

			//grab the sos sources that will be used to display the initial data
			//series. ignore other data sources that the user can add later.
			var sosSources = {
				eta : this.watershedVariables.eta,
				dayMet : this.watershedVariables.dayMet
			};

			// Used when retrieving streamflow data when there is a gage defined
			var acres;
			var convertCfsToMmd = function(value) {
				return NWC.util.Convert.cfsToMmd(value, acres);
			};
			var convertTimeToDateStr = function(str) {
				var tokens = str.split('T');
				var newDateStr = tokens[0].replace(/-/g, '/');
				newDateStr = newDateStr.trim();
				return newDateStr;
			};
			var streamflowDeferred;

			this.dataSeriesStore = new NWC.util.DataSeriesStore();

			Object.keys(sosSources, function (sourceId, source) {
				var d = $.Deferred();

				getDataDeferreds.push(d);

				$.ajax({
					url : source.getSosUrl(huc),
					dataType : "xml",
					success : function(data) {
						var thisDataSeries = NWC.util.DataSeries.newSeries();
						var parsedValues = NWC.util.SosResponseFormatter.formatSosResponse(data);

						thisDataSeries.metadata.seriesLabels.push({
							seriesName: source.get('propertyLongName'),
							seriesUnits: source.get('units')
						});
						thisDataSeries.metadata.downloadHeader = source.get('downloadMetadata');
						thisDataSeries.data = parsedValues;

						dataSeries[sourceId] = thisDataSeries;
						d.resolve();
					},
					error : function() {
						var errorMessage = 'Error retrieving time series data for ' + this.sourceId;
						alert(errorMessage);
						d.reject(errorMessage);
					}
				});
			});

			if (gage) {
				/*
				 *	Since there is a gage, the value for related acres will be
				 *	retrieved from the model.  So, set the model variable
				 *	for acres depending on whether or not the instance is for a
				 *	comparison type of the WaterBudgetHucDataView.
				 */
				if (this.compare) {
					acres = self.model.get('compareWatershedAcres');
				}
				else {
					acres = self.model.get('watershedAcres');
				}
				if (0 !== acres) {
					streamflowDeferred = $.Deferred();
					getDataDeferreds.push(streamflowDeferred);
					NWC.util.fetchMeasuredStreamflowData({
						gage : gage,
						startDate : '1838-01-01',
						convertDateStrFnc : convertTimeToDateStr,
						conversionFnc : convertCfsToMmd
					})
						.done(function(dataTable) {
							var thisDataSeries = NWC.util.DataSeries.newSeries();
							thisDataSeries.data = dataTable;
							thisDataSeries.metadata.seriesLabels.push({
								seriesName : 'Gaged Streamflow (Per Unit Drainage Area)',
								seriesUnits : NWC.util.Units.usCustomary.streamflow.daily
							});
							dataSeries.nwisStreamFlowData = thisDataSeries;
							streamflowDeferred.resolve();
						})
						.fail(function() {
							var errorMessage = 'Error retrieving time series data for nwisStreamFlowData';
							alert(errorMessage);
							streamflowDeferred.reject(errorMessage);
						});
				}
			}


			$.when.apply(null, getDataDeferreds).done(function() {
				self.dataSeriesStore.updateHucSeries(dataSeries);
				deferred.resolve(dataSeries);
			}).fail(function() {
				deferred.reject();
			});

			return deferred.promise();
		},

		/**
		 *	Update the plot with the current dataSeriesStore and model.
		 *	If this is an accumulated type of view from the WaterBudgetHucDataView and there is
		 *	an associated gage with the selected watershed, then streamflow will also be plotted.
		 */
		plotData : function() {
			var normalization = 'normalizedWater';
			var plotTimeDensity  = this.model.get('timeScale');
			var measurementSystem =  this.model.get('units');

			var values = this.dataSeriesStore[plotTimeDensity].getDataAs(measurementSystem, normalization);
			var labels = this.dataSeriesStore[plotTimeDensity].getSeriesLabelsAs(measurementSystem, normalization, plotTimeDensity);
			var ylabel = NWC.util.Units[measurementSystem][normalization][plotTimeDensity];
			var title = ((this.accumulated) ? 'Total Accumulated' : 'Local Incremental') + ' HUC ' + this.hucId;

			NWC.util.Plotter.getPlot(this.$el.find('.waterbudget-plot'), this.$el.find('.waterbudget-legend'), values, labels, ylabel, title);
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

