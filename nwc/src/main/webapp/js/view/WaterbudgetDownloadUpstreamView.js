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
	var executeFeatureTSCollection = function(hucId, dataModel, datasetURI, observedProperty) {
		var dateRange = dataModel.get('dataSeriesStore').dateRange();
		return NWC.util.executeFeatureTSCollection({
			startTime : dateRange.start.toISOString(),
			endTime : dateRange.end.toISOString(),
			threddsEndpoint : CONFIG.endpoint.direct.thredds,
			datasetURI : datasetURI,
			observedProperty : observedProperty,
			featureNamespace : 'http://gov.usgs.cida/WBD',
			featureName : 'feature:huc12agg',
			featureAttributeName : 'huc12',
			featureValues : [hucId].concat(dataModel.get('upstreamHucs'))
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
			'click .download-eta-btn' : 'downloadUpstreamEta',
			'click .download-precip-btn' : 'downloadUpstreamDaymet'
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
				this.$('.download-upstream-container button').prop('disabled', false);
			}
		},

		/*
		 * DOM event handlers
		 */

		/*
		 * Helper function to handle downloading the  upstream huc data
		 * @param {Object} dateModel - represents the huc data for this view
		 * @param {String} observedProperty*
		 */
		_downloadUpstreamData : function(datasetURI, observedProperty) {
			var self = this;
			var $downloadBtns = this.$('.download-upstream-container button');
			var $loadingIndicator = this.$('.download-loading-indicator');
			var $loadingAlert = this.$('.download-msg-container');
			var $loadingMsg = this.$('.download-msg');

			$downloadBtns.prop('disabled', true);
			$loadingIndicator.removeClass('hidden');
			$loadingMsg.html('Starting download');
			$loadingAlert.removeClass('hidden');

			executeFeatureTSCollection(this.hucId, this.model, datasetURI, observedProperty)
				.done(function(downloadUrl, downloadData) {
					var filename = self.hucId + '_upstreamHucs_' + observedProperty;
					var params = downloadData + '&filename=' + filename;
					$.download(downloadUrl, params, 'get');
					$loadingAlert.addClass('hidden');
				})
				.progress(function(message) {
					$loadingMsg.html(new Date().toTimeString() + ': ' + message);
				})
				.fail(function(message) {
					$loadingIndicator.addClass('hidden');
					$loadingMsg.html('Unable to download data: ' + message);
				})
				.always(function() {
					$loadingIndicator.show();
					$downloadBtns.prop('disabled', false);
				});
		},

		downloadUpstreamEta : function() {
			this._downloadUpstreamData('HUC12_data/HUC12_eta.nc', 'et');
		},

		downloadUpstreamDaymet : function() {
			this._downloadUpstreamData('HUC12_data/HUC12_daymet.nc', 'prcp');
		}
	});
})();


