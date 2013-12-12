/*global angular*/
(function(){
var watchModule = angular.module('nwc.watch', ['nwc.util']);
//using null-value map as a set (need fast membership checking later)
var watchServiceNames = Object.extended();

//this service provides a way to inject the names of all other stored state watch services into a controller
watchModule.provider('storedStateWatchers', function(){
    this.$get = function(){
       return watchServiceNames.keys();
    };
});

//call this function with the same arguments that you would module.factory()
var registerWatchFactory = function(watchServiceName, dependencyArray){
    var finalName = 'nwc.watch.' + watchServiceName;
    if(watchServiceName.has(finalName)){
        throw Error("Duplicate watch service name. You must register unique watch service names.");
    }
    else {
        watchServiceNames[finalName] = null;
        watchModule.factory(finalName, dependencyArray);
    }
};

registerWatchFactory('hucId', 
           ['$http', 'CommonState', 'ajaxUtils', 'SosSources', 'SosUrlBuilder', 'DataSeriesStore',
    function($http,   CommonState,   ajaxUtils,   SosSources,   SosUrlBuilder,   DataSeriesStore){
        return {
            propertyToWatch: 'hucId',
            watchFunction: function (prop, oldValue, newValue){
                CommonState.newProp = 'blue';
                var a = $http.get(newValue);
                return newValue;
            }
        };
    }
]);

}());