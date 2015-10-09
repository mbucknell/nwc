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

			this.hucId = options.hucId;
			var gageId = options.gageId ? options.gageId : null;
			this.context = {
				hucId : this.hucId,
				gageId : gageId
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
					this.hucName = event.feature.attributes[watershedConfig.name];
					this.$('.huc-name').html(this.hucName);
					this.model.set('watershedAcres', event.feature.attributes[watershedConfig.watershedAcres]);
				},
				loadend : function(event) {
					this.map.zoomToExtent(this.hucLayer.getDataExtent());
					this.$('.huc-loading-indicator').hide();
					hucLoadedDeferred.resolve();
				},
				scope : this
			});
			
			if (gageId) {
				this.streamflowGageConfig = NWC.config.get('streamflow').gage.attributes;
				this.gageLayer = NWC.util.mapUtils.createGageFeatureLayer(
						this.streamflowGageConfig.namespace,
						this.streamflowGageConfig.layerName,
						gageId);
				this.gageMarkerLayer = new OpenLayers.Layer.Markers("Markers");
				this.gageLayer.events.on({
					featureadded : function(event) {
						var lonlat = new OpenLayers.LonLat(event.feature.geometry.x, event.feature.geometry.y);
						this.gageMarkerLayer.addMarker(new OpenLayers.Marker(lonlat));
						$('#gage-name').html(event.feature.attributes.STANAME);
						$('#drainage-area').html(event.feature.attributes.DRAIN_SQKM);
					},
					scope : this
				});
				this.map.addLayers([this.gageLayer, this.gageMarkerLayer]);
			}

			this.map.addLayer(this.hucLayer);

			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
			this.map.render('huc-inset-' + this.hucId);
		}
	});
}());