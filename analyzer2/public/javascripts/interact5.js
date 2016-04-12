$(function () {
    var canvas = $("#myChart").get(0);
    var ctx = canvas.getContext("2d");
    var refreshButton = $(".scan")
    var myBarChart;

    
    var table = $("#table")
    var tableHeader = "<table><tr><th>SSID</th><th>Channel</th><th>Signal(dBm)</th><th>Mac Address</th><th>Frequency</th></tr>"
    

    var canvas_overTime = $("#overTimeChart").get(0);
    var ctx_overTime = canvas_overTime.getContext("2d");
    var overTimeChart;

    var legend = $("#legend")

    function updateChart(){
      var groupType = $('input[name=grouping]:checked', '#groupForm').val()
      $.getJSON( "/data?grouping="+groupType, function( serverData ) {
          //console.log(serverData)
          if(myBarChart){
              myBarChart.destroy()
          }
          myBarChart = new Chart(ctx).Line(serverData, {animation:false,pointDot : false});
      });
      updateTable()
      updateOTChart()
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
    setInterval(updateTable, 2000);
    refreshButton.click(updateChart)

});
