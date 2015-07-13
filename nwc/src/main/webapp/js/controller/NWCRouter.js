var NWC = NWC || {};

NWC.controller = NWC.controller || {};



NWC.controller.NWCRouter = Backbone.Router.extend({

	applicationContextDiv : '#site_content',

	aquaticBiologyFeaturesModel : new NWC.model.AquaticBiologyFeaturesModel(),

	aquaticBiologySelectMapModel : new NWC.model.AquaticBiologySelectMapModel(),
	streamflowStatsSelectMapModel : new NWC.model.StreamflowStatsSelectMapModel(),
	waterBudgetSelectMapModel : new NWC.model.WaterBudgetSelectMapModel(),

	routes: {
		'' : 'home',
		'home' : 'home',
		'waterbudget/huc/:huc' : 'waterbudgetHucData',
		'waterbudget/huc/:huc/county/:fips' : 'waterbudgetHucCountyData',
		'waterbudget' : 'waterbudget',
		'streamflow-stats' : 'streamflowStats',
		'streamflow-stats/gage/:gageid' : 'streamflowStatsGageData',
		'streamflow-stats/huc/:huc' : 'streamflowStatsHucData',
		'streamflow-stats/model-info' : 'streamflowStatsModeledInfo',
		'aquatic-biology' : 'aquaticBiology',
		'aquatic-biology/select-features' : 'aquaticBiologySelectFeatures',
		'data-discovery/show-projects' : 'dataDiscoveryProjects',
		'data-discovery/show-data' : 'dataDiscoveryData',
		'data-discovery/show-publications' : 'dataDiscoveryPublications',
		'data-discovery/projectDetail/:projectId' : 'dataDiscoveryProjectDetail'
	},

	home : function() {
		this.showView(NWC.view.HomeView);
	},

	waterbudget : function() {
		this.showView(NWC.view.WaterBudgetMapView, {
			mapDiv : 'hucSelectMap',
			model : this.waterBudgetSelectMapModel
		});
	},

	waterbudgetHucData : function(huc) {
		this.showView(NWC.view.WaterBudgetHucDataView, {
			hucId : huc,
			insetHucMapDiv : 'huc-inset'});
	},

	waterbudgetHucCountyData : function(huc, fips) {
		this.showView(NWC.view.WaterBudgetHucCountyDataView, {
			hucId : huc,
			fips : fips,
			insetHucMapDiv : 'huc-inset',
			insetCountyMapDiv : 'county-inset'
		});
	},

	streamflowStats : function() {
		this.showView(NWC.view.StreamflowStatsMapView, {
			mapDiv : 'streamflow-select-map',
			model : this.streamflowStatsSelectMapModel
		});
	},

	streamflowStatsGageData : function(gageid) {
		this.showView(NWC.view.StreamflowStatsGageDataView, {
			gageId : gageid,
			insetMapDiv : 'gage-inset'
		});
	},

	streamflowStatsHucData : function(huc) {
		this.showView(NWC.view.StreamflowStatsHucDataView, {
			hucId : huc,
			insetMapDiv : 'huc-inset'
		});
	},

	streamflowStatsModeledInfo : function() {
		this.showView(NWC.view.StreamflowStatsModeledInfoView, {});
	},

	aquaticBiology : function() {
		this.showView(NWC.view.AquaticBiologyMapView, {
			mapDiv : 'aquatic-biology-map',
			model : this.aquaticBiologySelectMapModel,
			aquaticBiologyFeaturesModel : this.aquaticBiologyFeaturesModel
		});
	},

	aquaticBiologySelectFeatures : function() {
            this.showView(NWC.view.AquaticBiologySelectFeaturesView, {
                model : this.aquaticBiologyFeaturesModel
            });
	},

	dataDiscoveryProjects : function() {
		this.showView(NWC.view.DataDiscoveryView, {tab : 'show-projects'});
	},

	dataDiscoveryData : function() {
		this.showView(NWC.view.DataDiscoveryView, {tab : 'show-data'});
	},

	dataDiscoveryPublications : function() {
		this.showView(NWC.view.DataDiscoveryView, {tab : 'show-publications'});
	},

	dataDiscoveryProjectDetail : function(projectId) {
		this.showView(NWC.view.ProjectView, {projectId : projectId});
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

