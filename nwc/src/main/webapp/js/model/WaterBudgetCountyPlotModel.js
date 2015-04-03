var NWC = NWC || {};

NWC.model = NWC.model || {};

/**
 * Model represent the state of the water budget huc data plot
 * @constructor
 */
NWC.model.WaterBudgetCountyPlotModel = Backbone.Model.extend({
	defaults : {
		units : 'usCustomary',
		plotType : 'totalWater'
	}
});
