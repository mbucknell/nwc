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
		'click #toggle-huc-layer' : 'toggleHucVisibility'
	},

	context : {
		warningModalText : 'Multiple watersheds have been selected. Please zoom in and select a single watershed',
		warningModalTitle : 'Warning'
	},

	/**
	 * @constructs
	 * @param {Object} options
	 *	@prop {String} mapDiv
	 *	@prop {NWC.model.WaterBudgetSelectMapModel} model
	 */
	initialize : function(options) {
		this.hucLayer = NWC.util.mapUtils.createHucLayer({
			visibility : false
		});

		this.selectControl = new OpenLayers.Control.WMSGetFeatureInfo({
			title: 'huc-identify-control',
			hover: false,
			layers: [
				this.hucLayer
			],
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
				this.showWarningDialog();
			}
			else if (hucCount === 1) {
				var actualFeature = actualFeatures[0];
				var huc12 = actualFeature.attributes.huc_12;
				this.router.navigate('/waterbudget/huc/' + huc12, {trigger : true});
			}
		};
        this.selectControl.events.register("getfeatureinfo", this, featureInfoHandler);

		$.extend(this.events, NWC.view.BaseSelectMapView.prototype.events);
		NWC.view.BaseSelectMapView.prototype.initialize.apply(this, arguments);

		this.map.addLayer(this.hucLayer);
		this.addFlowLines();

		this.listenTo(this.model, 'change:watershedLayerOn', this.updateLayerVisibility);
		this.updateLayerVisibility();
	},

	/**
	 * Toggles the model's waterShedLayerOn attribute
	 */
	toggleHucVisibility : function() {
		this.model.set('watershedLayerOn', !this.model.get('watershedLayerOn'));
	},

	/**
	 * Sets the hucLayer visibility to match this.model's watershedLayerOn attribute.
	 */
	updateLayerVisibility : function() {
		var isVisible = this.model.get('watershedLayerOn');
		this.$el.find('#toggle-huc-layer-span').html(isVisible ? 'Off' : 'On');
		this.hucLayer.setVisibility(isVisible);
	}
});


