/* jslint browser: true */
/* global $ */
/* global CONFIG */

var NWC = NWC || {};

NWC.util = NWC.util || {};

/*
 * @param {Object} options
 *		@prop {String} hucId - ID of huc that we want modeled streamflow data
 *		@prop {Function} convertDateStrFnc (optional) - function takes the date string (YYYY-MM-DD) and returns an object representing
 *			the date. If not passed in the string is passed back as it is read from the service.
 *		@prop {Function} convertValueFnc (optional) - function takes a number and returns a number.
 *			Will be applied to each data value returned from the service. If not defined, the value is passed back as is
 * @returns Jquery.Promise
 *		@resolve - returns an array of measured streamflow. Each element in the array is a two element
 *			array where the first element is the UTC date string, the second element is the data. Note
 *			that the array could be empty.
 *		@reject - Returns a string describing the error.
 */
NWC.util.fetchModeledStreamflowData = function(options) {
	"use strict";

	var fetchDeferred = $.Deferred();
	var modeledQConfig = NWC.config.get('streamflow').huc12.attributes.variables.modeledQ;
	var sosUrl = modeledQConfig.getSosUrl(options.hucId);

	$.ajax({
		url : sosUrl,
		success : function(data) {
			var parsedTable = NWC.util.SosResponseFormatter.formatSosResponse(data);
			var convertedTable = parsedTable.map(function(row) {
				var result = row;
				if (options.convertDateStrFnc) {
					result[0] = options.convertDateStrFnc(row[0]);
				}
				if (options.convertValueFnc) {
					result[1] = options.convertValueFnc(row[1]);
				}
				return result;
			});
			fetchDeferred.resolve(convertedTable);
		},
		error : function(jqXHR, textStatus) {
			fetchDeferred.reject(textStatus);
		}
	});

	return fetchDeferred.promise();
};


