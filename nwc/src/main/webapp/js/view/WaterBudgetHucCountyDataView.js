var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the water budget huc and county data page
 * @constructor extends NWC.view.WaterBudgetHucDataView
 */

NWC.view.WaterBudgetHucCountyDataView = NWC.view.WaterBudgetHucDataView.extend({

	templateName : 'waterbudgetHucData',

	NORMALIZED_WATER : "normalizedWater",
	TOTAL_WATER : "totalWater",

	events: {
		'click .back-button' : 'waterbudgetHucData',
		'click .metric-button' : 'toggleMetricLegend',
		'click .customary-button' : 'toggleCustomaryLegend',
		'click .total-county-button' : 'toggleTotalCountyWaterUse',
		'click .normalized-county-button' : 'toggleNormalizedCountyWaterUse',
		'click .wateruse-download-button' : 'downloadWateruse',
		'click .monthly-button' : 'toggleMonthlyLegend',
		'click .daily-button' : 'toggleDailyLegend'
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
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		$('#wateruse').show();
		$('#counties-button').hide();
		$('#normalized-warning').hide();

		var hucMapPromise = this.buildHucMap(this.hucId);
		var countyMapPromise = this.buildCountyMap(this.fips)

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
					intersectorInfo.hucInCounty + '%');
			$('#percent-of-county').html('Percentage of ' + this.countyName + ' County in HUC ' +
					intersectorInfo.countyInHuc + '%');
			$('#county-loading-indicator').hide();			
		}.bind(this));
		
		this.getHucData(this.hucId);
		this.getCountyData(this.fips);
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
			this.chartWaterUse(this.DAILY, this.CUSTOMARY, this.TOTAL_WATER);
		}.bind(this);
		$.when(getData).then(dataHandler);
		return;
	},

    /**
     * {String} time, the time scale of data to chart (daily or monthly)
     * {String} measurement, the quantity scale of data to chart (usCustomary or metric)
     * {String} type, the type of water use to chart (totalWater or normalizedWater)
     */
	chartWaterUse : function(time, measurement, type) {
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
        var ylabel = NWC.util.Units[measurementSystem][plotNormalization].daily; //is this correct?
        NWC.util.WaterUsageChart.setChart(chartDivSelector, chartLegendDivSelector, values, labels, ylabel,
            NWC.util.Units[measurementSystem][plotNormalization].precision);
        return;
	},	
	
	//TODO refactor the toggle functions (WATERSMART-510)
	
	toggleMetricLegend : function() {
		//metric scale selected
		if ($('.daily-button').prop('disabled')) {
			//daily was selected
			if ($('.total-county-button').prop('disabled')) {
				//total was selected
				this.chartWaterUse(this.DAILY, this.METRIC, this.TOTAL_WATER);
			}
			else {
				//normalized was selected
				this.chartWaterUse(this.DAILY, this.METRIC, this.NORMALIZED_WATER);
			}			
		}
		else {
			//monthly was selected
			if ($('.total-county-button').prop('disabled')) {
				//total was selected
				this.chartWaterUse(this.MONTHLY, this.METRIC, this.TOTAL_WATER);
			}
			else {
				//normalized was selected
				this.chartWaterUse(this.MONTHLY, this.METRIC, this.NORMALIZED_WATER);
			}						
		}		
		NWC.view.WaterBudgetHucDataView.prototype.toggleMetricLegend.apply(this, arguments);
	},

	toggleCustomaryLegend : function() {
		//customary scale selected
		if ($('.daily-button').prop('disabled')) {
			//daily was selected
			if ($('.total-county-button').prop('disabled')) {
				//total was selected
				this.chartWaterUse(this.DAILY, this.CUSTOMARY, this.TOTAL_WATER);
			}
			else {
				//normalized was selected
				this.chartWaterUse(this.DAILY, this.CUSTOMARY, this.NORMALIZED_WATER);
			}			
		}
		else {
			//monthly was selected
			if ($('.total-county-button').prop('disabled')) {
				//total was selected
				this.chartWaterUse(this.MONTHLY, this.CUSTOMARY, this.TOTAL_WATER);
			}
			else {
				//normalized was selected
				this.chartWaterUse(this.MONTHLY, this.CUSTOMARY, this.NORMALIZED_WATER);
			}						
		}		
		NWC.view.WaterBudgetHucDataView.prototype.toggleCustomaryLegend.apply(this, arguments);
	},

	toggleTotalCountyWaterUse : function() {
		$('#normalized-warning').hide();
		$('.total-county-button').prop('disabled', true);
		$('.normalized-county-button').prop('disabled', false);

		//total county selected
		if ($('.metric-button').prop('disabled')) {
			//metric was selected
			if ($('.daily-button').prop('disabled')) {
				//daily was selected
				this.chartWaterUse(this.DAILY, this.METRIC, this.TOTAL_WATER);
			}
			else {
				//monthly was selected
				this.chartWaterUse(this.MONTHLY, this.METRIC, this.TOTAL_WATER);
			}			
		}
		else {
			//customary was selected
			if ($('.daily-button').prop('disabled')) {
				//daily was selected
				this.chartWaterUse(this.DAILY, this.CUSTOMARY, this.TOTAL_WATER);
			}
			else {
				//monthly was selected
				this.chartWaterUse(this.MONTHLY, this.CUSTOMARY, this.TOTAL_WATER);
			}						
		}		
		return;
	},

	toggleNormalizedCountyWaterUse : function() {
		$('#normalized-warning').show();
		$('.total-county-button').prop('disabled', false);
		$('.normalized-county-button').prop('disabled', true);

		//normalized selected
		if ($('.metric-button').prop('disabled')) {
			//metric was selected
			if ($('.daily-button').prop('disabled')) {
				//daily was selected
				this.chartWaterUse(this.DAILY, this.METRIC, this.NORMALIZED_WATER);
			}
			else {
				//monthly was selected
				this.chartWaterUse(this.MONTHLY, this.METRIC, this.NORMALIZED_WATER);
			}			
		}
		else {
			//customary was selected
			if ($('.daily-button').prop('disabled')) {
				//daily was selected
				this.chartWaterUse(this.DAILY, this.CUSTOMARY, this.NORMALIZED_WATER);
			}
			else {
				//monthly was selected
				this.chartWaterUse(this.MONTHLY, this.CUSTOMARY, this.NORMALIZED_WATER);
			}						
		}		
	},

	toggleMonthlyLegend : function() {
		//monthly selected
		if ($('.metric-button').prop('disabled')) {
			//metric was selected
			if ($('.total-county-button').prop('disabled')) {
				//total was selected
				this.chartWaterUse(this.MONTHLY, this.METRIC, this.TOTAL_WATER);
			}
			else {
				//normalized was selected
				this.chartWaterUse(this.MONTHLY, this.METRIC, this.NORMALIZED_WATER);
			}			
		}
		else {
			//customary was selected
			if ($('.total-county-button').prop('disabled')) {
				//total was selected
				this.chartWaterUse(this.MONTHLY, this.CUSTOMARY, this.TOTAL_WATER);
			}
			else {
				//normalized was selected
				this.chartWaterUse(this.MONTHLY, this.CUSTOMARY, this.NORMALIZED_WATER);
			}						
		}		
		NWC.view.WaterBudgetHucDataView.prototype.toggleMonthlyLegend.apply(this, arguments);
	},

	toggleDailyLegend : function() {
		//daily selected
		if ($('.metric-button').prop('disabled')) {
			//metric was selected
			if ($('.total-county-button').prop('disabled')) {
				//total was selected
				this.chartWaterUse(this.DAILY, this.METRIC, this.TOTAL_WATER);
			}
			else {
				//normalized was selected
				this.chartWaterUse(this.DAILY, this.METRIC, this.NORMALIZED_WATER);
			}			
		}
		else {
			//customary was selected
			if ($('.total-county-button').prop('disabled')) {
				//total was selected
				this.chartWaterUse(this.DAILY, this.CUSTOMARY, this.TOTAL_WATER);
			}
			else {
				//normalized was selected
				this.chartWaterUse(this.DAILY, this.CUSTOMARY, this.NORMALIZED_WATER);
			}						
		}		
		NWC.view.WaterBudgetHucDataView.prototype.toggleDailyLegend.apply(this, arguments);
	},

	downloadWateruse : function() {
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
	},
});