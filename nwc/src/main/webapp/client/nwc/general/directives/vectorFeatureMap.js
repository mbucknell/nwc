(function() {
	var vectorFeatureMap = angular.module('nwc.directives.vectorFeatureMap', []);

	vectorFeatureMap.directive('nwcVectorFeatureMap', function() {
		var link = function(scope, element, attrs) {
			var layer_style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
			layer_style.fillOpacity = 0.2;
			layer_style.graphicOpacity = 1;
			var vectorLayer = new OpenLayers.Layer.Vector("Simple Geometry", {
				style: layer_style
			});
			vectorLayer.addFeatures([scope.nwcVectorFeatureMap()]);
			var layerExtent = vectorLayer.getDataExtent();
			var hucMap = new OpenLayers.Map(element.attr('id'),{controls: [],'restrictedExtent': layerExtent});
			hucMap.addLayer(vectorLayer);

			var layer = new OpenLayers.Layer.XYZ("World Street Map",
					"http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}", {
						isBaseLayer: true,
						units: "m",
						sphericalMercator: true
			});
			hucMap.addLayer(layer);
			hucMap.zoomToExtent(hucMap.restrictedExtent);
		};
		return {
			restrict : 'A',
			link : link,
			scope : {
				nwcVectorFeatureMap : '&'
			}
		};
	});

}());

