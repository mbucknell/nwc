/*jslint browser: true*/
/*global Backbone */


var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";
	NWC.view.BaseDiscoveryTabView = Backbone.View.extend({

		SHOW_TITLE : 'Show details',
		HIDE_TITLE : 'Hide details',
		SHOW_ICON : 'Details&nbsp;<i class="fa fa-caret-right"></i>',
		HIDE_ICON : 'Details&nbsp;<i class="fa fa-caret-down"></i>',

		listTemplateName : '',
		detailsTemplatename : '',

		listUrl : '',
		detailsUrl : function(id) {
			return '';
		},

		events : {
			'click .toggle-details-btn' : 'toggleDetails'
		},

		render : function() {
			this.$el.html(this.template(this.context));
		},

		initialize : function(options){
			var self = this;
			this.template = NWC.templates.getTemplate(this.listTemplateName);
			Backbone.View.prototype.initialize.apply(this, arguments);
			this.context = {
				showSummary : options.showSummary ? options.showSummary : false,
				toggleTitle : this.SHOW_TITLE,
				toggleIcon : this.SHOW_ICON
			};

			this.getList().done(function(data) {
				self.context.list = data.items;
				self.render();
			});
		},

		getList : function() {
			var deferred = $.Deferred();

			$.ajax({
				url : this.listUrl,
				dataType : "json",
				success: function(data) {
					deferred.resolve(data);
				},
				error : function() {
					//@todo - setup app level error handling
					var errorMessage = 'Error retrieving project list data';
					alert(errorMessage);
					deferred.reject(errorMessage);
				}
			});
			return deferred.promise();
		},

		getDetails : function(id) {
			var deferred = $.Deferred();

			$.ajax({
				url : this.detailsUrl(id),
				dataType : "json",
				success: function(data) {
					deferred.resolve(data);
				},
				error : function() {
					//@todo - setup app level error handling
					var errorMessage = 'error retrieving project detail data';
					alert(errorMessage);
				}
			});

			return deferred.promise();
		},

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
				this.getDetails($btn.data('id')).done(function(data) {
					$detailsDiv.html(NWC.templates.getTemplate(self.detailsTemplateName)(data));
				});
			}
			else {
				$btn.html(this.SHOW_ICON);
				$btn.attr('title', this.SHOW_TITLE);
				$detailsDiv.hide();
				$summaryDiv.show();
			}
		}
	});
}());

