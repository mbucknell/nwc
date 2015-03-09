describe('Tests for NWC.view.BaseSelectMapView', function() {
	CONFIG = {
		endpoint : {
			geoserver : 'http://fakeserver.com'
		}
	};

	var selectControl, mapSpy, NewView, template;
	var $selectButton, $panButton, $zoomButton;
	var $selectInfo, $panInfo, $zoomInfo;

	beforeEach(function() {
		search_api = {
			on : jasmine.createSpy('search_api.onSpy'),
			setOpts : jasmine.createSpy('search_api.setOptsSpy')
		};
		template = jasmine.createSpy('thisTemplate');

		var templateHtml = '<button id="select-button" value="select"></button>' +
			'<button id="pan-button" value="pan"></button>' +
			'<button id="zoom-button" value="zoom"></button>' +
			'<div id="map-controls-div">' +
			'<span id="map-control-select"></span>' +
			'<span id="map-control-pan"></span>' +
			'<span id="map-control-zoom"></span>' +
			'</div>' +
			'<input type="hidden" id="map-search-box"/>';
		$('body').append('<div id="test-div"></div>');
		$('#test-div').append(templateHtml);
		$selectButton = $('#select-button');
		$panButton = $('#pan-button');
		$zoomButton = $('#zoom-button');
		$selectInfo = $('#map-controls-div #map-control-select');
		$panInfo = $('#map-controls-div #map-control-pan');
		$zoomInfo = $('#map-controls-div #map-control-zoom');

		selectControl = jasmine.createSpyObj('selectControl', ['activate', 'deactivate']);

		// stub for OpenLayers.Map object
		mapSpy = {
			addControl : jasmine.createSpy('addControlSpy'),
			render : jasmine.createSpy('render'),
			zoomToExtent : jasmine.createSpy('zoomToExtent'),
			getMaxExtent : jasmine.createSpy('getMaxExtent'),
			getExtent : jasmine.createSpy('getExtent'),
			events : jasmine.createSpyObj('eventsSpy', ['register'])
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
		$('#test-div').remove();
	});

	it('Expects the appropriate properties to be defined for the view at construction', function() {
		var view = new NewView({
			mapDiv : 'map-div',
			template : template
		});
		expect(view.map).toBeDefined();
		expect(view.zoomBoxControl).toBeDefined();
		expect(view.selectControl).toBe(selectControl);

		expect($('#s2id_map-search-box').hasClass('select2-container')).toBe(true);
	});

	it('Expects the map to be rendered and the controls added to the map', function() {
		var view = new NewView({
			mapDiv : 'map-div',
			template : template
		});
		expect(mapSpy.render).toHaveBeenCalled();
		expect(mapSpy.addControl).toHaveBeenCalledWith(view.selectControl);
		expect(mapSpy.addControl).toHaveBeenCalledWith(view.zoomBoxControl);
	});

	describe('Tests updates to model\'s control attribute', function() {
		var view;

		beforeEach(function() {
			view = new NewView({
				mapDiv : 'map-div',
				template : template
			});
			spyOn(view.zoomBoxControl, 'activate');
			spyOn(view.zoomBoxControl, 'deactivate');

		});

		it('Expects the zoom box control to be activated when the model\'s control attribute is set to zoom', function() {
			view.model.set('control', 'zoom');
			expect(view.zoomBoxControl.activate).toHaveBeenCalled();
			expect(view.zoomBoxControl.deactivate).not.toHaveBeenCalled();
			expect(view.selectControl.activate.calls.length).toBe(1);
			expect(view.selectControl.deactivate.calls.length).toBe(1);

			expect($zoomButton.hasClass('active')).toBe(true);
			expect($selectButton.hasClass('active')).toBe(false);
			expect($panButton.hasClass('active')).toBe(false);
		});

		it('Expects the select box control to be activated when the model\'s control attribute is set to select', function() {
			view.model.set('control', 'zoom');
			view.model.set('control', 'select');
			expect(view.zoomBoxControl.activate.calls.length).toBe(1);
			expect(view.zoomBoxControl.deactivate.calls.length).toBe(1);
			expect(view.selectControl.activate.calls.length).toBe(2);
			expect(view.selectControl.deactivate.calls.length).toBe(1);

			expect($zoomButton.hasClass('active')).toBe(false);
			expect($selectButton.hasClass('active')).toBe(true);
			expect($panButton.hasClass('active')).toBe(false);
		});

		it('Expects both controls to be deactivate if the model\'s control attribute is set to pan', function() {
			view.model.set('control', 'pan');
			expect(view.zoomBoxControl.activate).not.toHaveBeenCalled();
			expect(view.zoomBoxControl.deactivate).toHaveBeenCalled();
			expect(view.selectControl.activate.calls.length).toBe(1);
			expect(view.selectControl.deactivate.calls.length).toBe(1);

			expect($zoomButton.hasClass('active')).toBe(false);
			expect($selectButton.hasClass('active')).toBe(false);
			expect($panButton.hasClass('active')).toBe(true);
		});
	});

	it('Expects changeControl to update the model', function() {
		var view = new NewView({
			mapDiv : 'map-div',
			template : template
		});
		var preventSpy = jasmine.createSpy('preventDefault');

		view.changeControl({
			preventDefault : preventSpy,
			target : { value : 'zoom' } });
		expect(view.model.get('control')).toEqual('zoom');

		view.changeControl({
			preventDefault : preventSpy,
			target : { value : 'pan' } });
		expect(view.model.get('control')).toEqual('pan');

		view.changeControl({
			preventDefault : preventSpy,
			target : { value : 'select' } });
		expect(view.model.get('control')).toEqual('select');
	});
});


