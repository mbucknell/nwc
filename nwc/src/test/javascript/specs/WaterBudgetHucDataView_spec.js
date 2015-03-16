describe('Tests for NWC.view.WaterBudgetHucDataView', function() {

	var $testDiv;
	var testView;
	var addLayerSpy, renderSpy;
	var eventSpy;

	beforeEach(function() {
		CONFIG = {
			endpoint : {
			geoserver : 'http://fakeserver.com'
			}
		};

		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="inset-map-div"></div>');

		addLayerSpy = jasmine.createSpy('addLayerSpy');
		renderSpy = jasmine.createSpy('renderSpy');
		spyOn(NWC.view.BaseView.prototype, 'render');
		spyOn(NWC.view.BaseView.prototype, 'initialize').andCallFake(function() {
			this.map = {
				addLayer : addLayerSpy,
				zoomToExtent : jasmine.createSpy('zoomToExtentSpy'),
				getMaxExtent : jasmine.createSpy('getMaxExtentSpy'),
				render : renderSpy
			};
		});

		eventSpy = jasmine.createSpyObj('eventSpy', ['preventDefault']);

		testView = new NWC.view.WaterBudgetHucDataView({
			hucId : '123456789012',
			insetMapDiv : 'inset-map-div'
		});
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects view\'s constructor to set the context property', function() {
		expect(testView.context.hucId).toEqual('123456789012');
	});

	it('Expects view\'s constructor to create properties for the inset map and hucLayer', function() {
		expect(testView.map).toBeDefined();
		expect(testView.hucLayer).toBeDefined();
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expect when the view\'s render method is called that BaseView render is called and the map is rendered', function() {
//		testView.render();
//		expect(NWC.view.BaseView.prototype.render).toHaveBeenCalled();
//		expect(renderSpy).toHaveBeenCalledWith('inset-map-div');
	});

	it('Expect that event handler calls exist and behave as expected', function() {

		//the view has an event to wire up the clickable plot options
		expect(testView.events['click .back-button']).toBeDefined();
		expect(testView.events['click .counties-button']).toBeDefined();
		expect(testView.events['click .metric-button']).toBeDefined();
		expect(testView.events['click .customary-button']).toBeDefined();
		expect(testView.events['click .monthly-button']).toBeDefined();
		expect(testView.events['click .daily-button']).toBeDefined();
		expect(testView.events['click .evapotranspiration-download-button']).toBeDefined();
		expect(testView.events['click .precipitation-download-button']).toBeDefined();

		//plot buttons exist and get set with the proper disabled attribute
		testView.toggleMetricLegend();
		expect($(testView.$('.metric-button').attr("disabled")).toBe("disabled"));
		testView.toggleCustomaryLegend();
		expect($(testView.$('.customary-button').attr("disabled")).toBe("disabled"));
		testView.toggleMonthlyLegend();
		expect($(testView.$('.monthly-button').attr("disabled")).toBe("disabled"));
		testView.toggleDailyLegend();
		expect($(testView.$('.daily-button').attr("disabled")).toBe("disabled"));
	});

});