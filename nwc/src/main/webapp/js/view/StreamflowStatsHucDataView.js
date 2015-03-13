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
		'click #calculate-stats-button' : 'calculateStats',
		'click #available-statistics input' : 'calculateStatsEnable'
	},

	context : {
	},

	render : function() {
		NWC.view.BaseView.prototype.render.apply(this, arguments);
		this.map.render(this.insetMapDiv);
	},

	initialize : function(options) {
		this.context.hucId = options.hucId;
		this.context.years = NWC.util.WaterYearUtil.yearsAsArray(NWC.util.WaterYearUtil.waterYearRange(Date.range(this.MIN_DATE, this.MAX_DATE)));
		this.context.streamStatsOptions = NWC.dictionary.statGroups;

		this.insetMapDiv = options.insetMapDiv;

		var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();

		this.map = NWC.util.mapUtils.createMap([baseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

		var hucLayer = NWC.util.mapUtils.createHucSEBasinFeatureLayer(options.hucId);

		//TODO: take out console.log statements. Leaving in console.log statements for now until HUC feature layer works.
		hucLayer.events.on({
			featureadded: function(event){
				this.map.zoomToExtent(this.getDataExtent());

				$('#huc-name').html(event.feature.attributes.HU_12_NAME);
				$('#huc-drainage-area').html(event.feature.attributes.DRAIN_SQKM);
			},
			loadend: function(event) {
				$('#loading-indicator').hide();
			}
		});
		this.map.addLayer(hucLayer);

		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		this.map.zoomToExtent(this.map.getMaxExtent());

		// Initialize DOM on page
		$start = $('#start-year option[value="' + this.context.years.first() + '"]');
		$end = $('#end-year option[value="' + this.context.years.last() + '"]');
		$start.prop('selected', true);
		$end.prop('selected', true);
	},

	calculateStatsEnable : function() {
		var disable = !($('#available-statistics input').is(':checked'));
		$('#calculate-stats-button').prop('disabled', disable);
	},

	calculateStats : function(ev) {
		ev.preventDefault();
		var hucId = this.context.hucId;
		var startDate = NWC.util.WaterYearUtil.waterYearStart($('#start-year option:selected').val());
		var endDate = NWC.util.WaterYearUtil.waterYearEnd($('#end-year option:selected').val());

		var tsvHeader;
		var streamflowStatistics;
		var streamflowStatisticsUrl;
		var streamflowStatisticsTsv;

		var callback = function(statistics, resultsUrl){
			streamflowStatistics = statistics;
			streamflowStatisticsUrl = resultsUrl;
			var tsvValues = "Name\tValue\tDescription\n";
			var i;
			for (i = 0; i < statistics.length; i += 1) {
				if (statistics[i].name) {
					tsvValues += statistics[i].name + "\t";
				}
				else {
					tsvValues += "\t";
				}
				if (statistics[i].value) {
					tsvValues += statistics[i].value + "\t";
				}
				else {
					tsvValues += "\t";
				}
				if (statistics[i].desc) {
					tsvValues += statistics[i].desc + "\n";
				}
				else {
					tsvValues += "\n";
				}
			}
			streamflowStatisticsTsv = tsvHeader + tsvValues;
			$('#stats-results-table-div').html(NWC.templates.getTemplate('statsResults')({streamflowStatistics : streamflowStatistics}));
			$('#stats-results-div').show();
			console.log('Collected streamflow stats');
		};

		var statTypes = [];
		$('#available-statistics input:checked').each(function() {
			statTypes.push($(this).val());
		});

		tsvHeader = "\"# Data derived from National Water Census daily flow estimates.\"\n";
			tsvHeader += "\"# HUC " + hucId +  " was selected.\"\n";
			tsvHeader += "\"# Statistics calculated using the USGS EflowStats Package\"\n";
			tsvHeader += "\"# http://cida.usgs.gov/nwc/ang/#/workflow/streamflow-statistics/select-site \"\n";
			tsvHeader += "\"# http://github.com/USGS-R/EflowStats \"\n";
		NWC.util.streamStats.getHucStats([hucId], statTypes, startDate, endDate, callback);

	}

});
