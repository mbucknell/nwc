/*jslint browser: true */
/*global Backbone*/

var NWC = NWC || {};

$(document).ready(function() {
	"use strict";
	// Preload all templates and partials
	var TEMPLATES = [
		'home',
		'waterbudget',
		'hucInsetMap',
		'waterbudgetPlot',
		'waterbudgetHucData',
		'countyWaterUse',
		'streamflowStats',
		'streamflowPlot',
		'streamflowGageStats',
		'streamflowHucStats',
		'streamflowCalcStats',
		'modeledInfoPage',
		'aquaticBiology',
		'aquaticBiologySelectFeatures',
		'aquaticBiologyPair',
		'dataDiscovery',
		'statsResults',
		'countyHucTable',
		'countyHucMap',
		'dataDiscoveryList',
		'dataDetail',
		'projectDetail',
		'publicationsDetail',
		'project',
		'data'
	];

	var PARTIALS = [
		'detailToggle',
		'mapControls',
		'warningModal'
	];

	NWC.templates = NWC.util.templateLoader();

	var loadTemplates = NWC.templates.loadTemplates(TEMPLATES);
	var loadPartials = NWC.templates.registerPartials(PARTIALS);

	NWC.templates.registerHelpers();

	$.when(loadTemplates, loadPartials).always(function() {
		NWC.config = new NWC.model.Config();
		NWC.router = new NWC.controller.NWCRouter();
		Backbone.history.start();
	});
});


