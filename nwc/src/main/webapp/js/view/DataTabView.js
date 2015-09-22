/*jslint  browser: true */

var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.DataTabView = NWC.view.BaseDiscoveryTabView.extend({

		listTemplateName : 'dataDiscoveryList',
		detailsTemplateName : 'dataDetail',

		listUrl : function() {
			return CONFIG.endpoint.direct.sciencebase + NWC.config.get('sciencebaseUrlFragment').getDataFragment();
		},
		detailsUrl : function(id) {
			return CONFIG.endpoint.direct.sciencebase + NWC.config.get('sciencebaseUrlFragment').getSingleItemFragment(id);
		}
	});
}());


