/*global angular*/
(function(){
var sharedStateServices = angular.module('nwc.sharedStateServices', ['nwc.watch']);

//enable sugarjs instance methods
var storedState = Object.extended({
    _version: 0.1
});


//enable sugarjs instance methods
var commonState = Object.extended({
    DataSeriesStore: Object.extended(),
    newDataSeriesStore: false,
    streamFlowStatEndDate: new Date(),
    streamFlowStatStartDate: new Date()
});

//this factory provides access to the state that is NOT stored to the server, but that
//can be shared between controllers
//generally, the commonState should NOT be written to by controllers, rather it should
//be written to by listeners on the StoredState
sharedStateServices.factory('CommonState', [
    function(){
        return commonState;
    }
]);

//This factory provides access to the state that can be Stored to the server and shared between controllers.
//The shared state watch service must be instantiated in order for the app to dynamically set shared state
//that is not stored to the server.
sharedStateServices.factory('StoredState', [
    function(){
        return storedState;
    }
]);

sharedStateServices.factory('StatePersistence', [
        'StoredState', '$state', '$timeout', '$http', '$modal', 'CommonState',
        function (StoredState, $state, $timeout, $http, $modal, CommonState) {
            var restore = function (stateId) {
                $http.get('../loadsession/' + stateId)
                    .success(function (data) {
                        
                        var customDeserializationProperties = Object.keys(customDeserializers);
                        var customlyDeserializedState = Object.reject(data, customDeserializationProperties);

                        customDeserializationProperties.each(function (customDeserializationProperty) {
                            var customDeserializer = customDeserializers[customDeserializationProperty];
                            var valueToDeserialize = data[customDeserializationProperty];
                            if(valueToDeserialize){
                                var customValue = customDeserializer(valueToDeserialize);
                                customlyDeserializedState[customDeserializationProperty] = customValue;
                            }
                        });
                        
                        Object.merge(StoredState, customlyDeserializedState);
                        //let listeners on StoredState run before changing state
                        $timeout(function(){
                            $state.go(StoredState.stateName, StoredState.stateParams);
                        });
                    })
                    .error(function () {
                        $modal.open({
                            template: 'Error Retrieving State'
                        });
                    });
            };
            
            
            var geoJsonFormatter = new OpenLayers.Format.GeoJSON();
            
            var dateFormat = '{yyyy}/{MM}/{dd}';
            /**
             * 
             * @param {Date} date object
             * @returns {String}
             */
            var serializeDate = function(date){
                var dateStr = date.format(dateFormat);
                return dateStr;
            };
            /**
             * 
             * @param {String} dateStr
             * @returns {Date}
             */
            var deserializeDate = function(dateStr){
                var date = new Date(dateStr);
                return date;
            };
            /**
             * A few objects cannot use the default JSON.stringify serialization because they
             * contain unserializable circular references. These functions catch
             * those objects and customize their serializations.
             */
            //map of property name to custom serialization function
            var customSerializers = {
                'hucFeature' : function(hucFeature){
                    var serializedHuc = geoJsonFormatter.write(hucFeature);
                    return serializedHuc;
                },
                'siteStatisticsParameters': function(params){
                    if(params.startDate){
                        params.startDate = serializeDate(params.startDate);
                    }
                    if(params.endDate){
                        params.endDate = serializeDate(params.endDate);
                    }
                    return params;
                }
            };
            //map of property name to custom deserialization function
            var customDeserializers = {
                'hucFeature': function(hucFeatureString){
                    var deserializedHucArray = geoJsonFormatter.read(hucFeatureString);
                    return deserializedHucArray[0];
                },
                'siteStatisticsParameters': function(params){
                    if(params.startDate){
                        params.startDate = deserializeDate(params.startDate);
                    }
                    if(params.endDate){
                        params.endDate = deserializeDate(params.endDate);
                    }
                    return params;
                }
            };

            var store = function (stateObject) {
                var customSerializationProperties = Object.keys(customSerializers);
                var nonCircularState = Object.reject(stateObject, customSerializationProperties);

                customSerializationProperties.each(function (customSerializationProperty) {
                    var customSerializer = customSerializers[customSerializationProperty];
                    var originalValue = stateObject[customSerializationProperty];
                    if (originalValue) {
                        var customValue = customSerializer(originalValue);
                        nonCircularState[customSerializationProperty] = customValue;
                    }
                });
                
                var httpPromise = $http.post('../savesession', nonCircularState);
                return httpPromise;
            };
            return {
                restore: restore,
                store: store
            };
        }
    ]);
            

}());