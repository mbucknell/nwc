var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.DataDiscoveryView = NWC.view.BaseView.extend({
	templateName : 'dataDiscovery',

	project : 'Project',
	data : 'Data',
	
	events: {
		'click #show-detail-button': "showDetail",
		'click #show-projects-button': "showProjects",
		'click #show-data-button': "showData",
	},

	initialize : function() {

		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);			
		$("#show-projects-button").prop('disabled', true);
		this.getList(this.project);
	},

	/**
	 * This makes a Web service call to get list data for display
	 */
	getList: function(type) {
		$.ajax({
			url : CONFIG.endpoint.direct.sciencebase + '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3D' + type + '&max=100&format=json',
			dataType : "json",
			success: function(data) {
				$('#list-div').html(NWC.templates.getTemplate('dataDiscoveryList')({list : data.items}));
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
	showDetail: function(ev) {
		var id = $(ev.currentTarget).data('id');
		if ($('#' + id).is(':hidden')) {
			$(ev.currentTarget).html('-');
			$(ev.currentTarget).prop('title', 'Hide details');
			$.ajax({
				url : CONFIG.endpoint.direct.sciencebase + '/catalog/item/' + id + '?format=json',
				dataType : "json",
				success: function(data) {
					$('#' + id).html(NWC.templates.getTemplate('dataDiscoveryDetail')({detail : data}));
					$('#' + id).show();
				},
				error : function() {
					//@todo - setup app level error handling
					var errorMessage = 'error retrieving project detail data';
					alert(errorMessage);
				}
			});
		}
		else {
			$(ev.currentTarget).html('+');
			$(ev.currentTarget).prop('title', 'Show details');
			$('#' + id).hide();
		}
	},

	/**
	 * This toggles the view to display projects
	 */
	showProjects: function() {
		$('#show-data-button').prop('disabled', false);
		$("#show-projects-button").prop('disabled', true);
		this.getList(this.project);
	},

	/**
	 * This toggles the view to display data
	 */
	showData: function() {
		$('#show-data-button').prop('disabled', true);
		$("#show-projects-button").prop('disabled', false);
		this.getList(this.data);
	}

});
