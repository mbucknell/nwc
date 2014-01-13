/*global angular,OpenLayers,CONFIG*/
(function () {
    var waterBudgetMap = angular.module('nwc.map.aquaticBiology', []);
    waterBudgetMap.factory('AquaticBiologyMap', [ 'StoredState', 'CommonState', '$state', 'BaseMap',
       function(StoredState, CommonState, $state, BaseMap){
           var privateMap; 
    
        var initMap = function () {
            var mapLayers = [];
            var controls = [];
           
                
                var map = BaseMap.new({
                    layers: mapLayers,
                    controls: controls
                });
            
            
            //stash it in a closure var
            privateMap = map;
            return privateMap;
        };
        var getMap = function () {
            if (!privateMap) {
                initMap();
            }
            return privateMap;
        };
        return {
            initMap: initMap,
            getMap: getMap
        };
       } 
    ]);
    
}());