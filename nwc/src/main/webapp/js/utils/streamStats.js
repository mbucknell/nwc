var NWC = NWC || {};

NWC.util = NWC.util || {};

(function() {
	var resultsCouldNotBeObtained = function (response) {
		var msg = 'Process Completed, but there was an error retrieving the results';
		console.log.error(msg);
		alert(msg);
	};
	var resultsHaveBeenObtained = function (response, resultsUrl, callback) {
		var responseText = response.data;
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
			$log.error(message);
			alert(message);
		}
		else {
			var message = 'An error occurred during statistics calcuation';
			$log.error(message);
			$log.error(response);
			alert(message);
		}
	};
	var getResultOptions = function (callback) {
		return {
			success: function (resultsUrl, config) {
				//now that we have the results url, ajax-get the results.
				$http.get(NWC.util.wps.getProxyUrl(resultsUrl)).then(
					function (response) {
						resultsHaveBeenObtained(response, NWC.util.wps.getProxyUrl(resultsUrl), callback);
					},
					resultsCouldNotBeObtained
				);
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

			// need to add the http: back in
			var doc = NWC.util.wps.createWpsExecuteRequestDocument('org.n52.wps.server.r.stats_huc12_modeled',
				{
					'sites': siteIdsString,
					'startdate': startDateString,
					'enddate': endDateString,
					'stats': statTypesString,
					'sos': CONFIG.endpoint.direct.thredds + 'HUC12_data/HUC12_Q.nc',
					'observedProperty': 'MEAN_streamflow',
					'wfsUrl': CONFIG.endpoint.direct.geoserver + 'NWC/ows',
					'wfsTypename': 'NWC:huc12_SE_Basins_v2',
					'wfsFilterProperty': 'NWC:HUC12',
					'wfsAreaPropertyname': 'NWC:mi2'
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


			var doc = NWC.util.wps.createWpsExecuteRequestDocument('org.n52.wps.server.r.stats_nwis',
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


