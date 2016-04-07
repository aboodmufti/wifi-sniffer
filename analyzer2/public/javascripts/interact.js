$(function () {
    var canvas = $("#myChart").get(0);
    var ctx = canvas.getContext("2d");
    var refreshButton = $("#scan")
    var myBarChart;
      function updateChart(){
      $.getJSON( "/data", function( serverData ) {
          //console.log(serverData)
          if(myBarChart){
              myBarChart.destroy()
          }
          myBarChart = new Chart(ctx).Line(serverData, {pointDot : false});
      });
     }
    updateChart()
    //setInterval(updateChart, 10000);
    refreshButton.click(updateChart)
});
