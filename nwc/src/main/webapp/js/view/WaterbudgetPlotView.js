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
		 * @constructs
		 * @param {Object} options
		 *      @prop {String} hucId - Id of the huc whose waterbudget data is plotted.
		 *      @prop {Jquery element} el - Jquery element where this view should be rendered
		 *      @prop {WaterBudgetHucPlotModel} model - Used to set the units and timeScaled of the plot.
		 *      @prop {String} gageId (optional)
		 *      @prop {Boolean} accumulated - false indicates if this is local watershed, true indicates accumulated.
		 *      @prop {Boolean} compare - True if this plot represents the compare huc
		 *		@prop {WaterBudgetHucPlotModel} model - Used to get the watershed acres
		 */
		initialize : function(options) {
			var self = this;
			this.hucId = options.hucId;
			this.gageId = options.gageId ? options.gageId : null;
			this.accumulated = options.accumulated ? options.accumulated : false;
			this.dataModel = options.compare ? this.model.get('compareHucData') : this.model.get('hucData');

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
			this.listenTo(this.model, 'change:units', this.plotData);
			this.listenTo(this.model, 'change:timeScale', this.plotData);
		},


		/**
		* This makes a Web service call to get huc data and transform it into a data series object.
		* This will also make a web service call to get streamflow data if it is created as an
		* accumulated type of view from the WaterBudgetHucDataView and there is an associated gage
		* with the selected watershed.
		*
		* @param {String} huc 12 digit identifier for the hydrologic unit
		* @param {String} gage (optional) identifier for the streamflow gage
		* @returns {Jquery.promise}
		*		@resolve- when both ETA, daymet, and any streamflow data data has been retrieved.
		*			The model now contains the property dataSeriesStore which contains the data as a NWC.util.DataSeriesStore
		*			object.
		*		@reject - if any of the data fetched can not be retrieved.
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
			var modeledStreamflowDeferred;

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
				 *	retrieved from the model.
				 */
				acres = this.dataModel.get('watershedAcres');

				if (0 !== acres) {
					console.log('acres for measured streamflow is ' + acres);
					streamflowDeferred = $.Deferred();
					getDataDeferreds.push(streamflowDeferred);
					NWC.util.fetchMeasuredStreamflowData({
						gage : gage,
						startDate : '1838-01-01',
						convertDateStrFnc : convertTimeToDateStr,
						convertValueFnc : convertCfsToMmd
					})
						.done(function(dataTable) {
							var thisDataSeries = NWC.util.DataSeries.newSeries();
							thisDataSeries.data = dataTable;
							thisDataSeries.metadata.seriesLabels.push({
								seriesName : 'Runoff (As Streamflow Per Unit Area)',
								seriesUnits : ''
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

			if (this.dataModel.has('modeledWatershedAcres')) {
				acres = this.dataModel.get('modeledWatershedAcres');

				if (acres !== 0 ) {
					console.log('Acres for modeled streamflow is ' + acres);
					modeledStreamflowDeferred = $.Deferred();
					getDataDeferreds.push(modeledStreamflowDeferred);
					NWC.util.fetchModeledStreamflowData({
						hucId : huc,
						convertValueFnc : convertCfsToMmd
					})
						.done(function(dataTable) {
							var thisDataSeries = NWC.util.DataSeries.newSeries();
							thisDataSeries.data = dataTable;
							thisDataSeries.metadata.seriesLabels.push({
								seriesName : 'Runoff (As Streamflow Per Unit Area)',
								seriesUnits : ''
							});
							dataSeries.modeledStreamflowData = thisDataSeries;
							modeledStreamflowDeferred.resolve();
						})
						.fail(function() {
							var errorMessage = 'Error retrieving time series data for modeledStreamflowData';
							alert(errorMessage);
							modeledStreamflowDeferred.reject(errorMessage);
						});
				}
			}

			$.when.apply(null, getDataDeferreds).done(function() {
				var dataSeriesStore = new NWC.util.DataSeriesStore();
				dataSeriesStore.updateHucSeries(dataSeries);
				self.dataModel.set('dataSeriesStore', dataSeriesStore);

				deferred.resolve();
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

			var values, labels, ylabel, title;
			var dataSeriesStore;

			if (this.dataModel.has('dataSeriesStore')) {
				dataSeriesStore = this.dataModel.get('dataSeriesStore');
				values = dataSeriesStore[plotTimeDensity].getDataAs(measurementSystem, normalization);
				labels = dataSeriesStore[plotTimeDensity].getSeriesLabelsAs(measurementSystem, normalization, plotTimeDensity);
				ylabel = NWC.util.Units[measurementSystem][normalization][plotTimeDensity];
				title = ((this.accumulated) ? 'Total Upstream' : 'Local Incremental') + ' HUC ' + this.hucId;

				NWC.util.Plotter.getPlot(this.$el.find('.waterbudget-plot'), this.$el.find('.waterbudget-legend'), values, labels, ylabel, title);
			}
		},

		downloadEvapotranspiration : function() {
			var blob = new Blob([this.dataModel.get('dataSeriesStore').eta.toCSV()], {type:'text/csv'});
			saveAs(blob, this.getHucFilename('eta'));
		},

		downloadPrecipitation : function() {
			var blob = new Blob([this.dataModel.get('dataSeriesStore').dayMet.toCSV()], {type:'text/csv'});
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

