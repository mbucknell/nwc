/*global angular SCE*/
/**
 * @requires angular
 */
(function () {
    var dictionary = angular.module('nwc.dictionary', []);
    dictionary.factory("MapControlDescriptions", ['$sce', function($sce) {
        return {
            select: {
                description: "Single click selects sites or watersheds. Pan by click and drag. Zoom with double click, map buttons or scroll wheel.",
                cursor: {cursor: "pointer"}
            },
            pan: {
                description: "Can pan by click and drag. Zoom with double click, map buttons or scroll wheel.",
                cursor: {cursor: "move"}
            },
            zoom: {
                description: "Click and hold to drag a bounding box to zoom.",
                cursor: {cursor: "crosshair"}
            },
            biosites: {
                description: "Click and hold to drag a bounding box around sites.",
                cursor: {cursor: "crosshair"}
            }
        };
    }]);
}());
