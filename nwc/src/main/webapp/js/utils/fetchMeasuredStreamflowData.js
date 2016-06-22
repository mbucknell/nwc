/* jslint browser: true */
/* global $ */
/* global CONFIG */

var NWC = NWC || {};

NWC.util = NWC.util || {};

/*
 * @param {Object} options
 *		@prop {String} gage - ID of gage that we want measured streamflow data
 *		@prop {String} startDate (optional) - format is YYYY-MM-DD
 *		@prop {String} endDate (optional) - format is YYYY-MM-DD
 *		@prop {Function} convertDateStrFnc (optional) - function takes the date string and returns an object representing
 *			the date. If not passed in the string is passed back as it is read from the service.
 *		@prop {Function} convertValueFnc (optional) - function takes a number and returns a number.
 *			Will be applied to each data value returned from the service. If not defined, the value is passed back as is
 *	@returns Jquery.Promise
 *		@resolve - returns an array of measured streamflow. Each element in the array is a two element
 *			array where the first element is the UTC date string, the second element is the data. Note
 *			that the array could be empty.
 *		@reject - Returns a string describing the error.
 */
NWC.util.fetchMeasuredStreamflowData = function(options) {
	"use strict";
	var fetchDeferred = $.Deferred();
	var streamflowGageConfig = NWC.config.get('streamflow').gage.attributes.variables;
	var params = $.extend({}, streamflowGageConfig.nwisStreamFlowData.queryParams, {
		sites : options.gage
	});

	if (options.startDate) {
		params.startDT = options.startDate;
	}
	if (options.endDate) {
		params.endDT = options.endDate;
	}

	$.ajax({
		url : CONFIG.endpoint.nwisStreamflow,
		data : params,
		method : 'GET',
		success : function(response) {
			var dataTable = [];

			NWC.util.findXMLNamespaceTags($(response), 'ns1:value').each(function() {
				var date = $(this).attr('dateTime');
				var value = parseFloat($(this).text());
				if (options.convertDateStrFnc) {
					date = options.convertDateStrFnc(date);
				}

				if (-999999 === value) {
					value = Number.NaN;
				}
				else if (options.conversionFnc) {
					value = options.conversionFnc(value);
				}
				dataTable.push([date, value]);
			});

			fetchDeferred.resolve(dataTable);
		},
		error : function(jqXHR, textStatus) {
			fetchDeferred.reject(textStatus);
		}
	});

	return fetchDeferred.promise();
};



