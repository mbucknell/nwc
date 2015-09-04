/*global jasmine*/
/*global spyOn*/
/*global NWC*/
/*global expect*/

describe('Tests for NWC.view.WaterBudgetMapView', function() {
	var addLayerSpy;
	beforeEach(function() {
		addLayerSpy = jasmine.createSpy('addLayerSpy');
		spyOn(NWC.util.mapUtils, 'addFlowLinesToMap');
		spyOn(NWC.view.BaseSelectMapView.prototype, 'initialize').andCallFake(function() {
			this.map = {
				addLayer : addLayerSpy
			};
			this.model = new this.Model();
		});
	});

	it('Expects appropriate properties to be defined after instantiation', function() {
		var view = new NWC.view.WaterBudgetMapView();

		expect(NWC.view.BaseSelectMapView.prototype.initialize).toHaveBeenCalled();
		expect(view.huc8Layer).toBeDefined();
		expect(view.huc12Layer).toBeDefined();
		expect(addLayerSpy).toHaveBeenCalledWith(view.huc8Layer);
		expect(addLayerSpy).toHaveBeenCalledWith(view.huc12Layer);
		expect(view.selectControl).toBeDefined();
		expect(view.context.hucId).not.toBeDefined();
	});

	it('Expects that updates to the model\'s watershedLayerOn attribute updates the view', function() {
		var view = new NWC.view.WaterBudgetMapView();

		view.model.set('watershedLayer', 'huc8-layer');
		view.model.set('watershedLayerOn', true);
		expect(view.huc8Layer.getVisibility()).toBe(true);

		view.model.set('watershedLayerOn', false);
		expect(view.huc8Layer.getVisibility()).toBe(false);
	});

	it('Expect that event handler calls to toggleLayer update the models\'s watershedLayer and watershedLayerOn attributes', function() {
		var view = new NWC.view.WaterBudgetMapView();
		
		view.model.set('watershedLayer', null);
		view.model.set('watershedLayerOn', false);
		var lastVisibility = view.model.get('watershedLayerOn');
		var ev = jQuery.Event( 'click', {target : {id :'huc8-layer'}});		
		view.toggleLayer(ev);
		expect(!lastVisibility).toBe(view.model.get('watershedLayerOn'));
		lastVisibility = !lastVisibility;

		view.toggleLayer(ev);
		expect(!lastVisibility).toBe(view.model.get('watershedLayerOn'));
	});
});