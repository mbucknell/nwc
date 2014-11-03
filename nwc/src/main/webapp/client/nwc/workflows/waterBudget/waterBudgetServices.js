/*global angular*/
(function () {
    var WaterBudgetServices = angular.module('nwc.waterBudgetServices', []);
    
    WaterBudgetServices.factory('CountyWaterUseProperties', [function() {
            var groupings = Object.extended({
                'Public Supply' : ["PS-WGWFr", "PS-WGWSa", "PS-WSWFr", "PS-WSWSa"],
                'Domestic' : ["DO-WGWFr", "DO-WGWSa", "DO-WSWFr", "DO-WSWSa"],
                'Irrigation' : ["IT-WGWFr", "IT-WGWSa", "IT-WSWFr", "IT-WSWSa"],
                'Thermoelectric Power' : ["PF-WGWFr", "PF-WGWSa", "PF-WSWFr", "PF-WSWSa", "PG-WGWFr", "PG-WGWSa", "PG-WSWFr", "PG-WSWSa", "PN-WGWFr", "PN-WGWSa", "PN-WSWFr", "PN-WSWSa", "PO-WGWFr", "PO-WGWSa", "PO-WSWFr", "PO-WSWSa", "PC-WGWFr", "PC-WGWSa", "PC-WSWFr", "PC-WSWSa"],
                'Livestock and Aquaculture' : ["LS-WGWFr", "LS-WGWSa", "LS-WSWFr", "LS-WSWSa", "LI-WGWFr", "LI-WSWFr", "LA-WGWFr", "LA-WGWSa", "LA-WSWFr", "LA-WSWSa", "AQ-WGWFr", "AQ-WGWSa", "AQ-WSWFr", "AQ-WSWSa"],
                'Industrial' : ["IN-WGWFr", "IN-WGWSa", "IN-WSWFr", "IN-WSWSa"],
                'Mining' : ["MI-WGWFr", "MI-WGWSa", "MI-WSWFr", "MI-WSWSa"]
            });
            
            return {
                getObservedProperties : (function() {
                    var result = [];
                    groupings.values(function(el) {
                        if (el) {
                            result.add(el);
                        }
                    });
                    return result;
                }).once(),
                getPropertyLongNames : (function() {
                    var result = [];
                    groupings.keys(function(key) {
                        if (key) {
                            result.add(key)
                        }
                    });
                    return result;
                }).once(),
                observedPropertiesLookup : (function() {
                    return groupings.clone(true);
                }).once(),
                propertyLongNameLookup : (function() {
                    var result = {};
                    
                    groupings.keys(function(longName, properties) {
                        properties.each(function(property) {
                            result[property] = longName;
                        })
                    });
                    
                    return result;
                }).once()
            };
    }]);
    WaterBudgetServices.factory('HucCountiesIntersector', [ 
        function(){
            var getIntersectionInfo = function(hucFeature, countyFeatures){
                var olGeoJsonFormatter = new OpenLayers.Format.GeoJSON();
                var jstsGeoJsonReader = new jsts.io.GeoJSONReader();
                var hucGeoJson = olGeoJsonFormatter.write(hucFeature);
                var hucJstsGeom = jstsGeoJsonReader.read(hucGeoJson);  
                var hucArea = hucJstsGeom.geometry.getArea();
                
                var countiesHucIntersectionInfo = countyFeatures.map(function(countyFeature){
                    //since OpenLayers' feature.transform method modifies data in-place, we must
                    //operate on a clone to avoid affecting the original data
                    //there is no native clone method, so we serialize and de-serialize instead.
                    var countyGeoJson = olGeoJsonFormatter.write(countyFeature.geometry);
                    var countyGeoClone = olGeoJsonFormatter.read(countyGeoJson, 'Geometry');
                    var countyFeatureGeometry = countyGeoClone.transform(
                            new OpenLayers.Projection('EPSG:4326'),
                            new OpenLayers.Projection('EPSG:900913')//maybe use epsg:3857 instead?
                    );
                    var transformedCountyGeoJson = olGeoJsonFormatter.write(countyFeatureGeometry);
  
                    var countyJstsGeom = jstsGeoJsonReader.read(transformedCountyGeoJson);
                    var countyArea = countyJstsGeom.getArea();
                    var intersection = countyJstsGeom.intersection(hucJstsGeom.geometry);
                    var intersectingArea = intersection.getArea();
                    var percentHucInCounty = (intersectingArea / hucArea);
                    var percentCountyInHuc = (intersectingArea / countyArea);
                    
                    var countyHucIntersectionInfo = {
                        countyName: countyFeature.attributes.FULL_NAME.capitalize(true),
                        countyId: countyFeature.attributes.FIPS,
                        hucInCounty: 100 * percentHucInCounty,
                        countyInHuc: 100 * percentCountyInHuc
                    };
                    return countyHucIntersectionInfo;
                });
                return countiesHucIntersectionInfo;
            };
            return {
                intersect: getIntersectionInfo
            };
        }
    ]);
})();

