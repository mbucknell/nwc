/*global angular,OpenLayers*/
(function () {
    var wps = angular.module('nwc.wps', []);
    wps.service('wps', [
        function(){
            var exports = {
                defaultResponseForm: {
                    'rawDataOutput': {
                        'identifier': 'result'
                    }
                },
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
                    OR
                 * @returns {String} Return the request XML as a string
                 */
                createWPSExecuteRequest : function (processId, dataInputs, responseForm) {
                    responseForm = responseForm || exports.defaultResponseForm;
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
                }
            };
        }
    ]);
}());
