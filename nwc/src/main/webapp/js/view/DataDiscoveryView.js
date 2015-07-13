var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.DataDiscoveryView = NWC.view.BaseView.extend({
	templateName : 'dataDiscovery',

	project : 'Project',
	data : 'Data',

	events: {
		'click #data-discovery-tabs .nav a': "showTab",
	},

	projectTabView : null,
	dataTabView : null,
	publicationTabView : null,

	/*
	 * @constructor
	 * @param {Object} options
	 *     @prop {Jquery element} el - the html element where view is rendered
	 */
	initialize : function(options) {

		this.router = options.router || null;
		this.tab = options.tab || null;

		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);

		this.projectTabView = new NWC.view.ProjectTabView({
			el : $('#show-projects'),
			showSummary : true,
			router : options.router
		});
		this.dataTabView = new NWC.view.DataTabView({
			el : $('#show-data'),
			showSummary : true,
			router : options.router
		});
		this.publicationsTabView = new NWC.view.PublicationsTabView({
			el : $('#show-publications'),
			showSummary : false
		});

		$('#' + this.tab + '-button').addClass('active');
		$('#' + this.tab).addClass('active');			
		
	},

	/*
	 * Handles the clicks to change tab visibility
	 * @param {Jquery event} ev
	 */
	showTab : function(ev) {
		var $el = $(ev.currentTarget);
		this.router.navigate('#data-discovery/' + $el.data('target'));
		var $dataDiscoveryTabs = this.$el.find('#data-discovery-tabs');

		ev.preventDefault();
		$dataDiscoveryTabs.find('li.active').removeClass('active');
		$dataDiscoveryTabs.find('.tab-content div.active').removeClass('active');

		$el.parent().addClass('active');
		$('#' + $el.data('target')).addClass('active');
	},

	remove : function() {
		this.projectTabView.remove();
		this.dataTabView.remove();
		this.publicationsTabView.remove();
		NWC.view.BaseView.prototype.remove.apply(this, arguments);
	}
});
