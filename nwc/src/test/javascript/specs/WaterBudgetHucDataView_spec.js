describe('Tests for WaterBudgetHucDataView', function() {
	var $testDiv;
	var $customaryButton, $metricButton, $dailyButton, $monthlyButton
	var testView;
	var getHucDataSpy;

	beforeEach(function() {
		CONFIG = {
				endpoint : {
					geoserver : 'http://fakeserver.com'
				}
			};

		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="inset-map-div"></div>');
		$testDiv.append('<button id="customary-button" value="usCustomary">US Customary</button>');
		$testDiv.append('<button id="metric-button" value="metric">Metric</button>');
		$testDiv.append('<button id="daily-button" value="daily">Daily</button>');
		$testDiv.append('<button id="monthly-button" value="monthly">Monthly</button>');
		$testDiv.append('<div id="county-selection-div"></div>');

		$customaryButton = $('#customary-button');
		$metricButton = $('#metric-button');
		$dailyButton = $('#daily-button');
		$monthlyButton = $('#monthly-button');

		getHucDataSpy = jasmine.createSpy('getHucDataSpy');
		spyOn(NWC.view.BaseView.prototype, 'initialize').andCallFake(function() {
			this.getHucData = getHucDataSpy
		});

		testView = new NWC.view.WaterBudgetHucDataView({
			hucId : '123456789',
			insetHucMapDiv : 'inset-map-div'
		});

		spyOn(testView, 'plotPTandETaData');
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects view\'s constructor to set the context property', function() {
		expect(testView.context.hucId).toEqual('123456789');
	});

	it('Expects view\'s constructor to create properties for the hucPlotModel, inset map and hucLayer', function() {
		expect(testView.hucMap).toBeDefined();
		expect(testView.hucLayer).toBeDefined();
		expect(testView.hucPlotModel).toBeDefined();
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expect that event handler calls exist', function() {

		//the view has an event to wire up the clickable plot options
		expect(testView.events['click #units-btn-group button']).toBeDefined();
		expect(testView.events['click #time-scale-btn-group button'])
		expect(testView.events['click #counties-button']).toBeDefined();
		expect(testView.events['click .evapotranspiration-download-button']).toBeDefined();
		expect(testView.events['click .precipitation-download-button']).toBeDefined();
	});

	it('Expects the units to change state and replot when the model changes', function() {
		testView.hucPlotModel.set('units', 'metric');
		expect(testView.plotPTandETaData).toHaveBeenCalledWith(testView.hucPlotModel.get('timeScale'), 'metric');
		expect($metricButton.hasClass('active')).toBe(true);
		expect($customaryButton.hasClass('active')).toBe(false);

		testView.hucPlotModel.set('units', 'usCustomary');
		expect(testView.plotPTandETaData).toHaveBeenCalledWith(testView.hucPlotModel.get('timeScale'), 'usCustomary')
		expect($metricButton.hasClass('active')).toBe(false);
		expect($customaryButton.hasClass('active')).toBe(true);
	});

	it('Expects the timeScale to change state and replot when the model changes', function() {
		testView.hucPlotModel.set('timeScale', 'daily');
		expect(testView.plotPTandETaData).toHaveBeenCalledWith('daily', testView.hucPlotModel.get('units'));
		expect($dailyButton.hasClass('active')).toBe(true);
		expect($monthlyButton.hasClass('active')).toBe(false);

		testView.hucPlotModel.set('timeScale', 'monthly');
		expect(testView.plotPTandETaData).toHaveBeenCalledWith('monthly', testView.hucPlotModel.get('units'));
		expect($dailyButton.hasClass('active')).toBe(false);
		expect($monthlyButton.hasClass('active')).toBe(true);
	});

	it('Expects changeUnits to update the model', function() {
		var preventSpy = jasmine.createSpy('preventDefault');
		testView.changeUnits({
			preventDefault : preventSpy,
			target : {value : 'metric'}
		});
		expect(testView.hucPlotModel.get('units')).toEqual('metric');

		testView.changeUnits({
			preventDefault : preventSpy,
			target : { value : 'usCustomary'}
		});
		expect(testView.hucPlotModel.get('units')).toEqual('usCustomary');

	});

	it('Expects changeTimeScale to update the model', function() {
		var preventSpy = jasmine.createSpy('preventDefault');
		testView.changeTimeScale({
			preventDefault : preventSpy,
			target : {value : 'daily'}
		});
		expect(testView.hucPlotModel.get('timeScale')).toEqual('daily');

		testView.changeTimeScale({
			preventDefault : preventSpy,
			target : { value : 'monthly'}
		});
		expect(testView.hucPlotModel.get('timeScale')).toEqual('monthly');
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