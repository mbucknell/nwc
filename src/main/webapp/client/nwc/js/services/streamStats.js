/*global angular,CONFIG*/
(function () {
    var streamStats = angular.module('nwc.streamStats', []);
    var streamStatsDateFormat = '{yyyy}-{MM}-{dd}';
    streamStats.service('StreamStats', ['$http', '$log', 'wps',
        function ($http, $log, wps) {
            return {
                /**
                 * 
                 * @param {Array<String>} siteIds
                 * @param {Array<String>} statTypes any of [GOF,GOFMonth,magnifSeven,magStat,flowStat,durStat,timStat,rateStat,otherStat]
                 * @param {Date} startDate the start of the period for which to calculate statistics
                 * @param {Date} endDate the start of the period for which to calculate statistics
                 * @param {Function} callback accepts two arguments, an array of statistics objects, and a String URL from which to obtain the results
                 * @returns {HttpPromise}
                 */
                getSiteStats: function (siteIds, statTypes, startDate, endDate, callback) {
                    //reformat params into strings for the wps call
                    var statTypesString = statTypes.join(',');
                    var siteIdsString = siteIds.join(',');
                    var startDateString = startDate.format(streamStatsDateFormat);
                    var endDateString = endDate.format(streamStatsDateFormat);
                    
                    
                    var doc = wps.createWpsExecuteRequestDocument('org.n52.wps.server.r.stats_nwis',
                    [
                        {
                            name: 'sites',
                            value: siteIdsString
                        }, 
                        {
                            name: 'startdate',
                            value: startDateString
                        }, 
                        {
                            name: 'enddate',
                            value: endDateString
                        }, 
                        {
                            name: 'stats',
                            value: statTypesString
                        }
                    ],
                    wps.getDefaultAsynchronousResponseForm()
                );
                var resultsHaveBeenObtained = function (response, resultsUrl) {
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
                            value: values[nameIndex]//parallel array
                        });
                    });
                    callback(statObjectArray, resultsUrl);
                };
                    var resultsCouldNotBeObtained = function (response) {
                    var msg = 'Process Completed, but there was an error retrieving the results';
                    $log.error(msg);
                    alert(msg);
                };
        
                wps.executeAsynchronousRequest({
                        wpsRequestDocument : doc,
                        url: CONFIG.endpoint.wps,
                        result:{
                            success: function (resultsUrl, config) {
                                //now that we have the results url, ajax-get the results.
                                $http.get(resultsUrl).then(
                                    function(response){
                                        resultsHaveBeenObtained(response, resultsUrl);
                                    },
                                    resultsCouldNotBeObtained
                                );
                            }
                        },
                        status:{
                            maxNumberOfPolls: 60,
                            failure: function(response, pollCount, processStatus, statusUrl, config){
                                if(pollCount === config.status.maxNumberOfPolls){
                                    var numSeconds = ((config.status.pollFrequency * pollCount)/1000).toFixed(0);
                                    var message = 'The server timed out after ' + pollCount + ' attempts (' + numSeconds + ' seconds).';
                                    $log.error(message);
                                    alert(message);
                                }
                            }
                        }
                    });                
                }
            }
        }
    ]);
}());
