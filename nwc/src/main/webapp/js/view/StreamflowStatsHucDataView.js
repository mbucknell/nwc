/*jslint browser: true */
/*global OpenLayers*/
/*global $*/
var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the streamflow stats huc data page
 * @constructor extends NWC.BaseView
 */
NWC.view.StreamflowStatsHucDataView = NWC.view.BaseStreamflowStatsDataView.extend({

	templateName : 'streamflowHucStats',

	MIN_DATE : Date.create('1980/10/01').utc(),
	MAX_DATE : Date.create('2010/09/30').utc(),

	events : {

		'click .show-plot-btn' : 'plotStreamFlowData',
		'click .download-streamflow-btn' : 'downloadData'
	},

	render : function() {
		NWC.view.BaseStreamflowStatsDataView.prototype.render.apply(this, arguments);

		this.map.render(this.insetMapDiv);
		this.streamflowPlotView = new NWC.view.StreamflowPlotView({
			el : this.$el.find('.streamflow-plot-container'),
			getDataSeriesPromise : this.getDataSeriesPromise.bind(this)
		});
		return this;
	},

	/*
	 * @construct
	 * @param {Object} options
	 *
	 *     @prop {String} hucId - Huc shown in this view
	 *     @prop {String} insetMapDiv - id of the inset map div
	 *     @prop {Jquery element} el - jquery element where this view will be rendered.
	 */
	initialize : function(options) {
		if (!Object.has(this, 'context')) {
			this.context = {};
		}
		this.context.hucId = options.hucId;
		this.context.years = NWC.util.WaterYearUtil.yearsAsArray(NWC.util.WaterYearUtil.waterYearRange(Date.range(this.MIN_DATE, this.MAX_DATE)));

		this.insetMapDiv = options.insetMapDiv;

		var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();

		this.map = NWC.util.mapUtils.createMap([baseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

		this.hucLayer = NWC.util.mapUtils.createHucSEBasinFeatureLayer(options.hucId);

		this.hucLayer.events.on({
			featureadded: function(event){
				this.hucName = event.feature.attributes.hu_12_name;
				this.map.zoomToExtent(this.hucLayer.getDataExtent());

				$('#huc-name').html(this.hucName);
				$('#huc-drainage-area').html(event.feature.attributes.drain_sqkm);
			},
			loadend: function(event) {
				$('#loading-indicator').hide();
			},
			scope : this
		});
		this.map.addLayer(this.hucLayer);

		$.extend(this.events, NWC.view.BaseStreamflowStatsDataView.prototype.events);
		NWC.view.BaseStreamflowStatsDataView.prototype.initialize.apply(this, arguments);
		this.map.zoomToExtent(this.map.getMaxExtent());

		// Initialize DOM on page
		var $start = $('#start-year option[value="' + this.context.years.first() + '"]');
		var $end = $('#end-year option[value="' + this.context.years.last() + '"]');
		$start.prop('selected', true);
		$end.prop('selected', true);
	},

	getStats : function(statTypes, startDate, endDate) {
		var d = $.Deferred();
		var callback = function(statistics) {
			d.resolve(statistics);
		};

		NWC.util.streamStats.getHucStats([this.context.hucId], statTypes, startDate, endDate, callback);

		return d;
	},

	getStatsTsvHeader : function() {
		var tsvHeader = "";

		tsvHeader = "\"# Data derived from National Water Census daily flow estimates.\"\n";
		tsvHeader += "\"# HUC " + this.context.hucId +  " was selected.\"\n";
		tsvHeader += "\"# Statistics calculated using the USGS EflowStats Package\"\n";
		tsvHeader += "\"# http://cida.usgs.gov/nwc/#streamflow-stats/huc/" + this.context.hucId + "\"\n";
		tsvHeader += "\"# http://github.com/USGS-R/EflowStats \"\n";

		return tsvHeader;
	},

	getStatsFilename : function() {
		return 'eflowstats_HUC_' + this.context.hucId + '.tsv';
	},

	/*
	 * @returns Jquery promise which is resolved with the data series if it is successfully retrieved. If
	 * unsuccessful is is rejected and forwards on the text response of the bad request
	 */
	getDataSeriesPromise : function() {
		var deferred = $.Deferred();

		var sosUrl = NWC.util.buildSosUrlFromSource(this.context.hucId, NWC.util.SosSources.modeledQ);

		var strToDate = function(dateStr){
		  return Date.create(dateStr).utc();
		};

		$.ajax({
			url: sosUrl,
			success : function(data) {
				var dataSeries = NWC.util.DataSeries.newSeries();
				var parsedTable = NWC.util.SosResponseFormatter.formatSosResponse(data);
				var convertedTable = parsedTable.map(function(row) {
					return row.map(function(column, index){
						var val = column;
						if (index === 0) {
							val = strToDate(column);
						}
					return val;
					});
				});
				var additionalSeriesLabels = NWC.util.SosSources.modeledQ.propertyLongName.split(',');

				dataSeries.data = convertedTable;

				additionalSeriesLabels.each(function(label) {
					dataSeries.metadata.seriesLabels.push({
						seriesName: label,
						seriesUnits: NWC.util.SosSources.modeledQ.units
					});
				});
				dataSeries.metadata.downloadHeader = NWC.util.SosSources.modeledQ.downloadMetadata;

				deferred.resolve(dataSeries);
			},
			error : function(jqXHR, textStatus) {
				deferred.reject(textStatus);
			}
		});
		return deferred.promise();
	},

	plotStreamFlowData : function(ev) {
		var self = this;
		var plotTitle = 'Modeled Streamflow for the ' + this.hucName + ' Watershed.';
		ev.preventDefault();

		this.streamflowPlotView.plotStreamflowData(plotTitle).done(function(dataSeries) {
			self.dataSeries = dataSeries;
			self.$el.find('.show-plot-btn').hide();
			self.$el.find('.download-streamflow-btn').show();
		}).fail(function(textStatus) {
			alert('Retrieving data for this plot failed with error: ' + textStatus);
		});
	},

	downloadData : function(ev) {
		ev.preventDefault();
		if (Object.has(this, 'dataSeries')) {
			var filename = this.hucName + '_' + this.context.hucId + '_Q.csv';

			var blob = new Blob([this.dataSeries.toCSV()], {type:'text/tsv'});
			saveAs(blob, filename);
		}
		else {
			alert('No data available to download');
		}
	},

	remove : function() {
		this.streamflowPlotView.remove();
		NWC.view.BaseStreamflowStatsDataView.prototype.remove.apply(this, arguments);
	}
});
