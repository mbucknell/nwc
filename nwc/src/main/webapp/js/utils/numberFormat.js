var NWC = NWC || {};

NWC.util.numberFormat = (function() {
	var that = {};

	that.roundToInteger = function(val) {
		var result = val.round();
		if (result === 0) {
			return '< 0.5';
		}
		else {
			return result.format();
		}
	};

	return that;

}())


