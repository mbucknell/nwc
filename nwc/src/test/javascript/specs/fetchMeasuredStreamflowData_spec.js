/* jslint browser: true */
/* global NWC */
/* global sinon */
/* global jasmine, expect*/
/* global CONFIG */

describe('fetchMeasuredStreamflowData', function() {
	"use strict";
	var fakeServer;
	var successSpy, failSpy;

	var STREAMFLOW_DATA = '<ns1:timeSeriesResponse xmlns:ns1="http://www.cuahsi.org/waterML/1.1/">' +
		'<ns1:timeSeries>' +
		'<ns1:values>' +
		'<ns1:value qualifiers="A" dateTime="1931-04-01T00:00:00.000">40</ns1:value>' +
		'<ns1:value qualifiers="A" dateTime="1931-04-02T00:00:00.000">37</ns1:value>' +
		'<ns1:value qualifiers="A" dateTime="1931-04-03T00:00:00.000">34</ns1:value>' +
		'</ns1:values>' +
		'</ns1:timeSeries>' +
		'</ns1:timeSeriesResponse>';

	beforeEach(function() {
		fakeServer = sinon.fakeServer.create();
		successSpy = jasmine.createSpy('successSpy');
		failSpy = jasmine.createSpy('failSpy');

		CONFIG = {};
		CONFIG.endpoint = {nwisStreamflow: 'http://dummynwisservice.com'};
	});

	afterEach(function() {
		fakeServer.restore();
	});

	it('Expects that the gage id will be part of the url parameters', function() {
		NWC.util.fetchMeasuredStreamflowData({
			gage : '01234567'
		});

		expect(fakeServer.requests.length).toBe(1);
		expect(fakeServer.requests[0].url).toContain(CONFIG.endpoint.nwisStreamflow);
		expect(fakeServer.requests[0].url).toContain('sites=01234567');
	});

	it('Expects that the startDate and endDate are in the url when specified as options', function() {
		NWC.util.fetchMeasuredStreamflowData({
			gage : '01234567',
			startDate : '1920-01-01',
			endDate : '2000-01-01'
		});

		expect(fakeServer.requests[0].url).toContain('startDT=1920-01-01');
		expect(fakeServer.requests[0].url).toContain('endDT=2000-01-01');
	});

	it('Expects a failed request to reject the returned promise', function() {
		NWC.util.fetchMeasuredStreamflowData({
			gage : '01234567'
		}).done(successSpy).fail(failSpy);
		fakeServer.respondWith([500, {'Content-Type' : 'text'}, 'Internal Server error']);
		fakeServer.respond();

		expect(successSpy).not.toHaveBeenCalled();
		expect(failSpy).toHaveBeenCalledWith('error');
	});

	it('Expects a successful request to return the data', function() {
		NWC.util.fetchMeasuredStreamflowData({
			gage : '01234567'
		}).done(successSpy).fail(failSpy);
		fakeServer.respondWith([200, {'Content-Type' : 'application/xml'}, STREAMFLOW_DATA]);
		fakeServer.respond();

		expect(successSpy).toHaveBeenCalledWith([
			['1931-04-01T00:00:00.000', 40],
			['1931-04-02T00:00:00.000', 37],
			['1931-04-03T00:00:00.000', 34]
		]);
		expect(failSpy).not.toHaveBeenCalled();
	});

	it('Expects the date returned to be parsed using the convertDateStrFnc when specified', function() {
		var convertTimeToDateStr = function(str) {
			var tokens = str.split('T');
			var newDateStr = tokens[0].replace(/-/g, '/');
			newDateStr = newDateStr.trim();
			return newDateStr;
		};
		NWC.util.fetchMeasuredStreamflowData({
			gage : '01234567',
			convertDateStrFnc : convertTimeToDateStr
		}).done(successSpy).fail(failSpy);
		fakeServer.respondWith([200, {'Content-Type' : 'application/xml'}, STREAMFLOW_DATA]);
		fakeServer.respond();

		expect(successSpy).toHaveBeenCalledWith([
			['1931/04/01', 40],
			['1931/04/02', 37],
			['1931/04/03', 34]
		]);
		expect(failSpy).not.toHaveBeenCalled();
	});

	it('Expects the value returned to be converted using the convertValeuFnc', function() {
		var convertValueFnc = function(num) {
			return num * 2;
		};
		NWC.util.fetchMeasuredStreamflowData({
			gage : '01234567',
			convertValueFnc : convertValueFnc
		}).done(successSpy).fail(failSpy);
		fakeServer.respondWith([200, {'Content-Type' : 'application/xml'}, STREAMFLOW_DATA]);
		fakeServer.respond();

		expect(successSpy).toHaveBeenCalledWith([
			['1931-04-01T00:00:00.000', 80],
			['1931-04-02T00:00:00.000', 74],
			['1931-04-03T00:00:00.000', 68]
		]);
		expect(failSpy).not.toHaveBeenCalled();
	});
});