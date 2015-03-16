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
		$testDiv.append('<div id="available-statistics"><input id="as1" type="checkbox"/><input id="as2" type="chckbox"/></div>');
		$testDiv.append('<button id="calculate-stats-button"></button>');
		$testDiv.append('<select id="start-year"><option value="1991"></option></select>');
		$testDiv.append('<select id="end-year"><option value="1992"></option></select');

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
		expect(testView.context.streamStatsOptions).toEqual(NWC.dictionary.statGroups);
	});

	it('Expects view\'s constructor to create properties for the inset map and hucLayer', function() {
		expect(testView.map).toBeDefined();
		expect(testView.hucLayer).toBeDefined();
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expect when the view\'s render method is called that BaseViw render is called and the map is rendered', function() {
		testView.render();
		expect(NWC.view.BaseView.prototype.render).toHaveBeenCalled();
		expect(renderSpy).toHaveBeenCalledWith('inset-map-div');
	});

	it('Expects view.calculateStatsEnable to enabe the calculate stats button if any of the stat checkboxes have been checked', function() {
		$('#as1').prop('checked', true);
		testView.calculateStatsEnable();
		expect($('#calculate-stats-button').prop('disabled')).toBe(false);

		$('#as1').prop('checked', false);
		testView.calculateStatsEnable();
		expect($('#calculate-stats-button').prop('disabled')).toBe(true);
	});

	describe('Tests for calculateStats', function() {
		var getTemplateSpy
		beforeEach(function() {
			getTemplateSpy = jasmine.createSpy('getTemplateSpy');

			NWC.templates = {
				'getTemplate' : getTemplateSpy
			};
			spyOn(NWC.util.streamStats, 'getHucStats');
			testView.calculateStats(eventSpy);
		});

		it('Expects calculateStats to use streamStats.getHucStats to retrieve the statistics', function() {
			expect(NWC.util.streamStats.getHucStats).toHaveBeenCalled();
			expect(NWC.util.streamStats.getHucStats.calls[0].args[0]).toEqual(['123456789012']);
			expect(NWC.util.streamStats.getHucStats.calls[0].args[2]).toEqual(NWC.util.WaterYearUtil.waterYearStart('1991'));
			expect(NWC.util.streamStats.getHucStats.calls[0].args[3]).toEqual(NWC.util.WaterYearUtil.waterYearEnd('1992'));
		});

		it('Expects the callback function to getHucStats to assign the statistics to the view', function() {
			var templateSpy = jasmine.createSpy('templateSpy');
			var statsResults = ['1', '2'];
			getTemplateSpy.andReturn(templateSpy);

			NWC.util.streamStats.getHucStats.calls[0].args[4](statsResults, '');
			expect(templateSpy).toHaveBeenCalledWith({streamflowStatistics : statsResults});
			expect(testView.streamflowStatistics).toEqual(statsResults);
		});
	});

	//TODO write test for creating tsv

	it('Expects downloadStats to save to the correct filename', function() {
		spyOn(window, 'saveAs');
		spyOn(window, 'Blob');
		spyOn(testView, '_getStatsTsv');
		testView.downloadStats(eventSpy);
		expect(saveAs).toHaveBeenCalled();
		expect(saveAs.calls[0].args[1]).toMatch(testView.context.hucId);
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