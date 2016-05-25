/* jslint browser: true */

/*global jasmine*/
/*global spyOn*/
/*global NWC*/
/*global expect*/
/*global _ */

describe('Tests for NWC.view.WaterBudgetMapView', function() {
	"use strict";

	var addLayerSpy;
	var addLayersSpy;
	var addControlSpy;
	var view;
	beforeEach(function() {
		addLayerSpy = jasmine.createSpy('addLayerSpy');
		addLayersSpy = jasmine.createSpy('addLayersSpy');
		addControlSpy = jasmine.createSpy('addControlSpy');
		spyOn(NWC.util.mapUtils, 'createFlowlinesLayer');
		spyOn(NWC.view.BaseSelectMapView.prototype, 'initialize').andCallFake(function() {
			this.map = {
				addLayer : addLayerSpy,
				addLayers : addLayersSpy,
				addControl : addControlSpy
			};
			this.model = new this.Model();
		});

		view = new NWC.view.WaterBudgetMapView({accumulated : false});
	});

	it('Expects appropriate properties to be defined after instantiation', function() {

		expect(NWC.view.BaseSelectMapView.prototype.initialize).toHaveBeenCalled();
		expect(view.hucLayers).toBeDefined();
		expect(view.gageLayer).toBeDefined();
		expect(addLayersSpy).toHaveBeenCalledWith(_.pluck(view.hucLayers, 'layer'));
		expect(addLayerSpy).toHaveBeenCalledWith(view.gageLayer);
		expect(view.selectControl).toBeDefined();
		expect(view.context.hucId).not.toBeDefined();
	});

	it('Expects that updates to the model\'s watershedLayer attribute updates the view', function() {

		view.model.set('watershedLayer', 'huc8');
		expect(view.hucLayers[1].layer.getVisibility()).toBe(true);

		view.model.set('watershedLayer', 'huc_12');
		expect(view.hucLayers[1].layer.getVisibility()).toBe(false);
	});

	it('Expect that event handler calls to selectHucLayer update the models\'s watershedLayer attribute', function() {

		view.model.set('watershedLayer', 'huc8');
		view.$el.html('<select class="huc-layers form-control">' +
				'<option value="huc_12" selected>huc_12</option>' +
				'</select>');
		var ev = jQuery.Event('click');
		view.selectHucLayer(ev);
		expect(view.model.get('watershedLayer')).toBe('huc_12');
	});

	it('Expects that updates to the model\'s gageLayer attribute updates the view', function() {

		view.model.set('gageLayerOn', true);
		expect(view.gageLayer.getVisibility()).toBe(true);

		view.model.set('gageLayerOn', false);
		expect(view.gageLayer.getVisibility()).toBe(false);
	});

	it('Expect that event handler calls to toggleGageLayer update the models\'s gageLayer attribute', function() {

		view.model.set('gageLayerOn', false);
		view.toggleGageVisibility();
		expect(view.model.get('gageLayerOn')).toBe(true);
		view.model.set('gageLayerOn', false);
		expect(view.model.get('gageLayerOn')).toBe(false);
	});

});