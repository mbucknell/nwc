var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the water budget huc data page
 * @constructor extends NWC.BaseView
 */

NWC.view.WaterBudgetCountyDataView = NWC.view.WaterBudgetHucDataView.extend({

	templateName : 'waterbudgetHucData',

	NORMALIZED_WATER : "normalizedWater",
	TOTAL_WATER : "totalWater",

	events: {
		'click .back-button' : 'waterbudgetHucData',
		'click .metric-button' : 'toggleMetricLegend',
		'click .customary-button' : 'toggleCustomaryLegend',
		'click .total-county' : 'toggleTotalCountyWaterUse',
		'click .normalized-county' : 'toggleNormalizedCountyWater',
		'click .water-use-download-button' : 'downloadWateruse',
		'click .monthly-button' : 'toggleMonthlyLegend',
		'click .daily-button' : 'toggleDailyLegend'
	},

	context : {
	},

	initialize : function(options) {

		this.context.hucId = options.hucId;
		this.countyId = options.countyId;
		this.hucId = options.hucId;
		this.insetHucMapDiv = options.insetHucMapDiv;
		this.insetCountyMapDiv = options.insetCountyMapDiv;

		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		$('#wateruse').show();
		$('#normalized-warning').hide();

		this.buildHucMap(this.hucId);
		this.getHucData(this.hucId);
		this.hucMap.render(this.insetHucMapDiv);
		this.buildCountyMap(this.countyId); //buildHucMap needs to finish first?
		this.getCountyData(this.countyId);  //buildCountyMap needs to finish first?
		this.countyMap.render(this.insetCountyMapDiv);
	},

	buildCountyMap : function(county) {

		var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();

		this.countyMap = NWC.util.mapUtils.createMap([baseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

		this.countyLayer = NWC.util.mapUtils.getCountyFeatureLayer(county);

		this.countyLayer.events.on({
			featureadded: function(event){
				this.countyName = event.feature.attributes.FULL_NAME.capitalize(true);
				this.countyAreaSqmi = event.feature.attributes.AREA_SQMI;
				this.countyMap.zoomToExtent(this.countyLayer.getDataExtent());
				var intersectorInfo = NWC.util.hucCountiesIntersector.getCountyIntersectionInfo(
						this.hucEvent,  //buildHucMap needs to finish first?
						event);

				$('#percent-of-huc').html('Percentage of HUC in ' + this.countyName + ' County ' + 
						intersectorInfo.hucInCounty + '%');
				$('#percent-of-county').html('Percentage of ' + this.countyName + ' County in HUC ' + 
						intersectorInfo.countyInCounty + '%');
				$('#water-use-chart-title').html('Water Use for ' + this.countyName + ' County');
				$('.wateruse-download-button').prop('disabled', false);
			},
			loadend: function(event) {
				$('#county-loading-indicator').hide();
			},
			scope : this
		});

		this.countyMap.addLayer(this.countyLayer);
		this.countyMap.zoomToExtent(this.countyMap.getMaxExtent());

		return;
	},

	//get an instance of dataSeries
	waterUseDataSeries : new NWC.util.DataSeriesStore(),

	/**
	 * This makes a Web service call to get huc data
	 * then makes call to render the data on a plot
	 * @param {String} huc 12 digit identifier for the hydrologic unit
	 */
	getCountyData: function(huc) {
        
        var url = NWC.util.buildSosUrlFromSource(huc, NWC.util.SosSources.countyWaterUse);
		var getData = $.ajax({
			url : url,
			success : function(data, textStatus, jqXHR) {
				var parsedTable = NWC.util.SosResponseParser.parseSosResponse(data);
                
				this.waterUseDataSeries.data = parsedTable;

                //use the series metadata as labels
                var additionalSeriesLabels = NWC.util.SosSources.countyWaterUse.propertyLongName.split(',');
                additionalSeriesLabels.each(function(label) {
                    this.waterUseDataSeries.metadata.seriesLabels.push({
                        seriesName: label,
                        seriesUnits: SosSources.countyWaterUse.units
                    });
                });
                
                this.waterUseDataSeries.metadata.downloadHeader = NWC.util.SosSources.countyWaterUse.downloadMetadata;
			},
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
     * {String} measurement, the quantity scale of data to plot (usCustomary or metric)
     * {String} time, the time scale of data to plot (daily or monthly)
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
        WaterUsageChart.setChart(chartDivSelector, chartLegendDivSelector, values, labels, ylabel,
            Units[measurementSystem][plotNormalization].precision);
        return;
	},	
	
	//there has got to be a better way to do this....
	
	toggleMetricLegend : function() {
		//metric scale selected
		if ($('.daily-button').prop('disabled', true)) {
			//daily was selected
			if ($('.total-county-button').prop('disabled', true)) {
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
			if ($('.total-county-button').prop('disabled', true)) {
				//total was selected
				this.chartWaterUse(this.MONTHLY, this.METRIC, this.TOTAL_WATER);
			}
			else {
				//normalized was selected
				this.chartWaterUse(this.MONTHLY, this.METRIC, this.NORMALIZED_WATER);
			}						
		}		
		//call this.parent.toggleMetricLegend?
		//disable metric button in parent
	},

	toggleCustomaryLegend : function() {
		//customary scale selected
		if ($('.daily-button').prop('disabled', true)) {
			//daily was selected
			if ($('.total-county-button').prop('disabled', true)) {
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
			if ($('.total-county-button').prop('disabled', true)) {
				//total was selected
				this.chartWaterUse(this.MONTHLY, this.CUSTOMARY, this.TOTAL_WATER);
			}
			else {
				//normalized was selected
				this.chartWaterUse(this.MONTHLY, this.CUSTOMARY, this.NORMALIZED_WATER);
			}						
		}		
		//call this.parent.toggleCustomaryLegend?
		//disable customary button in parent
	},

	toggleTotalCountyWaterUse : function() {
		$('#normalized-warning').hide();
		$('.total-county-button').prop('disabled', true);
		$('.normalized-county-button').prop('disabled', false);

		//total county selected
		if ($('.metric-button').prop('disabled', true)) {
			//metric was selected
			if ($('.daily-button').prop('disabled', true)) {
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
			if ($('.daily').prop('disabled', true)) {
				//daily was selected
				this.chartWaterUse(this.DAILY, this.CUSTOMARY, this.TOTAL_WATER);
			}
			else {
				//monthly was selected
				this.chartWaterUse(this.MONTHLY, this.CUSTOMARY, this.TOTAL_WATER);
			}						
		}		
	},

	toggleNormalizedCountyWaterUse : function() {
		$('#normalized-warning').show();
		$('.total-county-button').prop('disabled', false);
		$('.normalized-county-button').prop('disabled', true);

		//normalized selected
		if ($('.metric-button').prop('disabled', true)) {
			//metric was selected
			if ($('.daily-button').prop('disabled', true)) {
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
			if ($('.daily').prop('disabled', true)) {
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
		if ($('.metric-button').prop('disabled', true)) {
			//metric was selected
			if ($('.total-county-button').prop('disabled', true)) {
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
			if ($('.total-county-button').prop('disabled', true)) {
				//total was selected
				this.chartWaterUse(this.MONTHLY, this.CUSTOMARY, this.TOTAL_WATER);
			}
			else {
				//normalized was selected
				this.chartWaterUse(this.MONTHLY, this.CUSTOMARY, this.NORMALIZED_WATER);
			}						
		}		
		//call this.parent.toggleMonthlyLegend?
		//disable monthly button in parent
	},

	toggleDailyLegend : function() {
		//daily selected
		if ($('.metric-button').prop('disabled', true)) {
			//metric was selected
			if ($('.total-county-button').prop('disabled', true)) {
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
			if ($('.total-county-button').prop('disabled', true)) {
				//total was selected
				this.chartWaterUse(this.DAILY, this.CUSTOMARY, this.TOTAL_WATER);
			}
			else {
				//normalized was selected
				this.chartWaterUse(this.DAILY, this.CUSTOMARY, this.NORMALIZED_WATER);
			}						
		}		
		//call this.parent.toggleDailyLegend?
		//disable daily button in parent
	},

	downloadWateruse : function() {
		var blob = new Blob([getCombinedWaterUse(this.waterUseDataSeries.toCSV())], {type:'text/csv'}); 
		saveAs(blob, this.getCountyFilename('water use'));
		return;
	},

    getCombinedWaterUse : function(dataSeries) {
        var result = Object.clone(dataSeries);
        result.data = NWC.util.WaterUsageChart.combineData(result.data);
        return result;
    },
	
	getCountyFilename : function (series) {
		var filename = series + '_data.csv';
        if (this.countyName && this.countyId) {
        	filename = this.buildName(this.countyName, this.countyId, series); //make sure countyId is fips
        }
		return filename;
	},

});