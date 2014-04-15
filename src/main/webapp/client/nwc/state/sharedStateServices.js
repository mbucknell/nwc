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
    activatedMapControl: "select",
    gageStyleDescription: "Gages for Evaluating Streamflow",
    streamFlowStatMinDate: Date.create().utc(),
    streamFlowStatMaxDate: Date.create().utc()
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
        'StoredState', '$state', '$timeout', '$http', '$modal', 'CommonState', 'RunningWatches', '$log',
        function (StoredState, $state, $timeout, $http, $modal, CommonState, RunningWatches, $log) {
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
                                if(customValue){
                                    //custom deserializers may want to stop a serialized value from appearing in the final object
                                    customlyDeserializedState[customDeserializationProperty] = customValue;
                                }
                            }
                        });
                        Object.merge(StoredState, customlyDeserializedState);
                        CommonState = commonState;
                        //now a special case -- 
                        //streamflowStatsParamsReady needs to be loaded *after* siteStatisticsParameters
                        //don't re-run stats from restore, require manual click
                        StoredState.streamflowStatsParamsReady = false; //data.streamflowStatsParamsReady;
                        //let async listeners on StoredState finish before rendering the main ui
                        var checkWatchers = function(){
                            if(RunningWatches.isEmpty()){
                                $log.info('All asynchronous runtime content has been loaded');
                                $state.go(StoredState.stateName, StoredState.stateParams);
                            }
                            else{
                                $timeout(checkWatchers, 500);
                            }
                        };
                        $timeout(checkWatchers, 500);
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
                var date = Date.create(dateStr).utc();
                return date;
            };
            /**
             * A few objects cannot use the default JSON.stringify serialization because they
             * contain unserializable circular references. These functions catch
             * those objects and customize their serializations.
             * 
             * WARNING: SERIALIZATION SHOULD BE DONE ON A CLONE OF THE STATE NOT THE STATE ITSELF
             * YOU HAVE BEEN WARNED!
             */
            //map of property name to custom serialization function
            var customSerializers = {
                'hucFeature' : function(hucFeature){
                    var serializedHuc = geoJsonFormatter.write(hucFeature);
                    return serializedHuc;
                },
                'siteStatisticsParameters': function(params){
                    //You are being passed a reference to the existing parameters
                    //in-use by the app. Don't modify it; make a copy.
                    var clone = Object.clone(params, true);
                    if(clone.startDate){
                        clone.startDate = serializeDate(clone.startDate);
                    }
                    if(clone.endDate){
                        clone.endDate = serializeDate(clone.endDate);
                    }
                    return clone;
                },
                'mapExtent': function(extent) {
                    var bbox = {
                        left: extent.left,
                        bottom: extent.bottom,
                        right: extent.right,
                        top: extent.top
                    };
                    return bbox;
                }
            };
            //map of property name to custom deserialization function
            //use string literals for keys so that they do not get minified away
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
                },
                'streamflowStatsParamsReady': function(ready){
                    //do not initially include this value in the object
                    return undefined;
                },
                'mapExtent': function(bbox) {
                    return new OpenLayers.Bounds(bbox.left, bbox.bottom, bbox.right, bbox.top);
                }
            };

            var store = function (usersStateObject) {
                // remove keys with undefined values
                var stateMinusUndefined = usersStateObject.findAll(function(k, v) {
                   return v !== undefined; 
                });
                
                var customSerializationProperties = Object.keys(customSerializers);
                
                //reject potentially circular properties that have their own serializers
                var nonCircularState = Object.reject(stateMinusUndefined, customSerializationProperties);
                
                customSerializationProperties.each(function (customSerializationProperty) {
                    var customSerializer = customSerializers[customSerializationProperty];
                    var originalValue = usersStateObject[customSerializationProperty];
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