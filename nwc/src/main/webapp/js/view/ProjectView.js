var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.ProjectView = NWC.view.BaseView.extend({
		templateName : 'project',

		SCIENCEBASE_ERROR : '<h5>Sorry, the catalog contents are not available right now, please check back later.</h5>',

		detailsUrl : function(id) {
			return CONFIG.endpoint.direct.sciencebase + NWC.config.get('sciencebaseUrlFragment').getSingleItemFragment(id);
		},

		listUrl : function(id) {
			return CONFIG.endpoint.direct.sciencebase + NWC.config.get('sciencebaseUrlFragment').getDataFragment(id);
		},

		pubListUrl : function(id) {
			return CONFIG.endpoint.direct.sciencebase + NWC.config.get('sciencebaseUrlFragment').getPublicationsFragment(id);
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

			var self = this;
			this.getDetails(options.projectId).done(function(data) {
				$('#project-details').append(NWC.templates.getTemplate('projectDetail')(data));
				$('#projectTabLink').hide();
			}).fail(function(msg) {
				$('#project-details').append(self.SCIENCEBASE_ERROR + msg);
			});

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
						}).fail(function(msg) {
							$('#data-details').append(self.SCIENCEBASE_ERROR + msg);
						});
					};
				}
			}).fail(function(msg) {
							$('#data-details').append(self.SCIENCEBASE_ERROR + msg);
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
						}).fail(function(msg) {
							$('#publication-details').append(self.SCIENCEBASE_ERROR + msg);
						});
					};
				}
			}).fail(function(msg) {
							$('#publication-details').append(self.SCIENCEBASE_ERROR + msg);
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
					deferred.reject(errorMessage);
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
					deferred.reject(errorMessage);
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
					var errorMessage = 'Error retrieving detail data from ' + pubListUrl;
					deferred.reject(errorMessage);
				}
			});

			return deferred.promise();
		}
	});
}());
