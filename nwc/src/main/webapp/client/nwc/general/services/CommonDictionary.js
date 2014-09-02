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
            },
            observed: {
                description: $sce.trustAsHtml("Observed streamflow from <a href=\"http://waterdata.usgs.gov/nwis\" target=\"_blank\">National Water Information System <i class=\"fa fa-external-link\"></i></a> Gages.")
            },
            modeled: {
                description: $sce.trustAsHtml("Modeled streamflow is <strong>preliminary</strong> and subject to change. <a href=\"#/workflow/streamflow-statistics/model-info\" target=\"_blank\">Documentation in Review. <i class=\"fa fa-external-link\"></i></a>")
            }
        };
    }]);
}());
