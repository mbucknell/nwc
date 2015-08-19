var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.DataView = NWC.view.BaseView.extend({
	templateName : 'data',
	
	SCIENCEBASE_ERROR : "<h5>Sorry, the catalog contents are not available right now, please check back later.</h5>",

	detailsUrl : function(id) {
		return CONFIG.endpoint.direct.sciencebase + '/catalog/item/' + id + '?format=json';
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
		this.getDetails(options.datasetId).done(function(data) {
			$('#data-details').append(NWC.templates.getTemplate('dataDetail')(data));
			$('.dataTabLink').hide();
			self.getDetails(data.parentId).done(function(data) {
				$('#project-details').append(NWC.templates.getTemplate('projectDetail')(data));
				$('#projectTabLink').hide();
			}).fail(function(msg) {
				$('#project-details').append(self.SCIENCEBASE_ERROR + msg);
			});
		}).fail(function(msg) {
			$('#data-details').append(self.SCIENCEBASE_ERROR + msg);
			$('#project-details').append(self.SCIENCEBASE_ERROR);
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
});
