var NWC = NWC || {};

NWC.controller = NWC.controller || {};



NWC.controller.NWCRouter = Backbone.Router.extend({

	applicationContextDiv : '#site_content',

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
		this.showView(NWC.view.WaterBudgetMapView, {mapDiv : 'hucSelectMap'});
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
		var newEl = $('<div>');

		this.removeCurrentView();
		$(this.applicationContextDiv).append(newEl);
		this.currentView = new view($.extend({
			el: newEl,
			router: this
		}, opts));
	},
	removeCurrentView : function() {
		if (this.currentView) {
			this.currentView.remove();
		}
	}
});

