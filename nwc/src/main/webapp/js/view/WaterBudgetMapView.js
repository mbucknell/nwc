/*jslint browser: true */
/*global OpenLayers */
/*global _ */

var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";
	/*		addLayerSpy = jasmine.createSpy('addLayerSpy');

	 * View for the water budget huc selection page
	 *
	 * @constructor extends NWC.BaseSelectMapView
	 */

	NWC.view.WaterBudgetMapView = NWC.view.BaseSelectMapView.extend({
		templateName : 'waterbudget',

		events: {
			'change select' : 'selectHucLayer',
			'click #toggle-gage-layer' : 'toggleGageVisibility',
			'click #toggle-modeled-huc-layer' : 'toggleModeledHucVisibility'
		},

		/**
		 * @constructs
		 * @param {Object} options
		 *	@prop {String} mapDiv
		 *	@prop {Boolean} accumulated - true indicates accumulated, which indicates an
		 *			accumulated watershed comparison view will be triggered when a comparison
		 *			watershed is selected on this view.
		 *	@prop {NWC.model.WaterBudgetSelectMapModel} model
		 *	@prop {String} hucId - Previously selected watershed
		 */
		initialize : function(options) {
			var self = this;
			this.accumulated = options.accumulated ? options.accumulated : false;

			this.context = {
				hucs : [{value : "none", display : "none"}],
				featureToggles : NWC.config.get('featureToggles'),
				warningModalTitle : 'Warning'
			};

			this.hucLayers = [];
			var watershedConfig = NWC.config.get('watershed');
			Object.keys(watershedConfig, function(key, value) {
				self.hucLayers.push({layer : NWC.util.mapUtils.createHucLayer(value.attributes.namespace, value.attributes.layerName, {
					visibility : false
				}), propertyId : value.attributes.property});
				self.context.hucs.push({value: value.attributes.property, display : value.attributes.selectDisplay});
			});

			var gageConfig = NWC.config.get('streamflow').gage.attributes;
			this.gageLayer = new OpenLayers.Layer.WMS(
				"Gage Location",
				CONFIG.endpoint.direct.geoserver + 'gwc/service/wms',
				{
					LAYERS: gageConfig.namespace + ':' + gageConfig.layerName,
					format: 'image/png',
					transparent: true,
					tiled: false
				},
				{
					isBaseLayer: false,
					displayInLayerSwitcher: false,
					visibility: false
				}
			);

			var streamflowHuc12Config = NWC.config.get('streamflow').huc12.attributes;
			this.modeledHucLayer = new OpenLayers.Layer.WMS("National WBD Snapshot",
				CONFIG.endpoint.direct.geoserver + 'gwc/service/wms',
				{
					layers: streamflowHuc12Config.namespace + ':' + streamflowHuc12Config.localLayerName,
					transparent: true,
					styles: ['seOutline']
				},
				{
					opacity: 0.6,
					displayInLayerSwitcher: false,
					visibility: false,
					isBaseLayer: false,
					tiled: true
				}
			);

			this.hucLayers.forEach(function(val) {
				val.layer.addOptions({attribution: '<img src="' + this.legendUrl(val.layer.params.LAYERS, val.layer.params.STYLES[0]) + '"/>'});
			}, this);

			this.gageLayer.addOptions({attribution: '<img src="' + this.legendUrl(this.gageLayer.params.LAYERS, 'gagesii_hucComp') + '"/>'});
			this.modeledHucLayer.addOptions({
				attribution : '<img src="' + this.legendUrl(this.modeledHucLayer.params.STYLES[0], '') + '"/>'
			});

			this.legendControl = new OpenLayers.Control.Attribution();

			this.selectControl = new OpenLayers.Control.WMSGetFeatureInfo({
				title: 'huc-identify-control',
				hover: false,
				layers: _.pluck(this.hucLayers, 'layer'),
				queryVisible: true,
				infoFormat: 'application/vnd.ogc.gml',
				vendorParams: {
					radius: 5
				},
				autoActivate: false
			});

			var featureInfoHandler = function (responseObject) {
				var actualFeatures = responseObject.features;
				var hucCount = actualFeatures.length;
				if (hucCount > 1) {
					this.showWarningDialog('Multiple watersheds have been selected. Please zoom in and select a single watershed');
				}
				else if (hucCount === 1) {
					var actualFeature = actualFeatures[0];
					var huc;
					Object.keys(watershedConfig, function(key, value) {
						if (actualFeature.attributes[value.attributes.property]) {
							huc = actualFeature.attributes[value.attributes.property];
						};
					});
					if (Object.has(options, 'hucId')) {
						if (options.hucId === null) {
							this.showWarningDialog('Problem with huc, please try again.');
						}
						else if (options.hucId === huc) {
							this.showWarningDialog('The same watershed has been selected for comparison. Please select a different watershed');
						}
						else if (this.accumulated) {
							this.router.navigate('#!waterbudget/accomparehucs/' + options.hucId + '/' + huc, {trigger : true});
						}
						else {
							this.router.navigate('#!waterbudget/comparehucs/' + options.hucId + '/' + huc, {trigger : true});
						}
					}
					else {
						this.router.navigate('#!waterbudget/huc/' + huc, {trigger : true});
					}
				}
			};
			this.selectControl.events.register("getfeatureinfo", this, featureInfoHandler);

			$.extend(this.events, NWC.view.BaseSelectMapView.prototype.events);
			NWC.view.BaseSelectMapView.prototype.initialize.apply(this, arguments);

			this.map.addLayer(this.modeledHucLayer);
			this.map.addLayer(this.gageLayer);
			this.map.addLayers(_.pluck(this.hucLayers, 'layer'));

			if (Object.has(options, 'hucId')) {
				var highlightStyle = new OpenLayers.StyleMap({
					strokeWidth: 2,
					strokeColor: "black",
					fillColor: '#FF9900',
					fillOpacity: 0.4
				});
				var watershedHucConfig = NWC.config.getWatershed(options.hucId);
				this.map.addLayer(NWC.util.mapUtils.createHucFeatureLayer(
					watershedHucConfig.namespace,
					watershedHucConfig.layerName,
					watershedHucConfig.property,
					[options.hucId],
					highlightStyle));
				this.$el.find('.huc-layers').val(watershedHucConfig.property).prop('selected');
				this.$el.find('.huc-layers').prop('disabled', true);
				this.model.set('watershedLayer', watershedHucConfig.property);
				this.updateGageLayerVisibility();
			}
			this.map.addLayer(NWC.util.mapUtils.createFlowlinesLayer());

			if (NWC.config.get('featureToggles').enableAccumulatedWaterBudget) {
				this.map.addControl(this.legendControl);
			}

			this.listenTo(this.model, 'change:watershedLayer', this.updateHucLayerVisibility);
			this.listenTo(this.model, 'change:gageLayerOn', this.updateGageLayerVisibility);
			this.listenTo(this.model, 'change:modeledHucLayerOn', this.updateModeledHucLayerVisibility);
			this.updateHucLayerVisibility();
		},

		/**
		 * Selects the model's watershedLayer attribute
		 * @param {jquery.Event} ev
		 */
		selectHucLayer : function(ev) {
			var newSelection = this.$el.find('.huc-layers option:selected').val();
			this.model.set('watershedLayer', newSelection);
			ev.preventDefault();
		},

		/**
		 * Sets the hucLayer visibility to match this.model's layer attribute.
		 */
		updateHucLayerVisibility : function() {
			var self = this;
			var layer = this.model.get('watershedLayer');

			_.each(this.hucLayers, function(val) {
				val.layer.setVisibility(layer === val.propertyId);
			});
		},

		/**
		 * Toggles the model's gageLayerOn attribute
		 */
		toggleGageVisibility : function() {
			this.model.set('gageLayerOn', !this.model.get('gageLayerOn'));
		},

		/*
		 * Toggles the model's modeledHucLayerOn attribute
		 */
		toggleModeledHucVisibility : function() {
			this.model.set('modeledHucLayerOn', !this.model.get('modeledHucLayerOn'));
		},

		/**
		 * Sets the gageLayer visibility to match this.model's gageLayerOn attribute.
		 */
		updateGageLayerVisibility : function() {
			var isVisible = this.model.get('gageLayerOn');
			this.$el.find('#toggle-gage-layer-span').html(isVisible ? 'Off' : 'On');
			this.gageLayer.setVisibility(isVisible);
		},

		/**
		 * Sets the modeledHucLayer visibility to match thisModel's modeledHucLayerOn attribute
		 */
		updateModeledHucLayerVisibility : function() {
			var isVisible = this.model.get('modeledHucLayerOn');
			this.$el.find('#toggle-modeled-huc-layer-span').html(isVisible ? 'Off' : 'On');
			this.modeledHucLayer.setVisibility(isVisible);
		}
	});
}());