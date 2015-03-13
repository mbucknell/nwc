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
		'click .counties-button' : 'displayCountyMap',
		'click .metric-button' : 'toggleMetricLegend',
		'click .customary-button' : 'toggleCustomaryLegend',
		'click .monthly-button' : 'toggleMonthlyLegend',
		'click .daily-button' : 'toggleDailyLegend',
		'click .evapotranspiration-download-button' : 'downloadEvapotranspiration',
		'click .precipitation-download-button' : 'downloadPrecipitation'
	},

	render : function() {
		NWC.view.BaseView.prototype.render.apply(this, arguments);
		this.map.render(this.insetMapDiv);
	},
	
	huc12 : null,
	hu12Name : null,

	initialize : function(options) {
		
		if (options.hucId) {
			this.hucId = options.hucId;
			this.insetMapDiv = options.insetMapDiv;
		}
		else {
			//do we want to check the url query string?
		}

		var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();

		this.map = NWC.util.mapUtils.createMap([baseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

		var hucLayer = NWC.util.mapUtils.createHucFeatureLayer(this.hucId);

		hucLayer.events.on({
			featureadded: function(event){
				this.map.zoomToExtent(this.getDataExtent());
				
				this.huc12 = event.feature.attributes.HUC_12;
				this.hu12Name = event.feature.attributes.HU_12_NAME;
				$('#huc-id').html(event.feature.attributes.HUC_12);
				$('#huc-name').html(event.feature.attributes.HU_10_NAME);
//				$('#huc-drainage-area').html(event.feature.attributes.DRAIN_SQKM);
			},
			loadend: function(event) {
				$('#loading-indicator').hide();
			}
		});
		
		this.map.addLayer(hucLayer);

		this.getHucData(this.hucId);
		
		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		this.map.zoomToExtent(this.map.getMaxExtent());
	},

	/**
	 * This makes a Web service call to get huc data
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
                    $log.error(errorMessage);
                    $log.error(arguments);
                    d.reject();
				}
			});
        });
		var dataHandler = function() {
			NWC.util.DataSeriesStore.updateHucSeries(labeledResponses);
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
        var plotDivSelector = '#waterBudgetPlot';  //get this from router?
        var legendDivSelector = '#waterBudgetLegend';
        var normalization = 'normalizedWater';
        var plotTimeDensity  = time;
        var measurementSystem =  measurement;
        var values = NWC.util.DataSeriesStore[plotTimeDensity].getDataAs(measurementSystem, normalization);
        var labels = NWC.util.DataSeriesStore[plotTimeDensity].getSeriesLabelsAs(
                measurementSystem, normalization, plotTimeDensity);
        var ylabel = NWC.util.Units[measurementSystem][normalization][plotTimeDensity];
        NWC.util.Plotter.getPlot(plotDivSelector, legendDivSelector, values, labels, ylabel);
        return;
	},

	displayCountyMap : function() {
		return;
	},

	toggleMetricLegend : function() {
		this.$(".customary-button").removeAttr("disabled");			
		this.$(".metric-button").attr("disabled","disabled");			
		if (this.$(".daily-button").attr("disabled")) {
			this.plotPTandETaData(this.DAILY, this.METRIC);			
		}
		else {
			this.plotPTandETaData(this.MONTHLY, this.METRIC);						
		}
	},

	toggleCustomaryLegend : function() {
		this.$(".metric-button").removeAttr("disabled");			
		this.$(".customary-button").attr("disabled","disabled");			
		if (this.$(".daily-button").attr("disabled")) {
			this.plotPTandETaData(this.DAILY, this.CUSTOMARY);			
		}
		else {
			this.plotPTandETaData(this.MONTHLY, this.CUSTOMARY);						
		}
	},

	toggleMonthlyLegend : function() {		
		this.$(".daily-button").removeAttr("disabled");			
		this.$(".monthly-button").attr("disabled","disabled");			
		if (this.$(".customary-button").attr("disabled")) {
			this.plotPTandETaData(this.MONTHLY, this.CUSTOMARY);			
		}
		else {
			this.plotPTandETaData(this.MONTHLY, this.METRIC);						
		}
	},

	toggleDailyLegend : function() {
		this.$(".daily-button").attr("disabled","disabled");			
		this.$(".monthly-button").removeAttr("disabled");
		if (this.$(".customary-button").attr("disabled")) {
			this.plotPTandETaData(this.DAILY, this.CUSTOMARY);			
		}
		else {
			this.plotPTandETaData(this.DAILY, this.METRIC);						
		}
	},

	downloadEvapotranspiration : function() {
		var blob = new Blob([NWC.util.DataSeriesStore.eta.toCSV()], {type:'text/csv'});
		saveAs(blob, this.getHucFilename('eta'));
		return;
	},

	downloadPrecipitation : function() {
		var blob = new Blob([NWC.util.DataSeriesStore.dayMet.toCSV()], {type:'text/csv'});
		saveAs(blob, this.getHucFilename('dayMet'));	
		return;
	},

	getHucFilename : function (series) {
		var filename = series + '_data.csv';
        if (this.hu12Name || this.huc12) {
        	filename = this.buildName(this.hu12Name, this.huc12, series);
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