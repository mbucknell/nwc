/*jslint  browser: true */

var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.ProjectTabView = NWC.view.BaseDiscoveryTabView.extend({

		initialize : function(options) {
			this.template = NWC.templates.getTemplate('dataDiscoveryList');
			NWC.view.BaseDiscoveryTabView.prototype.initialize.apply(this, arguments);
		},

		getList: function() {
			var deferred = $.Deferred();
			$.ajax({
				url : CONFIG.endpoint.direct.sciencebase + '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DProject&max=100&format=json',
				dataType : "json",
				success: function(data) {
					deferred.resolve(data);
				},
				error : function() {
					//@todo - setup app level error handling
					var errorMessage = 'error retrieving project list data';
					alert(errorMessage);
					deferred.reject(errorMessage);
				}
			});

			return deferred.promise();
		},

		getDetails : function(id, $detailsDiv) {
			$.ajax({
				url : CONFIG.endpoint.direct.sciencebase + '/catalog/item/' + id + '?format=json',
				dataType : "json",
				success: function(data) {
					$detailsDiv.html(NWC.templates.getTemplate('dataDiscoveryDetail')({detail : data}));
				},
				error : function() {
					//@todo - setup app level error handling
					var errorMessage = 'error retrieving project detail data';
					alert(errorMessage);
				}
			});
		}
	});
}());


