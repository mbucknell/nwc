/*global angular*/
(function () {
    var waterUsageChart = angular.module('nwc.waterUsageChart', []);
    var privateChart = {};
    var setChart = function(chartEltSelector, values, labels, ylabel) {
            if(!values || !values.length){
                if(privateChart.shutdown){
                    privateChart.shutdown()
                }
                return;
            }

            var dateFormat = '{yyyy}';
            var dateIndex = 0;

            var stack = true,
                    bars = true;

            //convert all x values from String to Date
            values = values.map(function (row) {
                row[dateIndex] = Date.create(row[dateIndex]).utc();
                return row;
            });
            //now transform from the parameterized row-oriented parallel array to flotchart's column-oriented array
            var data = [];
            //first check row length
            var dataRowLength = values[0].length - 1;//ignore date column
            
            if(dataRowLength !== labels.length){
                var errMsg = 'Water Usage labels and data differ in length';
                alert(errMsg);
                throw new Exception(errMsg);
            }
            
            labels.each(function(label, labelIndex){
               var column = {label:label};
                //date column offesets index calculation by one
                var valueIndex = labelIndex + 1;
               column.data = values.map(function(row){
                       var newRow = [];
                       newRow.push(row[dateIndex]);
                       newRow.push(row[valueIndex]);
                       return newRow;
                });
               data.push(column);
            });
            var yearTooltipSeparator = ' - ';
            var numYearsPerDatum = 5;
            (function plotWithOptions () {
                /*
                 *  #ms in 5 years = (#ms in 4 non-leap years) + (#ms in 1 leap year)   =   157766400000
                 *  #ms in 4 non-leap years = 4 * #ms one leap year                 =   126144000000
                 *  #ms in 1 leap year = #ms one non-leap year + #ms in one day     =   31622400000
                 *  #ms in one non-leap year = 365 * #ms in one day                 =   31536000000
                 *  #ms in one day = 1000 * 60 * 60 * 24                            =   86400000
                 */
                var yearInMilliseconds = 1000 * 60 * 60 * 24 * 365; // 31536000000
                $.plot(chartEltSelector, data, {
                    series: {
                        stack: stack,
                        bars: {
                            show: bars,
                            barWidth: yearInMilliseconds
                        }
                    },
                    xaxis: {
                        mode: "time",
                        tickSize: [5, "year"],
                        tickLength: 10,
                        color: "black",
                        axisLabel: "Date",
                        axisLabelPadding: 10,
                        font: {
                            size: 12,
                            family: "sans-serif",
                            color: "#000000"
                        }
                    },
                    yaxis: {
                        color: "black",
                        axisLabel: ylabel,
                        axisLabelPadding: 3,
                        font: {
                            size: 12,
                            family: "sans-serif",
                            color: "#000000"
                        }
                    },
                    grid: {
                        hoverable: true,
                        borderWidth: 2
                    },
                    tooltip: true,
                    tooltipOpts: {
                          content: function(label, xval, yval, flotItem){
                              var offsetIndex = flotItem.datapoint.length - 1;
                              var offset = flotItem.datapoint[offsetIndex];
                              var realValue = yval - offset;
                              var initialDatumYear = Date.create(xval).utc().format(dateFormat);
                              var finalDatumYear = parseInt(initialDatumYear) + numYearsPerDatum;
                              var dateDisplay = initialDatumYear + yearTooltipSeparator + finalDatumYear;
                              var waterUsageUnitName = (function grabUnitsFromLabel (label) {
                                  var result = null;
                                  var regex = /\((.*)\)/;
                                  if (regex.test(label)) {
                                      result = regex.exec(label)[1];
                                  }
                                  return result;
                              })(label);
                              var tooltipText = 'Date: ' + dateDisplay + "<br/>" + label + ": " + realValue + " " + waterUsageUnitName;
                              return tooltipText;
                          }
                    }
                });
            })();
            
    };
    waterUsageChart.service('WaterUsageChart', [
        function(){
            return {
                setChart: setChart,
                getChart: function() {
                    return privateChart;
                }
            };
        }
    ]);
    
}());
