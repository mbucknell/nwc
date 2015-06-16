/*jslint  browser: true */

var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.DataTabView = NWC.view.BaseDiscoveryTabView.extend({

		listTemplateName : 'dataDiscoveryList',
		detailsTemplateName : 'dataDetail',

		listUrl : CONFIG.endpoint.direct.sciencebase + '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DData&format=json',
		detailsUrl : function(id) {
			return CONFIG.endpoint.direct.sciencebase + '/catalog/item/' + id + '?format=json';
		}
	});
}());


