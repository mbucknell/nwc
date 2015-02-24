describe('Tests for templateLoader', function() {
	var loader, server;
	beforeEach(function() {
		loader = NWC.util.templateLoader();

		server = sinon.fakeServer.create();
	});

	afterEach(function() {
		server.restore();
	});

	it('Tests if loader is created', function() {
		expect(loader.getTemplate).toBeDefined();
		expect(loader.loadTemplates).toBeDefined();
	});

	it('Expects getTemplate to return null if no templates have been loaded', function() {
		expect(loader.getTemplate('home')).toBeNull();
	});

	it('Expects loadTemplate to return a deferred', function() {
		var loadSpy = jasmine.createSpy('loadSpy');
		spyOn($, 'ajax').andCallThrough();
		loader.loadTemplates(['home', 'next']).always(loadSpy);
		expect($.ajax.calls.length).toBe(2);
		expect($.ajax.calls[0].args[0].url).toMatch('home.html');
		expect($.ajax.calls[1].args[0].url).toMatch('next.html');
		expect(loadSpy).not.toHaveBeenCalled();
	});

	it('Expects loadTemplate to be resolved if the ajax calls where completed', function() {
		var loadSpy = jasmine.createSpy('loadSpy');
		server.respondWith('templates/home.html', [200, {"Content-Type" : "text/html"}, "Home content"]);
		server.respondWith('templates/next.html', [200, {"Content-Type" : "text/html"}, "Next content"]);

		loader.loadTemplates(['home', 'next']).always(loadSpy);
		server.respond();

		expect(loadSpy).toHaveBeenCalled();
		expect(loader.getTemplate('home')).not.toBeNull();
		expect(loader.getTemplate('next')).not.toBeNull();
	});
});

