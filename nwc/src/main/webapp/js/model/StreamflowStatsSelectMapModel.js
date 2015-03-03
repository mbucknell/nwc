var NWC = NWC || {};

NWC.model = NWC.model || {};

NWC.model.StreamflowStatsSelectMapModel = NWC.model.BaseSelectMapModel.extend({

	defaults : function() {
		return $.extend({
			streamflowType : 'observed',
			gageFilter : 'default'
		}, NWC.model.BaseSelectMapModel.prototype.defaults);
	},

	getFilterStyle : function() {
		var STYLES = {
			default : 'blue_circle',
			active : 'gagesii_active',
			reference : 'gagesii_reference',
			por : 'gagesii_por'
		};
		return STYLES[this.get('gageFilter')];
	}

});


