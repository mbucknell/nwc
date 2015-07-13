var NWC = NWC || {};
NWC.view = NWC.view || {};

NWC.workflows = {
	waterbudget: {
		uri: 'waterbudget',
		name: 'Water Budget',
		description: 'Discover water budget data for watersheds and counties.',
		img: 'img/workflow/originals/watershed.svg'
	},
	streamflowStats: {
		uri: 'streamflow-stats',
		name: 'Streamflow Stats',
		description: 'Access streamflow statistics for stream gages and model results.',
		img: 'img/workflow/originals/form-01.svg'
	},
	aquaticBiology: {
		uri: 'aquatic-biology',
		name: 'Aquatic Biology',
		description: 'Access aquatic biology data and streamflow statistics for related sites.',
		img: 'img/workflow/originals/shield-01.svg'
	},
	dataDiscovery: {
		uri: 'data-discovery/show-projects',
		name: 'Data Discovery',
		description: 'Search and browse datasets, publications, and project descriptions.',
		img: 'img/workflow/originals/folder-01.svg'
	}
};

NWC.view.HomeView = NWC.view.BaseView.extend({

	events : {
		'click a' : 'navigate',
		'click a>img' : 'navigate'
	},

	context : {workflows : NWC.workflows},
	templateName : 'home',

	navigate : function(event) {
		event.preventDefault();
		if (event.target.pathname) {
			this.router.navigate(event.target.pathname, {trigger : true});
		}
		else {
			this.router.navigate(event.target.parentNode.pathname, {trigger : true});
		}
	}
});


