/*jslint browser: true*/
/*global OpenLayers*/

var NWC = NWC || {};
NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.CountyWaterUseView = NWC.view.BaseView.extend({
		NORMALIZED_WATER : "normalizedWater",
		TOTAL_WATER : "totalWater",

		templateName : 'countyWaterUse',

		events: {
			'click #county-units-btn-group button' : 'changeCountyUnits',
			'click #water-use-type-btn-group button' : 'changePlotType',
			'click .wateruse-download-button' : 'downloadWaterUse'
		},

		/*
		 * @constructs
		 * @param {Object} options
		 *     @prop {Jquery element} el - Jquery element where this view will be rendered
		 *     @prop {String} hucId - HUC 12
		 *     @prop {String} fips - county FIPS code
		 */
		initialize : function(options) {
			var self = this;
			var baseLayer;
			var countyLayerLoaded = $.Deferred();
			var hucLayerLoaded = $.Deferred();

			var watershedConfig = NWC.config.getWatershed(options.hucId);
			var waterUseDataLoaded = this.getWaterUseDataSeries(options.fips);

			this.hucId = options.hucId;
			this.fips = options.fips;
			this.context = {
				hucId : this.hucId
			};
			this.countyConfig = NWC.config.get('county').attributes;

			// Create inset map containing the county and the huc
			baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();
			this.map = NWC.util.mapUtils.createMap([baseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

			this.countyLayer = NWC.util.mapUtils.createCountyFeatureLayer(
				this.countyConfig.namespace,
				this.countyConfig.layerName,
				this.fips);
			this.countyLayer.events.on({
				featureadded: function(event){
					this.countyName = event.feature.attributes.full_name.capitalize(true);
					this.countyAreaSqmi = event.feature.attributes.area_sqmi;
					this.$el.find('#water-use-chart-title').html('Water Use for ' + this.countyName + ' County');
					this.$el.find('.wateruse-download-button').prop('disabled', false);
				},
				loadend : function() {
					this.map.zoomToExtent(this.countyLayer.getDataExtent());
					countyLayerLoaded.resolve();
				},
				scope : this
			});
			this.map.addLayer(this.countyLayer);

			this.hucLayer = NWC.util.mapUtils.createHucFeatureLayer(
				watershedConfig.namespace,
				watershedConfig.layerName,
				watershedConfig.property,
				[this.hucId]);
			this.hucLayer.events.on({
				loadend : function() {
					hucLayerLoaded.resolve();
				}
			});
			this.map.addLayer(this.hucLayer);

			// Set up the code to render the water use plot once the county and huc layers have been loaded
			$.when(countyLayerLoaded, hucLayerLoaded).done(function() {
				// Get the intersection info
				var intersectorInfo = NWC.util.hucCountiesIntersector.getCountyIntersectionInfo(
					self.hucLayer.features[0],
					self.countyLayer.features[0]);

				self.$el.find('#percent-of-huc').html('Percentage of watershed in ' + self.countyName + ' County ' +
						NWC.util.numberFormat.roundToInteger(intersectorInfo.hucInCounty) + '%');
				self.$el.find('#percent-of-county').html('Percentage of ' + self.countyName + ' County in watershed ' +
						NWC.util.numberFormat.roundToInteger(intersectorInfo.countyInHuc) + '%');
				self.$el.find('#county-loading-indicator').hide();
			});

			NWC.view.BaseView.prototype.initialize.apply(this, arguments);

			this.setUpCountyPlotModel();
			$.when(waterUseDataLoaded).done(function() {
				self.chartWaterUse();
			});
		},

		render : function() {
			NWC.view.BaseView.prototype.render.apply(this, arguments);
			this.map.render('county-inset');

			return this;
		},

		getWaterUseDataSeries : function(fips) {
			var self = this;
			var waterUseConfig = NWC.config.get('county').attributes.variables.waterUse;
			var deferred = $.Deferred();
			var url = waterUseConfig.getSosUrl(fips);
			this.waterUseDataSeries = NWC.util.DataSeries.newSeries();

			$.ajax({
				url : url,
				success : function(data, textStatus, jqXHR) {
					var parsedTable = NWC.util.SosResponseParser.parseSosResponse(data);

					self.waterUseDataSeries.data = parsedTable;

					//use the series metadata as labels
					var additionalSeriesLabels = waterUseConfig.get('propertyLongName').split(',');
					additionalSeriesLabels.each(function(label) {
						self.waterUseDataSeries.metadata.seriesLabels.push({
							seriesName: label,
							seriesUnits: waterUseConfig.get('units')
						});
					});

					self.waterUseDataSeries.metadata.downloadHeader = waterUseConfig.get('tdownloadMetadata');
					deferred.resolve();
				},
				dataType : "xml",
				error : function() {
					//@todo - setup app level error handling
					var errorMessage = 'An error occurred while retrieving water withdrawal data from:\n' +
					url + '\n' +
					'See browser logs for details';
					alert(errorMessage);
					deferred.reject();
				}
			});

			return deferred.promise();
		},

		/**
		 * Update the water use chart using the countyPlotModel and waterUseDataSeries properties
		 */
		chartWaterUse : function() {
			var chartDivEl = this.$el.find('#waterUsageChart');
			var chartLegendDivEl = this.$el.find('#waterUsageLegend');

			var plotNormalization = this.countyPlotModel.get('plotType');
			var measurementSystem =  this.countyPlotModel.get('units');;
			var plotTimeDensity  = 'daily';
			var normalizationFn = NWC.util.Convert.noop;

			if (this.NORMALIZED_WATER === plotNormalization) {
				normalizationFn = NWC.util.Convert.normalize.fill(undefined, this.countyAreaSqmi);
			}
			var values = this.waterUseDataSeries.getDataAs(measurementSystem, plotNormalization, normalizationFn);
			// get modified Series labels and throw away "Date"
			var labels = this.waterUseDataSeries.getSeriesLabelsAs(
				measurementSystem, plotNormalization, plotTimeDensity).from(1);
			var ylabel = NWC.util.Units[measurementSystem][plotNormalization][plotTimeDensity];

			NWC.util.WaterUsageChart.setChart(chartDivEl, chartLegendDivEl, values, labels, ylabel,
				NWC.util.Units[measurementSystem][plotNormalization].precision);
			return;
		},

		setUpCountyPlotModel : function() {
			// add listeners to model
			this.countyPlotModel = new NWC.model.WaterBudgetCountyPlotModel();
			this.listenTo(this.countyPlotModel, 'change:units', this.updateCountyUnits);
			this.listenTo(this.countyPlotModel, 'change:plotType', this.updatePlotType);

			var newType = this.countyPlotModel.get('plotType');
			this.setButtonActive(this.$el.find('#total-county-button'), newType === 'totalWater');
			this.setButtonActive(this.$el.find('#normalized-county-button'), newType === 'normalizedWater');

			var newUnits = this.countyPlotModel.get('units');
			this.setButtonActive(this.$el.find('#county-customary-button'), newUnits === 'usCustomary');
			this.setButtonActive(this.$el.find('#county-metric-button'), newUnits === 'metric');

			this.setVisibility(this.$el.find('#normalized-warning'), newType === 'normalizedWater');
		},

		changeCountyUnits : function(ev) {
			ev.preventDefault();
			var newUnits = ev.target.value;
			this.countyPlotModel.set('units', newUnits);
		},

		updateCountyUnits : function() {
			var newUnits = this.countyPlotModel.get('units');
			this.setButtonActive(this.$el.find('#county-customary-button'), newUnits === 'usCustomary');
			this.setButtonActive(this.$el.find('#county-metric-button'), newUnits === 'metric');

			this.chartWaterUse();

		},

		changePlotType : function(ev) {
			ev.preventDefault();
			var newType = ev.target.value;
			this.countyPlotModel.set('plotType', newType);
		},

		updatePlotType : function() {
			var newType = this.countyPlotModel.get('plotType');
			this.setButtonActive(this.$el.find('#total-county-button'), newType === 'totalWater');
			this.setButtonActive(this.$el.find('#normalized-county-button'), newType === 'normalizedWater');

			this.setVisibility(this.$el.find('#normalized-warning'), newType === 'normalizedWater');

			this.chartWaterUse();
		},

		downloadWaterUse : function() {
			var blob = new Blob([this.getCombinedWaterUse(this.waterUseDataSeries).toCSV()], {type:'text/csv'});
			saveAs(blob, this.getCountyFilename('water use'));
		},

		getCombinedWaterUse : function(dataSeries) {
			var result = Object.clone(dataSeries);
			result.data = NWC.util.WaterUsageChart.combineData(result.data);
			return result;
		},

		getCountyFilename : function (series) {
			var filename = series + '_data.csv';
			if (this.countyName && this.fips) {
				filename = this.buildName(this.countyName, this.fips, series);
			}
			return filename;
		},

		buildName : function(selectionName, selectionId, series) {
			var filename = selectionName;
			filename += '_' + selectionId;
			filename += '_' + series;
			filename += '.csv';
			filename = filename.replace(/ /g, '_');
			filename = escape(filename);
			return filename;
		}

	});
}());