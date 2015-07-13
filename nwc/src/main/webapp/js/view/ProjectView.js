var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.ProjectView = NWC.view.BaseView.extend({
	templateName : 'project',

	events: {
		'click #back-button': "back",	
	},

	detailsUrl : function(id) {
		return CONFIG.endpoint.direct.sciencebase + '/catalog/item/' + id + '?format=json';
	},

	listUrl : function(id) {
		return CONFIG.endpoint.direct.sciencebase + '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DData&parentId=' + id + '&format=json';
	},

	pubListUrl : function(id) {
		return CONFIG.endpoint.direct.sciencebase + '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DPublication&parentId=' + id + '&format=json';
	},

	/*
	 * @constructor
	 * @param {Object} options
	 *     @prop {Jquery element} el - the html element where view is rendered
	 */
	initialize : function(options) {
		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		
		this.getDetails(options.projectId).done(function(data) {
			$('#project-details').append(NWC.templates.getTemplate('projectDetail')(data));
			$('#projectTabLink').hide();
		});
		
		var self = this;
		this.getDatasetList(options.projectId).done(function(dataList) {
			if (dataList.items.length == 0) {
				$('#data-details').append('<div>None available</div>');				
			}
			else{
				var i;
				for (i=0; i < dataList.items.length; i++) {
					self.getDetails(dataList.items[i].id).done(function(data) {
						$('#data-details').append(NWC.templates.getTemplate('dataDetail')(data));
						$('.dataTabLink').hide();
					});
				};				
			}
		});

		this.getPublicationList(options.projectId).done(function(dataList) {
			if (dataList.items.length == 0) {
				$('#publication-details').append('<div>None available</div>');				
			}
			else{
				var i;
				for (i=0; i < dataList.items.length; i++) {
					self.getDetails(dataList.items[i].id).done(function(data) {
						$('#publication-details').append(NWC.templates.getTemplate('publicationsDetail')(data));
					});
				};				
			}
		});
		
	},

	/*
	 * Uses the detetailsUrl function result to retrieve information about a specific item, identified by id
	 * @param {String} id
	 * @returns Jquery.promise - If the call succeeds, the promise is reolved with the data retrieved.
	 * If the call fails, the promise is rejected with an error message.
	 */
	getDetails : function(id) {
		var deferred = $.Deferred();
		var detailsUrl = this.detailsUrl(id);

		$.ajax({
			url : detailsUrl,
			dataType : "json",
			success: function(data) {
				deferred.resolve(data);
			},
			error : function() {
				//@todo - setup app level error handling
				var errorMessage = 'Error retrieving detail data from ' + detailsUrl;
				alert(errorMessage);
			}
		});

		return deferred.promise();
	},

	/*
	 * Uses the listUrl function result to retrieve information about all datasets for a specific project, identified by id
	 * @param {String} id
	 * @returns Jquery.promise - If the call succeeds, the promise is resolved with the data retrieved.
	 * If the call fails, the promise is rejected with an error message.
	 */
	getDatasetList : function(id) {
		var deferred = $.Deferred();
		var listUrl = this.listUrl(id);

		$.ajax({
			url : listUrl,
			dataType : "json",
			success: function(data) {
				deferred.resolve(data);
			},
			error : function() {
				//@todo - setup app level error handling
				var errorMessage = 'Error retrieving detail data from ' + listUrl;
				alert(errorMessage);
			}
		});

		return deferred.promise();
	},

	/*
	 * Uses the pubListUrl function result to retrieve information about all publications for a specific project, identified by id
	 * @param {String} id
	 * @returns Jquery.promise - If the call succeeds, the promise is resolved with the data retrieved.
	 * If the call fails, the promise is rejected with an error message.
	 */
	getPublicationList : function(id) {
		var deferred = $.Deferred();
		var pubListUrl = this.pubListUrl(id);

		$.ajax({
			url : pubListUrl,
			dataType : "json",
			success: function(data) {
				deferred.resolve(data);
			},
			error : function() {
				//@todo - setup app level error handling
				var errorMessage = 'Error retrieving detail data from ' + listUrl;
				alert(errorMessage);
			}
		});

		return deferred.promise();
	},

	back: function() {
		if(window.history.length > 2) {
			//more than one route hit -> user did not land to current page directly\
			window.history.back();
		} 
		else {
			//otherwise go to the home page.
			window.location.assign('');
		}
	}
});
