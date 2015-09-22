/*jslint  browser: true */
/*global CONFIG */

var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.ProjectTabView = NWC.view.BaseDiscoveryTabView.extend({

		listTemplateName : 'dataDiscoveryList',
		detailsTemplateName : 'projectDetail',

		listUrl : function() {
			return CONFIG.endpoint.direct.sciencebase + NWC.config.get('sciencebaseUrlFragment').getProjectsFragment();
		},
		detailsUrl : function(id) {
			return CONFIG.endpoint.direct.sciencebase + NWC.config.get('sciencebaseUrlFragment').getSingleItemFragment(id);
		}
	});
}());


