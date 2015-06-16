var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.DataDiscoveryView = NWC.view.BaseView.extend({
	templateName : 'dataDiscovery',

	project : 'Project',
	data : 'Data',

	events: {
		'click #show-projects-button a': "showProjects",
		'click #show-data-button a': "showData",
		'click #show-publications-button a' : 'showPublications'
	},

	projectTabView : null,
	dataTabView : null,
	publicationTabView : null,

	initialize : function() {
		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		this.projectTabView = new NWC.view.ProjectTabView({
			el : $('#show-project'),
			showSummary : true
		});
		this.dataTabView = new NWC.view.DataTabView({
			el : $('#show-data'),
			showSummary : true
		});
		this.publicationsTabView = new NWC.view.PublicationsTabView({
			el : $('#show-publications'),
			showSummary : false
		});
	},
	/**
	 * This makes a Web service call to get list data for display
	 */
	getList: function(type) {
		var deferred = $.Deferred();
		$.ajax({
			url : CONFIG.endpoint.direct.sciencebase + '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3D' + type + '&max=100&format=json',
			dataType : "json",
			success: function(data) {
				deferred.resolve(data);
			},
			error : function() {
				//@todo - setup app level error handling
				var errorMessage = 'error retrieving project list data';
				alert(errorMessage);
				deferred.reject(errorMessage);
			}
		});

		return deferred;
	},

	/**
	 * This makes a Web service call to get project detail data for display
	 */
	showDetail: function(ev) {
		var id = $(ev.currentTarget).data('id');
		var selector = '#' + id;
		var $button = $(ev.currentTarget);
		var $container = $(selector);
		var $summaryContainer = $(selector + "-summary");
		if ($container.is(':hidden')) {
			$summaryContainer.hide();
			$button.html('-');
			$button.prop('title', 'Hide details');
			$.ajax({
				url : CONFIG.endpoint.direct.sciencebase + '/catalog/item/' + id + '?format=json',
				dataType : "json",
				success: function(data) {
					$(selector).html(NWC.templates.getTemplate('dataDiscoveryDetail')({detail : data}));
					$(selector).show();
				},
				error : function() {
					//@todo - setup app level error handling
					var errorMessage = 'error retrieving project detail data';
					alert(errorMessage);
				}
			});
		}
		else {
			$button.html('+');
			$button.prop('title', 'Show details');
			$container.hide();
			$summaryContainer.show();
		}
	},
	_showTab : function(el) {
		var $dataDiscoveryTabs = $('#data-discovery-tabs');
		$dataDiscoveryTabs.find('li.active').removeClass('active');
		var t = $dataDiscoveryTabs.find('.tab-content div');
		$dataDiscoveryTabs.find('.tab-content div.active').removeClass('active');

		$(el).parent().addClass('active');
		$('#' + $(el).data('target')).addClass('active');


	},

	/**
	 * This toggles the view to display projects
	 */
	showProjects: function(ev) {
		ev.preventDefault();
		this._showTab(ev.target);
	},

	/**
	 * This toggles the view to display data
	 */
	showData: function(ev) {
		ev.preventDefault();
		this._showTab(ev.target);
	},

	showPublications : function(ev) {
		ev.preventDefault();
		this._showTab(ev.target);
	}

});
