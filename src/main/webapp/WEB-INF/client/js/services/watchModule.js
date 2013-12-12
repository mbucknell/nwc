/*global angular*/
(function () {
    var watchModule = angular.module('nwc.watch', ['nwc.util']);
//using null-value map as a set (need fast membership checking later)
    var watchServiceNames = Object.extended();

//this service provides a way to inject the names of all other stored state watch services into a controller
    watchModule.provider('storedStateWatchers', function () {
        this.$get = function () {
            return watchServiceNames.keys();
        };
    });

//call this function with the same arguments that you would module.factory()
    var registerWatchFactory = function (watchServiceName, dependencyArray) {
        var finalName = 'nwc.watch.' + watchServiceName;
        if (watchServiceName.has(finalName)) {
            throw Error("Duplicate watch service name. You must register unique watch service names.");
        }
        else {
            watchServiceNames[finalName] = null;
            watchModule.factory(finalName, dependencyArray);
        }
    };

    registerWatchFactory('hucId',
            ['$http', 'CommonState', 'ajaxUtils', 'SosSources', 'SosUrlBuilder', 'DataSeriesStore', 'SosResponseParser',
                function ($http, CommonState, ajaxUtils, SosSources, SosUrlBuilder, DataSeriesStore, SosResponseParser) {
                    return {
                        propertyToWatch: 'hucId',
                        watchFunction: function (prop, oldHucValue, newHucValue) {
                            var labeledAjaxCalls = [];

                            //grab the sos sources that will be used to display the initial data 
                            //series. ignore other data sources that the user can add later.
                            var initialSosSourceKeys = ['eta', 'dayMet'];
                            var initialSosSources = Object.select(SosSources, initialSosSourceKeys);
                            angular.forEach(initialSosSources, function (source, sourceId) {
                                var url = SosUrlBuilder.buildSosUrlFromSource(newHucValue, source);
                                var labeledAjaxCall = ajaxUtils.makeLabeledAjaxCall(sourceId, url);
                                labeledAjaxCalls.push(labeledAjaxCall);
                            });

                            var sosError = function () {
                                //@todo - modal window this
                                alert('error retrieving time series data');
                                console.dir(arguments);
                            };

                            var sosSuccess = function () {
                                //all of the arguments normally passed to the individual callbacks of ajax calls
                                var allAjaxResponseArgs = arguments;
                                var self = this,
                                        errorsFound = false,
                                        labeledResponses = {},
                                        labeledRawValues = {};
                                $.each(allAjaxResponseArgs, function (index, ajaxResponseArgs) {
                                    var response = ajaxResponseArgs[0];
                                    if (null === response) {
                                        errorsFound = true;
                                        return false;//exit iteration
                                    }
                                    else {
                                        //the jqXHR object is the 3rd arg of response
                                        //the object has been augmented with a label property
                                        //by makeLabeledAjaxCall
                                        var jqXHR = ajaxResponseArgs[2],
                                                label = jqXHR.label;
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
                                    self.sosError.apply(self, allAjaxResponseArgs);
                                }
                                else {
                                    DataSeriesStore.updateHucSeries(labeledResponses);
                                    console.dir(DataSeriesStore);
                                }
                            };

                            $.when.apply(self, labeledAjaxCalls).then(
                                    sosSuccess,
                                    sosError
                                    );

                            return newHucValue;
                        }
                    };
                }
            ]);

}());