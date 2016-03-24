/*jslint browser:true */
/*global OpenLayers*/

var NWC = NWC || {};
NWC.view = NWC.view || {};

(function() {
	"use strict";

	var HUC_STYLE = {
		strokeWidth: 2,
		strokeColor: "#000000",
		fill : false
	};
	var ALT_HUC_STYLE = {
		strokeWidth: 2,
		strokeColor: "#FF0000",
		strokeOpacity : 1,
		fill: false
	};


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

			var hucLoadedDeferred = $.Deferred();
			var achucLoadedDeferred = $.Deferred();
			var gageLoadedDeferred = $.Deferred();

			var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();
			var mapControls = [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()];

			var gageLayer, gageMarkerLayer;

			this.hucStyle = accumulated ? ALT_HUC_STYLE : HUC_STYLE;
			this.achucStyle = accumulated ? HUC_STYLE : ALT_HUC_STYLE;

			this.context = {
				hucId : hucId,
				gageId : gageId,
				isHuc12 : hucId.length === 12
			};

			this.map = NWC.util.mapUtils.createMap([baseLayer], mapControls);

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
								NWC.util.Convert.squareKilometersToAcres(event.feature.attributes[acWatershedConfig.watershedAreaUnit]));

						gageMarkerLayer.addMarker(new OpenLayers.Marker(lonlat));

						this.$('#gage-name').html(event.feature.attributes.STANAME);
						this.$('#drainage-area').html(event.feature.attributes.DRAIN_SQKM);
					},
					loadend : function(event) {
						gageLoadedDeferred.resolve();
					},
					scope : this
				});
				this.map.addLayers([gageLayer, gageMarkerLayer]);
			}
			else {
				gageLoadedDeferred.resolve();
			}

			this.hucLayer = NWC.util.mapUtils.createHucFeatureLayer(
				watershedConfig.namespace,
				watershedConfig.layerName,
				watershedConfig.property,
				[hucId],
				this.hucStyle
			);
			this.hucLayer.events.on({
				featureadded : function(event) {
					var hucName = event.feature.attributes[watershedConfig.name];
					var drainage = event.feature.attributes[watershedConfig.drainageArea];
					this.$('.huc-name').html(hucName);
					this.$('.local-drainage-area').html(drainage);
				},
				loadend : function(event) {
					if (!accumulated) {
						this.map.zoomToExtent(this.hucLayer.getDataExtent());
					}
					hucLoadedDeferred.resolve();
				},
				scope : this
			});

			if (this.context.isHuc12) {
				this.achucLayer = NWC.util.mapUtils.createHucFeatureLayer(
					acWatershedConfig.namespace,
					acWatershedConfig.layerName,
					acWatershedConfig.property,
					[hucId],
					this.achucStyle
				);

				this.achucLayer.events.on({
					featureadded : function(event) {
						var hucName = event.feature.attributes[acWatershedConfig.name];
						var drainage = event.feature.attributes[acWatershedConfig.drainageArea];
						this.$('.huc-name').html(hucName);
						this.$('.total-upstream-drainage-area').html(drainage);
					},
					loadend : function(event) {
						if (accumulated) {
							this.map.zoomToExtent(this.achucLayer.getDataExtent());
						}
						achucLoadedDeferred.resolve();
					},
					scope : this
				});
			}
			else {
				achucLoadedDeferred.resolve();
			}

			// Add the layer for the page's watershed last
			if (accumulated && (this.achucLayer)) {
				this.map.addLayer(this.hucLayer);
				this.map.addLayer(this.achucLayer);
			}
			else {
				if (this.achucLayer) {
					this.map.addLayer(this.achucLayer);
				}
				this.map.addLayer(this.hucLayer);
			}

			this.featureLoadedPromise.done(function() {
				self.$('.huc-loading-indicator').hide();
			});

			// Finish initialization which also renders the view
			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		},

		render : function() {
			var hucLegendStyle = {
				'opacity': this.hucStyle.strokeOpacity ,
				'color' : this.hucStyle.strokeColor,
				'font-size': '20px'
			};
			var achucLegendStyle = {
				'opacity': this.achucStyle.strokeOpacity ,
				'color' : this.achucStyle.strokeColor,
				'font-size': '20px'
			};

			NWC.view.BaseView.prototype.render.apply(this, arguments);
			this.map.render('huc-inset-' + this.context.hucId);

			this.$('.huc-legend span').css(hucLegendStyle);
			this.$('.achuc-legend span').css(achucLegendStyle);
			if (!this.context.gageId) {
				this.$('.gage-legend').hide();
			}

			return this;
		}
	});
}());