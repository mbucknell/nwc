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
		expect(view.hucLayer).toBeDefined();
		expect(addLayerSpy).toHaveBeenCalledWith(view.hucLayer);
		expect(view.selectControl).toBeDefined();
		expect(view.context.hucId).not.toBeDefined();
	});

	it('Expects that updates to the model\'s watershedLayerOn attribute updates the view', function() {
		var view = new NWC.view.WaterBudgetMapView();

		view.model.set('watershedLayerOn', true);
		expect(view.hucLayer.getVisibility()).toBe(true);

		view.model.set('watershedLayerOn', false);
		expect(view.hucLayer.getVisibility()).toBe(false);
	});

	it('Expect that event handler calls to toggleHucVisibility update the models\'s watershedLayerOn attribute', function() {
		var view = new NWC.view.WaterBudgetMapView();

		var lastVisibility = view.model.get('watershedLayerOn');
		view.toggleHucVisibility();
		expect(!lastVisibility).toBe(view.model.get('watershedLayerOn'));
		lastVisibility = !lastVisibility;

		view.toggleHucVisibility();
		expect(!lastVisibility).toBe(view.model.get('watershedLayerOn'));
	});
});