var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.WaterBudgetMapView = NWC.view.BaseSelectMapView.extend({
	templateName : 'waterbudget',

	model : new NWC.model.WaterBudgetSelectMapModel(),

	events: {
		'click #toggle-huc-layer' : 'toggleHucVisibility'
	},

	initialize : function(options) {
		$.extend(this.events, NWC.view.BaseSelectMapView.prototype.events);
		NWC.view.BaseSelectMapView.prototype.initialize.apply(this, arguments);

		this.hucLayer = NWC.util.mapUtils.createHucLayer({
			visibility : false
		});
		this.map.addLayer(this.hucLayer);

		this.hucsGetFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
			title: 'huc-identify-control',
			hover: false,
			layers: [
				hucLayer
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
				var fid = actualFeature.fid;
				console.log('Go to next step with id ' + fid);

			}


		};
        this.hucsGetFeatureInfoControl.events.register("getfeatureinfo", {}, featureInfoHandler);
		this.map.addControl(this.hucsGetFeatureInfoControl);

	},

	toggleHucVisibility : function() {
		this.hucLayer.setVisibility(!this.hucLayer.getVisibility());
	}
});


