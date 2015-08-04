/*jslint browser:true */
/*global OpenLayers*/

var NWC = NWC || {};
NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.HucInsetMapView = NWC.view.BaseView.extend({

		templateName : 'hucInsetMap',

		// This  is resolved once the huc feature layer has been loaded and the hucLayer property
		// contains the OpenLayer vector layer.
		hucFeatureLoadedPromise : undefined,
		hucLayer : undefined,

		/*
		 * @constucts
		 * @param {Object} options
		 *     @prop {Jquery Element} el - Element where view should be rendered
		 *     @prop {String} hucId
		 */
		initialize : function(options) {
			var self = this;
			var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();
			var mapControls = [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()];
			var hucLoadedDeferred = $.Deferred();

			this.hucId = options.hucId;
			this.context = {
				hucId : this.hucId
			};

			//Create map and layers.
			this.hucFeatureLoadedPromise = hucLoadedDeferred.promise();
			this.map = NWC.util.mapUtils.createMap([baseLayer], mapControls);

			this.hucLayer = NWC.util.mapUtils.createHucFeatureLayer([this.hucId]);
			this.hucLayer.events.on({
				featureadded : function(event) {
					self.hucName = event.feature.attributes.hu_12_name;
					self.$('.huc-name').html(self.hucName);
				},
				loadend : function(event) {
					self.map.zoomToExtent(self.hucLayer.getDataExtent());
					self.$('.huc-loading-indicator').hide();
					hucLoadedDeferred.resolve();
				}
			});
			this.map.addLayer(this.hucLayer);

			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
			this.map.render('huc-inset-' + this.hucId);
		}
	});


}());


