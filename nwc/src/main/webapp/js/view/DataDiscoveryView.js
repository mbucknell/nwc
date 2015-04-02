var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.DataDiscoveryView = NWC.view.BaseView.extend({
	templateName : 'dataDiscovery',

	events: {
		'click #show-project-detail-button': "showProjectDetail",
	},

	initialize : function() {

		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);			

		this.getProjectData();
	},

	/**
	 * This makes a Web service call to get project list data for display
	 */
	getProjectData: function() {
		$.ajax({
			url : CONFIG.endpoint.direct.sciencebase + '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DProject&max=100&format=json',
			dataType : "json",
			success: function(data) {
				$('#project-list-div').html(NWC.templates.getTemplate('projectList')({projectList : data.items}));
			},
			error : function() {
				//@todo - setup app level error handling
				var errorMessage = 'error retrieving project list data';
				alert(errorMessage);
			}
		});
	},

	/**
	 * This makes a Web service call to get project detail data for display
	 */
	showProjectDetail: function(ev) {
		var projectId = $(ev.currentTarget).data('id');
		if ($('#' + projectId).is(':hidden')) {
			$(ev.currentTarget).removeClass('glyphicon-arrow-up');
			$(ev.currentTarget).addClass('glyphicon-arrow-down');
			$.ajax({
				url : CONFIG.endpoint.direct.sciencebase + '/catalog/item/' + projectId + '?format=json',
				dataType : "json",
				success: function(data) {
					$('#' + projectId).html(NWC.templates.getTemplate('projectDetail')({projectDetail : data}));
					$('#' + projectId).show();
				},
				error : function() {
					//@todo - setup app level error handling
					var errorMessage = 'error retrieving project detail data';
					alert(errorMessage);
				}
			});
		}
		else {
			$(ev.currentTarget).removeClass('glyphicon-arrow-down');
			$(ev.currentTarget).addClass('glyphicon-arrow-up');
			$('#' + projectId).hide();
		}
	}

});
