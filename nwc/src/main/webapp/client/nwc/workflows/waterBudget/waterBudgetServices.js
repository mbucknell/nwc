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
    WaterBudgetServices.factory('HucCountiesIntersector', ['Convert', 
        function(Convert){
            var getIntersectionInfo = function(hucFeature, countyFeatures){
                var hucArea = Convert.acresToSquareMeters(parseFloat(hucFeature.attributes.ACRES));
                var geoJsonWriter = new OpenLayers.Format.GeoJSON();
                var geoJsonReader = new jsts.io.GeoJSONReader();
                var hucGeoJson = geoJsonWriter.write(hucFeature);
                var hucJstsGeom = geoJsonReader.read(hucGeoJson);       
                
                var countiesHucIntersectionInfo = countyFeatures.map(function(countyFeature){
                    countyFeature.geometry = countyFeature.geometry.transform(
                            new OpenLayers.Projection('EPSG:4326'),
                            new OpenLayers.Projection('EPSG:900913')
                    );
                    var countyArea = Convert.acresToSquareMeters(Convert.squareMilesToAcres(parseFloat(countyFeature.attributes.AREA_SQMI)));
                    var countyGeoJson = geoJsonWriter.write(countyFeature);
                    var countyJstsGeom = geoJsonReader.read(countyGeoJson);
                    var intersection = countyJstsGeom.geometry.intersection(hucJstsGeom.geometry);
                    var intersectingArea = intersection.getArea();
                    var magic = 1;
                    var percentHucInCounty = (intersectingArea / hucArea)/magic;
                    var percentCountyInHuc = (intersectingArea / countyArea)/magic;
                    
                    var countyHucIntersectionInfo = {
                        countyName: countyFeature.attributes.FULL_NAME.capitalize(true), 
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

