describe('Tests for NWC.view.BaseStreamflowStatsDataView', function() {
	var $testDiv;
	var testView;

	beforeEach(function() {
		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="available-statistics"><input id="as1" value="as1" type="checkbox"/><input id="as2" value="as2" type="checkbox"/></div>');
		$testDiv.append('<button id="calculate-stats-button"></button>');
		$testDiv.append('<select id="start-year"><option value="1991"></option></select>');
		$testDiv.append('<select id="end-year"><option value="1992"></option></select');

		spyOn(NWC.view.BaseView.prototype, 'initialize');

		eventSpy = jasmine.createSpyObj('eventSpy', ['preventDefault']);

		testView = new NWC.view.BaseStreamflowStatsDataView();
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
		var getStatsDeferred;
		beforeEach(function() {
			getTemplateSpy = jasmine.createSpy('getTemplateSpy');

			NWC.templates = {
				'getTemplate' : getTemplateSpy
			};
			getStatsDeferred = $.Deferred();
			spyOn(testView, 'getStats').andCallFake(function() {
				return getStatsDeferred;
			});

			$('#as1').prop('checked', true);
		});

		it('Expects calculateStats to use streamStats.getStats to retrieve the statistics', function() {
			testView.calculateStats(eventSpy);

			expect(testView.getStats).toHaveBeenCalled();
			expect(testView.getStats.calls[0].args[0]).toEqual(['as1']);
			expect(testView.getStats.calls[0].args[1]).toEqual(NWC.util.WaterYearUtil.waterYearStart('1991'));
			expect(testView.getStats.calls[0].args[2]).toEqual(NWC.util.WaterYearUtil.waterYearEnd('1992'));
		});

		it('Expects the template to be rendered after the view\'s getStats function has been resolved', function() {
			var templateSpy = jasmine.createSpy('templateSpy');
			var statsResults = ['1', '2'];

			getTemplateSpy.andReturn(templateSpy);

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
		spyOn(testView, 'getStatsTsvHeader').andCallFake(function() {
			return "Fake Header";
		});
		spyOn(testView, 'getStatsTsv');
		testView.downloadStats(eventSpy);

		expect(testView.getStatsTsv).toHaveBeenCalledWith("Fake Header");
		expect(saveAs).toHaveBeenCalled();
		expect(saveAs.calls[0].args[1]).toMatch('stats.tsv');
	});
});