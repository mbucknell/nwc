var NWC = NWC || {};

$(document).ready(function() {
	// Preload all templates and partials
	var TEMPLATES = [
		'home',
		'waterbudget',
		'waterbudgetHucData',
		'streamflowStats',
		'streamflowGageStats',
		'streamflowHucStats',
		'aquaticBiology',
		'aquaticBiologySelectFeatures',
		'dataDiscovery',
		'statsResults'
	];

	var PARTIALS = [
		'mapControls',
		'warningModal'
	];

	NWC.templates = NWC.util.templateLoader();
	var loadTemplates = NWC.templates.loadTemplates(TEMPLATES);
	var loadPartials = NWC.templates.registerPartials(PARTIALS);
	$.when(loadTemplates, loadPartials).always(function() {
		NWC.router = new NWC.controller.NWCRouter();
		Backbone.history.start();
	});
});


