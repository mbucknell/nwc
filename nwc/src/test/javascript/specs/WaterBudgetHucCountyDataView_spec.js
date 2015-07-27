/*jslint browser: true*/
/*global spyOn*/
/*global expect*/
/*global NWC*/
/*global jasmine*/
/*global sinon*/
/*global saveAs*/

describe('Tests for WaterBudgetHucCountyDataView', function() {
	var $testDiv;
	var $customaryButton, $metricButton, $totalButton, $normalizedButton;
	var testView;
	var getTemplateSpy, templateSpy;
	var server;

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
		$testDiv.append('<button id="county-customary-button" value="usCustomary"></button>');
		$testDiv.append('<button id="county-metric-button" value="metric"></button>');
		$testDiv.append('<button id="total-county-button" value="totalWater"></button>');
		$testDiv.append('<button id="normalized-county-button" value="normalizedWater"></button>');

		$customaryButton = $('#county-customary-button');
		$metricButton = $('#county-metric-button');
		$totalButton = $('#total-county-button');
		$normalizedButton = $('#normalized-county-button');

		getTemplateSpy = jasmine.createSpy('getTemplateSpy');
		templateSpy = jasmine.createSpy('templateSpy');
		NWC.templates = {
			getTemplate : getTemplateSpy.andReturn(templateSpy)
		};

		// Stubbing the createMap call so OpenLayers does not try to make any ajax calls
		spyOn(NWC.util.mapUtils, 'createMap').andCallFake(function() {
			return {
				addLayer : jasmine.createSpy('addLayerSpy'),
				zoomToExtent : jasmine.createSpy('zoomToExtentSpy'),
				getMaxExtent : jasmine.createSpy('getMaxExtentSpy'),
				render : jasmine.createSpy('renderSpy')
			};
		});

		spyOn(NWC.view.BaseView.prototype, 'initialize');
		spyOn(NWC.view, 'WaterbudgetPlotView');

		// This prevents any ajax calls to get data
		server = sinon.fakeServer.create();

		testView = new NWC.view.WaterBudgetHucCountyDataView({
			hucId : '1234567891',
			fips : '1234',
			insetHucMapDiv : 'huc-inset-map-div',
			insetCountyMapDiv : 'county-inset-map-div'
		});
		spyOn(testView, 'chartWaterUse');
	});

	afterEach(function() {
		$testDiv.remove();
		server.restore();
	});

	it('Expects view\'s constructor to set the context property', function() {
		expect(testView.context.hucId).toEqual('1234567891');
	});

	it('Expects view\'s constructor to create properties for the countyPlotModel, inset map and hucLayer', function() {
		expect(testView.countyMap).toBeDefined();
		expect(testView.countyLayer).toBeDefined();
		expect(testView.countyPlotModel).toBeDefined();
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expects the waterbudgetCountyData template to be rendered', function() {
		expect(getTemplateSpy).toHaveBeenCalledWith('waterbudgetCountyData');
		expect(templateSpy).toHaveBeenCalled();
	});

	it('Expect that event handler calls exist and behave as expected', function() {
		//the view has an event to wire up the clickable plot options
		expect(testView.events['click #units-btn-group button']).toBeDefined();
		expect(testView.events['click #time-scale-btn-group button']);
		expect(testView.events['click #water-use-type-btn-group button']).toBeDefined();
		expect(testView.events['click #water-use-type-btn-group button']).toBeDefined();
	});

	it('Expects the units to change state and replot when the model changes', function() {
		testView.countyPlotModel.set('units', 'metric');
		expect(testView.chartWaterUse).toHaveBeenCalledWith('metric', testView.countyPlotModel.get('plotType'));
		expect($metricButton.hasClass('active')).toBe(true);
		expect($customaryButton.hasClass('active')).toBe(false);

		testView.countyPlotModel.set('units', 'usCustomary');
		expect(testView.chartWaterUse).toHaveBeenCalledWith('usCustomary', testView.countyPlotModel.get('plotType'));
		expect($metricButton.hasClass('active')).toBe(false);
		expect($customaryButton.hasClass('active')).toBe(true);
	});

	it('Expects the plotType to change state and replot when the model changes', function() {
		testView.countyPlotModel.set('plotType', 'normalizedWater');
		expect(testView.chartWaterUse).toHaveBeenCalledWith(testView.countyPlotModel.get('units'), 'normalizedWater');
		expect($normalizedButton.hasClass('active')).toBe(true);
		expect($totalButton.hasClass('active')).toBe(false);

		testView.countyPlotModel.set('plotType', 'totalWater');
		expect(testView.chartWaterUse).toHaveBeenCalledWith(testView.countyPlotModel.get('units'), 'totalWater');
		expect($normalizedButton.hasClass('active')).toBe(false);
		expect($totalButton.hasClass('active')).toBe(true);
	});

	it('Expects changeCountyUnits to update the model', function() {
		var preventSpy = jasmine.createSpy('preventDefault');
		testView.changeCountyUnits({
			preventDefault : preventSpy,
			target : {value : 'metric'}
		});
		expect(testView.countyPlotModel.get('units')).toEqual('metric');

		testView.changeCountyUnits({
			preventDefault : preventSpy,
			target : { value : 'usCustomary'}
		});
		expect(testView.countyPlotModel.get('units')).toEqual('usCustomary');
	});

	it('Expects changePlotType to update the model', function() {
		var preventSpy = jasmine.createSpy('preventDefault');
		testView.changePlotType({
			preventDefault : preventSpy,
			target : {value : 'normalizedWater'}
		});
		expect(testView.countyPlotModel.get('plotType')).toEqual('normalizedWater');

		testView.changePlotType({
			preventDefault : preventSpy,
			target : {value : 'totalWater'}
		});
		expect(testView.countyPlotModel.get('plotType')).toEqual('totalWater');
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

});