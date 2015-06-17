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

	showTab : function(ev) {
		var $el = $(ev.currentTarget);
		var $dataDiscoveryTabs = this.$el.find('#data-discovery-tabs');

		ev.preventDefault();
		$dataDiscoveryTabs.find('li.active').removeClass('active');
		$dataDiscoveryTabs.find('.tab-content div.active').removeClass('active');

		$el.parent().addClass('active');
		$('#' + $el.data('target')).addClass('active');


	}
});
