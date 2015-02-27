var NWC = NWC || {};

$(document).ready(function() {
	// Preload all templates
	NWC.templates = NWC.util.templateLoader();

	NWC.templates.loadTemplates(['home', 'waterbudget', 'waterbudgetHucData', 'streamflowStats', 'aquaticBiology', 'dataDiscovery']).always(function() {
		NWC.router = new NWC.controller.NWCRouter();
		Backbone.history.start();
	});
});


