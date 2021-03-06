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
	var MODELED_HUC_STYLE = {
		strokeWidth : 1,
		strokeColor : '#000000',
		strokeOpacity : 0,
		fillOpacity : .1,
		fillColor : '#000000'
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
		 *     @prop {WaterBudgetHucPlotModel} model - update the appropriate huc data model with
		 *			information retrieved from the feature attributes.
		 */
		initialize : function(options) {
			var self = this;

			var accumulated = options.accumulated ? options.accumulated : false;
			var gageId = options.gageId ? options.gageId : null;
			var hucId = options.hucId;
			var dataModel = options.compare ? this.model.get('compareHucData') : this.model.get('hucData');

			var watershedConfig = NWC.config.getWatershed(options.hucId);
			var acWatershedConfig = NWC.config.get('accumulated').attributes;
			var hucStreamflowConfig = NWC.config.get('streamflow').huc12.attributes;
			var streamflowGageConfig;

			var hucLoadedDeferred = $.Deferred();
			var achucLoadedDeferred = $.Deferred();
			var modeledHucLoadedDeferred = $.Deferred();
			var gageLoadedDeferred = $.Deferred();

			var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();
			var mapControls = [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()];

			var gageLayer, gageMarkerLayer;

			this.hucStyle = accumulated ? ALT_HUC_STYLE : HUC_STYLE;
			this.achucStyle = accumulated ? HUC_STYLE : ALT_HUC_STYLE;

			this.context = {
				hucId : hucId,
				gageId : gageId,
				accumulated : accumulated,
				isHuc12 : hucId.length === 12
			};

			this.map = NWC.util.mapUtils.createMap([baseLayer], mapControls);

			//Load vector layers
			this.featuresLoadedPromise = $.Deferred();
			$.when(hucLoadedDeferred, achucLoadedDeferred, gageLoadedDeferred, modeledHucLoadedDeferred).done(function(d1, d2, d3, d4) {
				var result = {};
				$.each(arguments, function(index, arg) {
					if (arg) {
						$.extend(result, arg);
					}
				});
				self.featuresLoadedPromise.resolve(result);
			});

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

						dataModel.set('watershedAcres',
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
					var drainage = parseFloat(event.feature.attributes[watershedConfig.drainageArea]);
					this.$('.huc-name').html(hucName);
					this.$('.local-drainage-area').html(drainage.toFixed(2));
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
						var drainage = parseFloat(event.feature.attributes[acWatershedConfig.drainageArea]);
						var upstreamHucs = (event.feature.attributes.uphucs) ? event.feature.attributes.uphucs.split(',') : [];
						dataModel.set('upstreamHucs', upstreamHucs);
						this.$('.huc-name').html(hucName);
						this.$('.total-upstream-drainage-area').html(drainage.toFixed(2));
					},
					loadend : function(event) {
						if (accumulated) {
							this.map.zoomToExtent(this.achucLayer.getDataExtent());
						}
						achucLoadedDeferred.resolve();
					},
					scope : this
				});

				if (accumulated) {
					this.modeledHucLayer = NWC.util.mapUtils.createHucSEBasinFeatureLayer(
						hucStreamflowConfig.namespace,
						hucStreamflowConfig.accumulatedLayerName,
						hucId,
						MODELED_HUC_STYLE);
					this.modeledHucLayer.events.on({
						beforefeatureadded : function(event) {
							if (event.feature.attributes.drain_sqkm > 2000) {
								console.log('Model results are not valid for watershed this large.');
								return false;
							}
						},
						featureadded : function(event) {
							var $modeledLegend = this.$('.modeled-huc-legend');
							dataModel.set('modeledWatershedAcres', NWC.util.Convert.squareKilometersToAcres(event.feature.attributes.drain_sqkm));
							$modeledLegend.find('div').css({
								backgroundColor : MODELED_HUC_STYLE.fillColor,
								opacity : MODELED_HUC_STYLE.fillOpacity
							});
							$modeledLegend.show();
						},
						loadend : function(event) {
							modeledHucLoadedDeferred.resolve();
						},
						scope : this
					});
				}
				else {
					modeledHucLoadedDeferred.resolve();
				}
			}
			else {
				achucLoadedDeferred.resolve();
				modeledHucLoadedDeferred.resolve();
			}

			// Add the layer for the page's watershed last
			if (this.modeledHucLayer) {
				this.map.addLayer(this.modeledHucLayer);
			}
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

			this.featuresLoadedPromise.done(function() {
				var upstreamDrainageArea = self.$('.total-upstream-drainage-area').html();
				var gageDrainageArea = self.$('#drainage-area').html();
				var upstreamArea, gageArea;
				var ratio;
				if ((upstreamDrainageArea) && (gageDrainageArea)) {
					upstreamArea = parseFloat(upstreamDrainageArea);
					gageArea = parseFloat(gageDrainageArea);
					ratio = (upstreamArea - gageArea) / (upstreamArea + gageArea) / 2;
					self.$('#percent-diff-drainage').html(Math.abs(ratio * 100.0).toFixed(2) + ' %');
				}
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