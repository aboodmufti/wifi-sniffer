$(function () {
    var canvas = $("#myChart").get(0);
    var ctx = canvas.getContext("2d");
    var refreshButton = $(".scan")
    var myBarChart;
    var table = $("#table")
    var tableHeader = "<table><tr><th>SSID</th><th>Channel</th><th>Signal(dBm)</th><th>Mac Address</th><th>Frequency</th></tr>"
    

    function updateChart(){
      var groupType = $('input[name=grouping]:checked', '#groupForm').val()
      $.getJSON( "/data?grouping="+groupType, function( serverData ) {
          //console.log(serverData)
          if(myBarChart){
              myBarChart.destroy()
          }
          myBarChart = new Chart(ctx).Line(serverData, {pointDot : false});
      });
      updateTable()
      
    }

    function updateTable(){
      var groupType = $('input[name=grouping]:checked', '#groupForm').val()
      $.getJSON( "/dataTable?grouping="+groupType, function( serverData ) {
          var tableContent = tableHeader
          for(var i = 0; i<serverData.length ; ++i){
            var currData = serverData[i] 
            if(currData){
              tableContent += "<tr><td>"+currData.SSID+"</td><td>"+currData.CHANNEL+"</td><td>"+currData.SIGNAL+"</td><td>"+currData.MAC_ADDRESS+"</td><td>"+currData.FREQUENCY+"</td></tr>"
            }
          }
          tableContent += "</table>"
          table.html(tableContent)
      });
    }

    updateChart()
    setInterval(updateTable, 1000);
    refreshButton.click(updateChart)

});
