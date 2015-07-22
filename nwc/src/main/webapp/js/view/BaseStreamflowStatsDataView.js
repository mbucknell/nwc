var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.BaseStreamflowStatsDataView = NWC.view.BaseView.extend({

	events : {
		'click #calculate-stats-button-left' : 'calculateStats',
		'click #calculate-stats-button-right' : 'calculateStats',
		'click #available-statistics-left input' : 'calculateStatsEnableLeft',
		'click #available-statistics-right input' : 'calculateStatsEnableRight',
		'click #download-stats-button-left' : 'downloadStats',
		'click #download-stats-button-right' : 'downloadStats'
	},
	initialize : function(options) {
		if (!Object.has(this, 'context')) {
			this.context = {};
		}
		this.context.streamStatsOptions = NWC.dictionary.statGroups;

		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
	},

	/*
	 * Functions which enable the statistics button
	 * must be a better way to do this
	 */
	
	calculateStatsEnableLeft : function() {
		var disable = !($('#available-statistics-left input').is(':checked'));
		$('#calculate-stats-button-left').prop('disabled', disable);
	},

	calculateStatsEnableRight : function() {
		var disable = !($('#available-statistics-right input').is(':checked'));
		$('#calculate-stats-button-right').prop('disabled', disable);
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
		var pane =  $el.data('pane');
		var startDate = NWC.util.WaterYearUtil.waterYearStart($('#start-year-' + pane + ' option:selected').val());
		var endDate = NWC.util.WaterYearUtil.waterYearEnd($('#end-year' + pane + ' option:selected').val());

		var $loadingIndicator = $('#loading-stats-indicator-' + pane);
		var $statsResultsDiv = $('#stats-results-div-' + pane);

		var statTypes = [];

		ev.preventDefault();

		$('#calculate-stats-button-' + pane).hide();

		$statsResultsDiv.hide();
		$loadingIndicator.show();
		$('#available-statistics-' + pane + ' input:checked').each(function() {
			statTypes.push($(this).val());
		});

		this.getStats(statTypes, startDate, endDate).done(function(statistics) {
			//must be a better way here and corresponding getStatsTsv...Mary?
			if (pane == 'left') {
				this.streamflowStatisticsLeft = statistics;				
			}
			else {
				this.streamflowStatisticsRight = statistics;								
			}

			$('#stats-results-table-div-' + pane).html(NWC.templates.getTemplate('statsResults')({streamflowStatistics : statistics}));
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
		var pane =  $el.data('pane');
		ev.preventDefault();
		var blob = new Blob([this.getStatsTsv(this.getStatsTsvHeader(), pane)], {type:'text/tsv'});
		saveAs(blob, this.getStatsFilename());
	}
});

