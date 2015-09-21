/*jslint browser: true */


var NWC = NWC || {};

NWC.util = NWC.util || {};

(function() {
	"use strict";

	var streamStatsDateFormat = '{yyyy}-{MM}-{dd}';
    var statTypesToString = function (statTypes) {
        return statTypes.join(',');
    };
    var siteIdsToString = function (siteIds) {
        return siteIds.join(',');
    };
    var dateToString = function (date) {
        return date.format(streamStatsDateFormat);
    };

	var resultsCouldNotBeObtained = function (response) {
		var msg = 'Process Completed, but there was an error retrieving the results';
		alert(msg);
	};
	var resultsHaveBeenObtained = function (responseText, resultsUrl, callback) {
		var statArray = responseText.split('\n');
		statArray = statArray.map(function (row) {
			return row.split('\t');
		});
		var namesIndex = 0;
		var valuesIndex = 1;
		var names = statArray[namesIndex];
		var values = statArray[valuesIndex];

		var statObjectArray = [];
		names.each(function (name, nameIndex) {
			statObjectArray.push({
				name: name,
				value: values[nameIndex],//parallel array
				desc: NWC.dictionary.statDict[name]
			});
		});
		callback(statObjectArray, resultsUrl);
	};
	var statusFailure = function (response, pollCount, processStatus, statusUrl, config) {
		if (pollCount === config.status.maxNumberOfPolls) {
			var numSeconds = ((config.status.pollFrequency * pollCount) / 1000).toFixed(0);
			var message = 'The server timed out after ' + pollCount + ' attempts (' + numSeconds + ' seconds).';
			alert(message);
		}
		else {
			var message = 'An error occurred during statistics calcuation';
			alert(message);
		}
	};
	var getResultOptions = function (callback) {
		return {
			success: function (resultsUrl, config) {
				//now that we have the results url, ajax-get the results.
				$.ajax({
					url : NWC.util.wps.getProxyUrl(resultsUrl),
					success: function (response) {
						resultsHaveBeenObtained(response, NWC.util.wps.getProxyUrl(resultsUrl), callback);
					},
					error: resultsCouldNotBeObtained
				});
			}
		};
	};
	// ~ 1 hr
	var statusOptions = {
		pollFrequency: 5000,
		maxNumberOfPolls: 720,
		failure: statusFailure
	};

	NWC.util.streamStats = {
		getAllStatTypes: function () {
			return NWC.dictionary.statGroups;
		},
		/**
		 *
		 * @param {Array<String>} hucIds
		 * @param {Array<String>} statTypes any of [magnifSeven,magStat,flowStat,durStat,timStat,rateStat]
		 * @param {Date} startDate the start of the period for which to calculate statistics
		 * @param {Date} endDate the start of the period for which to calculate statistics
		 * @param {Function} callback accepts two arguments, an array of statistics objects, and a String URL from which to obtain the results
		 */
		getHucStats: function (hucIds, statTypes, startDate, endDate, callback) {
			//reformat params into strings for the wps call
			var statTypesString = statTypesToString(statTypes);
			var siteIdsString = siteIdsToString(hucIds);
			var startDateString = dateToString(startDate);
			var endDateString = dateToString(endDate);

			var hucStatsWpsService = NWC.config.get('streamflow').huc12.attributes.variables.statsWpsService;

			// need to add the http: back in
			var doc = NWC.util.wps.createWpsExecuteRequestDocument(hucStatsWpsService.identifier,
				{
					'sites': siteIdsString,
					'startdate': startDateString,
					'enddate': endDateString,
					'stats': statTypesString,
					'sos': CONFIG.endpoint.direct.thredds + hucStatsWpsService.sos,
					'observedProperty': hucStatsWpsService.observedProperty,
					'wfsUrl': CONFIG.endpoint.direct.geoserver + 'ows',
					'wfsTypename': hucStatsWpsService.wfsTypename,
					'wfsFilterProperty': hucStatsWpsService.wfsFilterProperty,
					'wfsAreaPropertyname': hucStatsWpsService.wfsAreaPropertyname
				},
				NWC.util.wps.getDefaultAsynchronousResponseForm()
			);
			NWC.util.wps.executeAsynchronousRequest({
				wpsRequestDocument: doc,
				url: CONFIG.endpoint.wps,
				result: getResultOptions(callback),
				status: statusOptions
			});
		},
		/**
		 *
		 * @param {Array<String>} siteIds
		 * @param {Array<String>} statTypes any of [magnifSeven,magStat,flowStat,durStat,timStat,rateStat]
		 * @param {Date} startDate the start of the period for which to calculate statistics
		 * @param {Date} endDate the start of the period for which to calculate statistics
		 * @param {Function} callback accepts two arguments, an array of statistics objects, and a String URL from which to obtain the results
		 */
		getSiteStats: function (siteIds, statTypes, startDate, endDate, callback) {
			//reformat params into strings for the wps call
			var statTypesString = statTypesToString(statTypes);
			var siteIdsString = siteIdsToString(siteIds);
			var startDateString = dateToString(startDate);
			var endDateString = dateToString(endDate);


			var doc = NWC.util.wps.createWpsExecuteRequestDocument(NWC.config.get('streamflow').gage.attributes.variables.statsWpsService.identifier,
				{
					'sites': siteIdsString,
					'startdate': startDateString,
					'enddate': endDateString,
					'stats': statTypesString
				},
				NWC.util.wps.getDefaultAsynchronousResponseForm()
			);
			NWC.util.wps.executeAsynchronousRequest({
				wpsRequestDocument: doc,
				url: CONFIG.endpoint.wps,
				result: getResultOptions(callback),
				status: statusOptions
			});
		}

	};

}());


