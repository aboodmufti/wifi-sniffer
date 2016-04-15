$(function () {
    var canvas = $("#myChart").get(0);
    var ctx = canvas.getContext("2d");
    var refreshButton = $(".scan")
    var myBarChart;
    var newChart;
    
    var table = $("#table")
    var tableHeader = "<table><tr><th>SSID</th><th>Channel</th><th>Signal(dBm)</th><th>Mac Address</th><th>Frequency</th></tr>"
    

    //var canvas_overTime = $("#overTimeChart").get(0);
    //var ctx_overTime = canvas_overTime.getContext("2d");
    //var overTimeChart;

    var legend = $("#legend")
    var recom = $("#recom")
    var polarReference = $("#myChart")
    var lineReference = $("#chart")
    polarReference.hide()
    lineReference.hide()

    function updateChart(){
      
      var groupType = $('input[name=grouping]:checked', '#groupForm').val()
      $.getJSON( "/data?grouping="+groupType, function( serverData ) {
          polarReference.hide()
          lineReference.hide()

          if(groupType == "ssid"){
            if(myBarChart){
              myBarChart.destroy()
            }
            polarReference.show()
            var chartOptions = {
                    responsive:true,
                    scaleBeginAtZero:false,
                    barBeginAtOrigin:true,
                    scaleOverride: true,
                    scaleSteps: 9,
                    scaleStepWidth: 10,
                    scaleStartValue: -100,
                    responsive: false,
                    animation: false
            }

            myBarChart = new Chart(ctx).PolarArea(serverData,chartOptions);
          }else{
            lineReference.show()
            if(newChart){
              newChart.detach()
            }

            for(var i = 0; i < serverData.series.length; ++i){
              var data = []
              var currData = serverData.series[i]
              for(var j = 0; j < currData.length; ++j){
                if(currData[j] != null){
                  data[j] = currData[j]
                }
              }
              serverData.series[i] = data
            }
            newChart = new Chartist.Line('.ct-chart', serverData, {
                      fullWidth: true,
                      chartPadding: {
                        right: 40}
                      });
          }
      });
      //updateTable()
      //updateOTChart()
    }

    var rounds = 0
    var permanent_record = []
    function addToRecord(ssid,mac,signal){
      var added = false
      for(var i = 0; i<permanent_record.length ; ++i){
        if(mac == permanent_record[i].MAC_ADDRESS){
          permanent_record[i].signals.push(signal)
          added = true 
          return;
        }
      }
      if(added == false){
        var record = {MAC_ADDRESS: mac,
                            SSID: ssid , 
                            signals: [signal]
                     }
        permanent_record.push(record)
      }
    }
    function summary(data){
      var max = data[0]
      var min = data[0]
      var channels = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,36:0,38:0,40:0,42:0,44:0,46:0,48:0,149:0,151:0,153:0,155:0,157:0,159:0,161:0,165:0}
      
      for(var i = 0 ; i< data.length; ++i){
        if(max.SIGNAL < data[i].SIGNAL){
          max = data[i]
        }
        if(min.SIGNAL > data[i].SIGNAL){
          min = data[i]
        }
        //if(channels[data[i].CHANNEL]){
          channels[data[i].CHANNEL]++
        //}
      }

      return [max,min,channels]
    }
    function chooseBest(data){
      var channels = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,36:0,38:0,40:0,42:0,44:0,46:0,48:0,149:0,151:0,153:0,155:0,157:0,159:0,161:0,165:0}
      for(var i = 0 ; i< data.length; ++i){
        var currData = data[i]
        var channel = currData.CHANNEL
        switch(channel) {
            case 1:
              channels[channel]++
              channels[channel+1]++
              channels[channel+2]++
              channels[channel+3]++
              channels[channel+4]++
              break;
            case 2:
              channels[channel]++
              channels[channel-1]++
              channels[channel+1]++
              channels[channel+2]++
              channels[channel+3]++
              channels[channel+4]++
              break;
            case 3:
              channels[channel]++
              channels[channel-2]++
              channels[channel-1]++
              channels[channel+1]++
              channels[channel+2]++
              channels[channel+3]++
              channels[channel+4]++
              break;
            case 4:
              channels[channel]++
              channels[channel-3]++
              channels[channel-2]++
              channels[channel-1]++
              channels[channel+1]++
              channels[channel+2]++
              channels[channel+3]++
              channels[channel+4]++
              break;
            case 5:
              channels[channel]++
              channels[channel-4]++
              channels[channel-3]++
              channels[channel-2]++
              channels[channel-1]++
              channels[channel+1]++
              channels[channel+2]++
              channels[channel+3]++
              channels[channel+4]++
              break;
            case 6:
              channels[channel]++
              channels[channel-4]++
              channels[channel-3]++
              channels[channel-2]++
              channels[channel-1]++
              channels[channel+1]++
              channels[channel+2]++
              channels[channel+3]++
              channels[channel+4]++
              break;
            case 7:
              channels[channel]++
              channels[channel-4]++
              channels[channel-3]++
              channels[channel-2]++
              channels[channel-1]++
              channels[channel+1]++
              channels[channel+2]++
              channels[channel+3]++
              channels[channel+4]++
              break;
            case 8:
              channels[channel]++
              channels[channel-4]++
              channels[channel-3]++
              channels[channel-2]++
              channels[channel-1]++
              channels[channel+1]++
              channels[channel+2]++
              channels[channel+3]++
              break;
            case 9:
              channels[channel]++
              channels[channel-4]++
              channels[channel-3]++
              channels[channel-2]++
              channels[channel-1]++
              channels[channel+1]++
              channels[channel+2]++
              break;
            case 10:
              channels[channel]++
              channels[channel-4]++
              channels[channel-3]++
              channels[channel-2]++
              channels[channel-1]++
              channels[channel+1]++
              break;
            case 11:
              channels[channel]++
              channels[channel-4]++
              channels[channel-3]++
              channels[channel-2]++
              channels[channel-1]++
              break;
            case 36:
              channels[channel]++
              channels[channel+2]++
              channels[channel+4]++
              break;
            case 38:
              channels[channel-2]++
              channels[channel]++
              channels[channel+2]++
              channels[channel+4]++
              break;
            case 40:
              channels[channel]++
              channels[channel-4]++
              channels[channel-2]++
              channels[channel+2]++
              channels[channel+4]++
              break;
            case 42:
              channels[channel]++
              channels[channel-4]++
              channels[channel-2]++
              channels[channel+2]++
              channels[channel+4]++
              break;
            case 44:
              channels[channel]++
              channels[channel-4]++
              channels[channel-2]++
              channels[channel+2]++
              channels[channel+4]++
              break;
            case 46:
              channels[channel]++
              channels[channel-4]++
              channels[channel-2]++
              channels[channel+2]++
              break;
            case 48:
              channels[channel]++
              channels[channel-4]++
              channels[channel-2]++
              break;
            case 149:
              channels[channel]++
              channels[151]++
              channels[153]++
              channels[155]++
              channels[157]++
              channels[159]++
              break;
            case 151:
              channels[channel]++
              channels[149]++
              channels[153]++
              channels[155]++
              channels[157]++
              channels[159]++
              break;
            case 153:
              channels[channel]++
              channels[149]++
              channels[151]++
              channels[155]++
              channels[157]++
              channels[159]++
              break;
            case 155:
              channels[channel]++
              channels[149]++
              channels[151]++
              channels[153]++
              channels[157]++
              channels[159]++
              channels[161]++
              channels[165]++
              break;
            case 157:
              channels[channel]++
              channels[151]++
              channels[153]++
              channels[155]++
              channels[159]++
              channels[161]++
              break;
            case 159:
              channels[channel]++
              channels[151]++
              channels[153]++
              channels[155]++
              channels[157]++
              channels[161]++
              break;
            case 161:
              channels[channel]++
              channels[155]++
              channels[157]++
              channels[159]++
              channels[165]++
              break;
            case 165:
              channels[channel]++
              break;
        }
      }
      //console.log(channels)
      var min2 = channels[1]
      var channel2 = 1
      var max2 = channels[1]
      var maxChannel2 = 1
      for (var chan in channels){
        if(chan > 11){
          continue
        }
        if(min2 > channels[chan]){
          min2 = channels[chan]
          channel2 = chan
        }
        if(max2 < channels[chan]){
          max2 = channels[chan]
          maxChannel2 = chan
        }
      }
      var min5 = channels[36]
      var channel5 = 36
      var max5 = channels[36]
      var maxChannel5 = 36
      for (var chan in channels){
        if(chan <= 11){
          continue
        }
        if(min5 > channels[chan]){
          min5 = channels[chan]
          channel5 = chan
        }

        if(max5 < channels[chan]){
          max5 = channels[chan]
          maxChannel5 = chan
        }
      }
      var summary2 = summary(data)
      var output = "Best channel on 2.4GHz : "+channel2
      output += "<br>Worst channel on 2.4GHz: "+maxChannel2
      output += "<br>Best channel on 5GHz: "+channel5
      output += "<br>Worst channel on 5GHz: "+maxChannel5
      output += "<br>Strongest AP: "+summary2[0].SSID + " - "+summary2[0].MAC_ADDRESS+" | Signal: "+summary2[0].SIGNAL
      output += "<br>Weakest AP: "+summary2[1].SSID + " - "+summary2[1].MAC_ADDRESS+" | Signal: "+summary2[1].SIGNAL
      output += "<br>AP per channel: "
      for(var channel in summary2[2]){
        if (summary2[2][channel] > 0){
          output += "<br>Channel : "+ channel + " | Number of APs: "+ summary2[2][channel]
        }
      }
      recom.html(output)
    }

    function checkAllRecords(rounds){
      for(var i = 0; i<permanent_record.length ; ++i){
        if(permanent_record[i].signals.length < rounds){
          permanent_record[i].signals.push(null)
          //permanent_record[i].signals.push(permanent_record[i].signals[permanent_record.length-1])
        }
      }
    }


    function updateTable(){
      //updateOTChart()
      //updateChart()
      var groupType = $('input[name=grouping]:checked', '#groupForm').val()
      $.getJSON( "/dataTable?grouping="+groupType, function( serverData ) {
          //console.log(serverData)
          if(groupType != "ssid"){
            chooseBest(serverData)
          }
          rounds++
          var tableContent = tableHeader
          for(var i = 0; i<serverData.length ; ++i){
            var currData = serverData[i] 
            if(currData){
              
              addToRecord(currData.SSID,currData.MAC_ADDRESS,currData.SIGNAL)
              tableContent += "<tr><td>"+currData.SSID+"</td><td>"+currData.CHANNEL+"</td><td>"+currData.SIGNAL+"</td><td>"+currData.MAC_ADDRESS+"</td><td>"+currData.FREQUENCY+"</td></tr>"
            }
          }
          checkAllRecords(rounds)
          tableContent += "</table>"
          table.html(tableContent)
          if(groupType != "ssid"){
            updateChart()
          }else{
            recom.html("")
          }
          //updateOTChart()
      });
    }

    
    function generateArray(length){
      var array = []
      for(var i = 0; i<length ; ++i){
        array.push("")
      }
      return array
    }

    function updateOTChart(){
      if(overTimeChart){
        overTimeChart.destroy()
      }
      var finalChartData = {
        labels: generateArray(rounds),
        datasets: []
      };
      //console.log(permanent_record)
      for(var i = 0; i<permanent_record.length ; ++i){
        var r = Math.floor((Math.random() * 220) + 20).toString();
        var g = Math.floor((Math.random() * 220) + 20).toString();
        var b = Math.floor((Math.random() * 220) + 20).toString();
        var dataset = {
            label: permanent_record[i].SSID +" - "+permanent_record[i].MAC_ADDRESS.substring(0,5) ,
            strokeColor: "rgba("+r+","+g+","+b+",0.7)",
            fillColor: "rgba("+r+","+g+","+b+",0)",
            pointHighlightFill: "rgba("+r+","+g+","+b+",1)",
            pointHighlightStroke: "rgba("+r+","+g+","+b+",1)",
            data: permanent_record[i].signals
        }
        finalChartData.datasets.push(dataset)
      }
      //console.log(finalChartData){animationSteps: 15}
      overTimeChart = new Chart(ctx_overTime).Line(finalChartData, {animation:false,animationSteps: 15,pointDot : false,bezierCurve:false,
      legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>"});
      legend.html(overTimeChart.generateLegend())
      //console.log(overTimeChart.datasets[0])
    }


    $('input[type=radio][name=grouping]').change(function() {
      permanent_record = []
      rounds = 0 
    });

    updateChart()
    setInterval(updateTable, 1000);
    refreshButton.click(updateChart)

});
