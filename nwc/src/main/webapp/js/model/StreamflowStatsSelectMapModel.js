var NWC = NWC || {};

NWC.model = NWC.model || {};

NWC.model.StreamflowStatsSelectMapModel = NWC.model.BaseSelectMapModel.extend({

	defaults : function() {
		return $.extend({
			streamflowType : 'observed'
		}, NWC.model.BaseSelectMapModel.prototype.defaults);
	}

});


