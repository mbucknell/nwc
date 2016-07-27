/* jslint browser: true */
/* global Backbone */

var NWC = NWC || {};

NWC.model = NWC.model || {};

/**
 * Model represent the state of the water budget huc data plot
 * @constructor
 */
NWC.model.WaterBudgetHucPlotModel = Backbone.Model.extend({
	defaults : {
		units : 'usCustomary',
		timeScale : 'monthly',
		hucData : new Backbone.Model(),
		compareHucData : new Backbone.Model()
	}
});

