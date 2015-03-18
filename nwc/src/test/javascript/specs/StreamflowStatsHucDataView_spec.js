describe("Tests for NWC.view.StreamflowStatsHucDataView", function() {

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
		spyOn(NWC.view.BaseStreamflowStatsDataView.prototype, 'render');
		spyOn(NWC.view.BaseStreamflowStatsDataView.prototype, 'initialize').andCallFake(function() {
			this.map = {
				addLayer : addLayerSpy,
				zoomToExtent : jasmine.createSpy('zoomToExtentSpy'),
				getMaxExtent : jasmine.createSpy('getMaxExtentSpy'),
				render : renderSpy
			};
		});

		eventSpy = jasmine.createSpyObj('eventSpy', ['preventDefault']);

		testView = new NWC.view.StreamflowStatsHucDataView({
			hucId : '123456789012',
			insetMapDiv : 'inset-map-div'
		});
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects view\'s constructor to set the context property', function() {
		expect(testView.context.hucId).toEqual('123456789012');
		expect(testView.context.years.first()).toEqual(testView.MIN_DATE.getFullYear() + 1);
		expect(testView.context.years.last()).toEqual(testView.MAX_DATE.getFullYear());
	});

	it('Expects view\'s constructor to create properties for the inset map and hucLayer', function() {
		expect(testView.map).toBeDefined();
		expect(testView.hucLayer).toBeDefined();
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		expect(NWC.view.BaseStreamflowStatsDataView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expect when the view\'s render method is called that BaseViw render is called and the map is rendered', function() {
		testView.render();
		expect(NWC.view.BaseStreamflowStatsDataView.prototype.render).toHaveBeenCalled();
		expect(renderSpy).toHaveBeenCalledWith('inset-map-div');
	});

	it('Expects downloadModeledData to save to appropriate filename', function() {
		spyOn(window, 'saveAs');
		spyOn(window, 'Blob');
		testView.modeledDataSeries = {
			toCSV : jasmine.createSpy('toCSVSpy')
		};
		testView.hucName = 'This Huc Name';
		testView.downloadModeledData(eventSpy);

		expect(saveAs).toHaveBeenCalled();
		expect(saveAs.calls[0].args[1]).toMatch(testView.hucName);
		expect(saveAs.calls[0].args[1]).toMatch(testView.context.hucId);
		expect(testView.modeledDataSeries.toCSV).toHaveBeenCalled();
	});


});