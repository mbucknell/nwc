describe('Tests for NWC.BaseView', function() {
	var templateSpy;

	beforeEach(function() {
		templateSpy = jasmine.createSpy('templateSpy');

		$('body').append('<div id="test-div"><div id="warning-modal" class="modal">' +
			'<div class="modal-body">Default warning test</div>' +
			'</div>');
	});

	afterEach(function() {
		$("#test-div").remove();
	});

	it('Expects a context property to be used when rendering a view', function() {
		var NewView = NWC.view.BaseView.extend({
			context : {a : 'this'}
		});
		var view = new NewView({
			template : templateSpy
		});
		expect(templateSpy).toHaveBeenCalledWith({a : 'this'});
	});

	it('Expects a context option to be added to the context property', function() {
		var NewView = NWC.view.BaseView.extend({
			context : {a : 'this'}
		});
		var view = new NewView({
			context : {b : 'that'},
			template : templateSpy
		});
		expect(view.context).toEqual({a : 'this', b : 'that'});
		expect(templateSpy).toHaveBeenCalledWith({a : 'this', b : 'that'});
	});

	it('Expects showWarningDialog to show the warning message', function() {
		var NewView = NWC.view.BaseView.extend({
			context : {a : 'this'}
		});
		var view = new NewView({
			template : templateSpy
		});
		var $warningModal = $('#warning-modal');
		spyOn($.fn, 'modal');

		view.showWarningDialog();
		expect($warningModal.find('.modal-body').html()).toEqual('Default warning test');
		expect($warningModal.modal).toHaveBeenCalledWith('show');

		view.showWarningDialog("New message");
		expect($warningModal.find('.modal-body').html()).toEqual('New message');
		expect($warningModal.modal).toHaveBeenCalledWith('show');
	});

	it('Expects setButtonActive to add or remove the active class', function() {
		$('body').append('<button id="test-button"></button>');
		var NewView = NWC.view.BaseView.extend({
			context : {a : 'this'}
		});
		var view = new NewView({
			template : templateSpy
		});

		var $button = $('#test-button');

		view.setButtonActive($button, true);
		expect($button.hasClass('active')).toBe(true);

		view.setButtonActive($button, false);
		expect($button.hasClass('active')).toBe(false);

		$button.remove();
	});

	it('Expects setVisibility to set the visiblity of the element', function() {

		var NewView = NWC.view.BaseView.extend({
			context : {a : 'this'}
		});
		var view = new NewView({
			template : templateSpy
		});

		var $testDiv = $('#test-div');

		expect($testDiv.is(':visible')).toBe(true);
		view.setVisibility($testDiv, false);
		expect($testDiv.is(':visible')).toBe(false);
		view.setVisibility($testDiv, true);
		expect($testDiv.is(':visible')).toBe(true);
	});


});