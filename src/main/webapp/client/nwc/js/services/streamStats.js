/*global angular,CONFIG*/
(function () {
    var streamStats = angular.module('nwc.streamStats', []);

    streamStats.service('StreamStats', ['$http', '$log', 'wps',
        function ($http, $log, wps) {
            return {
                /**
                 * 
                 * @param {Array<String>} siteIds
                 * @param {Array<String>} statTypes, any of [GOF,GOFMonth,magnifSeven,magStat,flowStat,durStat,timStat,rateStat,otherStat]
                 * @param {Function} callback accepts two arguments, an array of statistics objects, and a String URL from which to obtain the results
                 * @returns {HttpPromise}
                 */
                getSiteStats: function (siteIds, statTypes, callback) {
                    var statTypesString = statTypes.join(',');
                    var siteIdsString = siteIds.join(',');
                    var doc = wps.createWpsExecuteRequestDocument('org.n52.wps.server.r.stats_nwis',
                    [
                        {
                            name: 'sites',
                            value: siteIdsString
                        }, 
                        {
                            name: 'startdate',
                            value: '1980-10-01'
                        }, 
                        {
                            name: 'enddate',
                            value: '2010-09-29'
                        }, 
                        {
                            name: 'stats',
                            value: statTypesString
                        }
                    ],
                    wps.defaultAsynchronousResponseForm
                );
                wps.executeAsynchronousRequest({
                        wpsRequestDocument : doc,
                        url: CONFIG.endpoint.wps,
                        maxNumberOfPolls: 15,
                        callbacks:{
                            result:{
                                success: function (response) {
                                    var responseText = response.responseText;
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
                                    var resultsUrl = this.resultsUrl;
                                    callback(statObjectArray, resultsUrl);
                                }
                            },
                            status:{
                                failure: function(response){
                                    if(this.statusPollCount === this.maxNumberOfPolls){
                                        var numSeconds = ((this.statusPollFrequency * this.statusPollCount)/1000).toFixed(0);
                                        var message = 'The server timed out after ' + this.statusPollCount + ' attempts (' + numSeconds + ' seconds).';
                                        console.error(message);
                                    }
                                }
                            }
                        }
                    });                
                }
            }
        }
    ]);
}());
