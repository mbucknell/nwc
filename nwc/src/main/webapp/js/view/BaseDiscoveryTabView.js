/*jslint browser: true*/


var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";
	NWC.view.BaseDiscoveryTabView = Backbone.View.extend({

		SHOW_TITLE : 'Show details',
		HIDE_TITLE : 'Hide details',
		SHOW_ICON : 'Details&nbsp;<i class="fa fa-caret-right"></i>',
		HIDE_ICON : 'Details&nbsp;<i class="fa fa-caret-down"></i>',

		templateName : 'dataDiscoveryList',

		events : {
			'click .toggle-details-btn' : 'toggleDetails'
		},

		render : function() {
			this.$el.html(this.template(this.context));
		},

		initialize : function(options){
			var self = this;
			this.template = NWC.templates.getTemplate(this.templateName);
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
			return deferred.promise();
		},

		getDetails : function(id, $detailsDiv) {
			var deferred = $.Deferred();
			return deferred.promise();
		},

		toggleDetails : function(ev) {
			var $btn = $(ev.currentTarget);
			var $parentEl = $btn.parents('.summary-container-div');
			var id = $btn.data('id');
			var $detailsDiv = this.$el.find('#' + id);
			var $summaryDiv = $parentEl.find('.summary-content-div');

			ev.preventDefault();

			if ($btn.attr('title') === this.SHOW_TITLE) {
				$btn.html(this.HIDE_ICON);
				$btn.attr('title', this.HIDE_TITLE);

				$detailsDiv.show();
				$summaryDiv.hide();
				this.getDetails($btn.data('id'), $detailsDiv);
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

