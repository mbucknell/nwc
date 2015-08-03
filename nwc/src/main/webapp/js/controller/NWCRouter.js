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
		'!home' : 'home',
		'!waterbudget/huc/:huc' : 'waterbudgetHucData',
		'!waterbudget/huc/:huc/county/:fips' : 'waterbudgetHucCountyData',
		'!waterbudget/comparehucs/:hucX/:hucY' : 'waterbudgetCompareHucs',
		'!waterbudget' : 'waterbudget',
		'!waterbudget/map/huc/:huc' : 'waterbudgetAddHucMap',
		'!streamflow-stats' : 'streamflowStats',
		'!streamflow-stats/gage/:gageid' : 'streamflowStatsGageData',
		'!streamflow-stats/huc/:huc' : 'streamflowStatsHucData',
		'!streamflow-stats/model-info' : 'streamflowStatsModeledInfo',
		'!aquatic-biology' : 'aquaticBiology',
		'!aquatic-biology/select-features' : 'aquaticBiologySelectFeatures',
		'!data-discovery/:tab' : 'dataDiscovery',
		'!data-discovery/projectDetail/:projectId' : 'dataDiscoveryProjectDetail',
		'!data-discovery/dataDetail/:datasetId' : 'dataDiscoveryDataDetail'
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

	waterbudgetAddHucMap : function(huc) {
		this.showView(NWC.view.WaterBudgetMapView, {
			mapDiv : 'hucSelectMap',
			model : this.waterBudgetSelectMapModel,
			hucId : huc
		});
	},

	waterbudgetHucData : function(huc) {
		this.showView(NWC.view.WaterBudgetHucDataView, {
			hucId : huc,
			insetHucMapDiv : 'huc-inset'});
	},

	waterbudgetHucCountyData : function(huc, fips) {
		this.showView(NWC.view.WaterBudgetHucDataView, {
			hucId : huc,
			fips : fips,
			insetHucMapDiv : 'huc-inset'
		});
	},

	waterbudgetCompareHucs : function(hucX, hucY) {
		this.showView(NWC.view.WaterBudgetHucDataView, {
			hucId : hucX,
			compareHucId : hucY,
			insetHucMapDiv : 'huc-inset'
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

	dataDiscovery : function(tab) {
		this.showView(NWC.view.DataDiscoveryView, {tab : tab});
	},

	dataDiscoveryProjectDetail : function(projectId) {
		this.showView(NWC.view.ProjectView, {projectId : projectId});
	},

	dataDiscoveryDataDetail : function(datasetId) {
		this.showView(NWC.view.DataView, {datasetId : datasetId});
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

