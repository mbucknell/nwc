var NWC = NWC || {};
NWC.view = NWC.view || {};

NWC.workflows = {
	waterbudget: {
		uri: '#!waterbudget',
		name: 'Water Budget',
		description: 'Discover water budget data for watersheds and counties.',
		img: 'img/workflow/originals/watershed.svg'
	},
	streamflowStats: {
		uri: '#!streamflow-stats',
		name: 'Streamflow Stats',
		description: 'Access streamflow statistics for stream gages and model results.',
		img: 'img/workflow/originals/form-01.svg'
	},
	aquaticBiology: {
		uri: '#!aquatic-biology',
		name: 'Aquatic Biology',
		description: 'Access aquatic biology data and streamflow statistics for related sites.',
		img: 'img/workflow/originals/shield-01.svg'
	},
	dataDiscovery: {
		uri: '#!data-discovery/show-projects',
		name: 'Data Discovery',
		description: 'Search and browse datasets, publications, and project descriptions.',
		img: 'img/workflow/originals/folder-01.svg'
	}
};

NWC.view.HomeView = NWC.view.BaseView.extend({

	context : {workflows : NWC.workflows},
	templateName : 'home'

});


