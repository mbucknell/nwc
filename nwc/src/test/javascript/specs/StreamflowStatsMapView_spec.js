describe('Test for NWC.view.StreamflowStatsMapView', function() {
	var addLayerSpy;
	var addControlSpy;
	var thisTemplate;
	var view;

	beforeEach(function() {
		$('body').append('<div id="stream-gage-filters-div"><span id="filter-label"></span>' +
			'<a data-value="default">Default</a>' +
			'<a data-value="active">Active</a>' +
			'<a data-value="reference">Reference</a>' +
			'<a data-value="por">Por</a>' +
			'</div>'
		);
		thisTemplate = jasmine.createSpy('thisTemplate');
		addLayerSpy = jasmine.createSpy('addLayerSpy');
		addControlSpy = jasmine.createSpy('addControlSpy');
		spyOn(NWC.util.mapUtils, 'addFlowLinesToMap');
		spyOn(NWC.view.BaseSelectMapView.prototype, 'initialize').andCallFake(function() {
			this.map = {
				addLayers : addLayerSpy,
				addControl : addControlSpy,
				updateSize : jasmine.createSpy('updateSizeSpy')
			};
			this.model = new this.Model();
		});
		view = new NWC.view.StreamflowStatsMapView({
			template : thisTemplate
		});
	});

	afterEach(function() {
		$('#stream-gage-filters-div').remove();
	});

	it('Expects the appropriate properties to be defined after instantiation', function() {
		expect(NWC.view.BaseSelectMapView.prototype.initialize).toHaveBeenCalled();
		expect(view.gagesLayer).toBeDefined();
		expect(view.hucLayer).toBeDefined();
		expect(view.legendControl).toBeDefined();
		expect(view.gageControl).toBeDefined();
		expect(view.hucsControl).toBeDefined();
		expect(view.selectControl).toBeDefined();
	});

	it('Expects updates to the model\'s streamflowType will update the selectControl, visible layer, and the legend control', function() {
		spyOn(view.hucsControl, 'activate');
		spyOn(view.hucsControl, 'deactivate');
		spyOn(view.gageControl, 'activate');
		spyOn(view.gageControl, 'deactivate');
		spyOn(view.legendControl, 'activate');
		spyOn(view.legendControl, 'deactivate');

		view.gageControl.active = true;
		view.hucsControl.active = false;
		view.legendControl.active = true;

		view.model.set('streamflowType', 'modeled');
		expect(view.hucLayer.getVisibility()).toBe(true);
		expect(view.gagesLayer.getVisibility()).toBe(false);

		expect(view.hucsControl.activate).toHaveBeenCalled();
		expect(view.hucsControl.deactivate).not.toHaveBeenCalled();
		expect(view.gageControl.activate).not.toHaveBeenCalled();
		expect(view.gageControl.deactivate).toHaveBeenCalled();
		expect(view.selectControl).toBe(view.hucsControl);

		expect(view.legendControl.activate).not.toHaveBeenCalled();
		expect(view.legendControl.deactivate).toHaveBeenCalled();

		view.gageControl.active = false;
		view.hucsControl.active = true;
		view.legendControl.active = false;
		view.model.set('streamflowType', 'observed');

		expect(view.hucLayer.getVisibility()).toBe(false);
		expect(view.gagesLayer.getVisibility()).toBe(true);
		expect(view.hucsControl.deactivate).toHaveBeenCalled();
		expect(view.gageControl.activate).toHaveBeenCalled();
		expect(view.selectControl).toBe(view.gageControl);
		expect(view.legendControl.activate).toHaveBeenCalled();
	});

	it('Expects update to the model\'s gageFilter to update the attribution control and gagelayer', function() {
		spyOn(view.gagesLayer, 'addOptions');
		spyOn(view.gagesLayer, 'mergeNewParams');

		view.model.set('gageFilter', 'active');
		expect($('#filter-label').html()).toEqual('Active');
		expect(view.gagesLayer.addOptions.mostRecentCall.args[0].attribution).toMatch(view.model.getFilterStyle());
		expect(view.gagesLayer.mergeNewParams.mostRecentCall.args[0].STYLES).toMatch(view.model.getFilterStyle());
	});
});