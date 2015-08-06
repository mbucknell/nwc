describe('Tests for StreamflowStatsGageDataView', function() {
	var $testDiv;
	var testView;
	var addLayersSpy, renderSpy;
	var eventSpy;
	var options;
	var server;
	var plotStreamflowDataDeferred;

	beforeEach(function() {
		CONFIG = {
			endpoint : {
				geoserver : 'http://fakeserver.com',
				nwis : 'http://fakenwis.org'
			}
		};

		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="inset-map-div"></div>');
		$testDiv.append('<select class="start-year"><option value="1991"></option></select>');
		$testDiv.append('<select class="end-year"><option value="1992"></option></select');
		$testDiv.append('<div id="start-period-of-record"></div>');
		$testDiv.append('<div id="end-period-of-record"></div>');



		addLayersSpy = jasmine.createSpy('addLayersSpy');
		renderSpy = jasmine.createSpy('renderSpy');
		spyOn(NWC.view.BaseView.prototype, 'render');
		spyOn(NWC.view.BaseView.prototype, 'initialize');
		plotStreamflowDataDeferred = $.Deferred();
		spyOn(NWC.view, 'StreamflowPlotView').andReturn({
			plotStreamflowData : jasmine.createSpy('plotStreamflowDataSpy').andReturn(plotStreamflowDataDeferred)
		});
		spyOn(NWC.util.mapUtils, 'createMap').andCallFake(function() {
			return {
				addLayers : addLayersSpy,
				zoomToExtent : jasmine.createSpy('zoomToExtentSpy'),
				getMaxExtent : jasmine.createSpy('getMaxExtentSpy'),
				render : renderSpy
			};
		});

		eventSpy = jasmine.createSpyObj('eventSpy', ['preventDefault']);

		options = {
			gageId : '12345678',
			insetMapDiv : 'inset-map-div'
		};

		server = sinon.fakeServer.create();
	});

	afterEach(function() {
		$testDiv.remove();
		server.restore();
	});

	it('Expects the view\'s constructor to set the context property', function() {
		testView = new NWC.view.StreamflowStatsGageDataView(options);

		expect(testView.context).toBeDefined();
		expect(testView.context.gageId).toEqual('12345678');
	});

	it('Expects the view\'s constructor to create properties for the inset map and gageLayers', function() {
		testView = new NWC.view.StreamflowStatsGageDataView(options);

		expect(testView.map).toBeDefined();
		expect(testView.gageLayer).toBeDefined();
		expect(testView.gageMarkerLayer).toBeDefined();

		expect(addLayersSpy).toHaveBeenCalled();
		expect(addLayersSpy.calls[0].args[0]).toContain(testView.gageLayer);
		expect(addLayersSpy.calls[0].args[0]).toContain(testView.gageMarkerLayer);
	});

	it('Expects nwis data to be retrieved to fill in the start and end wateryear selects during initialization', function() {
		var d = $.Deferred();
		spyOn(NWC.view.StreamflowStatsGageDataView.prototype, '_retrieveNWISData').andCallFake(function() {
			return d;
		});
		testView = new NWC.view.StreamflowStatsGageDataView(options);
		expect(testView._retrieveNWISData).toHaveBeenCalled();
		d.resolve({
			startDate : Date.create('02/01/1990').utc(),
			endDate : Date.create('03/04/1998').utc()
		});

		expect($('#start-period-of-record').html()).toEqual('1990-02-01');
		expect($('#end-period-of-record').html()).toEqual('1998-03-04');

		expect($('.start-year option:selected').val()).toEqual('1991');
		expect($('.end-year option:selected').val()).toEqual('1997');
	});

	it('Expects _retrieveNWISData to make an ajax call', function(){
		testView = new NWC.view.StreamflowStatsGageDataView(options);

		var requestCount = server.requests.length;

		testView._retrieveNWISData();
		expect(server.requests.length).toBe(requestCount + 1);
		var thisRequest = server.requests.last();
		expect(thisRequest.url).toMatch(CONFIG.endpoint.nwis);
		expect(thisRequest.url).toMatch(options.gageId);
	});

	it('Expects a successful _retrieveNWISData to return a deferred which resolves to the start and end date in the data', function() {
		testView = new NWC.view.StreamflowStatsGageDataView(options);
		var doneSpy = jasmine.createSpy('doneSpy');

		var response = '# Comments \nsite_no\tbegin_date\tend_date\n';
		response += '15s\t20d\t20d\n';
		response += options.gageId + '\t1944-10-01\t1977-09-30';

		testView._retrieveNWISData().done(doneSpy);
		expect(doneSpy).not.toHaveBeenCalled();
		server.respond([200, {"Content-Type": 'text/plain'}, response]);
		expect(doneSpy).toHaveBeenCalledWith({startDate : Date.create('1944/10/01').utc(), endDate : Date.create('1977/09/30').utc()});
	});

	it('Expects a failed _retrieveNWISData to return a deferred which resolves to a default start and end date', function() {
		spyOn(window, 'alert');
		testView = new NWC.view.StreamflowStatsGageDataView(options);
		var doneSpy = jasmine.createSpy('doneSpy');

		testView._retrieveNWISData().done(doneSpy);
		expect(doneSpy).not.toHaveBeenCalled();
		server.respond([500, {"Content-Type": 'text/plain'}, "Server Error"]);
		expect(doneSpy).toHaveBeenCalledWith({
			startDate : NWC.util.WaterYearUtil.waterYearStart(1981),
			endDate : NWC.util.WaterYearUtil.waterYearEnd(2010)
		});
	});

	it('Expects calling rendering to call the map\s render method and to create a StreamflowPlotView', function() {
		testView = new NWC.view.StreamflowStatsGageDataView(options);
		testView.render();
		expect(NWC.view.BaseView.prototype.render).toHaveBeenCalled();
		expect(renderSpy).toHaveBeenCalled();
		expect(NWC.view.StreamflowPlotView).toHaveBeenCalled();
	});

	it('Expects getStats to call getSiteStats and resolves the deferred when data is retrieved', function() {
			testView = new NWC.view.StreamflowStatsGageDataView(options);
			spyOn(NWC.util.streamStats, 'getSiteStats');
			var doneSpy = jasmine.createSpy('doneSpy')
			var d = testView.getStats(['s1', 's2'], '1990', '1991').done(doneSpy);
			expect(NWC.util.streamStats.getSiteStats).toHaveBeenCalled();
			expect(NWC.util.streamStats.getSiteStats.calls[0].args[0]).toEqual([options.gageId]);
			expect(NWC.util.streamStats.getSiteStats.calls[0].args[1]).toEqual(['s1', 's2']);
			expect(NWC.util.streamStats.getSiteStats.calls[0].args[2]).toEqual('1990');
			expect(NWC.util.streamStats.getSiteStats.calls[0].args[3]).toEqual('1991');
			expect(doneSpy).not.toHaveBeenCalled();

			var callback = NWC.util.streamStats.getSiteStats.calls[0].args[4];
			callback(['1', '2']);

			expect(doneSpy).toHaveBeenCalledWith(['1', '2']);
	});

	it('Expects the tsvHeader to contain the gage number', function() {
		testView = new NWC.view.StreamflowStatsGageDataView(options);
		var header = testView.getStatsTsvHeader();
		expect(header).toMatch(options.gageId);

	});

	it('Expects the tsv filename to contain the gage number', function() {
		testView = new NWC.view.StreamflowStatsGageDataView(options);
		var fname = testView.getStatsFilename();
		expect(fname).toMatch(options.gageId)
	});

	describe('Tests for plotStreamflowData', function() {
		beforeEach(function() {
			testView = new NWC.view.StreamflowStatsGageDataView(options);
			deferred = $.Deferred();

			ev = {
				preventDefault : jasmine.createSpy('preventDefaultSpy')
			};

			testView.render();
		});

		it('Expects a resolved call to plotStreamFlowData to set the dataSeries', function() {
			var ds = new NWC.util.DataSeries.newSeries();

			testView.plotStreamFlowData(ev);
			expect(testView.streamflowPlotViewLeft.plotStreamflowData).toHaveBeenCalled();
			expect(testView.streamflowPlotViewRight.plotStreamflowData).toHaveBeenCalled();
			plotStreamflowDataDeferred.resolve(ds);

			expect(testView.dataSeries).toEqual(ds);
		});
	});

});