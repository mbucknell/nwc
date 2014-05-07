/*global angular*/
(function () {
    var WaterUseLookup = angular.module('nwc.waterBudgetServices', []);
    
    WaterUseLookup.factory('CountyWaterUseProperties', [function() {
            var groupings = Object.extended({
                'Public Supply' : ["PS-WGWFr", "PS-WGWSa", "PS-WSWFr", "PS-WSWSa"],
                'Domestic' : ["DO-WGWFr", "DO-WGWSa", "DO-WSWFr", "DO-WSWSa"],
                'Irrigation' : ["IT-WGWFr", "IT-WGWSa", "IT-WSWFr", "IT-WSWSa"],
                'Thermoelectric Power' : ["PF-WGWFr", "PF-WGWSa", "PF-WSWFr", "PF-WSWSa", "PG-WGWFr", "PG-WGWSa", "PG-WSWFr", "PG-WSWSa", "PN-WGWFr", "PN-WGWSa", "PN-WSWFr", "PN-WSWSa", "PO-WGWFr", "PO-WGWSa", "PO-WSWFr", "PO-WSWSa", "PC-WGWFr", "PC-WGWSa", "PC-WSWFr", "PC-WSWSa"],
                'Livestock and Aquaculture' : ["LS-WGWFr", "LS-WGWSa", "LS-WSWFr", "LS-WSWSa", "LI-WGWFr", "LI-WSWFr", "LA-WGWFr", "LA-WGWSa", "LA-WSWFr", "LA-WSWSa", "AQ-WGWFr", "AQ-WGWSa", "AQ-WSWFr", "AQ-WSWSa"],
                'Industrial' : ["IN-WGWFr", "IN-WGWSa", "IN-WSWFr", "IN-WSWSa"],
                'Mining' : ["MI-WGWFr", "MI-WGWSa", "MI-WSWFr", "MI-WSWSa"]
            });
            
            var choppedLiver = 'PS-WFrTo,DO-WFrTo,IN-WTotl,MI-WTotl';
            return {
                getObservedProperties : function() {
                    var result = '';
                    var props = [];
                    groupings.values(function(el) {
                        if (el) {
                            props.add(el);
                        }
                    });
                    result = props.join();
                    return result;
                },
                getPropertyLongName : function() {
                    var result = '';
                    var props = [];
                    groupings.keys(function(key) {
                        if (key) {
                            props.add(key)
                        }
                    });
                    result = props.join();
                    return result;
                }
            };
    }]);
})();

