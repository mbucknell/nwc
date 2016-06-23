/*jslint browser: true*/
/*global expect*/
/*global spyOn*/
/*global jasmine*/
/*global sinon*/
/*global NWC*/

describe ('NWC.view.WaterbudgetPlotView', function() {
	var model;
	var testView;
	var fakeServer;

	beforeEach(function() {
		CONFIG = {
			endpoint: {
				geoserver : 'http:fakegeoserver.com',
				thredds : 'http://fakeservice'
			}
		};
		fakeServer = sinon.fakeServer.create();
		var html = '<div id="test-div">' +
			'<div class=".download-btn-containter">' +
			'<button class="downloadEvapotranspiration"></button>' +
			'<button class="downloadPrecipitation"></button>' +
			'</div>' +
			'<div class="waterbudget-plot"></div>' +
			'<div class="waterbudget-legend"></div>';
		$('body').append(html);

		spyOn(NWC.view.BaseView.prototype, 'initialize');
		spyOn(NWC.view.WaterbudgetPlotView.prototype, 'plotData');
		spyOn(NWC.view.WaterbudgetPlotView.prototype, 'getPlotData').andCallThrough();

		model = new NWC.model.WaterBudgetHucPlotModel();
	});

	afterEach(function() {
		$('#test-div').remove();
		fakeServer.restore();
	});

	it('Expects the view to be initialized be retrieving the plot data and rendering the view', function() {
		testView = new NWC.view.WaterbudgetPlotView({
			hucId : '123456',
			model : model
		});
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
		expect(NWC.view.WaterbudgetPlotView.prototype.getPlotData).toHaveBeenCalledWith('123456', null, undefined);
	});

	it('Expects that $.ajax is called for each data source', function() {
		testView = new NWC.view.WaterbudgetPlotView({
			hucId : '123456',
			model : model
		});
		expect(fakeServer.requests.length).toBe(2);
	});

	it('Expects that $.ajax is called for each data source including streamflow when accumulated', function() {
		model.set('watershedAcres', 10);
		testView = new NWC.view.WaterbudgetPlotView({
			accumulated : true,
			hucId : '123456',
			gageId : '123456',
			model : model
		});
		expect(fakeServer.requests.length).toBe(3);
	});

	it('Expects that $.ajax is called for each data source including streamflow when accumulated and a compare instance', function() {
		model.set('compareWatershedAcres', 10);
		testView = new NWC.view.WaterbudgetPlotView({
			accumulated : true,
			compare : true,
			hucId : '123456',
			gageId : '123456',
			model : model
		});
		expect(fakeServer.requests.length).toBe(3);
	});

	it('Expects an update to the model to call plotData', function() {
		testView = new NWC.view.WaterbudgetPlotView({
			hucId : '123456',
			model : model
		});

		model.set('units', 'METRIC');
		expect(NWC.view.WaterbudgetPlotView.prototype.plotData.calls.length).toBe(1);
		model.set('timeScale', 'daily');
		expect(NWC.view.WaterbudgetPlotView.prototype.plotData.calls.length).toBe(2);
	});

	it('Expects downloadEvapotranspiration to save to appropriate filename', function() {
		testView = new NWC.view.WaterbudgetPlotView({
			hucId : '123456',
			model : model
		});
		spyOn(window, 'saveAs');
		spyOn(window, 'Blob');
		testView.dataSeriesStore = {
			eta : {
			toCSV : jasmine.createSpy('toCSVSpy')
			}
		};
		testView.downloadEvapotranspiration();

		expect(saveAs).toHaveBeenCalled();
		expect(saveAs.calls[0].args[1]).toMatch(testView.hucId);
		expect(saveAs.calls[0].args[1]).toMatch('_eta');
		expect(testView.dataSeriesStore.eta.toCSV).toHaveBeenCalled();
	});

	it('Expects downloadPrecipitation to save to appropriate filename', function() {
		testView = new NWC.view.WaterbudgetPlotView({
			hucId : '123456',
			model : model
		});
		spyOn(window, 'saveAs');
		spyOn(window, 'Blob');
		testView.dataSeriesStore = {
			dayMet : {
			toCSV : jasmine.createSpy('toCSVSpy')
			}
		};
		testView.downloadPrecipitation();

		expect(saveAs).toHaveBeenCalled();
		expect(saveAs.calls[0].args[1]).toMatch(testView.hucId);
		expect(saveAs.calls[0].args[1]).toMatch('_dayMet');
		expect(testView.dataSeriesStore.dayMet.toCSV).toHaveBeenCalled();
	});
});