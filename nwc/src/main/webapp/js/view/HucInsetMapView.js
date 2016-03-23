/*jslint browser:true */
/*global OpenLayers*/

var NWC = NWC || {};
NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.HucInsetMapView = NWC.view.BaseView.extend({

		templateName : 'hucInsetMap',

		/*
		 * @constucts
		 * @param {Object} options
		 *     @prop {Jquery Element} el - Element where view should be rendered
		 *     @prop {String} hucId
		 *     @prop {String} gageId (optional)
		 *     @prop {Boolean} accumulated - false indicates if this is local watershed, true indicates accumulated.
		 *     @prop {Boolean} compare - True if this is the comparision inset map view
		 *     @prop {WaterBudgetHucPlotModel} model - Used to set the watershed acres
		 */
		initialize : function(options) {
			var self = this;

			var accumulated = options.accumulated ? options.accumulated : false;
			var watershedAcres = options.compare ? 'compareWatershedAcres' : 'watershedAcres';
			var gageId = options.gageId ? options.gageId : null;
			var hucId = options.hucId;

			var watershedConfig = NWC.config.getWatershed(options.hucId);
			var acWatershedConfig = NWC.config.get('accumulated').attributes;
			var streamflowGageConfig;

			this.context = {
				hucId : hucId,
				gageId : gageId
			};

			var hucLoadedDeferred = $.Deferred();
			var achucLoadedDeferred = $.Deferred();
			var gageLoadedDeferred = $.Deferred();

			var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();
			var mapControls = [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()];
			var map = NWC.util.mapUtils.createMap([baseLayer], mapControls);

			var gageLayer, gageMarkerLayer, hucLayer, achucLayer;

			var altHucStyle = {
				strokeWidth: 2,
				strokeColor: "#000000",
				strokeOpacity : .6,
				fillOpacity: .2,
				fillColor : "#000000",
				fill: true
			};
			var hucStyle = accumulated ? altHucStyle : null;
			var achucStyle = accumulated ? null : altHucStyle;

			// Load vector layers
			this.featureLoadedPromise = $.when(hucLoadedDeferred, achucLoadedDeferred, gageLoadedDeferred);

			if (gageId) {
				streamflowGageConfig = NWC.config.get('streamflow').gage.attributes;
				gageLayer = NWC.util.mapUtils.createGageFeatureLayer(
						streamflowGageConfig.namespace,
						streamflowGageConfig.layerName,
						gageId);
				gageMarkerLayer = new OpenLayers.Layer.Markers("Markers");
				gageLayer.events.on({
					featureadded : function(event) {
						var lonlat = new OpenLayers.LonLat(event.feature.geometry.x, event.feature.geometry.y);

						this.model.set(watershedAcres,
								NWC.util.Convert.squareKilometersToAcres(event.feature.attributes[watershedConfig.watershedAreaUnit]));

						gageMarkerLayer.addMarker(new OpenLayers.Marker(lonlat));

						this.$('#gage-name').html(event.feature.attributes.STANAME);
						this.$('#drainage-area').html(event.feature.attributes.DRAIN_SQKM);
					},
					loadend : function(event) {
						gageLoadedDeferred.resolve();
					},
					scope : this
				});
				map.addLayers([gageLayer, gageMarkerLayer]);
			}
			else {
				gageLoadedDeferred.resolve();
			}

			hucLayer = NWC.util.mapUtils.createHucFeatureLayer(
				watershedConfig.namespace,
				watershedConfig.layerName,
				watershedConfig.property,
				[hucId],
				hucStyle
			);
			hucLayer.events.on({
				featureadded : function(event) {
					var hucName = event.feature.attributes[watershedConfig.name];
					this.$('.huc-name').html(hucName);
				},
				loadend : function(event) {
					if (!accumulated) {
						map.zoomToExtent(hucLayer.getDataExtent());
					}
					hucLoadedDeferred.resolve();
				},
				scope : this
			});
			map.addLayer(hucLayer);

			achucLayer = NWC.util.mapUtils.createHucFeatureLayer(
				acWatershedConfig.namespace,
				acWatershedConfig.layerName,
				acWatershedConfig.property,
				[hucId],
				achucStyle
			);

			achucLayer.events.on({
				featureadded : function(event) {
					var hucName = event.feature.attributes[acWatershedConfig.name];
					this.$('.huc-name').html(hucName);
				},
				loadend : function(event) {
					if (accumulated) {
						map.zoomToExtent(achucLayer.getDataExtent());
					}
					achucLoadedDeferred.resolve();
				},
				scope : this
			});

			map.addLayer(achucLayer);


			this.featureLoadedPromise.done(function() {
				self.$('.huc-loading-indicator').hide();
			});

			// Render the template and the map
			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
			map.render('huc-inset-' + hucId);
		}
	});
}());