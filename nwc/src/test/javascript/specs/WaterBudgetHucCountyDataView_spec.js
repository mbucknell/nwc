describe('Tests for WaterBudgetHucCountyDataView', function() {
	var $testDiv;
	var testView;
	var getHucDataSpy, getCountyDataSpy;

	beforeEach(function() {
		CONFIG = {
				endpoint : {
					geoserver : 'http://fakeserver.com'
				}
			};

		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="huc-inset-map-div"></div>');
		$testDiv.append('<div id="county-inset-map-div"></div>');
		$testDiv.append('<button class="customary-button" disabled>US Customary</button>');
		$testDiv.append('<button class="metric-button">Metric</button>');
		$testDiv.append('<button class="total-county-button" disabled>Monthly</button>');
		$testDiv.append('<button class="normalized-county-button">Daily</button>');
		$testDiv.append('<button class="daily-button">Daily</button>');
		$testDiv.append('<button class="monthly-button" disabled>Monthly</button>');

		getHucDataSpy = jasmine.createSpy('getHucDataSpy');
		getCountyDataSpy = jasmine.createSpy('getCountyDataSpy');
		spyOn(NWC.view.BaseView.prototype, 'initialize').andCallFake(function() {
			this.getHucData = getHucDataSpy
			this.getCountyData = getCountyDataSpy
		});

		testView = new NWC.view.WaterBudgetHucCountyDataView({
			hucId : '1234567891',
			fips : '1234',
			insetHucMapDiv : 'huc-inset-map-div',
			insetCountyMapDiv : 'county-inset-map-div'
		});
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects view\'s constructor to set the context property', function() {
		expect(testView.context.hucId).toEqual('1234567891');
	});

	it('Expects view\'s constructor to create properties for the inset map and hucLayer', function() {
		expect(testView.countyMap).toBeDefined();
		expect(testView.countyLayer).toBeDefined();
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expect that event handler calls exist and behave as expected', function() {

		//the view has an event to wire up the clickable plot options
		expect(testView.events['click #units-btn-group']).toBeDefined();
		expect(testView.events['click #time-scale-btn-group'])
		expect(testView.events['click .total-county-button']).toBeDefined();
		expect(testView.events['click .total-county-button']).toBeDefined();
		expect(testView.events['click .normalized-county-button']).toBeDefined();

		//plot buttons exist and get set with the proper disabled attribute
		testView.chartWaterUse = jasmine.createSpy('chartWaterUseSpy')
		testView.toggleTotalCountyWaterUse();
		expect($('.normalized-county-button').prop('disabled')).toBe(false);
		expect($('.total-county-button').prop('disabled')).toBe(true);
		testView.toggleNormalizedCountyWaterUse();
		expect($('.normalized-county-button').prop('disabled')).toBe(true);
		expect($('.total-county-button').prop('disabled')).toBe(false);
	});

	it('Expects downloadWaterUse to save to appropriate filename', function() {
		spyOn(window, 'saveAs');
		spyOn(window, 'Blob');
		var waterUseDataSeries = NWC.util.DataSeries.newSeries();
		waterUseDataSeries.data =
			 [["1985/01/01",0.25,null,0]];
		testView.waterUseDataSeries = waterUseDataSeries;
		spyOn(testView.waterUseDataSeries, 'toCSV');

		testView.fileName = 'test_' + testView.fips + '_water_use.csv';
		testView.countyName = 'test';
		testView.downloadWaterUse();

		expect(saveAs).toHaveBeenCalled();
		expect(saveAs.calls[0].args[1]).toMatch(testView.fileName);
		expect(saveAs.calls[0].args[1]).toMatch(testView.fips);
		expect(testView.waterUseDataSeries.toCSV).toHaveBeenCalled();
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

});