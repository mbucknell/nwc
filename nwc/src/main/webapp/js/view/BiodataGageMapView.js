var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.BiodataGageMapView = NWC.view.BaseView.extend({

	templateName : 'biodataGageMap',

	/**
	 *
	 * @constructor
	 * @param {Object} options
	 *
	 *	@prop {String} mapDiv - the id of the div to place the biodata site/gage map.
	 *	@prop {OpenLayers.Feature.Vector} biodataFeature - the feature object for the biodata sites to be drawn on the map
         *	@prop {OpenLayers.Feature.Vector} gageFeature - the feature object for the gages to be drawn on the map
	 *	@prop {Backbone.Router} router
	 *	@prop {Jquery el} el
	 */
	initialize : function(options) {
		this.mapDiv = options.mapDiv;
		var mapBaseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();
		this.map = NWC.util.mapUtils.createMap([mapBaseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);
		

		// Create vector layer representing the biodata sites.
		this.biodataFeatureLayer = new OpenLayers.Layer.Vector('Biodata Sites Layer', {
			displayInLayerSwitcher : false,
			isBaseLayer : false,
			visibility : true,
			opacity: 0.6
		});
		this.biodataFeatureLayer.addFeatures(options.biodataFeature);		
		var selectControl = new OpenLayers.Control.SelectFeature(this.biodataFeatureLayer, {
		    hover:false,
		    selectStyle: {
			graphicName: 'square',
			fillColor: '#FF0000',
			strokeOpacity: 0,
			fillOpacity: 0.6,
			pointRadius: 5,
			cursor: "pointer"
		    }
		    });
		this.map.addLayer(this.biodataFeatureLayer);
		this.map.addControl(selectControl);
		
		selectControl.activate();
		
		// Create vector layer representing the gages.
		/*
                this.gageFeatureLayer = new OpenLayers.Layer.Vector('Gages Layer', {
			displayInLayerSwitcher : false,
			isBaseLayer : false,
			visibility : true,
			opacity: 0.6,
			style : {
                                graphicName: 'circle',
				fillColor: '#000066',
				fillOpacity: 0.6
			}
		});
                
		this.gageFeatureLayer.addFeatures([options.gageFeature]);
		this.map.addLayer(this.gageFeatureLayer);
                */
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
	},

	render : function() {
		NWC.view.BaseView.prototype.render.apply(this, arguments);
		this.map.render(this.mapDiv);
		this.map.zoomToExtent(this.biodataFeatureLayer.getDataExtent());
		return this;
	}
});