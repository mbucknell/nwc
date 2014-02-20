/*global angular,OpenLayers*/
/**
 * @requires Openlayers, angular
 * @todo - convert calls to 'each' to for-loops
 */
(function () {
    var wps = angular.module('nwc.wps', []);
    wps.service('wps', [
        function () {
            var defaultResultIdentifier = 'output';
            var defaultStatusIdentifier = 'statusLocation';
            var exports = {};
            exports.defaultResultIdentifier = defaultResultIdentifier;
            exports.defaultStatusIdentifier = defaultStatusIdentifier;
            exports.getDefaultSynchronousResponseForm = function () {
                return {
                    'rawDataOutput': {
                        'identifier': defaultResultIdentifier
                    }
                };
            };
            exports.getDefaultAsynchronousResponseForm = function(){
                return {
                    'responseDocument': {
                        'storeExecuteResponse': 'true',
                        'status': 'true',
                        'output': {
                            'asReference': true,
                            'mimeType': 'text/plain',
                            'identifier': defaultResultIdentifier
                        }
                    }
                };
            };

            /**
             * 
             * @param {String} processId String identifying the WPS request
             * @param {Object} dataInputs - Map of parameter name to value objects {'name1' : 'value1', 'nameA' : 'value4'}
             * @param {Object} responseForm optional object describing response format- for example:
             {
                'rawDataOutput': {
                    'identifier': 'result'
                    }
             }
             * @returns {String} Return the request XML as a string
             */
            exports.createWpsExecuteRequestDocument = function (processId, dataInputs, responseForm) {
                responseForm = responseForm || exports.getDefaultSynchronousResponseForm();
                var formattedData = [];
                for (var key in dataInputs) {
                    if (dataInputs.hasOwnProperty(key)) {
                        var value = dataInputs[key];
                        formattedData.push(
                            {
                                'identifier': key,
                                'data': {
                                    'literalData': {
                                        'value': value
                                    }
                                }
                            }
                        );
                    }
                }
                var requestDocument = new OpenLayers.Format.WPSExecute().write({
                    'identifier': processId,
                    'dataInputs': formattedData,
                    'responseForm': responseForm
                });
                return requestDocument;
            };

            exports.getDefaultExecuteAsynchronousRequestParams = function () {
                return{
                    status: {
                        identifier: defaultStatusIdentifier,
                        pollFrequency: 1000,
                        maxNumberOfPolls: 5
                    }
                };
            };
            var mandatoryAsynchParams = ['wpsRequestDocument', 'url', 'result'];
            
            var asyncPhases = [
                'start', 
                'status',
                'result'
            ];
            
            var asyncCallbackCategories = [
                'success',
                'failure'
            ];

            //map of callback subcategory to default callback
            var defaultCallbacks = {
                success: function () {
                    //this is intentionally a no-op
                },
                /**
                 * all failure callbacks are called with response as the first argument
                 * @param {XMLDocument} response
                 */
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
                var statusUrl = responseDoc.childNodes[0].getAttribute('statusLocation');
                return statusUrl;
            };
            /**
             * 
             * @param {XMLElement} parentElt
             * @param {String} tagName
             * @param {String} namespacePrefix  for an element <myNs:myTagName/>, this would be 'myNs'
             * @param {String} namespaceURI the fully-formed URI as appears in the xmlns attribute value
             * @returns {HTMLCollection}
             * @inspiration http://stackoverflow.com/a/2220499
             */
            var crossBrowserGetElementsByTagNameNS = function(parentElt, tagName, namespacePrefix, namespaceURI){
                var elts = parentElt.getElementsByTagName(namespacePrefix + ':' + tagName);
                if (!elts.length) {
                    elts = parentElt.getElementsByTagName(tagName);
                }
                if (!elts.length) {
                    elts = parentElt.getElementsByTagNameNS(namespaceURI, 'point');
                }
                return elts;
            };
            var wpsNamespacePrefix = 'ns';
            var wpsNamespaceURI = 'http://www.opengis.net/wps/1.0.0';
            /**
             * 
             * @param {XMLElement} parentElt
             * @param {String} tagName
             * @returns {HTMLCollection}
             */
            getWpsElementsByTagName = function (parentElt, tagName) {
                return crossBrowserGetElementsByTagNameNS(parentElt, tagName, wpsNamespacePrefix, wpsNamespaceURI);
            };
            /**
             * 
             * @param {XMLElement} parentElt
             * @param {String} tagName
             * @returns {XMLElement}
             */
            var extractExactlyOneWpsElementByTagName = function (parentElt, tagName) {
                var matchingChildElts = crossBrowserGetElementsByTagNameNS(parentElt, tagName, wpsNamespacePrefix, wpsNamespaceURI);
                if (1 !== matchingChildElts.length) {
                    throw Error('unanticipated format -- this node of the document should contain exactly one element of tag name ' + tagName);
                }
                return matchingChildElts[0];
            };

            /**
             * @returns {Object} a pseudo-enum used for determining process status
             * @example 
             *  var ProcessStatus = wps.getProcessStatusEnum;
             *  switch(myStatus){
             *      case ProcessStatus.SUCCEDED:
             *  ...
             *  
             */
            exports.getProcessStatusEnum = function(){
                return {
                    SUCCEEDED: 1,
                    FAILED: 2,
                    IN_PROGRESS: 3
                };
            };
            
            /**
             * @param {XMLDocument} statusDoc
             * @returns {ProcessStatus.SUCCEEDED|ProcessStatus.FAILED|ProcessStatus.IN_PROGRESS}
             */
            var getStatusFromStatusDoc = function (statusDoc) {
                var ProcessStatus = exports.getProcessStatusEnum();
                var parentElt = statusDoc.childNodes[0];
                var statusElt = extractExactlyOneWpsElementByTagName(parentElt, 'Status');
                var status = ProcessStatus.IN_PROGRESS;
                var successful = !!getWpsElementsByTagName(statusElt, 'ProcessSucceeded').length;
                if (successful) {
                    status = ProcessStatus.SUCCEEDED;
                }
                else {
                    var failed = !!getWpsElementsByTagName(statusElt, 'ProcessFailed').length;
                    if (failed) {
                        status = ProcessStatus.FAILED;
                    }
                }
                return status;
            };
            
            /**
             * @param {XMLDocument} statusDoc
             * @returns {String} results url
             */
            var getResultsUrlFromStatusDoc = function (statusDoc) {
                var rootElt = statusDoc.childNodes[0];
                //assume only one Reference element in doc
                var referenceElt = getWpsElementsByTagName(rootElt, 'Reference')[0];
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
                    var exceptions = getWpsElementsByTagName(responseDoc, 'Exception');
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
                for(var i = 0; i < mandatoryAsynchParams.length; i++){
                    var paramName = mandatoryAsynchParams[i];
                    if (undefined === cfg[paramName]) {
                        throw Error('config.' + paramName + ' must be defined');
                    }
                }
                //verify presence of result.success callback
                if ('undefined' === typeof cfg.result.success) {
                    throw Error('config.result.success must be defined');
                }
                
                //validate phases and callbacks, initializing callbacks to default if necessary
                for(var j = 0; j < asyncPhases.length; j++){
                    var asyncPhaseName = asyncPhases[j];
                    var phaseType = typeof cfg[asyncPhaseName];
                    //initialize if necessary
                    if ('object' !== phaseType) {
                        cfg[asyncPhaseName] = {};
                    }
                    for(var k = 0; k < asyncCallbackCategories.length; k++){
                        var category = asyncCallbackCategories[k];
                        var categoryMember = cfg[asyncPhaseName][category];
                        var typeOfCatagoryMember = typeof categoryMember;

                        //if a callback for a category is not defined, set it to the default callback for that category
                        if ('undefined' === typeOfCatagoryMember) {
                            cfg[asyncPhaseName][category] = defaultCallbacks[category];
                        }
                        else if ('function' !== typeOfCatagoryMember) {
                            throw Error('parameter config.' + asyncPhaseName + '.' + category +
                                    ' must be of type function. Got type ' + typeOfCatagoryMember);
                        }
                    }
                }
                return cfg;
            };
            
            /**
             * Starts the Asynchronous WPS Process Execution
             * @param {Object} cfg
             */
            var start = function (cfg) {
                OpenLayers.Request.POST({
                    url: cfg.url,
                    data: cfg.wpsRequestDocument,
                    success: function (response) {
                        var exceptions = wereThereExceptionsInResponse(response);
                        if (exceptions) {
                            cfg.start.failure(response, cfg);
                        }
                        else {
                            cfg.start.success(response, cfg);
                            var statusUrl = getStatusUrlFromStartDoc(response.responseXML);
                            pollStatus(cfg, statusUrl, 0);
                        }
                    },
                    failure: function (response) {
                        cfg.start.failure(response, cfg);
                    }
                });
            };
            
            /**
             * Polls the status of the asynchronous process begun in start()
             * @param {Object} cfg
             * @param {String} statusUrl
             * @param {Integer} pollCount
             */
            var pollStatus = function (cfg, statusUrl, pollCount) {
                var ProcessStatus = exports.getProcessStatusEnum();
                OpenLayers.Request.GET({
                    url: statusUrl,
                    success: function (response) {
                        var exceptions = wereThereExceptionsInResponse(response);
                        if (exceptions) {
                            cfg.status.failure(response, pollCount, ProcessStatus.FAILED, statusUrl, cfg);
                        }
                        else {
                            var responseDoc = response.responseXML;
                            var status = getStatusFromStatusDoc(responseDoc);
                            switch (status) {
                                case ProcessStatus.FAILED:
                                    //base case
                                    cfg.status.failure(response, pollCount, status, statusUrl, cfg);
                                    break;
                                case ProcessStatus.SUCCEEDED:
                                    //base case
                                    cfg.status.success(response, pollCount, status, statusUrl, cfg);
                                    var resultsUrl = getResultsUrlFromStatusDoc(responseDoc);
                                    handleResultsUrl(cfg, resultsUrl);
                                    break;
                                case ProcessStatus.IN_PROGRESS:
                                    if (pollCount < cfg.status.maxNumberOfPolls) {
                                        //deffered recursive case
                                        pollCount++;
                                        setTimeout(function () {
                                            pollStatus(cfg, statusUrl, pollCount);
                                        }, cfg.status.pollFrequency);
                                    }
                                    else {
                                        //base case
                                        cfg.status.failure(response, pollCount, status, statusUrl, cfg);
                                    }
                                    break;
                                default:
                                    //base case
                                    throw Error("Undefined WPS process status code detected");
                            }
                        }
                    },
                    failure: function (response) {
                        cfg.status.failure(response, pollCount, ProcessStatus.FAILED, statusUrl, cfg);
                    }
                });
            };
            
            /**
             * Retrieves the results of the process once pollStatus() determines
             * that the process has finished successfully
             * @param {Object} cfg
             * @param {String} resultsUrl - the url from which to retrieve the results
             */
            var handleResultsUrl = function (cfg, resultsUrl) {
                cfg.result.success(resultsUrl, cfg);
            };
            /**
             * 
             * @param {Mixed} obj
             * @returns {Boolean} true if object, false otherwise
             * @url http://stackoverflow.com/a/8511350
             */
            var isObject = function (obj) {
                //because `(typeof null  === 'object') === true`
                return null !== obj && 'object' === typeof obj;
            };
            /**
             * Automates the execution and monitoring of an asynchronous WPS 
             * process. Many callbacks are available to customize behavior 
             * if desired.
             * 
             * @param config.url - mandatory - a string url for a wps endpoint
             * @param config.wpsRequestDocument - mandatory - a string of a valid wps request document
             * 
             * @param config.start.success - optional - a function handling successful initiation of a request.
             *  The function is called with the follwing parameters:
             *  {XMLDocument} response - the response document from starting up the request
             *  {Object} config - the config information passed in from the invocation of executeAsynchronousRequest
             * @param config.start.failure - optional - a function handling successful initiation of a request
             *  The function is called with the follwing parameters:
             *  {XMLDocument} response - the response document from starting up the request
             *  {Object} config - the config information passed in from the invocation of executeAsynchronousRequest
             *  
             * @param config.status.success - optional - a function handling for successful status polling
             *  The function is called with the follwing parameters:
             *  {XMLDocument} response - the response document from starting up the request
             *  {Integer} pollCount - the number of polls performed. 0-based.
             *  {Integer} processStatus - a number whose value is defined in wps.getProcessStatusEnum()
             *  {String} statusUrl - the url being polled for the status
             *  {Object} config - the config information passed in from the invocation of executeAsynchronousRequest
             *  
             * @param config.status.failure - optional - a function handling unsuccessful status polling
             *  The function is called with the follwing parameters:
             *  {XMLDocument} response - the response document from starting up the request
             *  {Integer} pollCount - the number of polls performed. 0-based.
             *  {Integer} processStatus - a number whose value is defined in wps.getProcessStatusEnum()
             *  {String} statusUrl - the url being polled for the status
             *  {Object} config - the config information passed in from the invocation of executeAsynchronousRequest
             *  
             * @param config.status.identifier - optional - the xml key used to extract the status data from the status document
             * @param config.status.pollFrequency - optional - a Number of milliseconds to wait between polling
             * @param config.status.maxNumberOfPolls - optional - an Integer number of polls to perform before the status failure
             * 
             * @param config.result.success - mandatory - a function handling result retrieval
             *  The function is called with the follwing parameters:
             *  {String} resultsUrl - the url from which the results can be retrieved
             *  {Object} config - the config information passed in from the invocation of executeAsynchronousRequest
             *  Note that you cannot specify config.result.failure since any failure would have already been handled by 
             *  config.status.failure or config.start.failure
             *
             */
            exports.executeAsynchronousRequest = function (userConfig) {
                var cfg = {};
                //set up default properties in config
                OpenLayers.Util.extend(cfg, exports.getDefaultExecuteAsynchronousRequestParams());
                //now selectively copy user properties into cfg
                for(var userPropertyName in userConfig){
                    if(userConfig.hasOwnProperty(userPropertyName)){
                        var propertyValue = userConfig[userPropertyName];
                        if(isObject(propertyValue)){ 
                            //initialize object in target, if not already there
                            cfg[userPropertyName] = cfg[userPropertyName] || {};
                            //don't blow away all the properties of the existing object, merge the users' properties in on top
                            OpenLayers.Util.extend(cfg[userPropertyName], userConfig[userPropertyName]);
                        }
                        else{
                            cfg[userPropertyName] = userConfig[userPropertyName];
                        }
                    }
                }
                
                cfg = validateAndInitializeConfig(cfg);
                start(cfg);
            };

            return exports;
        }
    ]);
}());
