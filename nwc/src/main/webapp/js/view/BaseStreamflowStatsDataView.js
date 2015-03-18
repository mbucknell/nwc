var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.BaseStreamflowStatsDataView = NWC.view.BaseView.extend({

	events : {
		'click #calculate-stats-button' : 'calculateStats',
		'click #available-statistics input' : 'calculateStatsEnable',
		'click #download-stats-button' : 'downloadStats'
	},
	initialize : function(options) {
		if (!Object.has(this, 'context')) {
			this.context = {};
		}
		this.context.streamStatsOptions = NWC.dictionary.statGroups;

		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
	},


	calculateStatsEnable : function() {
		var disable = !($('#available-statistics input').is(':checked'));
		$('#calculate-stats-button').prop('disabled', disable);
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
		var startDate = NWC.util.WaterYearUtil.waterYearStart($('#start-year option:selected').val());
		var endDate = NWC.util.WaterYearUtil.waterYearEnd($('#end-year option:selected').val());

		var $loadingIndicator = $('#loading-stats-indicator');
		var $statsResultsDiv = $('#stats-results-div');

		var statTypes = [];

		ev.preventDefault();

		$statsResultsDiv.hide();
		$loadingIndicator.show();
		$('#available-statistics input:checked').each(function() {
			statTypes.push($(this).val());
		});

		this.getStats(statTypes, startDate, endDate).done(function(statistics) {
			this.streamflowStatistics = statistics;

			$('#stats-results-table-div').html(NWC.templates.getTemplate('statsResults')({streamflowStatistics : statistics}));
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

	/*
	 * Function returns the name to be used for the downloaded statistics file
	 * @return {String}
	 * This function should be overridden when extending this view
	 */
	getStatsFilename : function() {
		return 'stats.tsv';
	},

	downloadStats : function(ev) {
		ev.preventDefault();
		var blob = new Blob([this.getStatsTsv(this.getStatsTsvHeader())], {type:'text/tsv'});
		saveAs(blob, this.getStatsFilename());
	}
});

