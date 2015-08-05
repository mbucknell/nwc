/*jslint  browser: true */
/*global CONFIG */

var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * Subview for the streamflow stats gage and huc data page
 * @constructor extends NWC.BaseView
 */
(function() {
	"use strict";

	NWC.view.StreamflowCalculateStatsView = NWC.view.BaseView.extend({

		templateName : 'streamflowCalcStats',

		events : {
			'click #calculate-stats-button' : 'calculateStats',
			'click #available-statistics input' : 'calculateStatsEnable',
			'click #download-stats-button' : 'downloadStats'
		},
		
		/*
		 * @constructs
		 * @param {Object} options
		 *     @prop {Jquery element} el - this is where the view will be rendered
		 *     @prop {object} streamStatsOptions - this is the list of stat types
		 *     @prop {object} years (optional) - used to populate the date picker in the template
		 *     @prop {object} getStats - gets statistics for the gage or huc
		 *     @prop {object} getStatsTsvHeader - gets header which is different for gage and huc
		 *     @prop {object} getStatsFilename - get download file name which is different for gage and huc
		 */
		initialize : function(options){
			this.context = {
					streamStatsOptions : NWC.dictionary.statGroups,
					years : options.years
				};
			this.getStats = options.getStats;
			this.getStatsTsvHeader = options.getStatsTsvHeader;
			this.getStatsFilename = options.getStatsFilename;
			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		},

		/*
		 * Function which enables the statistics button
		 */		
		calculateStatsEnable : function() {
			var disable = !(this.$el.find('input').is(':checked'));
			this.$el.find('#calculate-stats-button').prop('disabled', disable);
		},

		calculateStats : function(ev) {
			var $startSelect = this.$el.find('.start-year option:selected'); 
			var $endSelect = this.$el.find('.end-year option:selected'); 
			var startDate = NWC.util.WaterYearUtil.waterYearStart($startSelect.val());
			var endDate = NWC.util.WaterYearUtil.waterYearEnd($endSelect.val());

			var $loadingIndicator = $(this.$el.find('#loading-stats-indicator'));
			var $statsResultsDiv = $(this.$el.find('#stats-results-div'));

			var statTypes = [];

			ev.preventDefault();

			this.$el.find('#calculate-stats-button').hide();

			$statsResultsDiv.hide();
			$loadingIndicator.show();
			var $statsSelected = this.$el.find('#available-statistics input:checked');
			$($statsSelected).each(function() {
				statTypes.push($(this).val());
			});

			this.getStats(statTypes, startDate, endDate).done(function(statistics) {
				this.streamflowStatistics = statistics;				

				var $statsResultsTableDiv = $(this.$el.find('#stats-results-table-div'));
				$statsResultsTableDiv.html(NWC.templates.getTemplate('statsResults')({streamflowStatistics : statistics}));
				$statsResultsDiv.show();
				$loadingIndicator.hide();

			}.bind(this));
		},

		getStatsTsv : function(tsvHeader) {
			var statistics = this.streamflowStatistics;
			var tsvValues = "Name\tValue\tDescription\n";
			var i;

			for (i = 0; i < statistics.length; i += 1) {
				if (statistics[i].name) {
					tsvValues += statistics[i].name + "\t";
				}
				else {
					tsvValues += "\t";
				}
				if (statistics[i].value) {
					tsvValues += statistics[i].value + "\t";
				}
				else {
					tsvValues += "\t";
				}
				if (statistics[i].desc) {
					tsvValues += statistics[i].desc + "\n";
				}
				else {
					tsvValues += "\n";
				}
			}
			return tsvHeader + tsvValues;
		},

		downloadStats : function(ev) {
			ev.preventDefault();
			var blob = new Blob([this.getStatsTsv(this.getStatsTsvHeader())], {type:'text/tsv'});
			saveAs(blob, this.getStatsFilename());
		}
		
	});
}());