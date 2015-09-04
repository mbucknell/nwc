var NWC = NWC || {};

NWC.model = NWC.model || {};

/**
 * Model to represent the map controls for the water budget selection map.
 * @constructor
 */

NWC.model.WaterBudgetSelectMapModel = NWC.model.BaseSelectMapModel.extend({
	defaults : function() {
		return $.extend({
			watershedLayer : null,
			watershedLayerOn : false
		}, NWC.model.BaseSelectMapModel.prototype.defaults);
	}
});


