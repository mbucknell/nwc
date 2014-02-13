/*global angular,OpenLayers*/
(function () {
    var wps = angular.module('nwc.wps', []);
    wps.service('wps', [
        function () {
            var defaultResultIdentifier = 'output';
            var defaultStatusIdentifier = 'statusLocation';
            var exports = {};
            exports.defaultResultIdentifier = defaultResultIdentifier;
            exports.defaultStatusIdentifier = defaultStatusIdentifier;
            exports.defaultSynchronousResponseForm = {
                'rawDataOutput': {
                    'identifier': defaultResultIdentifier
                }
            };
            exports.defaultAsynchronousResponseForm = {
                responseDocument: {
                    storeExecuteResponse: 'true',
                    status: 'true',
                    output: {
                        asReference: true,
                        mimeType: 'text/plain',
                        identifier: defaultResultIdentifier
                    }
                }
            };

            /**
             * 
             * @param {String} processId String identifying the WPS request
             * @param {Array} dataInputs - array of objects {'name' : xxx, 'value' : xxx}
             * @param {Object} responseForm optional object describing response format- for example:
             {
             'rawDataOutput': {
             'identifier': 'result'
             }
             }
             * @returns {String} Return the request XML as a string
             */
            exports.createWpsExecuteRequestDocument = function (processId, dataInputs, responseForm) {
                responseForm = responseForm || exports.defaultSynchronousResponseForm;
                var formattedData = [];
                for (var i = 0; i < dataInputs.length; i++) {
                    formattedData.push(
                            {
                                'identifier': dataInputs[i].name,
                                'data': {
                                    'literalData': {
                                        'value': dataInputs[i].value
                                    }
                                }
                            }
                    );
                }
                var requestDocument = new OpenLayers.Format.WPSExecute().write({
                    'identifier': processId,
                    'dataInputs': formattedData,
                    'responseForm': responseForm
                });
                return requestDocument;
            };

            var defaultExecuteAsynchronousRequestParams =
                    {
                        statusIdentifier: defaultStatusIdentifier,
                        statusPollFrequency: 1000,
                        maxNumberOfPolls: 5,
                        resultIdentifier: defaultResultIdentifier
                    };
            var mandatoryAsynchParams = ['wpsRequestDocument', 'url', 'callbacks'];

            var asyncCallbackCategories = [
                'start',
                'status',
                'result'
            ];
            var asyncCallbackSubcategories = [
                'success',
                'failure'
            ];

            //map of callback subcategory to default callback
            var defaultCallbacks = {
                success: function () {
                    //this is intentionally a no-op
                },
                failure: function (response) {
                    var errMsg = "An error occurred during an ajax call. Consult the browser's logs for details";
                    alert(errMsg);
                    console.error(errMsg);
                    console.dir(response);
                }
            };

            /**
             * @todo - make this into a full-fledged OpenLayers.Format.XML subclass
             * @param {XMLDocument} responseDoc
             * @returns {String} the status url
             */
            var getStatusUrlFromStartDoc = function (responseDoc) {
                var statusUrl = responseDoc.children[0].getAttribute('statusLocation');
                return statusUrl;
            };
            
            /**
             * 
             * @param {XMLElement} parentElt
             * @param {String} tagName
             * @returns {XMLElement}
             */
            var extractExactlyOneElementByTagName = function (parentElt, tagName) {
                var matchingChildElts = parentElt.getElementsByTagName(tagName);
                if(1 !== matchingChildElts.length){
                    throw Error('unanticipated format -- this node of the document should contain exactly one element of tag name ' + tagName);
                }
                return matchingChildElts[0];
            };
            
            //Pseudo-enum
            var ProcessStatus = {
                SUCCEEDED: 1,
                FAILED: 2,
                IN_PROGRESS: 3
            };
            
            var getStatusFromStatusDoc = function(statusDoc) {
                var parentElt = statusDoc.children[0];
                var statusElt = extractExactlyOneElementByTagName(parentElt, 'Status');
                var status = ProcessStatus.IN_PROGRESS;
                var successful = !!statusElt.getElementsByTagName('ProcessSucceeded').length;
                if(successful){
                    status = ProcessStatus.SUCCEEDED;
                }
                else{
                    var failed = !!statusElt.getElementsByTagName('ProcessFailed').length;
                    if(failed){
                        status = ProcessStatus.FAILED;
                    }
                }
                return status;
            };
            var getResultsUrlFromStatusDoc = function(statusDoc){
                var rootElt = statusDoc.children[0];
                //assume only one Reference element in doc
                var referenceElt = rootElt.getElementsByTagName('Reference')[0];
                var resultsUrl = referenceElt.getAttribute('href');
                return resultsUrl;
            };
           /**
             * Determines if the response contains xml. If it does not, return true.
             * If it contains xml, but there are Exception tags, return true.
             * Otherwise, return false.
             * 
             * @param {type} response
             * @returns {Boolean} - true if there were exceptions, false if there were not
             */
            var wereThereExceptionsInResponse = function (response) {
                hasExceptions = false;
                if (response.responseXML) {
                    var responseDoc = response.responseXML;
                    var exceptions = responseDoc.getElementsByTagNameNS('*', 'Exception');
                    var hasExceptions = !!exceptions.length;
                }
                else {
                    //status document must come back as xml, so this is an error.
                    console.error('error - perhaps the response format of your request document is wrong?');
                    hasExceptions = true;
                }
                return hasExceptions;
            };

            /**
             * 
             * @param {Object} cfg - the async config object after overlaying user properties on top of the default properties
             * @returns {Object} cfg - a completely initialized config
             * @throws Exceptions if the config is invalid.
             */
            var validateAndInitializeConfig = function (cfg) {
                // <parameter validation>
                mandatoryAsynchParams.each(function (paramName) {
                    if (undefined === cfg[paramName]) {
                        throw Error(paramName + ' must be defined');
                    }
                });
                //verify presence of success 
                var needCallbackMsg = 'config.callbacks.result.success must be defined';
                if (!cfg.callbacks.result) {
                    throw Error(needCallbackMsg);
                }
                if ('undefined' === typeof cfg.callbacks.result.success) {
                    throw Error(needCallbackMsg);
                }
                //validate callbacks
                asyncCallbackCategories.each(function (callbackCategory) {
                    var callbackType = typeof cfg.callbacks[callbackCategory];

                    //initialize if necessary
                    if ('object' !== callbackType) {
                        cfg.callbacks[callbackCategory] = {};
                    }
                    asyncCallbackSubcategories.each(function (subcategory) {
                        var subCategoryMember = cfg.callbacks[callbackCategory][subcategory];
                        var typeOfSubcatagoryMember = typeof subCategoryMember;

                        //if a callback for a subcategory is not defined, set it to the default callback for that subcategory
                        if ('undefined' === typeOfSubcatagoryMember) {
                            cfg.callbacks[callbackCategory][subcategory] = defaultCallbacks[subcategory];
                        }
                        else if ('function' !== typeOfSubcatagoryMember) {
                            throw Error('parameter ' + callbackCategory + '.' + subcategory +
                                    ' must be of type function. Got type ' + typeOfSubcatagoryMember);
                        }
                    });
                //initialize counter for callbacks. 
                cfg._statusPollCount = 0;
                });
                return cfg;
            };

            var start = function (cfg) {
                OpenLayers.Request.POST({
                    url: cfg.url,
                    data: cfg.wpsRequestDocument,
                    success: function (response) {
                        var exceptions = wereThereExceptionsInResponse(response);
                        if (exceptions) {
                            this.callbacks.start.failure.apply(this, arguments);
                        }
                        else {
                            this.callbacks.start.success.apply(this, arguments);
                            var statusUrl = getStatusUrlFromStartDoc(response.responseXML);
                            pollStatus(this, statusUrl);
                        }
                    },
                    failure: function (response) {
                        this.callbacks.start.error.apply(this, arguments);
                    },
                    scope: cfg
                });
            };
            var pollStatus = function (cfg, statusUrl) {
                OpenLayers.Request.GET({
                    url: statusUrl,
                    success: function (response) {
                        var exceptions = wereThereExceptionsInResponse(response);
                        if (exceptions) {
                            this.callbacks.status.failure.apply(this, arguments);
                        }
                        else {
                            var responseDoc = response.responseXML;
                            this.callbacks.status.success.apply(this, arguments);
                            var status = getStatusFromStatusDoc(responseDoc);
                            switch (status){
                                case ProcessStatus.FAILED:
                                    //base case
                                    this.callbacks.status.failure.apply(this, arguments);
                                    break;
                                case ProcessStatus.SUCCEEDED:
                                    //base case
                                    this.callbacks.status.success.apply(this, arguments);
                                    var resultsUrl = getResultsUrlFromStatusDoc(responseDoc);
                                    retrieveResults(cfg, resultsUrl);
                                    break;
                                case ProcessStatus.IN_PROGRESS:
                                    if(cfg._statusPollCount < cfg.maxNumberOfPolls){
                                        //deffered recursive case
                                        cfg._statusPollCount++; 
                                        setTimeout(function(){pollStatus(cfg, statusUrl);}, cfg.statusPollFrequency);
                                    }
                                    else{
                                        //base case
                                        this.callbacks.status.failure.apply(this, arguments);
                                    }
                                    break;
                                default:
                                    //base case
                                    throw Error("Undefined status code detected");
                            }
                        }
                    },
                    failure: function (response) {
                        this.callbacks.status.error.apply(this, arguments);
                    },
                    scope: cfg
                });
            };
            var retrieveResults = function(cfg, resultsUrl){
                 OpenLayers.Request.GET({
                    url: resultsUrl,
                    success: function (response) {
                        this.callbacks.result.success.apply(this, arguments)
                    },
                    failure: function(response) {
                        this.callbacks.result.failure.apply(this, arguments)
                    },
                    scope: cfg
                });
            };
            /**
             * 
             * @param config.url - mandatory - a string url for a wps endpoint
             * @param config.wpsRequestDocument - mandatory - a string of a valid wps request document
             * 
             * note that all callbacks are called with a single argument - a response object
             * all callbacks are called with config as the context. In other words, all properties present in config
             * are accessible to the callback through 'this'.
             * @param config.callbacks.start.success - optional - a function handling successful initiation of a request
             * @param config.callbacks.start.failure - optional - a function handling successful initiation of a request
             * 
             * @param config.callbacks.status.success - optional - a function handling for successful status polling
             * @param config.callbacks.status.failure - optional - a function hanlding unsuccessful status polling
             * @param config.statusIdentifier - optional - the xml key used to extract the status data from the status document
             * @param config.statusPollFrequency - optional - a Number of milliseconds to wait between polling
             * @param config.maxNumberOfPolls - optional - an Integer number of polls to perform before the status failure
             * 
             * @param config.callbacks.result.success - mandatory - a function handling successful result retrieval
             * @param config.callbacks.result.failure - optional - a function handling unsuccessful result retrieval
             * @param config.resultIdentifier - the xml key used to extract the result data from the results document
             *
             * This function:
             *  sends an asynchronous wps execute request
             *  extracts the status url out of the result document
             *  polls the status url until the proccess is complete
             *  retrieves the actual result once processing is complete
             *  
             */
            exports.executeAsynchronousRequest = function (userConfig) {
                var cfg = {};
                OpenLayers.Util.extend(cfg, defaultExecuteAsynchronousRequestParams);
                OpenLayers.Util.extend(cfg, userConfig);
                cfg = validateAndInitializeConfig(cfg);
                start(cfg);
            };

            return exports;
        }
    ]);
}());
