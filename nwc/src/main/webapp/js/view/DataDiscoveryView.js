var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.DataDiscoveryView = NWC.view.BaseView.extend({
	templateName : 'dataDiscovery',

	initialize : function(options) {
		if (!Object.has(this, 'context')) {
			this.context = {};
		}
		
		var _this = this;
		var projectDataPromise = this.getProjectData(_this);
		$.when(projectDataPromise).done(function() {

			// call superclass initialize to do default initialize
			// (includes render)
			NWC.view.BaseView.prototype.initialize.apply(_this, arguments);			
		});
		
	},

	/**
	 * This makes a Web service call to get project data for display
	 */
	getProjectData: function(_this) {
		var d = $.Deferred();
		var projects = [];
		$.ajax({
			url : CONFIG.endpoint.direct.sciencebase + '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DProject&max=100&format=json',
			dataType : "json",
			success: function(data) {
				for (var i = 0; i < data.total; i++) {
					if (data.items[i].summary) {
						projects.push({title: data.items[i].title, summary: data.items[i].summary});
					}
					else {
						projects.push({title: data.items[i].title, summary: 'Summary unavailable'});				
					}
				}
				_this.context.projectList = projects;
				d.resolve();
			},
			error : function() {
				//@todo - setup app level error handling
				var errorMessage = 'error retrieving project data';
				alert(errorMessage);
			}
		});
		return d.promise();
	}
});


