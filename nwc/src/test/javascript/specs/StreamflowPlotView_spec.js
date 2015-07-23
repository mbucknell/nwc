/*jslint browser: true */
/*global expect */
/*global jasmine*/
/*global NWC*/
/*global $*/

describe('NWC.view.StreamflowPlotView', function() {
	var deferred, testView, $testDiv, getPromise;

	beforeEach(function() {
		deferred = $.Deferred();
		getPromise = jasmine.createSpy('getPromiseSpy').andReturn(deferred.promise());

		spyOn(NWC.view.BaseView.prototype, 'initialize');
		spyOn(NWC.util.Plotter, 'getPlot');

		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		var html = '<div style="display:none" class="plot-loading-indicator"></div>' +
			'<div style="display:none" class="plot-legend-div"><div class="plot-div"></div></div class="legend-div"></div>';
		$testDiv.append(html);
		testView = new NWC.view.StreamflowPlotView({
			el : $testDiv,
			getDataSeriesPromise : getPromise
		});
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects that when plotStreamflowData is called, the loading indicator is shown and getPromise called', function() {
		testView.plotStreamflowData('this is a title');
		expect($('.plot-loading-indicator').is(':visible')).toBe(true);
		expect($('.plot-div').is(':visible')).toBe(false);
		expect(getPromise).toHaveBeenCalled();
	});

	it('Expects than if the getPromise resolves the plotting function is called and appropriate dom elements are shown/hidden', function() {
		var ds = new NWC.util.DataSeries.newSeries();
		var p = testView.plotStreamflowData('this is a title');
		var resolveSpy = jasmine.createSpy('resolveSpy');
		var errorSpy = jasmine.createSpy('errorSpy');
		p.done(resolveSpy).fail(errorSpy);

		deferred.resolve(ds);

		expect(resolveSpy).toHaveBeenCalledWith(ds);
		expect(errorSpy).not.toHaveBeenCalled();

		expect($('.plot-loading-indicator').is(':visible')).toBe(false);
		expect($('.plot-legend-div').is(':visible')).toBe(true);
		expect(NWC.util.Plotter.getPlot).toHaveBeenCalled();
		var args = NWC.util.Plotter.getPlot.calls[0].args;
		expect(args[5]).toEqual('this is a title');
	});

	it('Expects that if the getPromise is rejected the plotting function is not called and the appropriate dom elements are shown/hidden', function() {
		var p = testView.plotStreamflowData('this is a title');
		var resolveSpy = jasmine.createSpy('resolveSpy');
		var errorSpy = jasmine.createSpy('errorSpy');
		p.done(resolveSpy).fail(errorSpy);

		deferred.reject('An error message');
		expect(resolveSpy).not.toHaveBeenCalled();
		expect(errorSpy).toHaveBeenCalledWith(['An error message']);

		expect($('.plot-loading-indicator').is(':visible')).toBe(false);
		expect($('.plot-legend-div').is(':visible')).toBe(false);
		expect(NWC.util.Plotter.getPlot).not.toHaveBeenCalled();
	});
});