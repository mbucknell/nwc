/*global angular,CONFIG*/
(function () {
    var streamStats = angular.module('nwc.streamStats', []);

    var siteStatsXmlTemplate =
            '<?xml version="1.0" encoding="UTF-8"?>'
            + '<wps:Execute xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" service="WPS" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd">'
            + '  <ows:Identifier>org.n52.wps.server.r.stats_observed_all</ows:Identifier>'
            + '  <wps:DataInputs>'
            + '    <wps:Input>'
            + '      <ows:Identifier>sites</ows:Identifier>'
            + '      <wps:Data>'
            + '        <wps:LiteralData>${sites}</wps:LiteralData>'
            + '      </wps:Data>'
            + '    </wps:Input>'
            + '    <wps:Input>'
            + '      <ows:Identifier>startdate</ows:Identifier>'
            + '      <wps:Data>'
            + '        <wps:LiteralData>1980-10-01</wps:LiteralData>'
            + '      </wps:Data>'
            + '    </wps:Input>'
            + '    <wps:Input>'
            + '      <ows:Identifier>enddate</ows:Identifier>'
            + '      <wps:Data>'
            + '        <wps:LiteralData>2010-09-29</wps:LiteralData>'
            + '      </wps:Data>'
            + '    </wps:Input>'
            + '    <wps:Input>'
            + '      <ows:Identifier>stats</ows:Identifier>'
            + '      <wps:Data>'
            + '        <wps:LiteralData>${stats}</wps:LiteralData>'
            + '      </wps:Data>'
            + '    </wps:Input>'
            + '  </wps:DataInputs>'
            + '  <wps:ResponseForm>'
            + '      <wps:RawDataOutput mimeType="text/plain">'
            + '        <ows:Identifier>output</ows:Identifier>'
            + '      </wps:RawDataOutput>'
            + '  </wps:ResponseForm>'
            + '</wps:Execute>';

    streamStats.service('StreamStats', ['$http', '$log',
        function ($http, $log) {
            return {
                /**
                 * 
                 * @param {String} siteId
                 * @param {Array<String>} statTypes, any of [GOF,GOFMonth,magnifSeven,magStat,flowStat,durStat,timStat,rateStat,otherStat]
                 * @param {Function} callback accepts one argument, an array of statistics objects
                 * @returns {HttpPromise}
                 */
                getSiteStats: function (siteId, statTypes, callback) {
                    var statTypesString = statTypes.join(',');

                    //build the request document
                    //don't modify the template, get a fresh copy
                    var requestDocument = new String(siteStatsXmlTemplate);
                    requestDocument = requestDocument.replace("${sites}", siteId);
                    requestDocument = requestDocument.replace("${stats}", statTypesString);
                    $http.post(CONFIG.endpoint.wps, requestDocument).then(
                            function (response) {
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

                                callback(statObjectArray);
                            },
                            function (response) {
                                alert('There was an error retrieving the statistics. See browser console log for details.');
                                $log.error(response.data);
                            });
                }
            };
        }
    ]);

}());
