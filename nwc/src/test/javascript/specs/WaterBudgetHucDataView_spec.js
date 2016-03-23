/*jslint browser: true */
/*global spyOn*/
/*global NWC*/
/*global jasmine*/
/*global sinon*/
/*global expect*/

describe('Tests for NWC.WaterBudgetHucDataView', function() {
	var $testDiv;
	var $countiesButton, $accumulatedButton, $compareHucsButton;
	var $customaryButton, $metricButton, $dailyButton, $monthlyButton;
	var testView;
	var server;
	var featureLoadedDeferred;

	beforeEach(function() {
		CONFIG = {
				endpoint : {
					geoserver : 'http://fakeserver.com'
				}
			};

		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<button id="counties-button" disabled></button>');
		$testDiv.append('<button id="accumulated-button" disabled></button>');
		$testDiv.append('<button id="compare-hucs-button" disabled></button>');
		$testDiv.append('<button id="customary-button" value="usCustomary">US Customary</button>');
		$testDiv.append('<button id="metric-button" value="metric">Metric</button>');
		$testDiv.append('<button id="daily-button" value="daily">Daily</button>');
		$testDiv.append('<button id="monthly-button" value="monthly">Monthly</button>');
		$testDiv.append('<button id="annual-button" value="yearly">Annual</button>');
		$testDiv.append('<div id="county-selection-div"></div>');

		$customaryButton = $('#customary-button');
		$metricButton = $('#metric-button');
		$dailyButton = $('#daily-button');
		$monthlyButton = $('#monthly-button');
		$annualButton = $('#annual-button');
		$countiesButton = $('#counties-button');
		$accumulatedButton = $('#accumulated-button');
		$compareHucsButton = $('#compare-hucs-button');

		spyOn(NWC.view.BaseView.prototype, 'initialize');

		spyOn(NWC.view, 'WaterbudgetPlotView').andReturn({
			remove : jasmine.createSpy('waterbudgetPlotViewRemoveSpy')
		});

		featureLoadedDeferred = $.Deferred();

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
			spyOn(NWC.view, 'HucInsetMapView').andReturn({
				remove : jasmine.createSpy('waterBudgetHucInsetMapSpy'),
				featureLoadedPromise : featureLoadedDeferred.promise()
			});
			testView = new NWC.view.WaterBudgetHucDataView({
				hucId : '123456789',
				el : $testDiv
			});
		});

		it('Expects view\'s constructor to set the context property', function() {
			expect(testView.context.showAdditionalDataButtons).toBe(true);
		});

		it('Expects view\'s constructor to create properties for the hucPlotModel', function() {
			expect(testView.hucPlotModel).toBeDefined();
		});

		it('Expects the view\'s constructor to call BaseView initialize', function() {
			expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
		});

		it('Expects the view\'s constructor to create a waterBudgetPlotView', function() {
			expect(NWC.view.WaterbudgetPlotView).toHaveBeenCalled();
			expect(NWC.view.WaterbudgetPlotView.calls[0].args[0].hucId).toEqual('123456789');
			expect(testView.plotView).toBeDefined();
			expect(testView.comparePlotView).not.toBeDefined();
			expect(testView.countyWaterUseView).not.toBeDefined();
		});

		it('Expects the view\'s constructor to create create a hucInsetMapView', function() {
			expect(NWC.view.HucInsetMapView).toHaveBeenCalled();
			expect(NWC.view.HucInsetMapView.calls[0].args[0].hucId).toEqual('123456789');
			expect(testView.hucInsetMapView).toBeDefined();
			expect(testView.compareHucInsetMapView).not.toBeDefined();
		});

		it('Expect that event handler calls exist', function() {
			//the view has an event to wire up the clickable plot options
			expect(testView.events['click #units-btn-group button']).toBeDefined();
			expect(testView.events['click #time-scale-btn-group button']);
			expect(testView.events['click #counties-button']).toBeDefined();
		});

		it('Expect that when the huc feature has been loaded that the counties button and compare hucs buttons are enabled', function() {
			expect($countiesButton.prop('disabled')).toBe(true);
			expect($compareHucsButton.prop('disabled')).toBe(true);
			featureLoadedDeferred.resolve();
			expect($countiesButton.prop('disabled')).toBe(false);
			expect($compareHucsButton.prop('disabled')).toBe(false);
		});

		it('Expects a call to remove will remove the plotView', function() {
			testView.remove();
			expect(testView.plotView.remove).toHaveBeenCalled();
			expect(testView.hucInsetMapView.remove).toHaveBeenCalled();
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
			expect($annualButton.hasClass('active')).toBe(false);

			testView.hucPlotModel.set('timeScale', 'monthly');
			expect($dailyButton.hasClass('active')).toBe(false);
			expect($monthlyButton.hasClass('active')).toBe(true);
			expect($annualButton.hasClass('active')).toBe(false);

			testView.hucPlotModel.set('timeScale', 'yearly');
			expect($dailyButton.hasClass('active')).toBe(false);
			expect($monthlyButton.hasClass('active')).toBe(false);
			expect($annualButton.hasClass('active')).toBe(true);
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

			testView.changeTimeScale({
				preventDefault : preventSpy,
				target : { value : 'yearly'}
			});
			expect(testView.hucPlotModel.get('timeScale')).toEqual('yearly');
		});
	});

	describe('Test for view initialized with the accumulated option and hucID with corresponding gage', function() {
		beforeEach(function() {
			spyOn(NWC.view, 'HucInsetMapView').andReturn({
				remove : jasmine.createSpy('waterBudgetHucInsetMapSpy'),
				featureLoadedPromise : featureLoadedDeferred.promise()
			});
			var watershedGages = NWC.config.get('watershedGages');
			watershedGages.parse([{"hucId" : "123456789123", "gageId" : "02372250"}]);
			testView = new NWC.view.WaterBudgetHucDataView({
				hucId : '123456789123',
				accumulated : true,
				el : $testDiv
			});
		});

		it('Expects that the context properties are set', function() {
			expect(testView.context.showAdditionalDataButtons).toBe(true);
			expect(testView.context.showAccumulatedButton).toBe(false);
			expect(testView.context.showWaterUseButton).toBe(false);
		});


		it('Expect that when the huc feature has been loaded that only the compare button is enabled', function() {
			expect($countiesButton.prop('disabled')).toBe(true);
			expect($accumulatedButton.prop('disabled')).toBe(true);
			expect($compareHucsButton.prop('disabled')).toBe(true);
			featureLoadedDeferred.resolve();
			expect($countiesButton.prop('disabled')).toBe(true);
			expect($accumulatedButton.prop('disabled')).toBe(true);
			expect($compareHucsButton.prop('disabled')).toBe(false);
		});
	});

	describe('Test for view initialized with the accumulated option and hucID with no corresponding gage', function() {
		beforeEach(function() {
			spyOn(NWC.view, 'HucInsetMapView').andReturn({
				remove : jasmine.createSpy('waterBudgetHucInsetMapSpy'),
				featureLoadedPromise : featureLoadedDeferred.promise()
			});
			var watershedGages = NWC.config.get('watershedGages');
			watershedGages.parse([
				{"hucId" : "123456789012", "gageId" : "02372250"},
				{"hucId" : "987654321098", "gageId" : "02372250"}
					]);
			testView = new NWC.view.WaterBudgetHucDataView({
				hucId : '123456789123',
				accumulated : true,
				el : $testDiv
			});
		});

		it('Expects that the context properties are set', function() {
			expect(testView.context.showAdditionalDataButtons).toBe(true);
			expect(testView.context.showAccumulatedButton).toBe(false);
			expect(testView.context.showWaterUseButton).toBe(false);
		});


		it('Expect that when the huc feature has been loaded that only the compare button is enabled', function() {
			expect($countiesButton.prop('disabled')).toBe(true);
			expect($accumulatedButton.prop('disabled')).toBe(true);
			expect($compareHucsButton.prop('disabled')).toBe(true);
			featureLoadedDeferred.resolve();
			expect($countiesButton.prop('disabled')).toBe(true);
			expect($accumulatedButton.prop('disabled')).toBe(true);
			expect($compareHucsButton.prop('disabled')).toBe(false);
		});
	});

	describe('Tests for view created with a compareHucId and accumulated watershed', function() {
		beforeEach(function() {
			spyOn(NWC.view, 'HucInsetMapView').andReturn({
				remove : jasmine.createSpy('waterBudgetHucInsetMapSpy'),
				featureLoadedPromise : {
					done : function(fnc) {
						fnc();
					}
				}
			});
			var watershedGages = NWC.config.get('watershedGages');
			watershedGages.parse([
				{"hucId" : "123456789012", "gageId" : "02372250"},
				{"hucId" : "987654321098", "gageId" : "02372251"}
			]);
			NWC.config.set('watershedGages', watershedGages);
			testView = new NWC.view.WaterBudgetHucDataView({
				accumulated : true,
				hucId : '123456789012',
				compareHucId : '987654321098',
				el : $testDiv
			});
		});

		it('Expects that the context properties are set appropriately', function() {
			expect(testView.context.showAdditionalDataButtons).toBe(false);
		});

		it('Expects WaterBudgetPlotView to be called twice and that the view properties are defined', function() {
			expect(NWC.view.WaterbudgetPlotView.calls.length).toBe(2);
			expect(NWC.view.WaterbudgetPlotView.calls[0].args[0].hucId).toEqual('123456789012');
			expect(NWC.view.WaterbudgetPlotView.calls[1].args[0].hucId).toEqual('987654321098');
			expect(testView.plotView).toBeDefined();
			expect(testView.comparePlotView).toBeDefined();
			expect(testView.countyWaterUseView).not.toBeDefined();
		});

		it('Expects HucInsetMapView to be called twice and that the view properties are defined', function() {
			expect(NWC.view.HucInsetMapView.calls.length).toBe(2);
			expect(NWC.view.HucInsetMapView.calls[0].args[0].hucId).toEqual('123456789012');
			expect(NWC.view.HucInsetMapView.calls[1].args[0].hucId).toEqual('987654321098');
			expect(testView.hucInsetMapView).toBeDefined();
			expect(testView.compareHucInsetMapView).toBeDefined();
		});

		it('Expects that when remove is called it is called on both the plotViews and the hucInsetMapViews', function() {
			testView.remove();
			expect(testView.plotView.remove).toHaveBeenCalled();
			expect(testView.comparePlotView.remove).toHaveBeenCalled();
			expect(testView.hucInsetMapView.remove).toHaveBeenCalled();
			expect(testView.compareHucInsetMapView.remove).toHaveBeenCalled();
		});
	});

	describe('Tests for view created with a compareHucId', function() {
		beforeEach(function() {
			spyOn(NWC.view, 'HucInsetMapView').andReturn({
				remove : jasmine.createSpy('waterBudgetHucInsetMapSpy'),
				featureLoadedPromise : {
					done : function(fnc) {
						fnc();
					}
				}
			});
			testView = new NWC.view.WaterBudgetHucDataView({
				hucId : '123456789012',
				compareHucId : '232323232323',
				el : $testDiv
			});
		});

		it('Expects that the context properties are set appropriately', function() {
			expect(testView.context.showAdditionalDataButtons).toBe(false);
		});

		it('Expects WaterBudgetPlotView to be called twice and that the view properties are defined', function() {
			expect(NWC.view.WaterbudgetPlotView.calls.length).toBe(2);
			expect(NWC.view.WaterbudgetPlotView.calls[0].args[0].hucId).toEqual('123456789012');
			expect(NWC.view.WaterbudgetPlotView.calls[1].args[0].hucId).toEqual('232323232323');
			expect(testView.plotView).toBeDefined();
			expect(testView.comparePlotView).toBeDefined();
			expect(testView.countyWaterUseView).not.toBeDefined();
		});

		it('Expects HucInsetMapView to be called twice and that the view properties are defined', function() {
			expect(NWC.view.HucInsetMapView.calls.length).toBe(2);
			expect(NWC.view.HucInsetMapView.calls[0].args[0].hucId).toEqual('123456789012');
			expect(NWC.view.HucInsetMapView.calls[1].args[0].hucId).toEqual('232323232323');
			expect(testView.hucInsetMapView).toBeDefined();
			expect(testView.compareHucInsetMapView).toBeDefined();
		});

		it('Expects that when remove is called it is called on both the plotViews and the hucInsetMapViews', function() {
			testView.remove();
			expect(testView.plotView.remove).toHaveBeenCalled();
			expect(testView.comparePlotView.remove).toHaveBeenCalled();
			expect(testView.hucInsetMapView.remove).toHaveBeenCalled();
			expect(testView.compareHucInsetMapView.remove).toHaveBeenCalled();
		});
	});

	describe('Tests for view created with a fips', function() {
		beforeEach(function() {
			spyOn(NWC.view, 'HucInsetMapView').andReturn({
				remove : jasmine.createSpy('waterBudgetHucInsetMapSpy'),
				featureLoadedPromise : {
					done : function(fnc) {
						fnc();
					}
				}
			});
			testView = new NWC.view.WaterBudgetHucDataView({
				hucId : '123456789',
				fips : '9876',
				insetHucMapDiv : 'inset-map-div',
				el : $testDiv
			});
		});

		it('Expects that the context properties are set appropriately', function() {
			expect(testView.context.showAdditionalDataButtons).toBe(false);
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