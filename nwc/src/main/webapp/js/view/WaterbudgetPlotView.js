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
		 *		@prop {WaterBudgetHucPlotModel} model - Used to get the watershed acres 
		 * @returns {undefined}
		 */
		initialize : function(options) {
			var self = this;
			this.hucId = options.hucId;
			this.gageId = options.gageId ? options.gageId : null;
			var accumulated = options.accumulated ? options.accumulated : false;
			
			if (accumulated) {
				this.watershedVariables = NWC.config.get('accumulated').attributes.variables;
			}
			else {
				this.watershedVariables = NWC.config.getWatershed(options.hucId).variables;
			}
			
			this.compare = options.compare ? options.compare : false;

			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
			this.getHucDataPromise = this.getPlotData(options.hucId, this.gageId).done(function() {
				self.$el.find('.download-btn-container button').prop('disabled', false);
			});

			this.plotData();
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
		* @param {String} gageId (optional) identifier for the streamflow gage
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
			
			var acres;
			//for an accumulated view, there may or may not be a gage
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
				if (0 != acres) {  //check with dave to see if this is possible
					this.streamflowGageConfig = NWC.config.get('streamflow').gage.attributes.variables;
					sosSources.nwisStreamFlowData = this.streamflowGageConfig.nwisStreamFlowData;
				}
			}

			this.dataSeriesStore = new NWC.util.DataSeriesStore();

			Object.keys(sosSources, function (sourceId, source) {
				var d = $.Deferred();
				
				dataSeries[sourceId] = NWC.util.DataSeries.newSeries();
				getDataDeferreds.push(d);
				
				if (sourceId === 'nwisStreamFlowData') {					
					var startDate = '1838-01-01';
					var parseDateStr = function(dateStr){
						var tokens = dateStr.split('T');
						var newDateStr = tokens[0].replace(/-/g, '/');
						newDateStr = newDateStr.trim();
					  return newDateStr;
					};

					$.ajax({
						url : CONFIG.endpoint.nwisStreamflow,
						data : $.extend({}, self.streamflowGageConfig.nwisStreamFlowData.queryParams, {
							sites : gage,
							startDT : startDate,
						}),
						method : 'GET',
						success : function(response) {
							var dataTable = [];
							var thisDataSeries = dataSeries[sourceId];

							NWC.util.findXMLNamespaceTags($(response), 'ns1:value').each(function() {
								var row = [];
								var value = parseFloat($(this).text());
								if (-999999 === value) {
									value = Number.NaN;
								}
								else {
									value = NWC.util.Convert.cfsToMmd(value, acres)
								}
								row.push(parseDateStr($(this).attr('dateTime')));
								row.push(value);
								dataTable.push(row);
							});

							if (dataTable.length === 0) {
								var errorMessage = 'No data available to plot ' + self.sourceId;
								console.log(errorMessage);
							}
							else {
								thisDataSeries.data = dataTable;
								thisDataSeries.metadata.seriesLabels.push({
									seriesName : 'Observed Streamflow',
									seriesUnits : NWC.util.Units.usCustomary.streamflow.daily
								});
								d.resolve();
							}
						},
						error : function(jqXHR, textStatus) {
							var errorMessage = 'Error retrieving time series data for ' + self.sourceId;
							alert(errorMessage);
							d.reject(errorMessage);
						}
					});
				}
				else {
					$.ajax({
						url : source.getSosUrl(huc),
						dataType : "xml",
						success : function(data, textStatus, jqXHR) {
							var parsedValues = NWC.util.SosResponseFormatter.formatSosResponse(data);
							var thisDataSeries = dataSeries[sourceId];

							thisDataSeries.metadata.seriesLabels.push({
								seriesName: source.get('propertyLongName'),
								seriesUnits: source.get('units')
							});

							thisDataSeries.metadata.downloadHeader = source.get('downloadMetadata');
							thisDataSeries.data = parsedValues;

							d.resolve();
						},
						error : function() {
							var errorMessage = 'Error retrieving time series data for ' + this.sourceId;
							alert(errorMessage);
							d.reject(errorMessage);
						}
					});	
				}
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
		 *	Update the plot with the current dataSeriesStore and model.
		 *	If this is an accumulated type of view from the WaterBudgetHucDataView and there is
		 *	an associated gage with the selected watershed, then streamflow will also be plotted. 
		 */
		plotData : function() {
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

