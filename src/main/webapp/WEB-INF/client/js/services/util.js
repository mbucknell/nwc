/*global angular*/
(function () {
    var utilModule = angular.module('nwc.util', []);

    //pseudo-singleton syntax
    var ajaxUtils = new function () {
        var self = this;

        /**
         * Labels on ajax call objects permit a catch-all callback function to execute
         * specific behavior pertinent to the specific label of the request. 
         * This is most useful when used in tandem with jquery's deffereds ($.when etc).
         * 
         * @param {String} label The value to put in the 'label' property of the jqXHR 
         * object available to the callbacks.
         * @param {String} url
         * @param {Object} ajaxOptions any standard jQuery ajax options
         * @returns {Object} jQuery ajax object with an additional 'label' property.
         */
        self.makeLabeledAjaxCall = function (label, url, ajaxOptions) {
            var call = $.ajax(url, ajaxOptions);
            call.label = label;
            call.url = url;
            return call;
        };
    }();
    utilModule.service('ajaxUtils', [function () {
            return ajaxUtils;
        }]);
}());