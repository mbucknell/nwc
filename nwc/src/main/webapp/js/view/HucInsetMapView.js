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
		 *     @prop {String} gageId (optional)
		 *     @prop {Boolean} accumulated - false indicates if this is local watershed, true indicates accumulated.
		 *     @prop {WaterBudgetHucPlotModel} model - Used to set the watershed acres 
		 */
		initialize : function(options) {
			var self = this;
			var accumulated = options.accumulated ? options.accumulated : false;
			var watershedConfig;
			if (accumulated) {
				watershedConfig = NWC.config.get('accumulated').attributes;				
			}
			else {
				watershedConfig = NWC.config.getWatershed(options.hucId);
			}

			var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();
			var mapControls = [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()];
			var hucLoadedDeferred = $.Deferred();

			//do we want to put gage Id on view?
			this.hucId = options.hucId;
			this.context = {
				hucId : this.hucId
			};

			//Create map and layers.
			this.hucFeatureLoadedPromise = hucLoadedDeferred.promise();
			this.map = NWC.util.mapUtils.createMap([baseLayer], mapControls);

			this.hucLayer = NWC.util.mapUtils.createHucFeatureLayer(
				watershedConfig.namespace,
				watershedConfig.layerName,
				watershedConfig.property,
				[this.hucId]
			);
			var watershedAcres;
			this.hucLayer.events.on({
				featureadded : function(event) {
					self.hucName = event.feature.attributes[watershedConfig.name];
					self.$('.huc-name').html(self.hucName);
					self.model.set('watershedAcres', event.feature.attributes[watershedConfig.watershedAcres]);
				},
				loadend : function(event) {
					self.map.zoomToExtent(self.hucLayer.getDataExtent());
					self.$('.huc-loading-indicator').hide();
					hucLoadedDeferred.resolve();
				}
			});
			
			var gageId = options.gageId ? options.gageId : null;
			if (gageId) {
				this.streamflowGageConfig = NWC.config.get('streamflow').gage.attributes;
				this.gageLayer = NWC.util.mapUtils.createGageFeatureLayer(
						this.streamflowGageConfig.namespace,
						this.streamflowGageConfig.layerName,
						gageId);
				//might need to change the gage marker symbol?
				//also might need other gage info?
//				this.gageMarkerLayer = new OpenLayers.Layer.Markers("Markers");
//				this.map.addLayers([this.gageLayer, this.gageMarkerLayer]);
				this.map.addLayer(this.gageLayer);
			}

			this.map.addLayer(this.hucLayer);

			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
			this.map.render('huc-inset-' + this.hucId);
		}
	});

}());


