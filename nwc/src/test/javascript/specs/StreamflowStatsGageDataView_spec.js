describe('Tests for StreamflowStatsGageDataView', function() {
	var $testDiv;
	var testView;
	var addLayersSpy, renderSpy;
	var eventSpy;
	var options;
	var server;

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
		$testDiv.append('<select id="start-year"><option value="1991"></option></select>');
		$testDiv.append('<select id="end-year"><option value="1992"></option></select');
		$testDiv.append('<div id="start-period-of-record"></div>');
		$testDiv.append('<div id="end-period-of-record"></div>');



		addLayersSpy = jasmine.createSpy('addLayersSpy');
		renderSpy = jasmine.createSpy('renderSpy');
		spyOn(NWC.view.BaseStreamflowStatsDataView.prototype, 'render');
		spyOn(NWC.view.BaseStreamflowStatsDataView.prototype, 'initialize');
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

		expect($('#start-year option:selected').val()).toEqual('1991');
		expect($('#end-year option:selected').val()).toEqual('1997');
	});

	//TODO test _retrieveNWSIDATA

	it('Expects calling rendering to call the map\s render method', function() {
		testView = new NWC.view.StreamflowStatsGageDataView(options);
		testView.render();
		expect(NWC.view.BaseStreamflowStatsDataView.prototype.render).toHaveBeenCalled();
		expect(renderSpy).toHaveBeenCalled();
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
	})

});