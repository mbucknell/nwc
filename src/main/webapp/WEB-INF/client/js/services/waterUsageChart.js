/*global angular*/
(function () {
    var waterUsageChart = angular.module('nwc.waterUsageChart', []);
    var privateChart = {};
    var setChart = function(chartEltSelector, values, labels) {
            
            var d1 = [];
            var d2 = [];
            
            var d3 = [];
            var blankTimes = [2, 5, 6];
            (10).times(function(i){;
                if(blankTimes.any(i)){
                    return;
                }
                var date = (new Date("2001/"+ i +"/01")).getTime();
                d1.push([date, parseInt(Math.random() * 30)]);
                d2.push([date, parseInt(Math.random() * 30)]);
                d3.push([date, parseInt(Math.random() * 30)]);
            });
            var Data = function(data, label) {
                this.data = data;
                this.label = label;
            };
            

            
            var waterUsageUnitName = 'mm per day'; 
            var dateFormat = '{yyyy}-{MM}-{dd}';
            var stack = true,
                    bars = true;
            //now transform from the parameterized parallel array format to flotchart's format
            var data = [];
            if(values.length !== labels.length){
                var errMsg = 'Water Usage labels and data differ in length';
                alert(errMsg);
                throw new Exception(errMsg);
            }
            
            labels.each(function(label, index){
               data.push({data: values[index], label: label}); 
            });

            function plotWithOptions () {
                var plot = $.plot(chartEltSelector, [new Data(d1, 'Agricultural'), new Data(d2, 'Industrial'), new Data(d3, 'Municipal')], {
                    series: {
                        stack: stack,
                        bars: {
                            show: bars,
                            barWidth: 84000000 * 30 //garbage magic number just for show
                        }
                    },
                    xaxis: {
                        mode: "time",
                        tickSize: [1, "month"],
                        tickLength: 10,
                        color: "black",
                        axisLabel: "Date",
                        axisLabelPadding: 10
                    },
                    yaxis: {
                        color: "black",
                        axisLabel: waterUsageUnitName,
                        axisLabelPadding: 3
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
                              var dateDisplay = Date.create(xval).format(dateFormat);
                              var tooltipText = "Date: " + dateDisplay + ", " + label + ": " + realValue + " " + waterUsageUnitName;
                              return tooltipText;
                          }
                    }
                });
            }
            plotWithOptions();
            
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