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
		$.ajax({
			url : CONFIG.endpoint.direct.sciencebase + '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DProject&max=100&format=json',			
			success : this.renderProjectData,
			dataType : "json",
			error : function() {
				//@todo - setup app level error handling
				var errorMessage = 'error retrieving project data';
				alert(errorMessage);
			}
		});
	},

	/**
	 * This uses the data from the service call and renders it
	 */
	renderProjectData: function(data) {
		for (var i = 0; i < data.total; i++) {
			$('#all-projects').append('<h5>' + data.items[i].title + '</h5>');
			if (data.items[i].summary) {
				$('#all-projects').append('<p>' + data.items[i].summary + '</p>');				
			}
			else {
				$('#all-projects').append('<p>Summary unavailable</p>');								
			}
			$('#all-projects').append('<div class="row spacer"></div>');
		}
	}
	
});


