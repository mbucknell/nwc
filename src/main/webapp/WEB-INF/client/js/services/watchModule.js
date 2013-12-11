/*global angular*/
(function(){
var watchModule = angular.module('nwc.watch', []);
var watchServiceNames = [];

//this service provides a way to inject the names of all other stored state watch services into a controller
watchModule.factory('storedStateWatchers', [function(){
    return watchServiceNames;
}]);

//call this function with the same arguments that you would module.factory()
var registerWatchFactory = function(watchServiceName, dependencyArray){
    var finalName = 'nwc.watch.' + watchServiceName;
    watchServiceNames.push(finalName);
    watchModule.factory(finalName, dependencyArray);
};

registerWatchFactory('hucId', ['$http',
    function($http){
        return {
            propertyToWatch: 'hucId',
            watchFunction: function (prop, oldValue, newValue){
                alert('watchFired');
                var a = $http.get(newValue);
                return newValue;
            }
        };
    }
]);

}());