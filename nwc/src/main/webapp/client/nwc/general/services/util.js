/*global angular*/
(function () {
    var utilModule = angular.module('nwc.util', []);
    utilModule.service('util', [
        function(){
            return {
                /**
                 * OpenLayers Objects frequently have 'geometry' objects that
                 * have unserializable circular references
                 * @param {Object} object
                 * @returns {unresolved}
                 */
                rejectGeometry: function(object){
                    var retObj = Object.reject(object, 'geometry');
                    return retObj; 
                }
            };
        }
    ]);
    
}());