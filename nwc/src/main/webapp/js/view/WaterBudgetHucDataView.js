var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the water budget huc data page
 * @constructor extends NWC.BaseView
 */

NWC.view.WaterBudgetHucDataView = NWC.view.BaseView.extend({

	templateName : 'waterbudgetHucData',

	ETA : "eta",
	DAY_MET : "dayMet",
	DAILY : "daily",
	MONTHLY : "monthly",
	METRIC : "metric",
	CUSTOMARY : "usCustomary",

	events: {
		'click .back-button' : 'goToWaterbudget',
		'click #counties-button' : 'displayCountyMap',
		'click .metric-button' : 'toggleMetricLegend',
		'click .customary-button' : 'toggleCustomaryLegend',
		'click .monthly-button' : 'toggleMonthlyLegend',
		'click .daily-button' : 'toggleDailyLegend',
		'click .evapotranspiration-download-button' : 'downloadEvapotranspiration',
		'click .precipitation-download-button' : 'downloadPrecipitation'
	},

	context : {
	},

	initialize : function(options) {

		this.context.hucId = options.hucId;
		this.hucId = options.hucId;
		//TODO take out
		if (Object.has(options, 'fips')) {
			this.fips = options.fips;
			console.log('Passed in fips ' + options.fips);
		}
		this.insetMapDiv = options.insetMapDiv;

		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);

		this.buildMap(this.hucId);
		this.getHucData(this.hucId);
		this.map.render(this.insetMapDiv);
	},

	buildMap : function(huc) {

		var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();

		this.map = NWC.util.mapUtils.createMap([baseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

		this.hucLayer = NWC.util.mapUtils.createHucFeatureLayer(huc);

		this.hucLayer.events.on({
			featureadded: function(event){
				this.hucName = event.feature.attributes.HU_12_NAME;
				this.map.zoomToExtent(this.hucLayer.getDataExtent());

				$('#huc-name').html(event.feature.attributes.HU_12_NAME);
				$('.evapotranspiration-download-button').prop('disabled', false);
				$('.precipitation-download-button').prop('disabled', false);
			},
			loadend: function(event) {
				$('#loading-indicator').hide();
			},
			scope : this
		});

		this.map.addLayer(this.hucLayer);
		this.map.zoomToExtent(this.map.getMaxExtent());

		return;
	},

	/* then makes call to render the data on a plot
	 * @param {String} huc 12 digit identifier for the hydrologic unit
	 */
	dataSeriesStore : new NWC.util.DataSeriesStore(),

	/**
	 * This makes a Web service call to get huc data
	 * then makes call to render the data on a plot
	 * @param {String} huc 12 digit identifier for the hydrologic unit
	 */
	getHucData: function(huc) {
		var labeledResponses = {};
		var labeledAjaxCalls = [];
		//grab the sos sources that will be used to display the initial data
		//series. ignore other data sources that the user can add later.
		var initialSosSourceKeys = [this.ETA, this.DAY_MET];
		var initialSosSources = Object.select(NWC.util.SosSources, initialSosSourceKeys);
		Object.keys(initialSosSources, function (sourceId, source) {
			var d;
			d = $.Deferred();
			labeledAjaxCalls.push(d);
			var url = NWC.util.buildSosUrlFromSource(huc, source);
			$.ajax({
				url : url,
				success : function(data, textStatus, jqXHR) {
					var label = this.valueOf();
					var parsedValues = NWC.util.SosResponseFormatter.formatSosResponse(data);
					var labeledDataSeries = NWC.util.DataSeries.newSeries();
					labeledDataSeries.metadata.seriesLabels.push(
						{
							seriesName: NWC.util.SosSources[label].propertyLongName,
							seriesUnits: NWC.util.SosSources[label].units
						}
					);
					labeledDataSeries.metadata.downloadHeader = NWC.util.SosSources[label].downloadMetadata;
					labeledDataSeries.data = parsedValues;
					labeledResponses[label] = labeledDataSeries;
					d.resolve();
				},
				context : sourceId,
				dataType : "xml",
				error : function() {
                    //@todo - setup app level error handling
                    var errorMessage = 'error retrieving time series data';
                    alert(errorMessage);
                    d.reject();
				}
			});
        });
		var dataHandler = function() {
			this.dataSeriesStore.updateHucSeries(labeledResponses);
			this.plotPTandETaData(this.DAILY, this.CUSTOMARY);
		}.bind(this);
		$.when.apply(null, labeledAjaxCalls).then(dataHandler);
		return;
	},

    /**
     * {String} measurement, the quantity scale of data to plot (usCustomary or metric)
     * {String} time, the time scale of data to plot (daily or monthly)
     */
	plotPTandETaData : function(time, measurement) {
        var plotDivSelector = '#waterBudgetPlot';
        var legendDivSelector = '#waterBudgetLegend';
        var normalization = 'normalizedWater';
        var plotTimeDensity  = time;
        var measurementSystem =  measurement;
        var values = this.dataSeriesStore[plotTimeDensity].getDataAs(measurementSystem, normalization);
        var labels = this.dataSeriesStore[plotTimeDensity].getSeriesLabelsAs(
                measurementSystem, normalization, plotTimeDensity);
        var ylabel = NWC.util.Units[measurementSystem][normalization][plotTimeDensity];
        NWC.util.Plotter.getPlot(plotDivSelector, legendDivSelector, values, labels, ylabel);
        return;
	},

	_addIntersectingCountiesLayer: function(hucFeature, map) {
		var intersectionFilter = new OpenLayers.Filter.Spatial({
			type: OpenLayers.Filter.Spatial.INTERSECTS,
			property: 'the_geom',
			value: hucFeature.geometry
		});

		var intersectingCountiesLayer = new OpenLayers.Layer.Vector(
			'Historical Counties',
			{
				displayInLayerSwitcher: false,
				strategies: [new OpenLayers.Strategy.Fixed()],
				styleMap: new OpenLayers.StyleMap({
					strokeWidth: 3,
					strokeColor: '#333333',
					fillColor: '#FF9900',
					fillOpacity: 0.4,
					//Display County Name
					label: '${NAME}',
					fontSize: '2em',
					fontWeight: 'bold',
					labelOutlineColor: "white",
					labelOutlineWidth: 1,
					labelAlign: 'cm',
					cursor: 'pointer'
				}),
				filter: intersectionFilter,
				protocol: new OpenLayers.Protocol.WFS({
					version: '1.1.0',
					url: CONFIG.endpoint.geoserver + 'wfs',
					featureType: "US_Historical_Counties",
					featureNS: 'http://cida.usgs.gov/NWC',
					geometryName: 'the_geom',
					srsName: 'EPSG:900913'
				})
			}
		);
		map.addLayer(intersectingCountiesLayer);

		intersectingCountiesLayer.events.register('featuresadded',
			intersectingCountiesLayer,
			function() {
				console.log('added county layer');
				var countyFeatures = intersectingCountiesLayer.features;

				var countiesHucInfo = NWC.util.hucCountiesIntersector.getCountiesIntersectionInfo(hucFeature, countyFeatures);
				$('#county-table-div').html(NWC.templates.getTemplate('countyHucTable')({countiesHucInfo : countiesHucInfo}));

				var countiesExtent = intersectingCountiesLayer.getDataExtent();
				map.zoomToExtent(countiesExtent);
			}
		);
		return intersectingCountiesLayer;
	},

	displayCountyMap : function() {
		$('#county-selection-div').show();
		var countyMapBaseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();
		this.countyMap = NWC.util.mapUtils.createMap([countyMapBaseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

		// Get huc feature from the this.hucLayer
		var hucFeatures = this.hucLayer.features;
		this.countyHucFeatureLayer = new OpenLayers.Layer.Vector('County Huc Layer', {
			displayInLayerSwitcher : false,
			isBaseLayer : false,
			visibility : true,
			opacity: 0.6,
			style : {
				fillColor: '#00FF00',
				fillOpacity: 0.6
			}
		});
		this.countyHucFeatureLayer.addFeatures(hucFeatures);
		this.countyMap.addLayer(this.countyHucFeatureLayer);

		var countiesLayer = this._addIntersectingCountiesLayer(hucFeatures[0], this.countyMap);

		// Set up control
		var selectControl = new OpenLayers.Control.SelectFeature(countiesLayer, {
			onSelect : (function(feature) {
				this.router.navigate('/waterbudget/huc/' + this.hucId + '/county/' + feature.attributes.FIPS, {
					trigger : true
				});
			}).bind(this)
		});
		this.countyMap.addControl(selectControl);
		selectControl.activate();

		this.countyMap.render('county-selection-map');
		// Need to zoom to extent of county layer.
		this.countyMap.zoomToExtent(this.countyHucFeatureLayer.getDataExtent());
	},

	toggleMetricLegend : function() {
		$('.customary-button').prop('disabled', false);
		$('.metric-button').prop('disabled','disabled');
		if ($('.daily-button').prop('disabled')) {
			this.plotPTandETaData(this.DAILY, this.METRIC);
		}
		else {
			this.plotPTandETaData(this.MONTHLY, this.METRIC);
		}
	},

	toggleCustomaryLegend : function() {
		$('.metric-button').prop('disabled', false);
		$('.customary-button').prop('disabled','disabled');
		if ($('.daily-button').prop('disabled')) {
			this.plotPTandETaData(this.DAILY, this.CUSTOMARY);
		}
		else {
			this.plotPTandETaData(this.MONTHLY, this.CUSTOMARY);
		}
	},

	toggleMonthlyLegend : function() {
		$('.daily-button').prop('disabled', false);
		$('.monthly-button').prop('disabled','disabled');
		if ($('.customary-button').prop('disabled')) {
			this.plotPTandETaData(this.MONTHLY, this.CUSTOMARY);
		}
		else {
			this.plotPTandETaData(this.MONTHLY, this.METRIC);
		}
	},

	toggleDailyLegend : function() {
		$('.daily-button').prop('disabled','disabled');
		$('.monthly-button').prop('disabled', false);
		if (this.$('.customary-button').prop('disabled')) {
			this.plotPTandETaData(this.DAILY, this.CUSTOMARY);
		}
		else {
			this.plotPTandETaData(this.DAILY, this.METRIC);
		}
	},

	downloadEvapotranspiration : function() {
		var blob = new Blob([this.dataSeriesStore.eta.toCSV()], {type:'text/csv'});
		saveAs(blob, this.getHucFilename('eta'));
		return;
	},

	downloadPrecipitation : function() {
		var blob = new Blob([this.dataSeriesStore.dayMet.toCSV()], {type:'text/csv'});
		saveAs(blob, this.getHucFilename('dayMet'));
		return;
	},

	getHucFilename : function (series) {
		var filename = series + '_data.csv';
        if (this.hucName && this.hucId) {
        	filename = this.buildName(this.hucName, this.hucId, series);
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