describe('Tests for WaterBudgetHucDataView', function() {0
	var $testDiv;
	var testView;
	var addLayerSpy, renderSpy, getHucDataSpy;

	beforeEach(function() {
		CONFIG = {
			endpoint : {
				geoserver : 'http://fakeserver.com'
			}
		};

		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="inset-map-div"></div>');
		$testDiv.append('<button class="customary-button" disabled>US Customary</button>');
		$testDiv.append('<button class="metric-button">Metric</button>');
		$testDiv.append('<button class="daily-button">Daily</button>');
		$testDiv.append('<button class="monthly-button" disabled>Monthly</button>');
		$testDiv.append('<div id="county-selection-div" style="display:none;"></div>');

		addLayersSpy = jasmine.createSpy('addLayersSpy');
		renderSpy = jasmine.createSpy('renderSpy');
		getHucDataSpy = jasmine.createSpy('getHucDataSpy');
//		plotPTandETDataSpy = jasmine.createSpy('plotPTandETDataSpy');
		spyOn(NWC.view.BaseView.prototype, 'initialize').andCallFake(function() {
			this.getHucData = getHucDataSpy
			this.map = {
				addLayers : addLayersSpy,
				zoomToExtent : jasmine.createSpy('zoomToExtentSpy'),
				getMaxExtent : jasmine.createSpy('getMaxExtentSpy'),
				render : renderSpy
			}
		});

		testView = new NWC.view.WaterBudgetHucDataView({
			hucId : '12345678',
			insetHucMapDiv : 'inset-map-div'
		});
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects view\'s constructor to set the context property', function() {
		expect(testView.context.hucId).toEqual('12345678');
	});

	it('Expects view\'s constructor to create properties for the inset map and hucLayer', function() {
		expect(testView.map).toBeDefined();
		expect(testView.hucLayer).toBeDefined();
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expect that event handler calls exist and behave as expected', function() {

		//the view has an event to wire up the clickable plot options
		expect(testView.events['click .back-button']).toBeDefined();
		expect(testView.events['click #counties-button']).toBeDefined();
		expect(testView.events['click .metric-button']).toBeDefined();
		expect(testView.events['click .customary-button']).toBeDefined();
		expect(testView.events['click .monthly-button']).toBeDefined();
		expect(testView.events['click .daily-button']).toBeDefined();
		expect(testView.events['click .evapotranspiration-download-button']).toBeDefined();
		expect(testView.events['click .precipitation-download-button']).toBeDefined();

		//plot buttons exist and get set with the proper disabled attribute
		testView.plotPTandETaData = jasmine.createSpy('plotPTandETaDataSpy')
		testView.toggleMetricLegend();
		expect($('.customary-button').prop('disabled')).toBe(false);
		expect($('.metric-button').prop('disabled')).toBe(true);
		testView.toggleCustomaryLegend();
		expect($('.customary-button').prop('disabled')).toBe(true);
		expect($('.metric-button').prop('disabled')).toBe(false);
		testView.toggleMonthlyLegend();
		expect($('.monthly-button').prop('disabled')).toBe(true);
		expect($('.daily-button').prop('disabled')).toBe(false);
		testView.toggleDailyLegend();
		expect($('.monthly-button').prop('disabled')).toBe(false);
		expect($('.daily-button').prop('disabled')).toBe(true);
	});

	it('Expects downloadEvapotranspiration to save to appropriate filename', function() {
		spyOn(window, 'saveAs');
		spyOn(window, 'Blob');
		testView.dataSeriesStore = {
			eta : {
			toCSV : jasmine.createSpy('toCSVSpy')
			}
		};
		testView.fileName = 'test_' + testView.hucId + '_eta.csv';
		testView.hucName = 'test';
		testView.downloadEvapotranspiration();

		expect(saveAs).toHaveBeenCalled();
		expect(saveAs.calls[0].args[1]).toMatch(testView.fileName);
		expect(saveAs.calls[0].args[1]).toMatch(testView.context.hucId);
		expect(testView.dataSeriesStore.eta.toCSV).toHaveBeenCalled();
	});

	it('Expects downloadPrecipitation to save to appropriate filename', function() {
		spyOn(window, 'saveAs');
		spyOn(window, 'Blob');
		testView.dataSeriesStore = {
			dayMet : {
			toCSV : jasmine.createSpy('toCSVSpy')
			}
		};
		testView.fileName = 'test_' + testView.hucId + '_dayMet.csv';
		testView.hucName = 'test';
		testView.downloadPrecipitation();

		expect(saveAs).toHaveBeenCalled();
		expect(saveAs.calls[0].args[1]).toMatch(testView.fileName);
		expect(saveAs.calls[0].args[1]).toMatch(testView.context.hucId);
		expect(testView.dataSeriesStore.dayMet.toCSV).toHaveBeenCalled();
	});

	it('Expects displayCountyMap to show the county dif and to create the huc/county map view', function() {
		spyOn(NWC.view, 'HucCountyMapView');
		testView.displayCountyMap();
		expect($('#county-selection-div').is(':visible')).toBe(true);
		expect(NWC.view.HucCountyMapView).toHaveBeenCalled();
	});

});