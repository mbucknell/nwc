describe('Tests for AquaticBiologySelectFeaturesView', function() {
	var $testDiv;
	var testView;

	beforeEach(function() {
		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="site-selection-text"><div id="pair-list"><div></div></div></div>')
		$testDiv.append ('<div id="sites-table-div"><input type="checkbox" id="as1" name="as1" value="as1"/><input type="checkbox" id="allSelected" name="allSelected"/>');
		$testDiv.append('<button id="biodata-form-button" disabled="disabled" class="btn btn-success"></button>');
		$testDiv.append('<table class="sites-table">');
		$testDiv.append('<tr><td><input type="checkbox" class="sites" id="as2" name="as2" value="as2"/></td></tr>');
		$testDiv.append('<tr><td><input type="checkbox" class="sites" id="as3" name="as3" value="as3"/></td></tr>');
		$testDiv.append('</table></div>');
		
		spyOn(NWC.view.BaseView.prototype, 'initialize');
		eventSpy = jasmine.createSpyObj('eventSpy', ['preventDefault']);
		spyOn(NWC.view.BiodataGageMapView.prototype, 'initialize');
		
		testView = new NWC.view.AquaticBiologySelectFeaturesView({
			model : new NWC.model.AquaticBiologyFeaturesModel({
				sites : ["1","2","3","4","5"],
				hucs : ["21312","23234","34534534"],
				gages : ["5434","4354","34543"],
				selected : [],
				pairs : []
			})
		});
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects view\'s constructor to set the context property', function() {
		expect(testView.context).toBeDefined();
		expect(testView.context.biodataSites).toEqual(["1","2","3","4","5"]);
        expect(testView.context.gages).toEqual(["5434","4354","34543"]);
        expect(testView.context.hucs).toEqual(["21312","23234","34534534"]);
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expects view.checkboxChanged to enable the biodata form button if any of the site checkboxes have been checked', function() {
		$('#as1').prop('checked', true);
		testView.checkboxChanged({
			evt : eventSpy,
			target : document.getElementById('as1')});
		expect($('#biodata-form-button').prop('disabled')).toBe(false);

		$('#as1').prop('checked', false);
		testView.checkboxChanged({
			evt : eventSpy,
			target : document.getElementById('as1')});
		expect($('#biodata-form-button').prop('disabled')).toBe(true);
	});
        
	it('Expects view.checkboxChanged to add or remove checkbox name to selected array', function() {
		$('#as1').prop('checked', true);
		testView.checkboxChanged({
			evt : eventSpy,
			target : document.getElementById('as1')});
		expect(testView.model.get('selected')).toEqual(['as1']);
                
		$('#as1').prop('checked', false);
		testView.checkboxChanged({
			evt : eventSpy,
			target : document.getElementById('as1') });
		expect(testView.model.get('selected')).toEqual([]);
	});
    
	it('Expects model.associatePairs to add or remove site and gage pairs to pairs array', function(){
		testView.model.associatePairs('123', '567', 'add');
		expect(testView.model.get('pairs')).toEqual([{site_id : '123', gage_id: '567'}]);

		testView.model.associatePairs('123', '567', 'remove');
		expect(testView.model.get('pairs')).toEqual([]);

		testView.model.associatePairs('123', '567', 'add');
		testView.model.associatePairs('abc', '567', 'add');
		testView.model.associatePairs('123', 'def', 'add');
		testView.model.associatePairs('123', '567', 'remove');
		var goodPair = { site_id: '123', gage_id: 'def' };
		expect(testView.model.get('pairs')).toContain(goodPair);
		goodPair = { site_id: 'abc', gage_id: '567' };
		expect(testView.model.get('pairs')).toContain(goodPair);
		var badPair = { site_id: '123', gage_id: '567' };
		expect(testView.model.get('pairs')).not.toContain(badPair);
	});
	
	it('Expects a displayPairList to display the correct pairs', function(){
		testView.model.associatePairs('333', '999', 'add');
		testView.displayPairList();
		expect($('#pair-list div').html()).toMatch(/Site ID: 333/);
		expect($('#pair-list div').html()).toMatch(/Gage ID: 999/);
		testView.model.associatePairs('333', '999', 'remove');
		testView.displayPairList();
		expect($('#pair-list div').html()).not.toMatch(/Site ID: 333/);
		expect($('#pair-list div').html()).not.toMatch(/Gage ID: 999/);
	});
});