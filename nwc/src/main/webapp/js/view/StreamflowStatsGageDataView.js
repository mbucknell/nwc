var NWC = NWC || {};

NWC.view = NWC.view || {}

NWC.view.StreamflowStatsGageDataView = NWC.view.BaseView.extend({

	templateName : 'streamflowGageStats',

	events : {
		'click #calculate-stats-button' : 'calculateStats',
		'click #available-statistics input' : 'calculateStatsEnable',
		'click #download-stats-button' : 'downloadStats'
	},

	context : {},

	render : function() {
		NWC.view.BaseView.prototype.render.apply(this, arguments);
		this.map.render(this.insetMapDiv);
	},

	_retrieveNWISData : function() {
		var NWIS_QUERY_PARAMS = {
			'format': 'rdb',
			'seriesCatalogOutput': 'true',
			'parameterCd': '00060',
			'outputDataTypeCd': 'dv'
		};

		var START_DATE_COL_NAME = 'begin_date';
		var END_DATE_COL_NAME = 'end_date';

		var reformatDateStr = function(dateStr){
			return dateStr.replace(/-/g, '/');
		};
		var strToDate = function(dateStr){
			return Date.create(dateStr).utc();
		};

		var params = $.extend({}, NWIS_QUERY_PARAMS, {sites : this.context.gageId});

		var gageInfoSuccess = function(response) {
			var rdbTables = NWC.util.RdbParser.parse(response);
			if (rdbTables.length === 0) {
				alert('Error parsing NWIS series catalog output response');
			}

			var table = rdbTables[0];
			var startColumn = table.getColumnByName(START_DATE_COL_NAME);
			startColumn = startColumn.map(reformatDateStr);
			startColumn = startColumn.map(strToDate);
			startColumn.sort(function(a, b) {
				return a - b;
			});
			this.startDate = startColumn[0];

			var endColumn = table.getColumnByName(END_DATE_COL_NAME);
			endColumn = endColumn.map(reformatDateStr);
			endColumn = endColumn.map(strToDate);
			endColumn.sort(function(a, b) {
				return b - a;
			});
			this.endDate = endColumn[0];
			return {
				startDate : startColumn[0],
				endDate : endColumn[0]
			};
		};

		var gageInfoFailure = function() {
			alert('An error occurred while asking NWIS web for the period of record for the selected site');
			return {
				startDate : NWC.util.WaterYearUtil.waterYearStart(1981),
				endDate : NWC.util.WaterYearUtil.waterYearEnd(2010)
			}
		}

		var deferred = $.Deferred();
		$.ajax({
			url: CONFIG.endpoint.nwis,
			data : params,
			success : function(response) {
				var dates = gageInfoSuccess(response);
				deferred.resolve(dates);
			},
			error : function() {
				var dates = gageInfoFailure()
				deferred.reject(dates);
			},
			context : this
		});

		return deferred;
	},

	initialize : function(options) {
		this.context.gageId = options.gageId;
		this.context.streamStatsOptions = NWC.dictionary.statGroups;

		this.insetMapDiv = options.insetMapDiv;

		var nwisDataRetrieved = this._retrieveNWISData();

		var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();

		this.map = NWC.util.mapUtils.createMap([baseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

		this.gageLayer = NWC.util.mapUtils.createGageFeatureLayer(options.gageId);
		this.gageMarkerLayer = new OpenLayers.Layer.Markers("Markers");

		var featureLoaded = $.Deferred();
		this.gageLayer.events.on({
			featureadded : function(event) {
				var lonlat = new OpenLayers.LonLat(event.feature.geometry.x, event.feature.geometry.y);
				this.gageMarkerLayer.addMarker(new OpenLayers.Marker(lonlat));

				this.map.zoomToExtent(this.gageLayer.getDataExtent());

				$('#gage-name').html(event.feature.attributes.STANAME);
				$('#drainage-area').html(event.feature.attributes.DRAIN_SQKM);
			},
			loadend: function() {
				featureLoaded.resolve();
			},
			scope : this
		});
		this.map.addLayers([this.gageLayer, this.gageMarkerLayer]);


		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		this.map.zoomToExtent(this.map.getMaxExtent());

		nwisDataRetrieved.always(function(dates) {
			$('#start-period-of-record').html(dates.startDate.format('{yyyy}-{MM}-{dd}'));
			$('#end-period-of-record').html(dates.endDate.format('{yyyy}-{MM}-{dd}'));

			var $startYear = $('#start-year');
			var $endYear = $('#end-year');

			var years = NWC.util.WaterYearUtil.yearsAsArray(NWC.util.WaterYearUtil.waterYearRange(Date.range(dates.startDate, dates.endDate)));
			var i;

			var options = '';
			for (i = 0; i < years.length; i++) {
				options += '<option value="' + years[i] + '">' + years[i] + '</option>';
			}
			$startYear.append(options);
			$endYear.append(options);
			$startYear.find('option:first-child').prop('selected', true);
			$endYear.find('option:last-child').prop('selected', true);
		});
		$.when(nwisDataRetrieved, featureLoaded).done(function () {
			$('#loading-indicator').hide();
		});

	},

	calculateStatsEnable : function() {
		var disable = !($('#available-statistics input').is(':checked'));
		$('#calculate-stats-button').prop('disabled', disable);
	},

	calculateStats : function(ev) {
		var gageId = this.context.gageId;
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

		NWC.util.streamStats.getSiteStats([gageId], statTypes, startDate, endDate, callback);
	},

	_getStatsTsv : function() {
		var statistics = this.streamflowStatistics;
		var tsvHeader = "";
		var tsvValues = "Name\tValue\tDescription\n";
		var i;

		tsvHeader = "\"# Data derived from National Water Census daily flow estimates.\"\n";
		tsvHeader += "\"# HUC " + this.context.hucId +  " was selected.\"\n";
		tsvHeader += "\"# Statistics calculated using the USGS EflowStats Package\"\n";
		tsvHeader += "\"# http://cida.usgs.gov/nwc/ang/#/workflow/streamflow-statistics/select-site \"\n";
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
		return 'eflowstats_NWIS_' + this.context.gageId + '.tsv';
	},

	downloadStats : function(ev) {
		ev.preventDefault();

		var blob = new Blob([this._getStatsTsv()], {type:'text/tsv'});
		saveAs(blob, this._getStatsFilename());
	}
});

