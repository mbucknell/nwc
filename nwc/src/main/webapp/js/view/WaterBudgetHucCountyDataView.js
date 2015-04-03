var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the water budget huc and county data page
 * @constructor extends NWC.view.WaterBudgetHucDataView
 */

//TODO: Consider extending the standard BaseView and instead create the view in
// WaterBudgetHucDataView when needed.
NWC.view.WaterBudgetHucCountyDataView = NWC.view.WaterBudgetHucDataView.extend({

	NORMALIZED_WATER : "normalizedWater",
	TOTAL_WATER : "totalWater",

	events: {
		'click #county-units-btn-group button' : 'changeCountyUnits',
		'click #water-use-type-btn-group button' : 'changePlotType',
		'click .wateruse-download-button' : 'downloadWaterUse'
	},

	context : {
	},

	initialize : function(options) {

		this.context.hucId = options.hucId;
		this.fips = options.fips;
		this.hucId = options.hucId;
		this.insetHucMapDiv = options.insetHucMapDiv;
		this.insetCountyMapDiv = options.insetCountyMapDiv;

		// call superclass initialize to do default initialize
		// (includes render)
		$.extend(this.events, NWC.view.WaterBudgetHucDataView.prototype.events);
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		this.setUpHucPlotModel();

		$('#wateruse').html(NWC.templates.getTemplate('waterbudgetCountyData')());
		this.setUpCountyPlotModel();
		$('#counties-button').hide();

		var hucMapPromise = this.buildHucMap(this.hucId);
		var countyMapPromise = this.buildCountyMap(this.fips);

		this.hucMap.render(this.insetHucMapDiv);
		this.countyMap.render(this.insetCountyMapDiv);

		$.when(hucMapPromise, countyMapPromise).done(function() {
			// Now we can add the huc to the county map by retrieving the feature from this.hucLayer
			var countyHucLayer = new OpenLayers.Layer.Vector('County Huc Layer', {
				displayInLayerSwitcher : false,
				isBaseLayer : false,
				visibility : true,
				style : {
					strokeWidth: 2,
					strokeColor: 'black',
					fill: false
				}
			});

			var dupHucFeature = new OpenLayers.Feature.Vector(
					this.hucLayer.features[0].geometry.clone(),
					this.hucLayer.features[0].attributes);

			countyHucLayer.addFeatures(dupHucFeature);
			this.countyMap.addLayer(countyHucLayer);

			// Get the intersection info
			var intersectorInfo = NWC.util.hucCountiesIntersector.getCountyIntersectionInfo(
				countyHucLayer.features[0],
				this.countyLayer.features[0]);

			$('#percent-of-huc').html('Percentage of HUC in ' + this.countyName + ' County ' +
					NWC.util.numberFormat.roundToInteger(intersectorInfo.hucInCounty) + '%');
			$('#percent-of-county').html('Percentage of ' + this.countyName + ' County in HUC ' +
					NWC.util.numberFormat.roundToInteger(intersectorInfo.countyInHuc) + '%');
			$('#county-loading-indicator').hide();
		}.bind(this));

		this.getHucData(this.hucId);
		this.getCountyData(this.fips);
	},

	setUpCountyPlotModel : function() {
		// add listeners to model
		this.countyPlotModel = new NWC.model.WaterBudgetCountyPlotModel();
		this.listenTo(this.countyPlotModel, 'change:units', this.updateCountyUnits);
		this.listenTo(this.countyPlotModel, 'change:plotType', this.updatePlotType);

		var newType = this.countyPlotModel.get('plotType');
		this.setButtonActive($('#total-county-button'), newType === 'totalWater');
		this.setButtonActive($('#normalized-county-button'), newType === 'normalizedWater');

		var newUnits = this.countyPlotModel.get('units');
		this.setButtonActive($('#county-customary-button'), newUnits === 'usCustomary');
		this.setButtonActive($('#county-metric-button'), newUnits === 'metric');

		this.setVisibility($('#normalized-warning'), newType === 'normalizedWater');
	},

	buildCountyMap : function(fips) {

		var d = $.Deferred();

		var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();

		this.countyMap = NWC.util.mapUtils.createMap([baseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

		this.countyLayer = NWC.util.mapUtils.createCountyFeatureLayer(fips);

		this.countyLayer.events.on({
			featureadded: function(event){
				this.countyName = event.feature.attributes.full_name.capitalize(true);
				this.countyAreaSqmi = event.feature.attributes.area_sqmi;
				this.countyMap.zoomToExtent(this.countyLayer.getDataExtent());
				$('#water-use-chart-title').html('Water Use for ' + this.countyName + ' County');
				$('.wateruse-download-button').prop('disabled', false);
				d.resolve();
			},
			scope : this
		});

		this.countyMap.addLayer(this.countyLayer);
		this.countyMap.zoomToExtent(this.countyMap.getMaxExtent());

		return d.promise();
	},

	/**
	 * This makes a Web service call to get county data
	 * then makes call to render the data on a chart
	 * @param {String} fips identifier for the county
	 */
	getCountyData: function(fips) {

        var url = NWC.util.buildSosUrlFromSource(fips, NWC.util.SosSources.countyWaterUse);
		var getData = $.ajax({
			url : url,
			success : function(data, textStatus, jqXHR) {
				var parsedTable = NWC.util.SosResponseParser.parseSosResponse(data);

				var waterUseDataSeries = NWC.util.DataSeries.newSeries();
				waterUseDataSeries.data = parsedTable;

                //use the series metadata as labels
                var additionalSeriesLabels = NWC.util.SosSources.countyWaterUse.propertyLongName.split(',');
                additionalSeriesLabels.each(function(label) {
                    waterUseDataSeries.metadata.seriesLabels.push({
                    	seriesName: label,
                    	seriesUnits: NWC.util.SosSources.countyWaterUse.units
                    });
                });

                waterUseDataSeries.metadata.downloadHeader = NWC.util.SosSources.countyWaterUse.downloadMetadata;
                this.waterUseDataSeries = waterUseDataSeries;
			}.bind(this),
			dataType : "xml",
			error : function() {
                //@todo - setup app level error handling
	            var errorMessage = 'An error occurred while retrieving water withdrawal data from:\n' +
                url + '\n' +
                'See browser logs for details';
                alert(errorMessage);
 			}
		});

		var dataHandler = function() {
			this.chartWaterUse(this.countyPlotModel.get('units'), this.countyPlotModel.get('plotType'));
		}.bind(this);
		$.when(getData).then(dataHandler);
		return;
	},

    /**
     * {String} time, the time scale of data to chart (daily or monthly)
     * {String} measurement, the quantity scale of data to chart (usCustomary or metric)
     * {String} type, the type of water use to chart (totalWater or normalizedWater)
     */
	chartWaterUse : function(measurement, type) {
		var time = 'daily';
        var chartDivSelector = '#waterUsageChart';
        var chartLegendDivSelector = '#waterUsageLegend';
        var plotNormalization = type;
        var plotTimeDensity  = time;
        var normalizationFn = NWC.util.Convert.noop;
        var measurementSystem =  measurement;
        if (this.NORMALIZED_WATER === plotNormalization) {
            normalizationFn = NWC.util.Convert.normalize.fill(undefined, this.countyAreaSqmi);
        }
        var values = this.waterUseDataSeries.getDataAs(measurementSystem, plotNormalization, normalizationFn);
        // get modified Series labels and throw away "Date"
        var labels = this.waterUseDataSeries.getSeriesLabelsAs(
            measurementSystem, plotNormalization, plotTimeDensity).from(1);
        var ylabel = NWC.util.Units[measurementSystem][plotNormalization][time]
        NWC.util.WaterUsageChart.setChart(chartDivSelector, chartLegendDivSelector, values, labels, ylabel,
            NWC.util.Units[measurementSystem][plotNormalization].precision);
        return;
	},

	changeCountyUnits : function(ev) {
		ev.preventDefault();
		var newUnits = ev.target.value;
		this.countyPlotModel.set('units', newUnits);
	},

	updateCountyUnits : function() {
		var newUnits = this.countyPlotModel.get('units');
		this.setButtonActive($('#county-customary-button'), newUnits === 'usCustomary');
		this.setButtonActive($('#county-metric-button'), newUnits === 'metric');

		this.chartWaterUse(newUnits, this.countyPlotModel.get('plotType'));

	},

	changePlotType : function(ev) {
		ev.preventDefault();
		var newType = ev.target.value;
		this.countyPlotModel.set('plotType', newType);
	},

	updatePlotType : function() {
		var newType = this.countyPlotModel.get('plotType');
		this.setButtonActive($('#total-county-button'), newType === 'totalWater');
		this.setButtonActive($('#normalized-county-button'), newType === 'normalizedWater');

		this.setVisibility($('#normalized-warning'), newType === 'normalizedWater');


		this.chartWaterUse(this.countyPlotModel.get('units'), newType);
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
	}
});