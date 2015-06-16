/*jslint  browser: true */
/*global CONFIG */

var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.ProjectTabView = NWC.view.BaseDiscoveryTabView.extend({

		listTemplateName : 'dataDiscoveryList',
		detailsTemplateName : 'projectDetail',

		listUrl : CONFIG.endpoint.direct.sciencebase + '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DProject&format=json',
		detailsUrl : function(id) {
			return CONFIG.endpoint.direct.sciencebase + '/catalog/item/' + id + '?format=json';
		}
	});
}());


