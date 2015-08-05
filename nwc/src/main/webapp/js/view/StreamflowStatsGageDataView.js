/*jslint browser: true */
/*global OpenLayers*/
/*global $*/

var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.StreamflowStatsGageDataView = NWC.view.BaseView.extend({

	templateName : 'streamflowGageStats',

	events : {
		'click .show-plot-btn' : 'plotStreamFlowData'
	},

	/*
	 * Query NWIS for information about this.context.gageId. If the call fails
	 * the deferred will be rejected with a default start and end date. Otherwise the start and
	 * end date will be determined from the returned data.
	 * @return {Jquery.deferred}
	 */
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
			if (startColumn.length === 0) {
				startColumn.push(NWC.util.WaterYearUtil.waterYearStart(1981));
			}

			var endColumn = table.getColumnByName(END_DATE_COL_NAME);
			endColumn = endColumn.map(reformatDateStr);
			endColumn = endColumn.map(strToDate);
			endColumn.sort(function(a, b) {
				return b - a;
			});
			if (endColumn.length === 0) {
				endColumn.push(NWC.util.WaterYearUtil.waterYearEnd(2010));
			}

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
			};
		};

		var deferred = $.Deferred();
		$.ajax({
			url: CONFIG.endpoint.nwis,
			data : params,
			success : function(response) {
				var dates = gageInfoSuccess(response);
				deferred.resolve(dates);
			},
			error : function() {
				var dates = gageInfoFailure();
				deferred.resolve(dates);
			},
			context : this
		});

		return deferred;
	},

	render : function() {
		NWC.view.BaseView.prototype.render.apply(this, arguments);
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
	 *     @prop {String} gageId - Gage shown in this view
	 *     @prop {String} insetMapDiv - id of the inset map div
	 *     @prop {Jquery element} el - jquery element where this view will be rendered.
	 */
	initialize : function(options) {
		var self = this;

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

		// featureLoaded will be resolved when the gageLayer feature has been loaded.
		var featureLoaded = $.Deferred();
		this.gageLayer.events.on({
			featureadded : function(event) {
				var lonlat = new OpenLayers.LonLat(event.feature.geometry.x, event.feature.geometry.y);
				this.gageMarkerLayer.addMarker(new OpenLayers.Marker(lonlat));

				this.map.zoomToExtent(this.gageLayer.getDataExtent());

				$('#gage-name').html(event.feature.attributes.STANAME);
				$('#drainage-area').html(event.feature.attributes.drain_sqkm);
			},
			loadend: function() {
				featureLoaded.resolve();
			},
			scope : this
		});
		this.map.addLayers([this.gageLayer, this.gageMarkerLayer]);

		NWC.view.BaseView.prototype.initialize.apply(this, arguments);

		this.map.zoomToExtent(this.map.getMaxExtent());

		this.calculateStatsViewLeft = new NWC.view.StreamflowCalculateStatsView({
			el : $('#left'),
			years : null,
			getStats : this.getStats.bind(this),
			getStatsTsvHeader : this.getStatsTsvHeader.bind(this),
			getStatsFilename : this.getStatsFilename.bind(this)
		});

		this.calculateStatsViewRight = new NWC.view.StreamflowCalculateStatsView({
			el : $('#right'),
			years : null,
			getStats : this.getStats.bind(this),
			getStatsTsvHeader : this.getStatsTsvHeader.bind(this),
			getStatsFilename : this.getStatsFilename.bind(this)
		});

		nwisDataRetrieved.always(function(dates) {
			self.dates = dates;
			$('#start-period-of-record').html(dates.startDate.format('{yyyy}-{MM}-{dd}'));
			$('#end-period-of-record').html(dates.endDate.format('{yyyy}-{MM}-{dd}'));

			var $startYear = $('.start-year');
			var $endYear = $('.end-year');

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

			// Enable show plot button
			$('.show-plot-btn').removeProp('disabled');
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
		tsvHeader = "\"# Data derived from the USGS NWIS WEB SERVICES.\"\n";
		tsvHeader += "\"# Statistics calculated using the USGS EflowStats Package\"\n";
		tsvHeader += "\"# http://waterdata.usgs.gov/nwis/nwisman/?site_no=" + this.context.gageId + "\"\n";
		tsvHeader += "\"# http://github.com/USGS-R/EflowStats \"\n";

		return tsvHeader;
	},

	getStatsFilename : function() {
		return 'eflowstats_NWIS_' + this.context.gageId + '.tsv';
	},

	/*
	 * @returns Jquery promise which is resolved with the data series if it is successfully retrieved. If
	 * unsuccessful is is rejected and forwards on the text response of the bad request
	 */
	getDataSeriesPromise : function() {
		var deferred = $.Deferred();

		var startDate = this.dates.startDate;
		var endDate = this.dates.endDate;
		var strToDate = function(dateStr){
		  return Date.create(dateStr).utc();
		};

		$.ajax({
			url : CONFIG.endpoint.nwisStreamflow,
			data : this._getStreamflowParams(startDate, endDate, this.context.gageId),
			method : 'GET',
			success : function(response) {
				var dataSeries = NWC.util.DataSeries.newSeries();
				var dataTable = [];

				NWC.util.findXMLNamespaceTags($(response), 'ns1:value').each(function() {
					var row = [];
					var value = parseFloat($(this).text());
					row.push(strToDate($(this).attr('dateTime')));
					row.push(value);
					dataTable.push(row);
				});

				if (dataTable.length === 0) {
					deferred.reject('No data available to plot');
				}
				else {
					dataSeries.data = dataTable;
					dataSeries.metadata.seriesLabels.push({
						seriesName : 'Observed Streamflow',
						seriesUnits : NWC.util.Units.usCustomary.streamflow.daily
					});

					deferred.resolve(dataSeries);
				}
			},
			error : function(jqXHR, textStatus) {
				deferred.reject(textStatus);
			}
		});

		return deferred.promise();
	},

	plotStreamFlowData : function(ev) {
		var self = this;

		var plotTitle = 'Observed Streamflow';

		ev.preventDefault();

		this.streamflowPlotView.plotStreamflowData(plotTitle).done(function(dataSeries) {
			self.dataSeries = dataSeries;
			self.$el.find('.show-plot-btn').hide();
		}).fail(function(args) {
			alert('Retrieving data for this plot failed with error: ' + args[0]);
		});
	},

	remove : function() {
		this.calculateStatsViewLeft.remove();
		this.calculateStatsViewRight.remove();
		this.streamflowPlotView.remove();
		NWC.view.BaseView.prototype.remove.apply(this, arguments);
	},

	_getStreamflowParams : function(startDate, endDate, siteId) {
		return {
			format : 'waterml,1.1',
			sites : siteId,
			startDT : startDate.format('{yyyy}-{MM}-{dd}'),
			endDt : endDate.format('{yyyy}-{MM}-{dd}'),
			statCD : '00003',
			parameterCd : '00060'
		};
	}
});