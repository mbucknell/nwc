/*jslint browser: true*/
/*global Backbone */


var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";
	/*
	 * This view should be extended and the listTemplateName, detailsTemplateName, listUrl, detailsUrl properties
	 * defined. In addition, the getList and getDetails can be overridden if the default implementation needs
	 * to be changed.
	 */
	NWC.view.BaseDiscoveryTabView = Backbone.View.extend({

		/* The following properties define the title attr and icon for the button which toggles the details visibility. */
		SHOW_TITLE : 'Show details',
		HIDE_TITLE : 'Hide details',
		SHOW_ICON : 'More&nbsp;<i class="fa fa-caret-right"></i>',
		HIDE_ICON : 'Less&nbsp;<i class="fa fa-caret-down"></i>',

		/* The following properties should be overridden with the names of the list and details templates, respectively */
		listTemplateName : '',
		detailsTemplateName : '',

		/*
		 * Should be overridden
		 * @returns String - the url to be used to retrieve the list information to be rendered.
		 */
		listUrl : function() {
			return '';
		},

		/*
		 * Should be overridden
		 * @param {String} id - id of the item whose details will be rendered.
		 * @returns String - the url to be used to retrieve detail information about the object with id.
		 */
		detailsUrl : function(id) {
			return '';
		},

		events : {
			'click .toggle-details-btn' : 'toggleDetails',
			'click a' : 'goToPage'
		},

		/*
		 * @constructs
		 * @param {Object} options
		 *     @prop {Jquery element} el - this is where the list will be rendered
		 *     @prop {Backbone.Router instance} router - defaults to null
		 *     @prop {Boolean} showSummary (optional) - Whether the summary in the list is rendered.
		 */
		initialize : function(options){
			var self = this;
			this.template = NWC.templates.getTemplate(this.listTemplateName);
			Backbone.View.prototype.initialize.apply(this, arguments);
			this.context = {
				showSummary : options.showSummary ? options.showSummary : false,
				toggleTitle : this.SHOW_TITLE,
				toggleIcon : this.SHOW_ICON
			};
			this.router = options.router || null;

			this.getList().done(function(data) {
				self.context.list = data.items;
				self.$el.html(self.template(self.context));
			});
		},

		/*
		 * Uses the listUrl function result to retrieve the list of information asynchronously.
		 * @returns Jquery.promise - If the call succeeds, the promise is resolved with the data retrieved.
		 * If the call fails, the promise is rejected with an error message.
		 */
		getList : function() {
			var deferred = $.Deferred();
			var listUrl = this.listUrl();

			$.ajax({
				url : listUrl,
				dataType : "json",
				success: function(data) {
					deferred.resolve(data);
				},
				error : function() {
					//@todo - setup app level error handling
					var errorMessage = 'Error retrieving data from ' + listUrl;
					alert(errorMessage);
					deferred.reject(errorMessage);
				}
			});
			return deferred.promise();
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
		 * Handles the click event on a details toggle button. This includes updating the toggle button itself,
		 * showing/hiding the details content div and retrieving the details using getDetails if they have not
		 * yet been retrieved successfully.
		 * @param {Jquery event object} ev
		 */
		toggleDetails : function(ev) {
			var self = this;
			var $btn = $(ev.currentTarget);
			var id = $btn.data('id');
			var $detailsDiv = this.$el.find('#' + id);
			var $parentEl = $btn.parents('.summary-container-div');
			var $summaryDiv = $parentEl.find('.summary-content-div');

			ev.preventDefault();

			if ($btn.attr('title') === this.SHOW_TITLE) {
				$btn.html(this.HIDE_ICON);
				$btn.attr('title', this.HIDE_TITLE);

				$detailsDiv.show();
				$summaryDiv.hide();
				if (($detailsDiv).html() === '') {
					this.getDetails($btn.data('id')).done(function(data) {
						$detailsDiv.html(NWC.templates.getTemplate(self.detailsTemplateName)(data));
					});
				}
			}
			else {
				$btn.html(this.SHOW_ICON);
				$btn.attr('title', this.SHOW_TITLE);
				$detailsDiv.hide();
				$summaryDiv.show();
			}
		},

		goToPage: function(ev) {
			this.router.navigate(event.target.hash, {trigger: true});
		}
	});
}());

