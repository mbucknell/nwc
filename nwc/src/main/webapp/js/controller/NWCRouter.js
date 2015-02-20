var NWC = NWC || {};

NWC.workflows = [{
			uri: '/waterbudget',
			name: 'Water Budget',
			description: 'Discover water budget data for watersheds and counties.',
			img: 'img/workflow/originals/watershed.svg'
		},{
			uri: '/streamflow-stats',
			name: 'Streamflow Stats',
			description: 'Access streamflow statistics for stream gages and model results.',
			img: 'img/workflow/originals/form-01.svg'
		},{
			uri: '/aquatic-biology',
			name: 'Aquatic Biology',
			description: 'Access aquatic biology data and streamflow statistics for related sites.',
			img: 'img/workflow/originals/shield-01.svg'
		},{
			uri: 'data-discovery',
			name: 'Data Discovery',
			description: 'Search and browse datasets, publications, and project descriptions.',
			img: 'img/workflow/originals/folder-01.svg'
	}];
NWC.controller = NWC.controller || {};



NWC.controller.NWCRouter = Backbone.Router.extend({

	routes: {
		'' : 'home'
	},

	home : function() {
		$.ajax({
			url: 'templates/home.html',
			cache : true,
			success : function (data) {
				var template = Handlebars.compile(data);
				var html = template({workflows : NWC.workflows});
				$('#site_content').html(html);
			}

		});
	}

});

