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
		'click #huc-controls-group a' : 'toggleLayer'
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
	 *	@prop {String} hucId - Previously selected watershed
	 */
	initialize : function(options) {
		var watershedHuc8Config = NWC.config.get('watershed').huc8.attributes;
		var watershedHuc12Config = NWC.config.get('watershed').huc12.attributes;

		this.huc8Layer = NWC.util.mapUtils.createHucLayer(watershedHuc8Config.namespace, watershedHuc8Config.layerName, {
			visibility : false
		});

		this.huc12Layer = NWC.util.mapUtils.createHucLayer(watershedHuc12Config.namespace, watershedHuc12Config.layerName, {
			visibility : false
		});

		this.selectControl = new OpenLayers.Control.WMSGetFeatureInfo({
			title: 'huc-identify-control',
			hover: false,
			layers: [
				this.huc8Layer,
				this.huc12Layer
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
				var huc;
				if (this.huc8Layer.visibility) {
					huc = actualFeature.attributes.huc_8;					
				}
				else {
					huc = actualFeature.attributes.huc_12;										
				}
				if (Object.has(options, 'hucId')) {
					this.router.navigate('#!waterbudget/comparehucs/' + options.hucId + '/' + huc, {trigger : true});
				}
				else {
					this.router.navigate('#!waterbudget/huc/' + huc, {trigger : true});
				}
			}
		};
        this.selectControl.events.register("getfeatureinfo", this, featureInfoHandler);

		$.extend(this.events, NWC.view.BaseSelectMapView.prototype.events);
		NWC.view.BaseSelectMapView.prototype.initialize.apply(this, arguments);

		this.map.addLayer(this.huc8Layer);
		this.map.addLayer(this.huc12Layer);
		if (Object.has(options, 'hucId')) {
			var highlightStyle = new OpenLayers.StyleMap({
				strokeWidth: 2,
				strokeColor: "black",
				fillColor: '#FF9900',
				fillOpacity: 0.4
			});
			var namespace;
			var layerName;
			//these are actually the same but could change?
			if (options.hucId.length === 8) {
				namespace = watershedHuc8Config.namespace;
				layerName = watershedHuc8Config.layerName;
			}
			else {
				namespace = watershedHuc12Config.namespace;
				layerName = watershedHuc12Config.layerName;				
			}
			this.map.addLayer(NWC.util.mapUtils.createHucFeatureLayer(
				namespace,
				layerName,
				[options.hucId],
				highlightStyle));
		}
		this.addFlowLines();

		this.listenTo(this.model, 'change:watershedLayer', this.updateLayerSelection);
		this.listenTo(this.model, 'change:watershedLayerOn', this.updateLayerVisibility);
		this.updateLayerSelection();
		this.updateLayerVisibility();
	},

	/**
	 * Toggles the model's Layer and LayerOn attribute
	 * @param {jquery.Event} ev
	 */
	toggleLayer : function(ev) {
		ev.preventDefault();
		var newSelection = ev.target.id;
		var oldSelection = this.model.get('watershedLayer');
		var isVisible = this.model.get('watershedLayerOn');
		
		if (null === oldSelection) {   //first click
			this.model.set('watershedLayer', newSelection);
			this.$el.find('#toggle-' + newSelection + '-span').html('Off');
			this.model.set('watershedLayerOn', !this.model.get('watershedLayerOn'));							
		} else if (oldSelection === newSelection) {  //click same huc button
			if (isVisible) {
				this.setButtonActive($('#' + newSelection), false);				
			}
			else {
				this.setButtonActive($('#' + newSelection), true);
			}
			this.$el.find('#toggle-' + newSelection + '-span').html(isVisible ? 'On' : 'Off');
			this.model.set('watershedLayerOn', !this.model.get('watershedLayerOn'));
		}
		else {  //click other huc button
			this.model.set('Layer', newSelection);
			this.$el.find('#toggle-' + oldSelection + '-span').html('On');
			this.$el.find('#toggle-' + newSelection + '-span').html('Off');
			if (isVisible) {  //previous huc button was active so will not trigger updateLayerVisibility
				this.updateLayerVisibility();  
			}
			else {
				this.model.set('watershedLayerOn', !this.model.get('watershedLayerOn'));					
			}
		}
	},

	/**
	 * Updates the view to reflect the map layer selected.
	 */
	updateLayerSelection : function() {
		var newSelection = this.model.get('watershedLayer');
		var huc8Active = newSelection === 'huc8-layer';
		var huc12Active = newSelection === 'huc12-layer';

		this.setButtonActive($('#huc8-layer'), huc8Active);
		this.setButtonActive($('#huc12-layer'), huc12Active);
	},

	/**
	 * Sets the hucLayer visibility to match this.model's layer and LayerOn attribute.
	 */
	updateLayerVisibility : function() {
		var layer = this.model.get('watershedLayer');
		var huc8Active = layer === 'huc8-layer';
		var huc12Active = layer === 'huc12-layer';
		var isVisible = this.model.get('watershedLayerOn');
		
		if (huc8Active) {
			this.huc12Layer.setVisibility(false);
			this.huc8Layer.setVisibility(isVisible);
		}
		else if (huc12Active) {
			this.huc12Layer.setVisibility(isVisible);
			this.huc8Layer.setVisibility(false);
		}
	},
});


