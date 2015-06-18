/*jslint browser: true */

var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.PublicationsTabView = NWC.view.BaseDiscoveryTabView.extend({
		listTemplateName : 'dataDiscoveryList',
		detailsTemplateName : 'publicationsDetail', //TODO: change to publications template

		listUrl : function() {
			return CONFIG.endpoint.direct.sciencebase + '/catalog/items?&q=&filter0=browseCategory%3DPublication&community=National+Water+Census&format=json';
		},
		detailsUrl : function(id) {
			return CONFIG.endpoint.direct.sciencebase + '/catalog/item/' + id + '?format=json';
		}
	});
}());

