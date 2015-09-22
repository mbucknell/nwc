/*jslint browser: true */

var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.PublicationsTabView = NWC.view.BaseDiscoveryTabView.extend({
		listTemplateName : 'dataDiscoveryList',
		detailsTemplateName : 'publicationsDetail',

		listUrl : function() {
			return CONFIG.endpoint.direct.sciencebase + NWC.config.get('sciencebaseUrlFragment').getPublicationsFragment();
		},
		detailsUrl : function(id) {
			return CONFIG.endpoint.direct.sciencebase + NWC.config.get('sciencebaseUrlFragment').getSingleItemFragment(id);
		}
	});
}());

