/*jslint browser: true */
/*global spyOn*/
/*global NWC*/
/*global jasmine*/
/*global sinon*/
/*global expect*/

describe('Tests for NWC.WaterBudgetHucDataView', function() {
	var $testDiv;
	var $customaryButton, $metricButton, $dailyButton, $monthlyButton;
	var testView;
	var server;

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

		spyOn(NWC.view, 'WaterbudgetPlotView').andReturn({
			remove : jasmine.createSpy('waterbudgetPlotViewRemoveSpy')
		});

		spyOn(NWC.view, 'CountyWaterUseView').andReturn({
			remove : jasmine.createSpy('countyWaterUsePlotViewRemoveSpy')
		});

		// This prevents any ajax calls to get data
		server = sinon.fakeServer.create();
	});

	afterEach(function() {
		$testDiv.remove();
		server.restore();
	});

	describe('Test for view initialized only with a hucId', function() {
		beforeEach(function() {
			testView = new NWC.view.WaterBudgetHucDataView({
				hucId : '123456789',
				insetHucMapDiv : 'inset-map-div',
				el : $testDiv
			});
		});

		it('Expects view\'s constructor to set the context property', function() {
			expect(testView.context.hucId).toEqual('123456789');
			expect(testView.context.showAdditionalDataButtons).toBe(true);
		});

		it('Expects view\'s constructor to create properties for the hucPlotModel, inset map and hucLayer', function() {
			expect(testView.hucMap).toBeDefined();
			expect(testView.hucLayer).toBeDefined();
			expect(testView.hucPlotModel).toBeDefined();
		});

		it('Expects the view\'s constructor to call BaseView initialize', function() {
			expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
		});

		it('Expects the view\'s constructor to create a waterBudgetPlotView', function() {
			expect(NWC.view.WaterbudgetPlotView).toHaveBeenCalled();
			expect(testView.plotView).toBeDefined();
			expect(testView.comparePlotView).not.toBeDefined();
			expect(testView.countyWaterUseView).not.toBeDefined();
		});

		it('Expect that event handler calls exist', function() {
			//the view has an event to wire up the clickable plot options
			expect(testView.events['click #units-btn-group button']).toBeDefined();
			expect(testView.events['click #time-scale-btn-group button']);
			expect(testView.events['click #counties-button']).toBeDefined();
		});

		it('Expects a call to remove will remove the plotView', function() {
			testView.remove();
			expect(testView.plotView.remove).toHaveBeenCalled();
		});

		it('Expects the units to change state when the model changes', function() {
			testView.hucPlotModel.set('units', 'metric');
			expect($metricButton.hasClass('active')).toBe(true);
			expect($customaryButton.hasClass('active')).toBe(false);

			testView.hucPlotModel.set('units', 'usCustomary');
			expect($metricButton.hasClass('active')).toBe(false);
			expect($customaryButton.hasClass('active')).toBe(true);
		});

		it('Expects the timeScale to change state and replot when the model changes', function() {
			testView.hucPlotModel.set('timeScale', 'daily');
			expect($dailyButton.hasClass('active')).toBe(true);
			expect($monthlyButton.hasClass('active')).toBe(false);

			testView.hucPlotModel.set('timeScale', 'monthly');
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
	});

	describe('Tests for view created with a compareHucId', function() {
		beforeEach(function() {
			testView = new NWC.view.WaterBudgetHucDataView({
				hucId : '123456789',
				compareHucId : '232323232323',
				insetHucMapDiv : 'inset-map-div',
				el : $testDiv
			});
		});

		it('Expects that the context properties are set appropriately', function() {
			expect(testView.context.showAdditionalDataButtons).toBe(false);
			expect(testView.context.hucId).toBe('123456789');
		});

		it('Expects WaterBudgetPlotView to be called twice and that the view properties are defined', function() {
			expect(NWC.view.WaterbudgetPlotView.calls.length).toBe(2);
			expect(testView.plotView).toBeDefined();
			expect(testView.comparePlotView).toBeDefined();
			expect(testView.countyWaterUseView).not.toBeDefined();
		});

		it('Expects that when remove is called it is called on both the plotView and the comparePlotView', function() {
			testView.remove();
			expect(testView.plotView.remove).toHaveBeenCalled();
			expect(testView.comparePlotView.remove).toHaveBeenCalled();
		});
	});

	describe('Tests for view created with a fips', function() {
		beforeEach(function() {
			testView = new NWC.view.WaterBudgetHucDataView({
				hucId : '123456789',
				fips : '9876',
				insetHucMapDiv : 'inset-map-div',
				el : $testDiv
			});
		});

		it('Expects that the context properties are set appropriately', function() {
			expect(testView.context.showAdditionalDataButtons).toBe(false);
			expect(testView.context.hucId).toBe('123456789');
		});

		it('Expects WaterBudgetPlotView to be called once, that CountyWaterUserView is called once and that the view properties are defined', function() {
			expect(NWC.view.WaterbudgetPlotView.calls.length).toBe(1);
			expect(NWC.view.CountyWaterUseView).toHaveBeenCalled();
			expect(testView.plotView).toBeDefined();
			expect(testView.comparePlotView).not.toBeDefined();
			expect(testView.countyWaterUseView).toBeDefined();
		});

		it('Expects that when remove is called it is called on both the plotView and the comparePlotView', function() {
			testView.remove();
			expect(testView.plotView.remove).toHaveBeenCalled();
			expect(testView.countyWaterUseView.remove).toHaveBeenCalled();
		});
	});
});