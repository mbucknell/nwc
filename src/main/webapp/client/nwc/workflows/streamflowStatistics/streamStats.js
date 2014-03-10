/*global angular,CONFIG*/
(function () {
    var streamStats = angular.module('nwc.streamStats', []);
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


    streamStats.service('StreamStats', ['$http', '$log', 'wps', 'statDict',
        function ($http, $log, wps, statDict) {
            var resultsCouldNotBeObtained = function (response) {
                var msg = 'Process Completed, but there was an error retrieving the results';
                $log.error(msg);
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
                        desc: statDict[name]
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
                        $http.get(resultsUrl).then(
                            function (response) {
                                resultsHaveBeenObtained(response, resultsUrl, callback);
                            },
                            resultsCouldNotBeObtained
                        );
                    }
                };
            };
            var statusOptions = {
                maxNumberOfPolls: 60,
                failure: statusFailure
            };

            return {
                getAllStatTypes: function () {
                    return ["magnifSeven", "magStat", "flowStat", "durStat", "timStat", "rateStat"];
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

                    var doc = wps.createWpsExecuteRequestDocument('org.n52.wps.server.r.stats_huc12_modeled',
                                    {
                                        'sites': siteIdsString,
                                        'startdate': startDateString,
                                        'enddate': endDateString,
                                        'stats': statTypesString,
                                        'sos': CONFIG.endpoint.thredds + 'HUC12_data/HUC12_Q.nc',
                                        'observedProperty': 'MEAN_streamflow',
                                        'wfsUrl': CONFIG.endpoint.geoserver + 'NHDPlusHUCs/ows',
                                        'wfsTypename': 'NHDPlusHUCs:huc12_SE_Basins_v2',
                                        'wfsFilterProperty': 'NHDPlusHUCs:HUC12',
                                        'wfsAreaPropertyname': 'NHDPlusHUCs:mi2'
                                    },
                                    wps.getDefaultAsynchronousResponseForm()
                                    );
                            wps.executeAsynchronousRequest({
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


                            var doc = wps.createWpsExecuteRequestDocument('org.n52.wps.server.r.stats_nwis',
                                {
                                    'sites': siteIdsString,
                                    'startdate': startDateString,
                                    'enddate': endDateString,
                                    'stats': statTypesString
                                },
                                wps.getDefaultAsynchronousResponseForm()
                            );
                            wps.executeAsynchronousRequest({
                                wpsRequestDocument: doc,
                                url: CONFIG.endpoint.wps,
                                result: getResultOptions(callback),
                                status: statusOptions
                            });
                        }
                    };
                }
            ]);
}());
