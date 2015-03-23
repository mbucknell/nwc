var NWC = NWC || {};

NWC.util = NWC.util || {};

NWC.util.hucCountiesIntersector = (function() {
	var that = {};

	var olGeoJsonFormatter = new OpenLayers.Format.GeoJSON();
	var jstsGeoJsonReader = new jsts.io.GeoJSONReader();

	that.getCountiesIntersectionInfo = function(hucFeature, countyFeatures){
		var countiesHucIntersectionInfo = countyFeatures.map(function(countyFeature){
			return that.getCountyIntersectionInfo(hucFeature, countyFeature);
		});
		return countiesHucIntersectionInfo;
	};

	that.getCountyIntersectionInfo = function(hucFeature, countyFeature){
		//since OpenLayers' feature.transform method modifies data in-place, we must
		//operate on a clone to avoid affecting the original data
		//there is no native clone method, so we serialize and de-serialize instead.
		var hucGeoJson = olGeoJsonFormatter.write(hucFeature);
		var hucJstsGeom = jstsGeoJsonReader.read(hucGeoJson);
		var hucArea = hucJstsGeom.geometry.getArea();

		var countyGeoJson = olGeoJsonFormatter.write(countyFeature.geometry);
		var countyJstsGeom = jstsGeoJsonReader.read(countyGeoJson);

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
	};

	return that;
}());

