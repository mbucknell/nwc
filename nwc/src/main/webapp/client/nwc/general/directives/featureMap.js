(function() {
	/*
	 * Directive is used as an attribute on an element where you would like a simple map with no
	 * controls, a base layer, and a user defined layer based in from the attribute value, nwc-feature-map.
	 */
	var featureMap = angular.module('nwc.directives.featureMap', []);

	featureMap.directive('nwcFeatureMap', function() {
		var link = function(scope, element, attrs) {
			var featureLayer = scope.nwcFeatureMap();
			var layerExtent = featureLayer.getDataExtent();
			var hucMap = new OpenLayers.Map(element.attr('id'),{controls: [],'restrictedExtent': layerExtent});
			hucMap.addLayer(featureLayer);

			var baseLayer = new OpenLayers.Layer.XYZ("World Street Map",
					"http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}", {
						isBaseLayer: true,
						units: "m",
						sphericalMercator: true
			});
			hucMap.addLayer(baseLayer);
			hucMap.zoomToExtent(hucMap.restrictedExtent);
		};
		return {
			restrict : 'A',
			link : link,
			scope : {
				nwcFeatureMap : '&'
			}
		};
	});

}());

