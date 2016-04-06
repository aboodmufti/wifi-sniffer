$(function () {
    var canvas = $("#myChart").get(0);
    var ctx = canvas.getContext("2d");

    var myBarChart;
    
    var data = {
        labels: [0,1,2,3,4,5,6,7,8,9,10,11],
        datasets: [
            {
                label: "CU Wireless",
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: [-90,-60,-90]
            },
			{
                label: "eduroam",
                fillColor: "rgba(151,0,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: [null,null,null,null,-90,-70,-90]
            }
        ]
    };
    /*
    $.getJSON( "/actualData", function( data ) {
        
        
    });*/
    myBarChart = new Chart(ctx).Line(data, {
        pointDot : false
        });
    
});
