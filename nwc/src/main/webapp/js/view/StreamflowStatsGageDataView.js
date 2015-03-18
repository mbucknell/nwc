var NWC = NWC || {};

NWC.view = NWC.view || {}

NWC.view.StreamflowStatsGageDataView = NWC.view.BaseStreamflowStatsDataView.extend({

	templateName : 'streamflowGageStats',

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

	render : function() {
		NWC.view.BaseStreamflowStatsDataView.prototype.render.apply(this, arguments);
		this.map.render(this.insetMapDiv);

		return this;
	},

	initialize : function(options) {
		if (!Object.has(this, 'context')) {
			this.context = {};
		}
		this.context.gageId = options.gageId;

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


		NWC.view.BaseStreamflowStatsDataView.prototype.initialize.apply(this, arguments);
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

	getStats : function(statTypes, startDate, endDate) {
		var d = $.Deferred();
		var callback = function(statistics) {
			d.resolve(statistics);
		};

		NWC.util.streamStats.getSiteStats([this.context.gageId], statTypes, startDate, endDate, callback);

		return d;
	},

	getStatsTsvHeader : function() {
		var tsvHeader = "";
		tsvHeader = "\"# Data derived from National Water Census daily flow estimates.\"\n";
		tsvHeader += "\"# Statistics calculated using the USGS EflowStats Package\"\n";
		tsvHeader += "\"# http://waterdata.usgs.gov/nwis/nwisman/?site_no=" + this.context.gageId + "\"\n";
		tsvHeader += "\"# http://github.com/USGS-R/EflowStats \"\n";

		return tsvHeader;
	},

	getStatsFilename : function() {
		return 'eflowstats_NWIS_' + this.context.gageId + '.tsv';
	}
});

