/*jslint browser: true */
/*global Backbone*/

var NWC = NWC || {};

$(document).ready(function() {
	"use strict";
	// Preload all templates and partials
	var TEMPLATES = [
		'home',
		'waterbudget',
		'waterbudgetHucData',
		'waterbudgetCountyData',
		'streamflowStats',
		'streamflowGageStats',
		'streamflowHucStats',
		'modeledInfoPage',
		'aquaticBiology',
		'aquaticBiologySelectFeatures',
		'dataDiscovery',
		'statsResults',
		'countyHucTable',
		'countyHucMap',
		'dataDiscoveryList',
		'dataDiscoveryDetail',
		'publicationsDetail'
	];

	var PARTIALS = [
		'detailToggle',
		'mapControls',
		'warningModal',
		'streamflowCalcStats'
	];

	NWC.templates = NWC.util.templateLoader();

	var loadTemplates = NWC.templates.loadTemplates(TEMPLATES);
	var loadPartials = NWC.templates.registerPartials(PARTIALS);

	NWC.templates.registerHelpers();

	$.when(loadTemplates, loadPartials).always(function() {
		NWC.router = new NWC.controller.NWCRouter();
		Backbone.history.start();
	});
});


