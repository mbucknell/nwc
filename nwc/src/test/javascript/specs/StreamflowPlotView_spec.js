/*jslint browser: true */
/*global expect */
/*global jasmine*/
/*global NWC*/
/*global $*/

describe('NWC.view.StreamflowPlotView', function() {
	var fetchDeferred, testView, $testDiv, getPromise;

	beforeEach(function() {
		fetchDeferred = $.Deferred();

		spyOn(NWC.view.BaseView.prototype, 'initialize');
		spyOn(NWC.util.Plotter, 'getPlot');

		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		var html = '<div style="display:none" class="plot-loading-indicator"></div>' +
			'<div style="display:none" class="plot-container"><div class="plot-div"></div></div class="legend-div"></div>';
		$testDiv.append(html);
		testView = new NWC.view.StreamflowPlotView({
			el : $testDiv,
			fetchDataSeriesPromise : fetchDeferred
		});
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects that when plotStreamflowData is called, the loading indicator is shown', function() {
		testView.plotStreamflowData('this is a title');
		expect($('.plot-loading-indicator').is(':visible')).toBe(true);
		expect($('.plot-div').is(':visible')).toBe(false);
	});

	it('Expects than if the fetchDeferred is resolved the plotting function is called and appropriate dom elements are shown/hidden', function() {
		var ds = new NWC.util.DataSeries.newSeries();
		var p = testView.plotStreamflowData('this is a title');
		var resolveSpy = jasmine.createSpy('resolveSpy');
		var errorSpy = jasmine.createSpy('errorSpy');
		p.done(resolveSpy).fail(errorSpy);

		fetchDeferred.resolve(ds);

		expect(resolveSpy).toHaveBeenCalledWith(ds);
		expect(errorSpy).not.toHaveBeenCalled();

		expect($('.plot-loading-indicator').is(':visible')).toBe(false);
		expect($('.plot-container').is(':visible')).toBe(true);
		expect(NWC.util.Plotter.getPlot).toHaveBeenCalled();
		var args = NWC.util.Plotter.getPlot.calls[0].args;
		expect(args[5]).toEqual('this is a title');
	});

	it('Expects that if the fetchDeferred is rejected the plotting function is not called and the appropriate dom elements are shown/hidden', function() {
		var p = testView.plotStreamflowData('this is a title');
		var resolveSpy = jasmine.createSpy('resolveSpy');
		var errorSpy = jasmine.createSpy('errorSpy');
		p.done(resolveSpy).fail(errorSpy);

		fetchDeferred.reject('An error message');
		expect(resolveSpy).not.toHaveBeenCalled();
		expect(errorSpy).toHaveBeenCalledWith(['An error message']);

		expect($('.plot-loading-indicator').is(':visible')).toBe(false);
		expect($('.plot-container').is(':visible')).toBe(false);
		expect(NWC.util.Plotter.getPlot).not.toHaveBeenCalled();
	});
});