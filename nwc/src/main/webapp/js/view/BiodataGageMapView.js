var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.BiodataGageMapView = Backbone.View.extend({
	
	//templateName : 'biodataGageMap',


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
			    strokeColor: '#000000',
			    strokeOpacity: 1,
			    fillOpacity: 0.8,
			    pointRadius: 5,
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
			    fillOpacity: 0.6,
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
			
		this.biodataLayer.addFeatures(this.biodataMapFeatures);
		this.gageLayer.addFeatures(this.gageMapFeatures);
		this.map.addLayers([this.biodataLayer, this.gageLayer]);
			    
		// Create a separate Control for the biodata sites.  
		// The layer will not be clickable on the map, which is OK, they'll be selected 
		// programmatically when the user clicks a checkbox on biodata sites table
		
		this.biodataSelectControl = new OpenLayers.Control.SelectFeature(
		    this.biodataLayer,
		    {
			clickout: false, toggle: true,
			multiple: true, hover: false,
			toggleKey: "ctrlKey", // ctrl key removes from selection
			multipleKey: "shiftKey" // shift key adds to selection
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
			featurehighlighted: this.gageShowPopup,
			featureunhighlighted: this.gageDestroyPopup
			}
		    });
		
		// Create a second control to manage the gage layer selection functionality
		this.gageSelectControl = new OpenLayers.Control.SelectFeature(
		    this.gageLayer,
		    {
			onSelect: options.highlightGageRow,
			onUnselect: options.unHighlightGageRow,
			eventListeners: {
			    //when the gage is actually selected, we want the popup to disappear.
			    featurehighlighted: this.gageDestroyPopup
			},
			clickout: true 
		    }
		);
            
	    this.map.addControl(this.biodataSelectControl);
	    this.map.addControl(this.gageHoverControl);
	    this.map.addControl(this.gageSelectControl);
	    this.biodataSelectControl.activate();	    
	    this.gageHoverControl.activate();
	    this.gageSelectControl.activate();
		
	    Backbone.View.prototype.initialize.apply(this, arguments);
	    this.render();
	},

	render : function() {
		Backbone.View.prototype.render.apply(this, arguments);
		this.map.render(this.mapDiv);
		// default to biodataLayer extent
		if (this.biodataLayer.features.length > 0) {
		this.map.zoomToExtent(this.biodataLayer.getDataExtent());
		} else {
		    // If no biodata sites were selected on the previous page, try gageLayer extent
		    if (this.gageLayer.features.length > 0) {
			this.map.zoomToExtent(this.gageLayer.getDataExtent());
			// If somehow users got here with no sites selected:
		    } else {
			this.map.zoomToExtent();
		    };
		};
		
		return this;
	},
	
	highlightSite : function(name) {
	    var selected_item = this.getSelectedSiteFeature(name);
	    this.biodataSelectControl.select(selected_item[0]);
	},
	
	unHighlightSite : function(name) {
	    var selected_item = this.getSelectedSiteFeature(name);
	    this.biodataSelectControl.unselect(selected_item[0]);
	},
	
	getSelectedSiteFeature : function(name) {
	    return this.biodataLayer.getFeaturesByAttribute('SiteNumber', name);
	},
	gageShowPopup : function(evt){
	    var feature = evt.feature;
	    var popup = new OpenLayers.Popup.AnchoredBubble("popup",
		OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
		null,
		'Gage ID: ' + feature.attributes.STAID,
		null,
		false,
		null
		);
	    popup.autoSize = true;
	    popup.maxSize = new OpenLayers.Size(400,800);
	    popup.setOpacity(0.9);
	    popup.relativePosition = 'tr';
	    feature.popup = popup;
	    this.map.addPopup(popup);
	},
	gageDestroyPopup :function(evt){
	    var feature = evt.feature;
	    this.map.removePopup(feature.popup);
	    feature.popup.destroy();
	    feature.popup = null;
	    }
});