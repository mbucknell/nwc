var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.DataDiscoveryView = NWC.view.BaseView.extend({
	templateName : 'dataDiscovery',

	initialize : function(options) {

		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);			

		this.getProjectData();
	},

	/**
	 * This makes a Web service call to get project data for display
	 */
	getProjectData: function() {
		var projects = [];
		$.ajax({
			url : CONFIG.endpoint.direct.sciencebase + '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DProject&max=100&format=json',
			dataType : "json",
			success: function(data) {
				$('#all-projects-div').html(NWC.templates.getTemplate('allProjects')({projectList : data.items}));
			},
			error : function() {
				//@todo - setup app level error handling
				var errorMessage = 'error retrieving project data';
				alert(errorMessage);
			}
		});
	}
});


