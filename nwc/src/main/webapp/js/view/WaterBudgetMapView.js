var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.WaterBudgetMapView = NWC.view.BaseSelectMapView.extend({
	templateName : 'waterbudget',

	model : new NWC.model.WaterBudgetSelectMapModel(),

	events: {
		'click #toggle-huc-layer' : 'toggleHucVisibility'
	},

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
			//for some reason the real features are inside an array
			var actualFeatures = responseObject.features;
			var hucCount = actualFeatures.length;
			if (0 === hucCount) {
				//nothing
			}
			else {
				var actualFeature = actualFeatures[0];
				var huc12 = actualFeature.attributes.HU_12_DS;
				this.router.navigate('/waterbudget/huc/' + huc12, {trigger : true});
			}
		};
        this.selectControl.events.register("getfeatureinfo", this, featureInfoHandler);

		$.extend(this.events, NWC.view.BaseSelectMapView.prototype.events);
		NWC.view.BaseSelectMapView.prototype.initialize.apply(this, arguments);

		this.map.addLayer(this.hucLayer);
	},

	toggleHucVisibility : function() {
		var isVisible = !this.hucLayer.getVisibility();
		this.$el.find('#toggle-huc-layer-span').html(isVisible ? 'Off' : 'On');
		this.hucLayer.setVisibility(!this.hucLayer.getVisibility());
	}
});


