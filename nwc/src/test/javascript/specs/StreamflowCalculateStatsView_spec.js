/*jslint browser: true */
/*global expect */
/*global jasmine*/
/*global NWC*/
/*global $*/

describe('NWC.view.StreamflowCalculateStatsView', function() {
	var testView, $testDiv;
	var getStatsDeferred;

	beforeEach(function() {
		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		var html = '<div id="left" class="calculate-stats"><div id="available-statistics">' + 
			'<input id="as1" value="as1" type="checkbox"/><input id="as2" value="as2" type="checkbox"/></div>' +
			'<button id="calculate-stats-button"></button>' +
			'<select class="start-year"><option value="1991"></option></select>' + 
			'<select class="end-year"><option value="1992"></option></select>' +
			'<button id="download-stats-button">Download These Statistics</button></div>'
		$testDiv.append(html);

		spyOn(NWC.view.BaseView.prototype, 'initialize');

		eventSpy = jasmine.createSpyObj('eventSpy', ['preventDefault']);
		getStatsDeferred = $.Deferred();
		getStatsSpy = jasmine.createSpy('getStatsSpy').and.callFake(function() {
			return getStatsDeferred;
		});
		getStatsTsvHeaderSpy = jasmine.createSpy('getStatsHeaderSpy').and.callFake(function() {
			return "Fake Header";
		});
		getStatsFileNameSpy = jasmine.createSpy('getStatsFileNameSpy').and.callFake(function() {
			return "stats.tsv";
		});			
		testView = new NWC.view.StreamflowCalculateStatsView({
			el : $testDiv,
			years : null,
			gageId : '12345678',
			getStats : getStatsSpy,
			getStatsTsvHeader : getStatsTsvHeaderSpy,
			getStatsFilename : getStatsFileNameSpy
		});
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects view\'s constructor to set the context property', function() {
		expect(testView.context).toBeDefined();
		expect(testView.context.streamStatsOptions).toEqual(NWC.dictionary.statGroups);
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
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
		var getTemplateSpy;
		beforeEach(function() {
			getTemplateSpy = jasmine.createSpy('getTemplateSpy');

			NWC.templates = {
				'getTemplate' : getTemplateSpy
			};

			$('#as1').prop('checked', true);
		});

		it('Expects calculateStats to use streamStats.getStats to retrieve the statistics', function() {
			testView.calculateStats(eventSpy);

			expect(testView.getStats).toHaveBeenCalled();
			expect(testView.getStats.calls.argsFor(0)[0]).toEqual(['as1']);
			expect(testView.getStats.calls.argsFor(0)[1]).toEqual(NWC.util.WaterYearUtil.waterYearStart('1991'));
			expect(testView.getStats.calls.argsFor(0)[2]).toEqual(NWC.util.WaterYearUtil.waterYearEnd('1992'));
		});

		it('Expects the template to be rendered after the view\'s getStats function has been resolved', function() {
			var templateSpy = jasmine.createSpy('templateSpy');
			var statsResults = ['1', '2'];

			getTemplateSpy.and.returnValue(templateSpy);

			testView.calculateStats(eventSpy);
			expect(templateSpy).not.toHaveBeenCalled();

			getStatsDeferred.resolve(statsResults);
			expect(templateSpy).toHaveBeenCalledWith({streamflowStatistics : statsResults});
			expect(testView.streamflowStatistics).toEqual(statsResults);
		});
	});

	//TODO write test for creating tsv

	it('Expects downloadStats to save to the correct filename', function() {
		spyOn(window, 'saveAs');
		spyOn(window, 'Blob');
		spyOn(testView, 'getStatsTsv');
		testView.downloadStats(eventSpy);

		expect(testView.getStatsTsv).toHaveBeenCalledWith("Fake Header");
		expect(saveAs).toHaveBeenCalled();
		expect(saveAs.calls.argsFor(0)[1]).toMatch('stats.tsv');
	});
});