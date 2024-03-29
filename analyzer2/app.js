var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var PythonShell = require("python-shell")
var pyshell = new PythonShell('wifi_sniffer.py');
var chartData = []
var tableData = []
var message = ""
var reset = false
var moved = true
pyshell.on('message', function (message) {
    if(message.substr(0,2) == "{\""  && message.substr(-3) == "\" }"){
      try{
        var obj = JSON.parse(message)
        //console.log(obj.CHANNEL+" |||||||| "+ moved)
        if(obj.CHANNEL == 1 && moved == true){
          resetTable()
          moved = false
        }
        if(obj.CHANNEL > 1){
          moved = true
        }
        chartData.push(obj)
        tableData.push(obj)
      }catch(e){
        console.log(e.message);
      }
    }

});

function resetTable(){

    tableData = []
    for(var i = 0; i<unique_AP_table.length; ++i){
      if(unique_AP_table[i].count >26){
        unique_AP_table.splice(i,1)
        console.log("removed")
      }
      
    }

    for(var i = 0; i<unique_SSID_table.length; ++i){
      if(unique_SSID_table[i].count >26){
        unique_SSID_table.splice(i,1)
        console.log("removed")
      }
      
    }

}
function getMaxOfArray(numArray) {
    var max = numArray[0];
    var maxIndex = 0;

    for (var i = 1; i < numArray.length; i++) {
        if (numArray[i] > max) {
            maxIndex = i;
            max = numArray[i];
        }
    }

    return [max,maxIndex];
    //return Math.max.apply(null, numArray);
}

function getMaxOfArray2(numArray) {
    var maxSignal = numArray[0].SIGNAL;
    var max = numArray[0]

    for (var i = 1; i < numArray.length; i++) {
        if (numArray[i].SIGNAL > maxSignal) {
            maxSignal = numArray[i].SIGNAL
            max = numArray[i];
        }
    }
    //console.log(max)
    return max;
    //return Math.max.apply(null, numArray);
}

var unique_AP_table = []
var unique_SSID_table = []
app.get("/dataTable", function(req, res) {
  

  var groupType = req.query.grouping

  function inUniqueMAC(BSSID){
      
      for(var i = 0; i<unique_AP_table.length; ++i){
          if(unique_AP_table[i] && BSSID == unique_AP_table[i].MAC_ADDRESS){
              return [true,i]
          }
      }
      return [false,null] 
  }
  

  function inUniqueSSID(SSID){
      
      for(var i = 0; i<unique_SSID_table.length; ++i){
          if(unique_SSID_table[i] && SSID == unique_SSID_table[i].SSID){
              return [true,i]
          }
      }
      return [false,null] 
  }

  var ssidDidNotChange = true
  var allSignals ={}
  /*
  This for loop is populating unique ssid and mac addresses
  */
  tableDataTemp = tableData.slice()
  for(var i = 0; i<tableDataTemp.length; ++i){
      currData = tableDataTemp[i]
      existsMAC = inUniqueMAC(currData.MAC_ADDRESS)
      existsSSID = inUniqueSSID(currData.SSID)
      oldIDMAC = existsMAC[1]
      oldIDSSID = existsSSID[1]

      if(!currData){
        continue
      }
      if(existsMAC[0]){
            unique_AP_table[oldIDMAC].SIGNAL = currData.SIGNAL
            unique_AP_table[oldIDMAC].count = 0
      }else{
            currData.count = 0
            unique_AP_table.push(currData)
      }

      if(existsSSID[0]){
          unique_SSID_table[oldIDSSID].count = 0

          if(allSignals[unique_SSID_table[oldIDSSID].SSID]){
            allSignals[unique_SSID_table[oldIDSSID].SSID].push(currData)
          }else{
            allSignals[unique_SSID_table[oldIDSSID].SSID] = [currData]
          }
          var max = getMaxOfArray2(allSignals[unique_SSID_table[oldIDSSID].SSID])
          unique_SSID_table[oldIDSSID] = max
          /*
          if(allSignals[unique_SSID_table[oldIDSSID].SSID]){
            allSignals[unique_SSID_table[oldIDSSID].SSID].signals.push(currData.SIGNAL)
            allSignals[unique_SSID_table[oldIDSSID].SSID].aps.push(currData.MAC_ADDRESS)
            allSignals[unique_SSID_table[oldIDSSID].SSID].channels.push(currData.CHANNEL)
            allSignals[unique_SSID_table[oldIDSSID].SSID].frequencies.push(currData.FREQUENCY)
          }else{
            allSignals[unique_SSID_table[oldIDSSID].SSID] = {}
            allSignals[unique_SSID_table[oldIDSSID].SSID].signals = [currData.SIGNAL]
            allSignals[unique_SSID_table[oldIDSSID].SSID].aps = [currData.MAC_ADDRESS]
            allSignals[unique_SSID_table[oldIDSSID].SSID].channels = [currData.CHANNEL]
            allSignals[unique_SSID_table[oldIDSSID].SSID].frequencies = [currData.FREQUENCY]
          }
          var max = getMaxOfArray(allSignals[unique_SSID_table[oldIDSSID].SSID].signals)
          unique_SSID_table[oldIDSSID].SIGNAL = max[0]
          unique_SSID_table[oldIDSSID].MAC_ADDRESS = allSignals[unique_SSID_table[oldIDSSID].SSID].aps[max[1]]
          unique_SSID_table[oldIDSSID].CHANNEL = allSignals[unique_SSID_table[oldIDSSID].SSID].channels[max[1]]
          unique_SSID_table[oldIDSSID].FREQUENCY = allSignals[unique_SSID_table[oldIDSSID].SSID].frequencies[max[1]]*/
      }else{
            currData.count = 0
            unique_SSID_table.push(currData)
      }   
  }
  //console.log(unique_SSID_table)
  /*
  These for loops are eliminating all unique ssid or AP that have been there for 10 rounds
  */
  

  function sortSignal(a,b){
    if(a.SIGNAL < b.SIGNAL){
      return 1
    }else  if(a.SIGNAL > b.SIGNAL){
      return -1
    }
    return -1
  }

  //sort based on signal
  unique_AP_table = unique_AP_table.sort(sortSignal)
  unique_SSID_table = unique_SSID_table.sort(sortSignal)
  //incrementing count for every unique ssid and AP
  for(var i = 0; i<unique_AP_table.length; ++i){
    unique_AP_table[i].count++
  }
  for(var i = 0; i<unique_SSID_table.length; ++i){
    unique_SSID_table[i].count++
  }

  if(groupType == "ssid"){
    res.send(unique_SSID_table)
  }else{
    res.send(unique_AP_table)
  }
  tableData = []
})


var unique_AP_chart = []
var unique_SSID_chart = []

app.get("/data", function(req, res) {
  if(chartData[i] && chartData[i].CHANNEL == 1 ){
    chartData = []
    for(var i = 0; i<unique_AP_chart.length; ++i){
      if(unique_AP_chart[i].count >26){
        unique_AP_chart.splice(i,1)
        console.log("removed")
      }
      
    }

    for(var i = 0; i<unique_SSID_chart.length; ++i){
      if(unique_SSID_chart[i].count >26){
        unique_SSID_chart.splice(i,1)
        console.log("removed")
      }
      
    }
  }
  var finalData_AP = {
            labels: [" "," ",1,2,3,4,5,6,7,8,9,10,11," "," "," "," "," "," ",36,"",38," ",40," ",42," ",44," ",46,"",48," "," "," "," "," ",149," ",151," ",153," ",155," ",157," ",159," ",161," "," "," ",165," "," "," "],
            series: []
          }
  var finalData_SSID = []
    
  var groupType = req.query.grouping

  function inUniqueMAC(BSSID){
      
      for(var i = 0; i<unique_AP_chart.length; ++i){
          /*if(unique_SSID_chart[i] && SSID == unique_SSID_chart[i].SSID){
              return [true,i]
          }*/
          if(unique_AP_chart[i] && BSSID == unique_AP_chart[i].MAC_ADDRESS){
              return [true,i]
          }
      }
      return [false,null] 
  }
  
  function inUniqueSSID(SSID){
      
      for(var i = 0; i<unique_SSID_chart.length; ++i){
          if(unique_SSID_chart[i] && SSID == unique_SSID_chart[i].SSID){
              return [true,i]
          }
      }
      return [false,null] 
  }
  var ssidDidNotChange = true
  var allSignalsSSD = {}
  for(var i = 0; i<chartData.length; ++i){
      currData = chartData[i]
      existsMAC = inUniqueMAC(currData.MAC_ADDRESS)
      existsSSID = inUniqueSSID(currData.SSID)
      oldIDMAC = existsMAC[1]
      oldIDSSID = existsSSID[1]

      if(existsMAC[0]){
              unique_AP_chart[oldIDMAC].SIGNAL = currData.SIGNAL
              unique_AP_chart[oldIDMAC].count = 0
      }else{
            currData.count = 0
            unique_AP_chart.push(currData)
      }

      if(existsSSID[0]){
          unique_SSID_chart[oldIDSSID].count = 0
          /*
          if(allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID]){
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID].signals.push(currData.SIGNAL)
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID].aps.push(currData.MAC_ADDRESS)
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID].channels.push(currData.CHANNEL)
          }else{
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID] = {}
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID].signals = [currData.SIGNAL]
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID].aps = [currData.MAC_ADDRESS]
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID].channels = [currData.CHANNEL]
          }
          var max = getMaxOfArray(allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID].signals)
          unique_SSID_chart[oldIDSSID].SIGNAL = max[0]
          unique_SSID_chart[oldIDSSID].MAC_ADDRESS = allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID].aps[max[1]]
          unique_SSID_chart[oldIDSSID].CHANNEL = allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID].channels[max[1]]
          */
          if(allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID]){
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID].push(currData)
          }else{
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID] = [currData]
          }
          var max = getMaxOfArray2(allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID])
          unique_SSID_chart[oldIDSSID] = max
          /*
          if(allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID]){
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID].push(currData.SIGNAL)
          }else{
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID] = [currData.SIGNAL]
          }
          unique_SSID_chart[oldIDSSID].SIGNAL = getMaxOfArray(allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID])
          */
      }else{
            currData.count = 0
            unique_SSID_chart.push(currData)
      }   
  }
  

  
  for(var i = 0; i<unique_AP_chart.length; ++i){
      var values = []
      if(unique_AP_chart[i] == undefined){
        continue  
      }
      var channel = unique_AP_chart[i].CHANNEL
      //console.log(channel)
      var currSignal = unique_AP_chart[i].SIGNAL
      for(var j = 0 ; j<finalData_AP.labels.length; ++j){
          if(channel < 15){
            if(finalData_AP.labels[j] == channel){
              values[j] = currSignal
              values[j+2] = -100
              values[j-2] = -100
            }
          }else if((channel >30 && channel <= 149) || channel == 157 || channel == 153 || channel > 160){
            if(finalData_AP.labels[j] == channel){
              values[j] = currSignal
              values[j+2] = -100
              values[j-2] = -100
            }
          }else{
            if(channel == 151){
              if(finalData_AP.labels[j] == channel){
                values[j] = currSignal
                values[j+4] = -100
                values[j-4] = -100
              }
            }else if(channel == 155){
              if(finalData_AP.labels[j] == channel){
                values[j] = currSignal
                values[j+2] = -100
                values[j-8] = -100
              }
            }else if(channel == 159){
              if(finalData_AP.labels[j] == channel){
                values[j] = currSignal
                values[j+2] = -100
                values[j-4] = -100
              }
            }
          }
      }


      finalData_AP.series.push(values)
  }

  for(var i = 0; i<unique_SSID_chart.length; ++i){
      if(unique_SSID_chart[i] == undefined){
        continue  
      }

      var r = Math.floor((Math.random() * 220) + 20).toString();
      var g = Math.floor((Math.random() * 220) + 20).toString();
      var b = Math.floor((Math.random() * 220) + 20).toString();

      var data = {
                value: unique_SSID_chart[i].SIGNAL,
                color:"rgba("+r+","+g+","+b+",1)",
                highlight: "rgba("+r+","+g+","+b+",1)",
                label: unique_SSID_chart[i].SSID
            }
      finalData_SSID.push(data)
  }

  for(var i = 0; i<unique_AP_chart.length; ++i){
    unique_AP_chart[i].count++
  }
  for(var i = 0; i<unique_SSID_chart.length; ++i){
    unique_SSID_chart[i].count++
  }

  if(groupType == "ssid"){

    res.send(finalData_SSID)
  }else{
    res.json(finalData_AP)
  }
  
  finalData_AP = []
  finalData_SSID = []

})
  
//setInterval(clearContainers, 20000);

function clearContainers(){
  chartData = []
  tableData = []
  unique_AP_chart = []
  unique_SSID_chart = []
  
  unique_AP_table = []
  unique_SSID_table = []
}

app.get('/', function(req, res, next) {
  res.render('index', { title: 'Wifi Analyzer' });
});

app.get('/5', function(req, res, next) {
  res.render('index5', { title: 'Wifi Analyzer' });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err)
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err)
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
