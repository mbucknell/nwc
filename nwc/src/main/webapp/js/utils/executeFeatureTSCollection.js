/* jslint browser */

/* global Handlebars */
/* global $ */
/* global CONFIG */

var NWC = NWC || {};
NWC.util = NWC.util || {};

(function() {
	"use strict";

	var TEMPLATE_PATH = 'templates/xml/FeatureTimeSeriesCollection.xml';
	var loadTemplateDeferred = $.Deferred();
	$.ajax({
		url : TEMPLATE_PATH,
		dataType : 'text',
		method : 'GET',
		success : function(xmlTemplateText) {
			var templateWithoutWhitespace = xmlTemplateText.replace(/[\t\n]/g, '');
			var xmlTemplate = Handlebars.compile(templateWithoutWhitespace);
			loadTemplateDeferred.resolve(xmlTemplate);
		},
		error : function() {
			loadTemplateDeferred.reject('Unable to load xml template from ' + TEMPLATE_PATH);
		}
	});

	/*
	 * @param {Object} options
	 *		@prop {String representing a zulu time} startTime
	 *		@prop {String representing a zulu time} endTIme
	 *		@prop {String} threddsEndpoint
	 *		@prop {String} datasetURI
	 *		@prop {String} observedProperty
	 *		@prop {String} featureAttributesName
	 *		@prop {String} featureName
	 *		@prop {Array of String} featureValues
	 *	@returns Jquery promise
	 *		@resolve - when the GDP process has completed. Arguments will be two strings, the first is the url
	 *			where the the results can be retrieved, the second is the query string to send when retrieving results.
	 *		@reject - when the GDP process fails. Argument will be a text string describing the error that occurred.
	 *		@notify - A notify message will be sent each time the process status is queried. Argument will be
	 *			a string indicating the current status of the process.
	 */
	NWC.util.executeFeatureTSCollection = function(context) {
		var executeDeferred = $.Deferred();
		var processId;
		var intervalId;

		var processStatusMessage = function(xmlText) {
			var xmlDoc;
			var statusEl;

			if (!xmlText || xmlText === '') {
				executeDeferred.notify('RetrieveResultServlet returned empty response. Retrying');
			}

			xmlDoc = $.parseXML(xmlText);
			statusEl = NWC.util.findXMLNamespaceTags($(xmlDoc), 'wps:Status').children().get(0);
			switch (statusEl.tagName.toLowerCase()) {
				case 'wps:processaccepted':
					executeDeferred.notify('Download process is in the queue');
					break;
				case 'wps:processstarted':
					executeDeferred.notify('Download process is in progress');
					break;
				case 'wps:processsucceeded':
					if (intervalId) {
						window.clearInterval(intervalId);
					}
					var $output = NWC.util.findXMLNamespaceTags($(xmlDoc), 'wps:Output');
					var outputURL = NWC.util.findXMLNamespaceTags($output, 'wps:Reference').attr('href');
					var outputURLAndData = outputURL.split('?');
					executeDeferred.resolve(outputURLAndData[0], outputURLAndData[1]);
					break;
				case 'wps:processfailed':
					var $processFailed = NWC.util.findXMLNamespaceTags($(xmlDoc), 'wps:ProcessFailed');
					var exceptionText = NWC.util.findXMLNamespaceTags($processFailed, 'ows:ExceptionText').text();
					if (intervalId) {
						window.clearInterval(intervalId);
					}
					executeDeferred.reject('Process Failed: '  + exceptionText);
			}
		};

		console.log('Trying to load data for ' + context.featureValues.length + ' huc12s');

		loadTemplateDeferred.done(function(xmlTemplate) {
			$.ajax({
				url : CONFIG.endpoint.gdpWps + 'WebProcessingService',
				type : 'POST',
				data : xmlTemplate(context),
				processData : false,
				dataType : 'xml',
				contentType : 'text/xml'
			}).done(function(xml) {
				var $exceptionReport = NWC.util.findXMLNamespaceTags($(xml), 'ns:ExceptionReport');
				var $statusLocation = NWC.util.findXMLNamespaceTags($(xml), 'wps:ExecuteResponse').attr('statusLocation');

				if ($exceptionReport.length > 0) {
					executeDeferred.reject('Process initialization failed with exception report');
				}
				else {
					processId = $statusLocation.split('?')[1].split('id=')[1];

					// Poll to check the status of the process
					intervalId = window.setInterval(function() {
						$.ajax({
								url : CONFIG.endpoint.gdpWps +'RetrieveResultServlet',
							data : {id : processId},
							success : function(data, textStatus, jqXHR) {
								processStatusMessage(jqXHR.responseText);
							},
							error : function(jqXHR, errorThrown, errorMessage) {
								executeDeferred.reject('Process status: Status called falled with error ' + errorMessage);
							}
						});
					}, 5000);
				}
			}).fail(function(jqXHR, textStatus) {
				executeDeferred.reject('Initial WPS request has failed: ' + textStatus);
			});
		}).fail(function(text) {
			console.log(text);
			executeDeferred.reject(text);
		});

		return executeDeferred.promise();
	};
})();


