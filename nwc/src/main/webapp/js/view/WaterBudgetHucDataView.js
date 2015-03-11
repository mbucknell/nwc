var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the water budget huc data page
 *
 * @constructor extends NWC.BaseSelectMapView
 */

NWC.view.WaterBudgetHucDataView = NWC.view.BaseView.extend({
	templateName : 'waterbudgetHucData',
	ETA : "eta",
	DAY_MET : "dayMet",
	DAILY : "daily",
	MONTHLY : "monthly",
	METRIC : "metric",
	CUSTOMARY : "usCustomary",

//	model : new NWC.model.WaterBudgetSelectMapModel(),

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

	initialize : function(options) {
		
		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);

		this.getHucData(options.hucValue);
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
					var i;
					var label = '';
					for (i=0; i<this.length; i++){
						label = label + this[i];
					}
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
			this.displayHucData(huc);
		}.bind(this);
		$.when.apply(null, labeledAjaxCalls).then(dataHandler);
		return;
	},

	/**
	 * This renders the huc info on the view
	 */
	displayHucData: function(huc) {
		this.$(".hucId").html(huc);
		
		// Create vector layer to show HUC
//           var layerStyle = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
//           layerStyle.fillOpacity = 0;
//           layerStyle.graphicOpacity = 1;
//           layerStyle.strokeColor = "black";
//           layerStyle.strokeWidth = 2;
//           var hucVectorLayer = new OpenLayers.Layer.Vector("Simple Geometry Huc", {
//              	style: layerStyle
//           });
//
//       	var hucFeature = new OpenLayers.Feature.Vector(StoredState.waterBudgetHucFeature.geometry);
//       	hucVectorLayer.addFeatures([hucFeature]);
//
//		$scope.hucLayer = [hucVectorLayer];
//		$scope.hucBounds = hucVectorLayer.getDataExtent();
//
//       var selectionInfo = {};
//       if (StoredState.waterBudgetHucFeature) {
//           selectionInfo.hucId = StoredState.waterBudgetHucFeature.data.HUC_12;
//           selectionInfo.hucName = StoredState.waterBudgetHucFeature.data.HU_10_NAME;
//       } else {
//           $state.go("^.selectHuc");
//           return;
//       }
//       $scope.selectionInfo = selectionInfo;
//
       this.plotPTandETaData(this.DAILY, this.CUSTOMARY);

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
		var blob = new Blob([NWC.util.DataSeriesStore.eta.toCSV(true)], {type:'text/csv'});
		saveAs(blob, this.getHucFilename('eta'));
		return;
	},

	downloadPrecipitation : function() {
		var blob = new Blob([NWC.util.DataSeriesStore.dayMet.toCSV(true)], {type:'text/csv'});
		saveAs(blob, this.getHucFilename('dayMet'));	
		return;
	},

	getHucFilename : function (series) {
		var filename = series + '_data.csv'; //temporary
//		if (StoredState.waterBudgetHucFeature) {
//			filename = buildName(StoredState.waterBudgetHucFeature.data.HU_12_NAME,
//					StoredState.waterBudgetHucFeature.data.HUC_12, series);
//		}
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