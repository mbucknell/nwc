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
		'click #available-statistics input' : 'calculateStatsEnable',
		'click #download-stats-button' : 'downloadStats',
		'click #streamflow-data-plot-button' : 'plotStreamFlowData',
		'click #streamflow-data-download-button' : 'downloadModeledData'
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

		this.hucLayer = NWC.util.mapUtils.createHucSEBasinFeatureLayer(options.hucId);

		this.hucLayer.events.on({
			featureadded: function(event){
				this.hucName = event.feature.attributes.HU_12_NAME;
				this.map.zoomToExtent(this.hucLayer.getDataExtent());

				$('#huc-name').html(this.hucName);
				$('#huc-drainage-area').html(event.feature.attributes.DRAIN_SQKM);
			},
			loadend: function(event) {
				$('#loading-indicator').hide();
			},
			scope : this
		});
		this.map.addLayer(this.hucLayer);

		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		this.map.zoomToExtent(this.map.getMaxExtent());

		// Initialize DOM on page
		var $start = $('#start-year option[value="' + this.context.years.first() + '"]');
		var $end = $('#end-year option[value="' + this.context.years.last() + '"]');
		$start.prop('selected', true);
		$end.prop('selected', true);
	},

	calculateStatsEnable : function() {
		var disable = !($('#available-statistics input').is(':checked'));
		$('#calculate-stats-button').prop('disabled', disable);
	},

	_getStatsTsv : function() {
		var statistics = this.streamflowStatistics;
		var tsvHeader = "";
		var tsvValues = "Name\tValue\tDescription\n";
		var i;

		tsvHeader = "\"# Data derived from National Water Census daily flow estimates.\"\n";
		tsvHeader += "\"# HUC " + this.context.hucId +  " was selected.\"\n";
		tsvHeader += "\"# Statistics calculated using the USGS EflowStats Package\"\n";
		tsvHeader += "\"# http://cida.usgs.gov/nwc/ang/#/streamflow-stats/huc/" + this.context.hucId + "\"\n";
		tsvHeader += "\"# http://github.com/USGS-R/EflowStats \"\n";
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
		return tsvHeader + tsvValues;
	},

	_getStatsFilename : function() {
		return 'eflowstats_HUC_' + this.context.hucId + '.tsv';
	},

	calculateStats : function(ev) {
		var hucId = this.context.hucId;
		var startDate = NWC.util.WaterYearUtil.waterYearStart($('#start-year option:selected').val());
		var endDate = NWC.util.WaterYearUtil.waterYearEnd($('#end-year option:selected').val());

		var $loadingIndicator = $('#loading-stats-indicator');
		var $statsResultsDiv = $('#stats-results-div');

		var callback = function(statistics, resultsUrl){
			this.streamflowStatistics = statistics;

			$('#stats-results-table-div').html(NWC.templates.getTemplate('statsResults')({streamflowStatistics : statistics}));
			$statsResultsDiv.show();
			$loadingIndicator.hide();
		}.bind(this);

		var statTypes = [];

		ev.preventDefault();

		$statsResultsDiv.hide();
		$loadingIndicator.show();
		$('#available-statistics input:checked').each(function() {
			statTypes.push($(this).val());
		});

		NWC.util.streamStats.getHucStats([hucId], statTypes, startDate, endDate, callback);
	},

	downloadStats : function(ev) {
		ev.preventDefault();

		var blob = new Blob([this._getStatsTsv()], {type:'text/tsv'});
		saveAs(blob, this._getStatsFilename());
	},

	plotStreamFlowData : function(ev) {
		var sosUrl = NWC.util.buildSosUrlFromSource(this.context.hucId, NWC.util.SosSources.modeledQ);

		var strToDate = function(dateStr){
		  return Date.create(dateStr).utc();
		};

		var modeledFailure = function (response) {
			var message = 'An error occurred while retrieving water withdrawals data from:\n' +
					'See browser logs for details';
			alert(message);
		};

		var modeledSuccess = function (data) {
			$('#streamflow-data-plot-button').hide();
			$('#streamflow-data-download-button').show();
			$('#streamflow-plot-div').show();
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

			var modeledDataSeries = NWC.util.DataSeries.newSeries();
			var TIME_DENSITY = 'daily';
			var MEASUREMENT_SYSTEM = 'usCustomary';

			var plotDivSelector = '#modeledQPlot';
			var legendDivSelector = '#modeledQLegend';

			modeledDataSeries.data = convertedTable;

			//use the series metadata as labels
			var additionalSeriesLabels = NWC.util.SosSources.modeledQ.propertyLongName.split(',');
			additionalSeriesLabels.each(function(label) {
				modeledDataSeries.metadata.seriesLabels.push({
					seriesName: label,
					seriesUnits: NWC.util.SosSources.modeledQ.units
				});
			});
			modeledDataSeries.metadata.downloadHeader = NWC.util.SosSources.modeledQ.downloadMetadata;

			this.modeledDataSeries = modeledDataSeries;

			var values = this.modeledDataSeries.getDataAs(MEASUREMENT_SYSTEM, 'streamflow');
			var labels = this.modeledDataSeries.getSeriesLabelsAs(MEASUREMENT_SYSTEM, 'streamflow', TIME_DENSITY);
			var ylabel = NWC.util.Units[MEASUREMENT_SYSTEM].streamflow[TIME_DENSITY];
			var title = "Modeled Streamflow for the " + this.hucName + ' Watershed.';
			NWC.util.Plotter.getPlot(plotDivSelector, legendDivSelector, values, labels, ylabel, title);
		}.bind(this);

		ev.preventDefault();
		$('#plot-loading-indicator').show();
		$.ajax({
			url: sosUrl,
			success : modeledSuccess,
			error : modeledFailure
		}).always(function() {
			$('#plot-loading-indicator').hide();
		});

	},
	downloadModeledData : function(ev) {
		ev.preventDefault();
		var filename = this.hucName + '_' + this.context.hucId + '_Q.csv';

		var blob = new Blob([this.modeledDataSeries.toCSV()], {type:'text/tsv'});
		saveAs(blob, filename);
	}

});
