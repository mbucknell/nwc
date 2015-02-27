describe('Tests for NWC.view.BaseSelectMapView', function() {
	CONFIG = {
		endpoint : {
			geoserver : 'http://fakeserver.com'
		}
	};

	var selectControl, mapSpy, NewView;

	beforeEach(function() {
		$('body').append('<div id="map-div"></div>');

		var templateSpy = jasmine.createSpy('templateSpy');
		NWC.templates = jasmine.createSpyObj('NWCTemplates', ['getTemplate', 'loadTemplates']);
		NWC.templates.getTemplate.andReturn(templateSpy);

		selectControl = jasmine.createSpyObj('selectControl', ['activate', 'deactivate']);

		// stub for OpenLayers.Map object
		mapSpy = {
			addControl : jasmine.createSpy('addControlSpy'),
			render : jasmine.createSpy('render'),
			zoomToExtent : jasmine.createSpy('zoomToExtent'),
			getMaxExtent : jasmine.createSpy('getMaxExtent')
		};

		//mock methods that are used from NWC.util.mapUtils
		spyOn(NWC.util.mapUtils, 'addFlowLinesToMap');
		spyOn(NWC.util.mapUtils, 'createMap').andReturn(mapSpy);
		spyOn(NWC.util.mapUtils, 'createAllBaseLayers').andReturn([]);

		NewView = NWC.view.BaseSelectMapView.extend({
			selectControl : selectControl,
			templateName : 'base'
		});
	});

	afterEach(function() {
		$('#map-div').remove();
	});

	it('Expects the appropriate properties to be defined for the view at construction', function() {
		var view = new NewView({mapDiv : 'map-div'});
		expect(view.map).toBeDefined();
		expect(view.zoomBoxControl).toBeDefined();
		expect(view.selectControl).toBe(selectControl);
	});

	it('Expects the map to be rendered and the controls added to the map', function() {
		var view = new NewView({mapDiv : 'map-div'});
		expect(mapSpy.render).toHaveBeenCalled();
		expect(mapSpy.addControl).toHaveBeenCalledWith(view.selectControl);
		expect(mapSpy.addControl).toHaveBeenCalledWith(view.zoomBoxControl);
	});

	describe('Tests updates to model\'s control attribute', function() {
		var view;

		beforeEach(function() {
			view = new NewView({mapDiv : 'map-div'});
			spyOn(view.zoomBoxControl, 'activate');
			spyOn(view.zoomBoxControl, 'deactivate');

		});

		it('Expects the zoom box control to be activated when the model\'s control attribute is set to zoom', function() {
			view.model.set('control', 'zoom');
			expect(view.zoomBoxControl.activate).toHaveBeenCalled();
			expect(view.zoomBoxControl.deactivate).not.toHaveBeenCalled();
			expect(view.selectControl.activate.calls.length).toBe(1);
			expect(view.selectControl.deactivate.calls.length).toBe(1);
		});

		it('Expects the select box control to be activated when the model\'s control attribute is set to select', function() {
			view.model.set('control', 'zoom');
			view.model.set('control', 'select');
			expect(view.zoomBoxControl.activate.calls.length).toBe(1);
			expect(view.zoomBoxControl.deactivate.calls.length).toBe(1);
			expect(view.selectControl.activate.calls.length).toBe(2);
			expect(view.selectControl.deactivate.calls.length).toBe(1);
		});

		it('Expects both controls to be deactivate if the model\'s control attribute is set to pan', function() {
			view.model.set('control', 'pan');
			expect(view.zoomBoxControl.activate).not.toHaveBeenCalled();
			expect(view.zoomBoxControl.deactivate).toHaveBeenCalled();
			expect(view.selectControl.activate.calls.length).toBe(1);
			expect(view.selectControl.deactivate.calls.length).toBe(1);
		});
	});

	it('Expects changeControl to update the model', function() {
		var view = new NewView({ mapDiv : 'map-div' });

		view.changeControl({ target : { value : 'zoom' } });
		expect(view.model.get('control')).toEqual('zoom');

		view.changeControl({ target : { value : 'pan' } });
		expect(view.model.get('control')).toEqual('pan');

		view.changeControl({ target : { value : 'select' } });
		expect(view.model.get('control')).toEqual('select');
	});


});


