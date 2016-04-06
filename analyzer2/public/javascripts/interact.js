$(function () {
    var canvas = $("#myChart").get(0);
    var ctx = canvas.getContext("2d");
    
    var myBarChart;
    var finalData = {
        labels: [0,1,2,3,4,5,6,7,8,9,10,11],
        datasets: []
    };
    

    var unique_AP = []
    
    function inUnique(BSSID){
        for(var i = 0; i<unique_AP.length; ++i){
            if(BSSID == unique_AP.MAC_ADDRESS){
                return [true,i]
            }
        }
        return [false,null] 
    }
    
    function updateChart(){
        $.getJSON( "/data", function( serverData ) {
            //console.log(serverData)
            if(myBarChart){
                myBarChart.destroy()
            }
            
            for(var i = 0; i<serverData.length; ++i){
                currData = serverData[i]
                exists = inUnique(currData.MAC_ADDRESS)
                oldID = exists[1]
                if(currData.CHANNEL > 11){
                    continue
                }
                if(exists[0]){
                    //if(currData.SIGNAL > unique_AP[oldID]){
                        unique_AP[oldID] = currData.SIGNAL
                    //}
                }else{
                    unique_AP.push(currData)
                }   
            }
            
            
            for(var i = 0; i<unique_AP.length; ++i){
                var values = []
                var channel = unique_AP[i].CHANNEL
                for(var j = 0 ; j<11; ++i){
                    if(j == channel - 1){
                        values.push(-90)
                    }else if(j ==  channel){
                        values.push(unique_AP[i].SIGNAL)
                    }else if(j ==  channel +1){
                        values.push(-90)
                    }else{
                        values.push(null)
                    }
                }
                var dataset = {
                    label: unique_AP[i].SSID ,
                    fillColor: "rgba(151,187,205,0.5)",
                    strokeColor: "rgba(151,187,205,0.8)",
                    highlightFill: "rgba(151,187,205,0.75)",
                    highlightStroke: "rgba(151,187,205,1)",
                    data: values
                }
                finalData.datasets.push(dataset)
            }
            //console.log("GOT HERE")
            //console.log(JSON.stringify(unique_AP))
            myBarChart = new Chart(ctx).Line(finalData, {pointDot : false});
            
            
        });
    }
    //updateChart()
    setInterval(updateChart, 10000);
});
