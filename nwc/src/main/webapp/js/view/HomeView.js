var NWC = NWC || {};
NWC.view = NWC.view || {};

NWC.workflows = {
	waterbudget: {
		uri: 'waterbudget',
		name: 'Water Budget',
		description: 'Discover water budget data for watersheds and counties.',
		img: 'img/workflow/originals/watershed.svg',
		render: function() {
			$('#site_content').html('Water Budget');
		}
	},
	streamflowStats: {
		uri: 'streamflow-stats',
		name: 'Streamflow Stats',
		description: 'Access streamflow statistics for stream gages and model results.',
		img: 'img/workflow/originals/form-01.svg',
				render: function() {
			$('#site_content').html('Streamflow Stats');
		}

	},
	aquaticBiology: {
		uri: 'aquatic-biology',
		name: 'Aquatic Biology',
		description: 'Access aquatic biology data and streamflow statistics for related sites.',
		img: 'img/workflow/originals/shield-01.svg',
				render: function() {
			$('#site_content').html('Aquatic Biology');
		}

	},
	dataDiscovery: {
		uri: 'data-discovery',
		name: 'Data Discovery',
		description: 'Search and browse datasets, publications, and project descriptions.',
		img: 'img/workflow/originals/folder-01.svg',
				render: function() {
			$('#site_content').html('Data Discovery');
		}

	}
};

NWC.view.HomeView = NWC.view.BaseView.extend({

	context : {workflows : NWC.workflows},
	templateName : 'home'

});


