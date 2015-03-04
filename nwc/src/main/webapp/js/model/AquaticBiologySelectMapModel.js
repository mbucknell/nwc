var NWC = NWC || {};

NWC.model = NWC.model || {};

NWC.model.AquaticBiologySelectMapModel = NWC.model.BaseSelectMapModel.extend({
	defaults : function() {
		return $.extend({
			gageLayerOn : false,
			hucLayerOn : false
		}, NWC.model.BaseSelectMapModel.prototype.defaults);
	}
});



