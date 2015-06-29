var NWC = NWC || {};

NWC.model = NWC.model || {};

NWC.model.AquaticBiologyFeaturesModel =  Backbone.Model.extend({
	defaults : {
		sites : [],
		gages : [],
		hucs : [],
		selected : []
	}         
});

NWC.model.PairModel =  Backbone.Model.extend({
	defaults : {
		site: null,
		gage: null,
		comment: null
	}
});

NWC.model.PairCollection = Backbone.Collection.extend({
	Model : NWC.model.PairModel,
	
	SERIES_LABELS : [
						{seriesName: 'SiteNumber'},
						{seriesName: 'SiteName'},
						{seriesName: 'SiteDrainageAreaSqMi'},
						{seriesName: 'GageID'},
						{seriesName: 'GageName'},
						{seriesName: 'GageDrainageAreaSqKM'},
						{seriesName: 'Comment'}
					],
	DOWNLOAD_HEADER: "Aquatic Biology Site-Gage pair selections",
	
	addPair : function(s,g) {
		var newPair = new this.Model({site: s, gage: g, comment: null});
		this.add(newPair);
	},
	// loop through the collection of pairs and returns array of rows of pairs
	getPairData : function() {
		var pairData = [];
		pairData = this.map(function(model){
			var rows;
			rows	= [model.get("site").SiteNumber,
			model.get("site").SiteName,
			model.get("site").DrainageAr,
			model.get("gage").STAID,
			model.get("gage").STANAME,
			model.get("gage").DRAIN_SQKM,
			model.get("comment")];
		return rows;
		});
		return pairData;
	},
		
	toCSV: function() {
		var data = this.getPairData();
		var createSeriesLabel = function (metadata) {
			var label = metadata.seriesName;
			return label;
		};
		var csvHeader = "";
		if (this.DOWNLOAD_HEADER && this.DOWNLOAD_HEADER.length !== 0) {
			this.DOWNLOAD_HEADER.lines(function(line) {
				csvHeader += "\"# " + line + "\"\r\n";
			});
		}
		csvHeader += this.SERIES_LABELS.map(function(label) {
				return createSeriesLabel(label);
			}).join(",") + "\r\n";
		var csvValues = "";
		data.each(function(row) {
			// Add enclosing quotes to account for commas in the site and/or gage names
			csvValues += "\"" + row.join("\",\"") + "\"\r\n";
		});
		return csvHeader + csvValues;
	}
});

