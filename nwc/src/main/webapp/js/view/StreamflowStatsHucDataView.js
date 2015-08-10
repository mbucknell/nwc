/*jslint browser: true */
/*global OpenLayers*/
/*global $*/
var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the streamflow stats huc data page
 * @constructor extends NWC.BaseView
 */
NWC.view.StreamflowStatsHucDataView = NWC.view.BaseView.extend({

	templateName : 'streamflowHucStats',

	MIN_DATE : Date.create('1980/10/01').utc(),
	MAX_DATE : Date.create('2010/09/30').utc(),

	events : {

		'click .show-plot-btn' : 'plotStreamFlowData',
		'click .download-streamflow-btn' : 'downloadData'
	},

	render : function() {
		NWC.view.BaseView.prototype.render.apply(this, arguments);

		this.map.render(this.insetMapDiv);
		this.streamflowPlotViewLeft = new NWC.view.StreamflowPlotView({
			el : this.$el.find('#left-plot'),
			getDataSeriesPromise : this.getDataSeriesPromise.bind(this)
		});
		this.streamflowPlotViewRight = new NWC.view.StreamflowPlotView({
			el : this.$el.find('#right-plot'),
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

		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		this.map.zoomToExtent(this.map.getMaxExtent());

		this.dataSeriesLoaded = $.Deferred();

		this.calculateStatsViewLeft = new NWC.view.StreamflowCalculateStatsView({
			el : $('#left'),
			years : this.context.years,
			getStats : this.getStats.bind(this),
			getStatsTsvHeader : this.getStatsTsvHeader.bind(this),
			getStatsFilename : this.getStatsFilename.bind(this)
		});

		this.calculateStatsViewRight = new NWC.view.StreamflowCalculateStatsView({
			el : $('#right'),
			years : this.context.years,
			getStats : this.getStats.bind(this),
			getStatsTsvHeader : this.getStatsTsvHeader.bind(this),
			getStatsFilename : this.getStatsFilename.bind(this)
		});

		// Initialize DOM on page
		var $start = $('.start-year option[value="' + this.context.years.first() + '"]');
		var $end = $('.end-year option[value="' + this.context.years.last() + '"]');
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
	 * @returns Jquery promise which is resolved if getDataSeries() returns successfully in init.
	 */
	getDataSeriesPromise : function() {
		return this.dataSeriesLoaded.promise();
	},

	/*
	 * @returns Jquery promise which is resolved with the data series if it is successfully retrieved. If
	 * unsuccessful is is rejected and forwards on the text response of the bad request
	 */
	getDataSeries : function() {
		var self = this;

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

				self.dataSeriesLoaded.resolve(dataSeries);
			},
			error : function(jqXHR, textStatus) {
				self.dataSeriesLoaded.reject(textStatus);
			}
		});
		return self.dataSeriesLoaded.promise();
	},

	plotStreamFlowData : function(ev) {
		var self = this;
		this.getDataSeries();
		
		var plotTitle = 'Modeled Streamflow for the ' + this.hucName + ' Watershed.';

		ev.preventDefault();

		self.$el.find('.show-plot-btn').hide();
		$.when(this.streamflowPlotViewLeft.plotStreamflowData(plotTitle),
				this.streamflowPlotViewRight.plotStreamflowData(plotTitle))
		.done(function(dataSeries) {
			self.dataSeries = dataSeries;
			self.$el.find('.download-streamflow-btn').show();})
		.fail(function(textStatus) {
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
		this.calculateStatsViewLeft.remove();
		this.calculateStatsViewRight.remove();
		this.streamflowPlotViewLeft.remove();
		this.streamflowPlotViewRight.remove();
		NWC.view.BaseView.prototype.remove.apply(this, arguments);
	}
});