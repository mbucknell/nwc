/*jslint browser: true */

var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.PublicationsTabView = NWC.view.BaseDiscoveryTabView.extend({

		initialize : function(options) {
			this.template = NWC.templates.getTemplate('dataDiscoveryList');
			NWC.view.BaseDiscoveryTabView.prototype.initialize.apply(this, arguments);
		},

		getList: function() {
			var deferred = $.Deferred();
			$.ajax({
				url : CONFIG.endpoint.direct.sciencebase + '/catalog/items?&q=&filter0=browseCategory%3DPublication&community=National+Water+Census&format=json',
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

		/* NEEDS to be modified */
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

