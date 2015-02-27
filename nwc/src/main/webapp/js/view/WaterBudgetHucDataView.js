var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.WaterBudgetHucDataView = NWC.view.BaseSelectMapView.extend({
	templateName : 'waterbudgetHucData',

//	model : new NWC.model.WaterBudgetSelectMapModel(),

	events: {
		'click .counties-button' : 'displayCountyMap',
		'click .metric-button' : 'toggleMetricLegend',
		'click .customary-button' : 'toggleCustomaryLegend'
	},

	initialize : function(options) {
		var passedHucValue = this.options.hucValue.value;
		this.loadHucInfo(passedHucValue);
	},

	/**
	 * This makes a Web service call to get search models
	 */
	loadHucInfo: function(huc) {
		this.$('.hucId').html(huc);
	},

	displayCountyMap : function() {
	},

	toggleMetricLegend : function() {
//		var isVisible = !this.hucLayer.getVisibility();
//		this.$el.find('#toggle-huc-layer-span').html(isVisible ? 'Off' : 'On');
//		this.hucLayer.setVisibility(!this.hucLayer.getVisibility());
	},

	toggleCustomaryLegend : function() {
//		var isVisible = !this.hucLayer.getVisibility();
//		this.$el.find('#toggle-huc-layer-span').html(isVisible ? 'Off' : 'On');
//		this.hucLayer.setVisibility(!this.hucLayer.getVisibility());
	}
});


