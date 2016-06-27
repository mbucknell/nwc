/* jslint browser: true */

/* global $*/

var NWC = NWC || {};
NWC.view = NWC.view || {};

(function() {
	"use strict";

	/*
	 * @param {Object} dateModel - represents the huc data for this view
	 * @param {String} observedProperty
	 * @param {Array of String} upstreamHucs - representing the upstream hucs
	 * @returns {Jquery Promise} - See NWC.util.executeFeatureTSCollection
	 */
	var executeFeatureTSCollection = function(dataModel, observedProperty) {
		var dateRange = dataModel.get('dataSeriesStore');
		return NWC.util.executeFeatureTSCollection({
			startTime : dateRange.start.toISOString(),
			endTime : dateRange.end.toISOString(),
			threddsEndpoint : CONFIG.endpoint.thredds,
			datasetURI : 'HUC12_data',
			observedProperty : observedProperty,
			featureAttributesName : 'huc12',
			featureNamespace : 'http://gov.usgs.cida.WBD',
			featureName : 'feature:huc12agg',
			featureAttributeName : 'huc12',
			featureValues : dataModel.get('upstreamHucs')
		});
	};
	/*
	 * @constructs
	 * @param {Object}
	 *		@prop {Jquery selector element} el - Container where this view will be rendered
	 *		@prop {String} hucId,
	 *		@prop {Backbone.Model} model - this should be the data model for the huc or the compare huc as appropriate.
	 */
	NWC.view.WaterbudgetDownloadUpstreamView = NWC.view.BaseView.extend({
		templateName : 'waterbudgetDownloadUpstream',

		events : {
			'click .download-upstream-eta-container button' : 'downloadUpstreamEta',
			'click .download-upstream-daymet-container button' : 'downloadUpstreamDaymet'
		},

		initialize : function(options) {
			this.hucId = options.hucId;

			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
			this.listenTo(this.model, 'change:dataSeriesStore', this.enableDownloadButtons);
			this.listenTo(this.model, 'change:upstreamHucs', this.enableDownloadButtons);
			this.enableDownloadButtons();
		},

		/*
		 * Enables the download buttons and save the information necessary to start the GDP process.
		 * @param {Object} dateRange - start and end Date Properties
		 * @param {Array of Strings} upstreamHucs - representing the upstream hucs
		 */
		enableDownloadButtons : function(dateRange, upstreamHucs) {
			if (this.model.has('dataSeriesStore') && this.model.has('upstreamHucs')) {
				this.$('.download-upstream-eta-container button').prop('disabled', false);
				this.$('.download-upstream-daymet-container button').prop('disabled', false);
			}
		},

		/*
		 * DOM event handlers
		 */

		downloadUpstreamEta : function(ev) {
			var $loadingIndicator = this.$('.download-upstream-eta-container .download-loading-indicator');
			var $loadingMsg = this.$('.download-upstream-eta-container .download-msg');

			$(ev.target).prop('disabled', true);
			$loadingIndicator.show();
			$loadingMsg.html('');
			executeFeatureTSCollection(this.model, 'et')
				.done(function(downloadUrl, downloadData) {
					var filename = this.hucId + '_upstreamHucs_eta';
					var params = downloadData + '&filename=' + filename;
					$.download(downloadUrl, params, 'get');
					$loadingMsg.html('File is being downloaded: ' + filename);
				})
				.progress(function(message) {
					$loadingMsg.html(new Date().toTimeString() + ': ' + message);
				})
				.error(function(message) {
					$loadingMsg.html('Unable to download data: ' + message);
				})
				.always(function() {
					$loadingIndicator.hide();
					$(ev.target).prop('disabled', false);
				});
		},

		downloadUpstreamDaymet : function(ev) {
			var $loadingIndicator = this.$('.download-upstream-daymet-container .download-loading-indicator');
			var $loadingMsg = this.$('.download-upstream-daymet-container .download-msg');

			$(ev.target).prop('disabled', true);
			$loadingIndicator.show();
			$loadingMsg.html('');
			executeFeatureTSCollection(this.dateRange, 'prcp', this.upstreamHucs)
				.done(function(downloadUrl, downloadData) {
					var filename = this.hucId + '_upstreamHucs_daymet';
					var params = downloadData + '&filename=' + filename;
					$.download(downloadUrl, params, 'get');
					$loadingMsg.html('File is being downloaded: ' + filename);
				})
				.progress(function(message) {
					$loadingMsg.html(new Date().toTimeString() + ': ' + message);
				})
				.error(function(message) {
					$loadingMsg.html('Unable to download data: ' + message);
				})
				.always(function() {
					$loadingIndicator.hide();
					$(ev.target).prop('disabled', false);
				});
		}
	});
})();


