var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the water budget huc data page
 *
 * @constructor extends NWC.BaseSelectMapView
 */

NWC.view.WaterBudgetHucDataView = NWC.view.BaseView.extend({
	templateName : 'waterbudgetHucData',

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
		
		this.getHucData(options.hucValue);
		
		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);

		// this may need to be after render...
		this.displayHucData(options.hucValue);
	},

	/**
	 * This makes a Web service call to get huc data
	 * @param {String} huc 12 digit identifier for the hydrologic unit
	 */
	getHucData: function(huc) {
		var i;
		var labeledAjaxCalls = [];
		//grab the sos sources that will be used to display the initial data 
		//series. ignore other data sources that the user can add later.
		var initialSosSourceKeys = ['eta', 'dayMet'];
		var initialSosSources = Object.select(NWC.util.SosSources, initialSosSourceKeys);
		$.each(initialSosSources, function (sourceId, source) {
			var url = NWC.util.buildSosUrlFromSource(huc, source);
			labeledAjaxCalls.push($.ajax({
				url : url,
				success : function(data, textStatus, jqXHR) {
					labeledResponses = {};
					var parsedValues = NWC.util.SosResponseFormatter.formatSosResponse(data);
					var labeledDataSeries = DataSeries.new();
					labeledDataSeries.metadata.seriesLabels.push(
						{
							seriesName: source[sourceId].propertyLongName,
							seriesUnits: source[sourceId].units
						}
					);
					labeledDataSeries.metadata.downloadHeader = source[sourceId].downloadMetadata;
					labeledDataSeries.data = parsedValues;
			        
					labeledResponses[sourceId] = labeledDataSeries;
					DataSeriesStore.updateHucSeries(labeledResponses);
				},
				dataType : "xml",
				error : function() {
                    //@todo - setup app level error handling
                    var errorMessage = 'error retrieving time series data';
                    alert(errorMessage);
                    $log.error(errorMessage);
                    $log.error(arguments);
				}
			}));
        });
		return $.when.apply(null, labeledAjaxCalls);
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
//       var plotDivSelector = '#waterBudgetPlot';
//       var legendDivSelector = '#waterBudgetLegend';
//       StoredState.plotNormalization = StoredState.plotNormalization || 'totalWater';
//       StoredState.plotTimeDensity  = StoredState.plotTimeDensity || 'daily';
//       StoredState.measurementSystem = StoredState.measurementSystem || 'usCustomary';
//       $scope.$watch('StoredState.plotNormalization', function(newValue, oldValue){
//           if(newValue !== oldValue) {
//               chartWaterUse();
//           }
//       });
//       $scope.$watch('StoredState.measurementSystem', function(newValue, oldValue){
//           if(newValue !== oldValue) {
//               plotPTandETaData();
//               chartWaterUse();
//           }
//       });
//       $scope.$watch('StoredState.plotTimeDensity', function(newValue, oldValue){
//           if(newValue !== oldValue){
//               plotPTandETaData();
//           }
//       });
       /**
        * {String} category the category of data to plot (daily or monthly)
        */
//       var plotPTandETaData = function(){
//           var normalization = 'normalizedWater';
//           var values = CommonState.DataSeriesStore[StoredState.plotTimeDensity].getDataAs(StoredState.measurementSystem, normalization);
//           var labels = CommonState.DataSeriesStore[StoredState.plotTimeDensity].getSeriesLabelsAs(
//                   StoredState.measurementSystem, normalization, StoredState.plotTimeDensity);
//           var ylabel = Units[StoredState.measurementSystem][normalization][StoredState.plotTimeDensity];
//           Plotter.getPlot(plotDivSelector, legendDivSelector, values, labels, ylabel);
//       };
//
//       var buildName = function(selectionName, selectionId, series) {
//           var filename = selectionName;
//           filename += '_' + selectionId;
//           filename += '_' + series;
//           filename += '.csv';
//           filename = filename.replace(/ /g, '_');
//           filename = escape(filename);
//           return filename;
//       };
//
//       $scope.getHucFilename = function (series) {
//           var filename = 'data.csv';
//           if (StoredState.waterBudgetHucFeature) {
//               filename = buildName(StoredState.waterBudgetHucFeature.data.HU_12_NAME,
//                   StoredState.waterBudgetHucFeature.data.HUC_12, series);
//           }
//           return filename;
//       };
	
	},

	displayCountyMap : function() {
		return;
	},

	toggleMetricLegend : function() {
		//stub
	},

	toggleCustomaryLegend : function() {
		//stub
	},

	toggleMonthlyLegend : function() {
		//stub
	},

	toggleDailyLegend : function() {
		//stub
	},

	downloadEvapotranspiration : function() {
		//stub
	},

	downloadPrecipitation : function() {
		//stub
	}
});

  
