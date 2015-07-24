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

	events: {
		'click #counties-button' : 'displayCountyMap',
		'click #compare-hucs-button' : 'goToAddHucMapPage',
		'click #units-btn-group button' : 'changeUnits',
		'click #time-scale-btn-group button' : 'changeTimeScale',
		'click .evapotranspiration-download-button' : 'downloadEvapotranspiration',
		'click .precipitation-download-button' : 'downloadPrecipitation'
	},

	context : {
	},

	initialize : function(options) {

		this.context.hucId = options.hucId;
		this.hucId = options.hucId;
		this.insetHucMapDiv = options.insetHucMapDiv;

		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);

		this.setUpHucPlotModel();

		this.buildHucMap(this.hucId);
		this.getHucData(this.hucId);
		this.hucMap.render(this.insetHucMapDiv);
	},

	setUpHucPlotModel : function() {
		// Add listeners to model
		this.hucPlotModel = new NWC.model.WaterBudgetHucPlotModel();
		this.listenTo(this.hucPlotModel, 'change:units', this.updateUnits);
		this.listenTo(this.hucPlotModel, 'change:timeScale', this.updateTimeScale);

		var newTimeScale = this.hucPlotModel.get('timeScale');
		this.setButtonActive($('#daily-button'), newTimeScale === 'daily');
		this.setButtonActive($('#monthly-button'), newTimeScale === 'monthly');

		var newUnits = this.hucPlotModel.get('units');
		this.setButtonActive($('#customary-button'), newUnits === 'usCustomary');
		this.setButtonActive($('#metric-button'), newUnits === 'metric');
	},

	buildHucMap : function(huc) {

		var d = $.Deferred();

		var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();

		this.hucMap = NWC.util.mapUtils.createMap([baseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

		this.hucLayer = NWC.util.mapUtils.createHucFeatureLayer(huc);

		this.hucLayer.events.on({
			featureadded: function(event){
				this.hucName = event.feature.attributes.hu_12_name;
				this.hucMap.zoomToExtent(this.hucLayer.getDataExtent());

				$('#huc-name').html(event.feature.attributes.hu_12_name);
				$('.evapotranspiration-download-button').prop('disabled', false);
				$('.precipitation-download-button').prop('disabled', false);
				d.resolve();
			},
			loadend: function(event) {
				$('#huc-loading-indicator').hide();
				$('#counties-button').prop('disabled', false);
				$('#compare-hucs-button').prop('disabled', false);
			},
			scope : this
		});

		this.hucMap.addLayer(this.hucLayer);
		this.hucMap.zoomToExtent(this.hucMap.getMaxExtent());

		return d.promise();
	},

	//get and instance of dataSeriesStore
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
			this.plotPTandETaData(this.hucPlotModel.get('timeScale'), this.hucPlotModel.get('units'));
		}.bind(this);
		$.when.apply(null, labeledAjaxCalls).then(dataHandler);
		return;
	},

    /**
     * {String} measurement, the quantity scale of data to plot (usCustomary or metric)
     * {String} time, the time scale of data to plot (daily or monthly)
     */
	plotPTandETaData : function(time, measurement) {

        var normalization = 'normalizedWater';
        var plotTimeDensity  = time;
        var measurementSystem =  measurement;
        var values = this.dataSeriesStore[plotTimeDensity].getDataAs(measurementSystem, normalization);
        var labels = this.dataSeriesStore[plotTimeDensity].getSeriesLabelsAs(
                measurementSystem, normalization, plotTimeDensity);
        var ylabel = NWC.util.Units[measurementSystem][normalization][plotTimeDensity];
        NWC.util.Plotter.getPlot($('#waterBudgetPlot'), $('#waterBudgetLegend'), values, labels, ylabel);
        return;
	},

	displayCountyMap : function() {
		this.hucCountMapView = new NWC.view.HucCountyMapView({
			mapDiv : 'county-selection-map',
			hucFeature : new OpenLayers.Feature.Vector(
					this.hucLayer.features[0].geometry.clone(),
					this.hucLayer.features[0].attributes),
			router : this.router,
			el : $('#county-selection-div')
		});
	},

	goToAddHucMapPage : function() {
		this.router.navigate('waterbudget/map/huc/' + this.hucId, {trigger: true});
	},

	changeUnits : function(ev) {
		ev.preventDefault();
		var newUnits = ev.target.value;
		this.hucPlotModel.set('units', newUnits);
	},

	updateUnits : function(ev) {
		var newUnits = this.hucPlotModel.get('units');
		this.setButtonActive($('#customary-button'), newUnits === 'usCustomary');
		this.setButtonActive($('#metric-button'), newUnits === 'metric');

		this.plotPTandETaData(this.hucPlotModel.get('timeScale'), newUnits);
	},

	changeTimeScale : function(ev) {
		ev.preventDefault();
		var newTimeScale = ev.target.value;
		this.hucPlotModel.set('timeScale', newTimeScale);
	},

	updateTimeScale : function(ev) {
		var newTimeScale = this.hucPlotModel.get('timeScale');
		this.setButtonActive($('#daily-button'), newTimeScale === 'daily');
		this.setButtonActive($('#monthly-button'), newTimeScale === 'monthly');

		this.plotPTandETaData(newTimeScale, this.hucPlotModel.get('units'));
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
	},

	remove : function() {
		if (Object.has(this, 'hucCountyMapView')) {
			this.hucCountyMapView.remove();
		}
		NWC.view.BaseView.prototype.remove.apply(this, arguments);
	}
});