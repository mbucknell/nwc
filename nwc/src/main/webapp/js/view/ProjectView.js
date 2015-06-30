var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.ProjectView = NWC.view.BaseView.extend({
	templateName : 'project',

	events: {
		'click #back-button': "back",	
	},

	/*
	 * @constructor
	 * @param {Object} options
	 *     @prop {Jquery element} el - the html element where view is rendered
	 */
	initialize : function(options) {
		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		this.projectDetailView = new NWC.view.ProjectTabView({
		});		
		
		this.projectDetailView.getDetails(options.projectId).done(function(data) {
			$('#project-details').append('<h6>Title</h6>');
			$('#project-details').append(data.title);
			$('#project-details').append(NWC.templates.getTemplate('projectDetail')(data));
		});

		this.dataDetailView = new NWC.view.DataTabView({
		});
		
		var _this = this;
		this.getDataList(options.projectId).done(function(dataList) {
			if (dataList.items.length == 0) {
				$('#data-details').append('<div class="row" style="margin: 0px;">None available</div>');				
			}
			else{
				var i;
				for (i=0; i < dataList.items.length; i++) {
					_this.dataDetailView.getDetails(dataList.items[i].id).done(function(data) {
						$('#data-details').append('<div class="row" style="margin: 0px;"></div>');
						$('#data-details').append('<h6>Title</h6>');
						$('#data-details').append(data.title);
						$('#data-details').append(NWC.templates.getTemplate('dataDetail')(data));
						$('#data-details').append('<div class="row" style="margin: 0px;border-bottom: 1px solid black;"></div>');						
					});
				};				
			}
		});
		
	},

	listUrl : function(id) {
		return CONFIG.endpoint.direct.sciencebase + '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DData&parentId=' + id + '&format=json';
	},

	/*
	 * Uses the listUrl function result to retrieve information about all datasets for a specific project, identified by id
	 * @param {String} id
	 * @returns Jquery.promise - If the call succeeds, the promise is resolved with the data retrieved.
	 * If the call fails, the promise is rejected with an error message.
	 */
	getDataList : function(id) {
		var deferred = $.Deferred();
		var listUrl = this.listUrl(id);

		$.ajax({
			url : listUrl,
			dataType : "json",
			success: function(data) {
				deferred.resolve(data);
			},
			error : function() {
				//@todo - setup app level error handling
				var errorMessage = 'Error retrieving detail data from ' + listUrl;
				alert(errorMessage);
			}
		});

		return deferred.promise();
	},

	back: function() {
		if(window.history.length > 2) {
			//more than one route hit -> user did not land to current page directly\
			window.history.back();
		} 
		else {
			//otherwise go to the home page.
			window.location.assign('');
		}
	}
});
