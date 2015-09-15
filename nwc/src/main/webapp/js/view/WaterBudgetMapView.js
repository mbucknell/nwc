/*jslint browser: true */
/*global OpenLayers */

var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the water budget huc selection page
 *
 * @constructor extends NWC.BaseSelectMapView
 */

NWC.view.WaterBudgetMapView = NWC.view.BaseSelectMapView.extend({
	templateName : 'waterbudget',

	events: {
		'change select' : 'selectLayer'
	},

	/**
	 * @constructs
	 * @param {Object} options
	 *	@prop {String} mapDiv
	 *	@prop {NWC.model.WaterBudgetSelectMapModel} model
	 *	@prop {String} hucId - Previously selected watershed
	 */
	initialize : function(options) {
		this.context = {
			hucs : [{value : "none", display : "none"}],
			warningModalTitle : 'Warning'
		};
		this.hucLayers = [];
		var self = this;
		var watershedConfig = NWC.config.get('watershed');
		Object.keys(watershedConfig, function(key, value) {
			self.hucLayers.push({layer : NWC.util.mapUtils.createHucLayer(value.attributes.namespace, value.attributes.layerName, {
				visibility : false
			}), propertyId : value.attributes.property});
			self.context.hucs.push({value: value.attributes.property, display : value.attributes.selectDisplay});
		});
		
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
			/*if you come into this view directly rather than from WaterBudgetHucDataView
			 *the layer needs to be set to visible since the model is not passed in
			 */
			if (this.model.get('watershedLayer') === 'none') {
				this.model.set('watershedLayer', watershedHucConfig.property);
				this.updateLayerVisibility();				
			}
		}
		this.addFlowLines();

		this.listenTo(this.model, 'change:watershedLayer', this.updateLayerVisibility);
	},

	/**
	 * Selects the model's Layer attribute
	 * @param {jquery.Event} ev
	 */
	selectLayer : function(ev) {
		var newSelection = this.$el.find('.huc-layers option:selected').val();
		this.model.set('watershedLayer', newSelection);
		ev.preventDefault();
	},

	/**
	 * Sets the hucLayer visibility to match this.model's layer attribute.
	 */
	updateLayerVisibility : function() {
		var self = this;
		var layer = this.model.get('watershedLayer');

		_.map(this.hucLayers, function(val, key) {
			val.layer.setVisibility(layer === val.propertyId);
		});
	}
});