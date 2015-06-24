var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.BiodataGageMapView = Backbone.View.extend({


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
		OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '2';
		
		// Create vector layer representing the biodata sites.
		this.biodataLayer = new OpenLayers.Layer.Vector('Biodata Sites Layer', {
			styleMap: new OpenLayers.StyleMap({
				'default': new OpenLayers.Style(OpenLayers.Util.applyDefaults({
					graphicName: 'square',
					fillColor: '#FF0000',
					strokeOpacity: 0,
					fillOpacity: 0.6,
					pointRadius: 4
				}, OpenLayers.Feature.Vector.style['default'])),
				'select': new OpenLayers.Style({
					strokeColor: '#FF0000',
					strokeOpacity: 1,
					fillOpacity: 0.4,
					pointRadius: 6,
					cursor: 'pointer'
				}),
				'temporary': new OpenLayers.Style({
					strokeColor: '#FF0000',
					strokeOpacity: 1,
					fillOpacity: 0.4,
					pointRadius: 6,
					cursor: 'pointer'
				})
			})
		});
		// Create vector layer representing the NWIS gages.
		this.gageLayer = new OpenLayers.Layer.Vector('NWIS Gage Layer', {
			styleMap: new OpenLayers.StyleMap({
				'default': new OpenLayers.Style(OpenLayers.Util.applyDefaults({
					graphicName: 'circle',
					fillColor: '#000099',
					strokeOpacity: 0,
					fillOpacity: 0.7,
					pointRadius: 4
				}, OpenLayers.Feature.Vector.style['default'])),
				'select': new OpenLayers.Style({
					strokeColor: '#000000',
					strokeOpacity: 1,
					fillOpacity: 0.8,
					pointRadius: 5,
					cursor: "pointer"
				}),
			// Could also just use the 'select' style in renderIntent, but may want to change 
			// the hover style in the future
				'temporary': new OpenLayers.Style({
					strokeColor: '#000000',
					strokeOpacity: 1,
					fillOpacity: 0.8,
					pointRadius: 5,
					cursor: "pointer"
				})
			})
		});
		
		this.biodataMapFeatures = options.biodataFeature.map(function(f){
			    return new OpenLayers.Feature.Vector(
						f.geometry,
						f.attributes);
		});
			
		this.gageMapFeatures = options.gageFeature.map(function(f){
			    return new OpenLayers.Feature.Vector(
						f.geometry,
						f.attributes);
		});
			
		NWC.util.mapUtils.addFlowLinesToMap(this.map);
		this.biodataLayer.addFeatures(this.biodataMapFeatures);
		this.gageLayer.addFeatures(this.gageMapFeatures);
		this.map.addLayers([this.biodataLayer, this.gageLayer]);
		
		// Create Control to manage the biodata layer hover-over and tooltip functionality
		this.biodataHoverControl = new OpenLayers.Control.SelectFeature(
			this.biodataLayer,
			{
			hover: true,
			highlightOnly: true,
			renderIntent: "temporary",
			eventListeners: {
				featurehighlighted: this.showPopup,
				featureunhighlighted: this.destroyPopup
			}
		    });
		    
		this.biodataSelectControl = new OpenLayers.Control.SelectFeature(
			this.biodataLayer,
			{
			onSelect: this.addSite.bind(this),
			eventListeners: {
				//when the gage is actually selected, we want the popup to disappear.
				featurehighlighted: this.destroyPopup
			},
			clickout: true 
			}
		);
		
		// Create Control to manage the gage layer hover-over and tooltip functionality
		this.gageHoverControl = new OpenLayers.Control.SelectFeature(
			this.gageLayer,
			{
			hover: true,
			highlightOnly: true,
			renderIntent: "temporary",
			eventListeners: {
				featurehighlighted: this.showPopup,
				featureunhighlighted: this.destroyPopup
			}
			});
		
		// Create a second control to manage the gage layer selection functionality
		this.gageSelectControl = new OpenLayers.Control.SelectFeature(
			this.gageLayer,
			{
			onSelect: this.addGage.bind(this),
			eventListeners: {
				//when the gage is actually selected, we want the popup to disappear.
				featurehighlighted: this.destroyPopup
			},
			clickout: true 
			}
		);
    
		this.map.addControl(this.biodataHoverControl);
		this.map.addControl(this.biodataSelectControl);
		this.map.addControl(this.gageHoverControl);
		this.map.addControl(this.gageSelectControl);
		this.biodataHoverControl.activate();
		this.biodataSelectControl.activate();	    
		this.gageHoverControl.activate();
		this.gageSelectControl.deactivate();
		this.collection = options.collection;
		Backbone.View.prototype.initialize.apply(this, arguments);
		this.render(options);
	},

	render : function() {
		this.map.render(this.mapDiv);
		if (this.biodataLayer.features.length > 0) {
			if (this.gageLayer.features.length > 0){
				var minBottom = Math.min(this.biodataLayer.getDataExtent().bottom,this.gageLayer.getDataExtent().bottom);
				var maxLeft = Math.max(this.biodataLayer.getDataExtent().left,this.gageLayer.getDataExtent().left);
				var maxTop = Math.max(this.biodataLayer.getDataExtent().top,this.gageLayer.getDataExtent().top);
				var maxRight = Math.max(this.biodataLayer.getDataExtent().right,this.gageLayer.getDataExtent().right);
				var bounds = new OpenLayers.Bounds(maxLeft, minBottom, maxRight, maxTop);
				this.map.zoomToExtent(bounds);
			} else {
				this.map.zoomToExtent(this.biodataLayer.getDataExtent());
			};  
		} else {
			this.map.zoomToExtent(this.gageLayer.getDataExtent());
		};
		return this;
	},
	
	addSite : function (feature) {
		this.selectedSite = feature.attributes;
		this.biodataSelectControl.deactivate();
		this.gageSelectControl.activate();
		if (this.selectedGage){
			this.deselectGage(this.selectedGage);
		};
	},
	
	addGage : function(feature) {
		this.selectedGage = feature.attributes;
		this.collection.addPair(this.selectedSite, this.selectedGage);
		this.gageSelectControl.deactivate();
		this.biodataSelectControl.activate();
	},	
	
	showPopup : function(evt){
		var feature = evt.feature;
		var layerName = feature.layer.name;
		var drainArea;
		var siteName;
		var layerLabel;
		if (layerName === 'Biodata Sites Layer') {
			drainArea = feature.attributes.DrainageAr;
			siteName = feature.attributes.SiteName;
			layerLabel = siteName + ', ' + drainArea + ' mi<sup>2</sup>';
		} else {
			drainArea = feature.attributes.DRAIN_SQKM;
			siteName = feature.attributes.STANAME;
			layerLabel = siteName + ', ' + drainArea + ' km<sup>2</sup>';
		}
		var popup = new OpenLayers.Popup.AnchoredBubble("popup",
			OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
			null,
			layerLabel,
			null,
			true,
			null
		);
		popup.autoSize = true;
		popup.maxSize = new OpenLayers.Size(400,800);
		popup.setOpacity(0.9);
		popup.relativePosition = 'tr';
		feature.popup = popup;
		this.map.addPopup(popup);
	},
	
	destroyPopup :function(evt){
		var feature = evt.feature;
		this.map.removePopup(feature.popup);
		feature.popup.destroy();
		feature.popup = null;
	},
	
	deselectGage: function(selGage){
		var gageFeature = this.gageLayer.getFeaturesByAttribute('STAID', selGage.STAID);
		this.gageSelectControl.unselect(gageFeature[0]);
 	}
	
});