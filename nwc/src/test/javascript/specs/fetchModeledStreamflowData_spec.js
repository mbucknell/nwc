/* jslint browser: true */
/* global NWC */
/* global sinon */
/* global jasmine, expect */
/* global CONFIG */

describe('fetchModeledStreamflowData', function() {
	"use strict";
	var fakeServer;
	var successSpy, failSpy;

	var STREAMFLOW_DATA = '<om:ObservationCollection xmlns:om="http://www.opengis.net/om/1.0" xmlns:swe="http://www.opengis.net/swe/1.0">' +
		'<om:member>' +
		'<om:Observation>' +
		'<om:result>' +
		'<swe:values>' +
		'1980-10-01T00:00:00Z,1.16\n' +
		'1980-10-02T00:00:00Z,1.04\n' +
		'1980-10-03T00:00:00Z,0.93' +
		'</swe:values>' +
		'</om:result>' +
		'</om:Observation>' +
		'</om:member>' +
		'</om:ObservationCollection>';

	beforeEach(function() {
		fakeServer = sinon.fakeServer.create();
		successSpy = jasmine.createSpy('successSpy');
		failSpy = jasmine.createSpy('failSpy');

		window.CONFIG = {};
		CONFIG.endpoint = {
			thredds : 'http://fakethredds.com'
		};
	});

	afterEach(function() {
		fakeServer.restore();
	});

	it('Expects that the huc id will be part of the url parameters', function() {
		NWC.util.fetchModeledStreamflowData({
			hucId : '01234567'
		});

		expect(fakeServer.requests.length).toBe(1);
		expect(fakeServer.requests[0].url).toContain('offering=01234567');
	});

	it('Expects a failed request to reject the returned promise', function() {
		NWC.util.fetchModeledStreamflowData({
			hucId : '01234567'
		}).done(successSpy).fail(failSpy);
		fakeServer.respondWith([500, {'Content-Type' : 'text'}, 'Internal Server error']);
		fakeServer.respond();

		expect(successSpy).not.toHaveBeenCalled();
		expect(failSpy).toHaveBeenCalledWith('error');
	});

	it('Expects a successful request to return the data', function() {
		NWC.util.fetchModeledStreamflowData({
			hucId : '01234567'
		}).done(successSpy).fail(failSpy);
		fakeServer.respondWith([200, {'Content-Type' : 'application/xml'}, STREAMFLOW_DATA]);
		fakeServer.respond();

		expect(successSpy).toHaveBeenCalledWith([
			['1980/10/01',1.16],
			['1980/10/02',1.04],
			['1980/10/03',0.93]
		]);
		expect(failSpy).not.toHaveBeenCalled();
	});

	it('Expects that when the convertDateStrFnc is specified the returned data has the date transformed', function() {
		var convertDate = function(str) {
			return str.replace(/\//g, '-');
		};
		NWC.util.fetchModeledStreamflowData({
			hucId : '01234567',
			convertDateStrFnc : convertDate
		}).done(successSpy).fail(failSpy);
		fakeServer.respondWith([200, {'Content-Type' : 'application/xml'}, STREAMFLOW_DATA]);
		fakeServer.respond();

		expect(successSpy).toHaveBeenCalledWith([
			['1980-10-01',1.16],
			['1980-10-02',1.04],
			['1980-10-03',0.93]
		]);
		expect(failSpy).not.toHaveBeenCalled();
	});

	it('Expects that when the convertValueFnc is specified the returned data has the value transformed', function() {
		var double = function(num) {
			return num * 2;
		};
		NWC.util.fetchModeledStreamflowData({
			hucId : '01234567',
			convertValueFnc : double
		}).done(successSpy).fail(failSpy);
		fakeServer.respondWith([200, {'Content-Type' : 'application/xml'}, STREAMFLOW_DATA]);
		fakeServer.respond();

		expect(successSpy).toHaveBeenCalledWith([
			['1980/10/01',2.32],
			['1980/10/02',2.08],
			['1980/10/03',1.86]
		]);
		expect(failSpy).not.toHaveBeenCalled();
	});
});