/*global angular*/
(function () {
    var watchModule = angular.module('nwc.watch', ['nwc.util', 'nwc.conversion', 'nwc.rdbParser']);

    //using a map as a set (need fast membership checking later)
    var watchServiceNames = Object.extended();

//call this function with the same arguments that you would module.factory()
    var registerWatchFactory = function (watchServiceName, dependencyArray) {
        var finalName = 'nwc.watch.' + watchServiceName;
        if (watchServiceName.has(finalName)) {
            throw Error("Duplicate watch service name. You must register unique watch service names.");
        }
        else {
            watchServiceNames[finalName] = 1;
            watchModule.factory(finalName, dependencyArray);
        }
    };

    registerWatchFactory('hucId',
            ['$http', 'CommonState', 'SosSources', 'SosUrlBuilder', 'DataSeriesStore', 'SosResponseParser', '$q', '$log', 'DataSeries',
                function ($http, CommonState, SosSources, SosUrlBuilder, DataSeriesStore, SosResponseParser, $q, $log, DataSeries) {
                    return {
                        propertyToWatch: 'hucId',
                        watchFunction: function (prop, oldHucValue, newHucValue) {
                            //clear downstream state
                            CommonState.WaterUsageDataSeries = DataSeries.new();
                            var labeledAjaxCalls = [];
                            //grab the sos sources that will be used to display the initial data 
                            //series. ignore other data sources that the user can add later.
                            var initialSosSourceKeys = ['eta', 'dayMet'];
                            var initialSosSources = Object.select(SosSources, initialSosSourceKeys);
                            angular.forEach(initialSosSources, function (source, sourceId) {
                                var url = SosUrlBuilder.buildSosUrlFromSource(newHucValue, source);
                                var labeledAjaxCall = $http.get(url, {label: sourceId});
                                labeledAjaxCalls.push(labeledAjaxCall);
                            });

                            var sosError = function () {
                                //@todo - modal window this
                                var errorMessage = 'error retrieving time series data';
                                alert(errorMessage);
                                $log.error(errorMessage);
                                $log.error(arguments);
                            };
                            /**
                             * 
                             * @param {type} allAjaxResponseArgs all of the arguments normally passed to the individual callbacks of ajax calls
                             * @returns {undefined}
                             */
                            var sosSuccess = function (allAjaxResponseArgs) {
                                var self = this,
                                        errorsFound = false,
                                        labeledResponses = {},
                                        labeledRawValues = {};
                                $.each(allAjaxResponseArgs, function (index, ajaxResponseArgs) {
                                    var response = ajaxResponseArgs.data;
                                    if (!response || !response.length) {
                                        errorsFound = true;
                                        return false;//exit iteration
                                    }
                                    else {
                                        //the jqXHR object is the 3rd arg of response
                                        //the object has been augmented with a label property
                                        //by makeLabeledAjaxCall
                                        var label = ajaxResponseArgs.config.label;
                                        var rawValues = SosResponseParser.getValuesFromSosResponse(response);
                                        var parsedValues = SosResponseParser.parseSosResponseValues(rawValues);
                                        labeledRawValues[label] = rawValues;
                                        var labeledResponse = {
                                            metadata: {
                                                seriesName: SosSources[label].observedProperty,
                                                seriesUnits: SosSources[label].units
                                            },
                                            data: parsedValues
                                        };
                                        labeledResponses[label] = labeledResponse;
                                    }
                                });
                                if (errorsFound) {
                                    sosError.apply(self, allAjaxResponseArgs);
                                }
                                else {
                                    DataSeriesStore.updateHucSeries(labeledResponses);
                                    CommonState.DataSeriesStore.merge(DataSeriesStore);
                                    //boolean property is cheaper to watch than deep object comparison
                                    CommonState.newDataSeriesStore = true;
                                }
                            };
                            $q.all(labeledAjaxCalls).then(sosSuccess, sosError);
                            
                            return newHucValue;
                        }
                    };
                }
            ]);
    registerWatchFactory('countyInfo',
            [           '$http', 'CommonState', 'SosSources', 'SosUrlBuilder', 'DataSeriesStore', 'SosResponseParser', 'Convert', 'DataSeries', 'WaterBudgetPlot', 'StoredState', '$state', '$log',
                function ($http, CommonState, SosSources, SosUrlBuilder, DataSeriesStore, SosResponseParser, Convert, DataSeries, WaterBudgetPlot, StoredState, $state, $log) {
                    return {
                        propertyToWatch: 'countyInfo',
                        watchFunction: function (prop, oldCountyInfo, newCountyInfo) {

                            var offeringId = newCountyInfo.offeringId;
                            
                            var sosUrl = SosUrlBuilder.buildSosUrlFromSource(offeringId, SosSources.countyWaterUse);

                            var waterUseFailure = function (response) {
                                var url = response.config.url;
                                alert(
                                        'An error occurred while retrieving water use data from:\n' +
                                        url + '\n' +
                                        'See browser logs for details'
                                        );
                                $log.error('Error while accessing: ' + url + '\n' + response.data);
                            };

                            var waterUseSuccess = function (response) {
                                var data = response.data;
                                if (!data || data.has('exception') || data.has('error')) {
                                    waterUseFailure(response);
                                } else {
                                    var parsedTable = SosResponseParser.parseSosResponse(data);
                                    var countyAreaSqMiles = newCountyInfo.area;
                                    var countyAreaAcres = Convert.squareMilesToAcres(countyAreaSqMiles);
                                    var convertedTable = Convert.mgdTableToMmPerDayTable(parsedTable, countyAreaAcres);
                                    
                                    var waterUseDataSeries = DataSeries.new();
                                    waterUseDataSeries.data = convertedTable;

                                    //use the series metadata as labels
                                    var additionalSeriesLabels = SosSources.countyWaterUse.observedProperty.split(',');
                                    var waterUseValueLabelsOnly = waterUseDataSeries.metadata.seriesLabels.from(1);//skip the initial 'Date' label
                                    waterUseDataSeries.metadata.seriesLabels = waterUseValueLabelsOnly.concat(additionalSeriesLabels);

                                    CommonState.WaterUsageDataSeries = waterUseDataSeries;
                                    CommonState.newWaterUseData = true;
                                    $state.go('workflow.waterBudget.plotData');
                                }
                            };

                            $http.get(sosUrl).then(waterUseSuccess, waterUseFailure);

                            return newCountyInfo;
                        }
                    };
                }
            ]);
    var nwisBaseUrl = 'http://waterservices.usgs.gov/nwis/site/?';
    var getNwisQueryParams = function () {
        return {
            'format': 'rdb',
            'seriesCatalogOutput': 'true',
            'parameterCd': '00060',
            'outputDataTypeCd': 'dv'
        };
    };
    var startDateColName = 'begin_date';
    var endDateColName = 'end_date';
    
    /**
     * Replace '-' with '/' in date strings to prevent time-zone errors.
     * @param {String} dateStr
     * @returns {String}
     */
    var reformatDateStr = function(dateStr){
      return dateStr.replace(/-/g, '/');
    };
    var strToDate = function(dateStr){
        return new Date(dateStr);
    };
    /**
     * On gage change, query nwis for the start and end dates of that gage's relevant data.
     * Once obtained, stuff start and end dates into Common State as absolute minimums and maximums for the datepickers
     * Then navigate to the stat params form.
     */
    registerWatchFactory('gage', [
        '$http', 'CommonState', '$log', 'StreamStats', '$rootScope', 'StoredState', 'rdbParser', '$state',
        function ($http, CommonState, $log, StreamStats, $rootScope, StoredState, rdbParser, $state) {
            return {
                propertyToWatch: 'gage',
                //once a gage is selected, ask nwis what the relevant period of record is
                watchFunction: function (prop, oldValue, newGage) {
                    if (newGage !== undefined) {
                        //reset params
                        CommonState.streamFlowStatStartDate = undefined;
                        CommonState.streamFlowStatEndDate = undefined;

                        var siteId = newGage.data.STAID;
                        var params = getNwisQueryParams();
                        params.sites = siteId;
                        //@todo remove this in favor of SugarJS method once sugarjs webjar pull request upgrading version is accepted
                        var queryString = '';
                        var first = true;
                        for (var key in params) {
                            if (params.hasOwnProperty(key)) {
                                var value = params[key];
                                var appendVal = '';
                                if (first) {
                                    first = false;
                                } else {
                                    appendVal += '&';
                                }

                                appendVal += encodeURIComponent(key) + '=' + encodeURIComponent(value);
                                queryString += appendVal;
                            }
                        }
                        //var queryString = Object.toQueryString(params);
                        var url = nwisBaseUrl + queryString;


                        $http.get(url).then(
                                function (response) {
                                    var rdbTables = rdbParser.parse(response.data);
                                    if (!rdbTables.length) {
                                        throw Error('Error parsing NWIS series catalog output response');
                                    }
                                    var table = rdbTables[0];
                                    var startColumn = table.getColumnByName(startDateColName);
                                    startColumn = startColumn.map(reformatDateStr);
                                    startColumn = startColumn.map(strToDate);
                                    startColumn.sort(function (a, b) {
                                        return a - b;
                                    });
                                    var startDate = startColumn[0];

                                    var endColumn = table.getColumnByName(endDateColName);
                                    endColumn = endColumn.map(reformatDateStr);
                                    endColumn = endColumn.map(strToDate);
                                    endColumn.sort(function (a, b) {
                                        return a + b;
                                    });
                                    var endDate = endColumn[0];

                                    CommonState.streamFlowStatStartDate = startDate;
                                    CommonState.streamFlowStatEndDate = endDate;
                                    $state.go('workflow.streamflowStatistics.setSiteStatisticsParameters');
                                },
                                function (response) {
                                    var msg = 'An error occurred while asking NWIS web for the period of record for the selected site';
                                    $log.error(msg);
                                    alert(msg);
                                }
                        );
                    }
                    return newGage;
                }
            };
        }
    ]);

    registerWatchFactory('streamflowStatsParamsReady',
                        ['$http', 'CommonState', '$log', 'StreamStats', '$rootScope', 'StoredState',
                function ($http, CommonState, $log, StreamStats, $rootScope, StoredState) {
                    return {
                        propertyToWatch: 'streamflowStatsParamsReady',
                        watchFunction: function (prop, oldValue, streamFlowStatsParamsReady) {
                            if (streamFlowStatsParamsReady) {
                                //reset
                                CommonState.streamflowStatistics = [];
                                var newGage = StoredState.gage;
                                var newHuc = StoredState.streamFlowStatsHuc;
                                var startDate = StoredState.siteStatisticsParameters.startDate;
                                var endDate = StoredState.siteStatisticsParameters.endDate;
                                var callback = function(statistics, resultsUrl){
                                    CommonState.streamflowStatistics = statistics;
                                    CommonState.streamflowStatisticsUrl = resultsUrl;
                                };
                                var statTypes  = StoredState.siteStatisticsParameters.statGroups;
                                
                                if(newGage){
                                    var siteId = newGage.data.STAID;
                                    StreamStats.getSiteStats([siteId], statTypes, startDate, endDate, callback);
                                }
                                else if(newHuc){
                                    var hucId = newHuc.data.HUC12;
                                    StreamStats.getHucStats([hucId], statTypes, startDate, endDate, callback);
                                }
                                else{
                                    var msg = 'Error: Neither a HUC nor a gage is defined. Cannot continue computing statistics.';
                                    $log.error(StoredState.streamFlowStatsHuc);
                                    alert(msg);
                                }
                            }
                            return streamFlowStatsParamsReady;
                        }
                    };
                }
            ]
    );
            
        var allWatchServiceNames = watchServiceNames.keys();
        var dependencies = ['StoredState'].concat(allWatchServiceNames);
        
        var registerAllWatchers = function(){
            var StoredState = arguments[0];
            var watchServices = Array.create(arguments).from(1);//ignore storedState
            angular.forEach(watchServices, function(watchService){
                StoredState.watch(watchService.propertyToWatch, watchService.watchFunction);
            });
        };
        watchModule.run(dependencies.concat([registerAllWatchers]));

}());