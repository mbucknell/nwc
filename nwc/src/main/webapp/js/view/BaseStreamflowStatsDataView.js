var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.BaseStreamflowStatsDataView = NWC.view.BaseView.extend({

	events : {
		'click #calculate-stats-button' : 'calculateStats',
		'click #available-statistics input' : 'calculateStatsEnable',
		'click #download-stats-button' : 'downloadStats'
	},
	initialize : function(options) {

		NWC.view.BaseView.prototype.initialize.apply(this, arguments);

		this.CalculateStatsView = new NWC.view.StreamflowStatsCalculateStatsView({
			el : $('.calculate-stats'),
			years : this.context.years || null
		});
	},

	/*
	 * Function which enables the statistics button
	 */
	
	calculateStatsEnable : function(ev) {
		var $el = $(ev.currentTarget);
		var disable = !($($el).is(':checked'));
		var $paneDiv = $el.parents('.calculate-stats');
		var $calculateButton = $paneDiv.find('#calculate-stats-button');
		$calculateButton.prop('disabled', disable);
	},

	/*
	 * Function which retrieves the statistics
	 * @return Jquery.Deferred which when resolved returns the array of statistics
	 * This function should be overridden when extending this view.
	 */
	getStats : function(statTypes, startDate, endDate) {
		var d = $.Deferred();
		d.resolve([]);
		return d;
	},

	calculateStats : function(ev) {
		var $el = $(ev.currentTarget);
		var $paneDiv = $el.parents('.calculate-stats');
		var pane = $paneDiv.get(0).id;
		var $startSelect = $paneDiv.find('.start-year option:selected'); 
		var $endSelect = $paneDiv.find('.end-year option:selected'); 
		var startDate = NWC.util.WaterYearUtil.waterYearStart($($startSelect).val());
		var endDate = NWC.util.WaterYearUtil.waterYearEnd($($endSelect).val());

		var $loadingIndicator = $($paneDiv.find('#loading-stats-indicator'));
		var $statsResultsDiv = $($paneDiv.find('#stats-results-div'));

		var statTypes = [];

		ev.preventDefault();

		var $calculateButton = $paneDiv.find('#calculate-stats-button');
		$calculateButton.hide();

		$statsResultsDiv.hide();
		$loadingIndicator.show();
		var $statsSelected = $paneDiv.find('#available-statistics input:checked');
		$($statsSelected).each(function() {
			statTypes.push($(this).val());
		});

		this.getStats(statTypes, startDate, endDate).done(function(statistics) {
			if (pane == 'left') {
				this.streamflowStatisticsLeft = statistics;				
			}
			else {
				this.streamflowStatisticsRight = statistics;								
			}

			var $statsResultsTableDiv = $($paneDiv.find('#stats-results-table-div'));
			$statsResultsTableDiv.html(NWC.templates.getTemplate('statsResults')({streamflowStatistics : statistics}));
			$statsResultsDiv.show();
			$loadingIndicator.hide();

		}.bind(this));
	},

	/*
	 * Function which return the header to be used for the downloaded tsv statistics file
	 * @ return {String}
	 * Function should be overridden when extending the view
	 */
	getStatsTsvHeader : function() {
		return '';
	},

	getStatsTsv : function(tsvHeader, pane) {
		var statistics;
		if (pane == 'left') {
			statistics = this.streamflowStatisticsLeft;			
		}
		else {
			statistics = this.streamflowStatisticsRight;
		}
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

	/*
	 * Function returns the name to be used for the downloaded statistics file
	 * @return {String}
	 * This function should be overridden when extending this view
	 */
	getStatsFilename : function() {
		return 'stats.tsv';
	},

	downloadStats : function(ev) {
		var $el = $(ev.currentTarget);
		var $paneDiv = $el.parents('.calculate-stats');
		var pane = $paneDiv.get(0).id;
		ev.preventDefault();
		var blob = new Blob([this.getStatsTsv(this.getStatsTsvHeader(), pane)], {type:'text/tsv'});
		saveAs(blob, this.getStatsFilename());
	}
});

