var NWC = NWC || {};

NWC.model = NWC.model || {};

NWC.model.WaterBudgetSelectMapModel = NWC.model.BaseSelectMapModel.extend({
	defaults : function() {
		return $.extend({
			watershedLayerOn : true
		}, NWC.model.BaseSelectMapModel.prototype.defaults);
	}
});


