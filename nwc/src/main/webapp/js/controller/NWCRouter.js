var NWC = NWC || {};

NWC.controller = NWC.controller || {};



NWC.controller.NWCRouter = Backbone.Router.extend({

	routes: {
		'' : 'home',
		'waterbudget' : 'waterbudget',
		'streamflow-stats' : 'streamflowStats',
		'aquatic-biology' : 'aquaticBiology',
		'data-discovery' : 'dataDiscovery'
	},

	home : function() {
		this.showView(NWC.view.HomeView);
	},

	waterbudget : function() {
		this.showView(NWC.view.WaterBudgetMapView);
	},

	streamflowStats : function() {
		this.showView(NWC.view.StreamflowStatsMapView);
	},

	aquaticBiology : function() {
		this.showView(NWC.view.AquaticBiologyMapView);
	},

	dataDiscovery : function() {
		this.showView(NWC.view.DataDiscoveryView);
	},

	showView : function(view, opts) {
		this.removeCurrentView();
		this.currentView = new view($.extend({
			router: this
		}, opts));
	},
	removeCurrentView : function() {
		if (this.currentView) {
			this.currentView.remove();
		}
	}
});

