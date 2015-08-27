describe("Tests for NWC.view.StreamflowStatsHucDataView", function() {

	var $testDiv;
	var testView;
	var addLayerSpy, renderSpy;
	var eventSpy;
	var server;
	var plotStreamflowDataDeferred;

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
		plotStreamflowDataDeferred = $.Deferred();
		spyOn(NWC.view, 'StreamflowPlotView').andReturn({
			plotStreamflowData : jasmine.createSpy('plotStreamflowDataSpy').andReturn(plotStreamflowDataDeferred)
		});
		spyOn(NWC.view.BaseView.prototype, 'initialize');
		spyOn(NWC.util.mapUtils, 'createMap').andCallFake(function() {
			return {
				addLayer : addLayerSpy,
				zoomToExtent : jasmine.createSpy('zoomToExtentSpy'),
				getMaxExtent : jasmine.createSpy('getMaxExtentSpy'),
				render : renderSpy
			};
		});

		eventSpy = jasmine.createSpyObj('eventSpy', ['preventDefault']);
		server = sinon.fakeServer.create();

		testView = new NWC.view.StreamflowStatsHucDataView({
			hucId : '123456789012',
			insetMapDiv : 'inset-map-div'
		});
	});

	afterEach(function() {
		$testDiv.remove();
		server.restore();
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
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expect when the view\'s render method is called that BaseView render is called, the map is rendered and the streamflowPlotView is created', function() {
		testView.render();
		expect(NWC.view.BaseView.prototype.render).toHaveBeenCalled();
		expect(renderSpy).toHaveBeenCalledWith('inset-map-div');
		expect(NWC.view.StreamflowPlotView).toHaveBeenCalled();
	});

	it('Expects getStats to call getHucStats and resolves the deferred when data is retrieved', function() {
			spyOn(NWC.util.streamStats, 'getHucStats');
			var doneSpy = jasmine.createSpy('doneSpy')
			var d = testView.getStats(['s1', 's2'], '1990', '1991').done(doneSpy);
			expect(NWC.util.streamStats.getHucStats).toHaveBeenCalled();
			expect(NWC.util.streamStats.getHucStats.calls[0].args[0]).toEqual(['123456789012']);
			expect(NWC.util.streamStats.getHucStats.calls[0].args[1]).toEqual(['s1', 's2']);
			expect(NWC.util.streamStats.getHucStats.calls[0].args[2]).toEqual('1990');
			expect(NWC.util.streamStats.getHucStats.calls[0].args[3]).toEqual('1991');
			expect(doneSpy).not.toHaveBeenCalled();

			var callback = NWC.util.streamStats.getHucStats.calls[0].args[4];
			callback(['1', '2']);

			expect(doneSpy).toHaveBeenCalledWith(['1', '2']);
	});

	it('Expects the hucId to be in the tsv header', function() {
		var header = testView.getStatsTsvHeader();
		expect(header).toMatch('123456789012');
	});

	it('Expects the hucId to be in the stats file name', function() {
		var fname = testView.getStatsFilename();
		expect(fname).toMatch('123456789012');
	});

	it('Expects downloadData to save to appropriate filename', function() {
		spyOn(window, 'saveAs');
		spyOn(window, 'Blob');
		testView.dataSeries = {
			toCSV : jasmine.createSpy('toCSVSpy')
		};
		testView.hucName = 'This Huc Name';
		testView.downloadData(eventSpy);

		expect(saveAs).toHaveBeenCalled();
		expect(saveAs.calls[0].args[1]).toMatch(testView.hucName);
		expect(saveAs.calls[0].args[1]).toMatch(testView.context.hucId);
		expect(testView.dataSeries.toCSV).toHaveBeenCalled();
	});

	describe('Test getDataSeries function', function() {
		var promise;

		beforeEach(function() {
			spyOn(NWC.util, 'buildSosUrlFromSource').andCallFake(function() {
				return 'http://fakesos.org';
			});
		});

		it('Expects that an ajax call is made to retrieve the data', function() {
			requestCount = server.requests.length;
			testView.getDataSeries();
			expect(server.requests.length).toEqual(requestCount + 1);
			expect(server.requests[requestCount].url).toEqual('http://fakesos.org');
		});
	});

	describe('Tests for plotStreamflowData', function() {
		beforeEach(function() {
			deferred = $.Deferred();

			ev = {
				preventDefault : jasmine.createSpy('preventDefaultSpy')
			};

			testView.hucName = 'Huc 12';
			testView.render();
		});

		it('Expects a resolved call to plotStreamFlowData to set the dataSeries', function() {
			var ds = new NWC.util.DataSeries.newSeries();

			testView.plotStreamFlowData(ev);
			expect(testView.streamflowPlotViewLeft.plotStreamflowData).toHaveBeenCalled();
			expect(testView.streamflowPlotViewLeft.plotStreamflowData.calls[0].args[0]).toMatch('Huc 12');
			plotStreamflowDataDeferred.resolve(ds);

			expect(testView.dataSeries).toEqual(ds);
		});
	});
});