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
				addLayers : addLayerSpy
			};
			this.model = new this.Model();
		});
	});

	it('Expects appropriate properties to be defined after instantiation', function() {
		var view = new NWC.view.WaterBudgetMapView();

		expect(NWC.view.BaseSelectMapView.prototype.initialize).toHaveBeenCalled();
		expect(view.hucLayers).toBeDefined();
		expect(addLayerSpy).toHaveBeenCalledWith(view.hucLayers);
		expect(view.selectControl).toBeDefined();
		expect(view.context.hucId).not.toBeDefined();
	});

	it('Expects that updates to the model\'s watershedLayer attribute updates the view', function() {
		var view = new NWC.view.WaterBudgetMapView();

		view.model.set('watershedLayer', 'huc8');
		expect(view.hucLayers[1].getVisibility()).toBe(true);

		view.model.set('watershedLayer', 'huc_12');
		expect(view.hucLayers[1].getVisibility()).toBe(false);
	});

	it('Expect that event handler calls to toggleLayer update the models\'s watershedLayer attribute', function() {
		var view = new NWC.view.WaterBudgetMapView();
		
		view.model.set('watershedLayer', 'huc8');
		view.$el.html('<select class="huc-layers form-control">' +
				'<option value="huc_12" selected>huc_12</option>' +
				'</select>');
		var ev = jQuery.Event('click');
		view.toggleLayer(ev);
		expect(view.model.get('watershedLayer')).toBe('huc_12');
	});
});