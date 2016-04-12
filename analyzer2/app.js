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
pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement) 

    if(message.substr(0,2) == "{\""  && message.substr(-3) == "\" }"){
      try{
        var obj = JSON.parse(message)

        chartData.push(obj)
        tableData.push(obj)
      }catch(e){
        console.log(e.message);
      }
    }
    
    
});
var unique_AP_table = []
var unique_SSID_table = []

function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
  }

app.get("/dataTable", function(req, res) {
  var groupType = req.query.grouping
  //var unique_AP_table = []
  function inUniqueMAC(BSSID){
      
      for(var i = 0; i<unique_AP_table.length; ++i){
          /*if(unique_SSID_table[i] && SSID == unique_SSID_table[i].SSID){
              return [true,i]
          }*/
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
  for(var i = 0; i<tableData.length; ++i){
      currData = tableData[i]
      //exists = inUnique(currData.SSID)
      existsMAC = inUniqueMAC(currData.MAC_ADDRESS)
      existsSSID = inUniqueSSID(currData.SSID)
      oldIDMAC = existsMAC[1]
      oldIDSSID = existsSSID[1]
      /*if(currData.CHANNEL > 11){
          continue
      }*/
      if(currData.CHANNEL > 11){
          console.log(currData)
      }
      if(existsMAC[0]){
          //if(currData.SIGNAL < unique_AP_table[oldID]){
              unique_AP_table[oldIDMAC].SIGNAL = currData.SIGNAL
              unique_AP_table[oldIDMAC].count = 0
          //}
      }else{
          //if(currData != undefined){
            currData.count = 0
            unique_AP_table.push(currData)
          //}
      }

      if(existsSSID[0]){
          unique_SSID_table[oldIDSSID].count = 0
          if(allSignals[unique_SSID_table[oldIDSSID].SSID]){
            allSignals[unique_SSID_table[oldIDSSID].SSID].push(currData.SIGNAL)
          }else{
            allSignals[unique_SSID_table[oldIDSSID].SSID] = [currData.SIGNAL]
          }

          //if(currData.SIGNAL < unique_SSID_table[oldIDSSID].SIGNAL){
          unique_SSID_table[oldIDSSID].SIGNAL = getMaxOfArray(allSignals[unique_SSID_table[oldIDSSID].SSID])
          //}
      }else{
            currData.count = 0
            unique_SSID_table.push(currData)
      }   
  }
  //console.log(allSignals)
  for(var i = 0; i<unique_AP_table.length; ++i){
    if(unique_AP_table[i].count >=10){
      unique_AP_table.splice(i,1)
      console.log("removed")
    }
    
  }

  for(var i = 0; i<unique_SSID_table.length; ++i){
    if(unique_SSID_table[i].count >=10){
      unique_SSID_table.splice(i,1)
      console.log("removed")
    }
    
  }

  

  function sortSignal(a,b){
    if(a.SIGNAL < b.SIGNAL){
      return 1
    }else  if(a.SIGNAL > b.SIGNAL){
      return -1
    }
    return -1
  }

  //console.log(unique_AP_table)
  unique_AP_table = unique_AP_table.sort(sortSignal)

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

  var finalData_AP = {
        labels: [" "," ",1,2,3,4,5,6,7,8,9,10,11," "," "],
        datasets: []
    };

  var finalData_SSID = {
        labels: [" "," ",1,2,3,4,5,6,7,8,9,10,11," "," "],
        datasets: []
    };
    
  var groupType = req.query.grouping
  //var unique_AP_chart = []
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
      //exists = inUnique(currData.SSID)
      existsMAC = inUniqueMAC(currData.MAC_ADDRESS)
      existsSSID = inUniqueSSID(currData.SSID)
      oldIDMAC = existsMAC[1]
      oldIDSSID = existsSSID[1]
      if(currData.CHANNEL > 11){
          continue
      }
      if(existsMAC[0]){
          //if(currData.SIGNAL < unique_AP_chart[oldID]){
              unique_AP_chart[oldIDMAC].SIGNAL = currData.SIGNAL
              unique_AP_chart[oldIDMAC].count = 0
          //}
      }else{
          //if(currData != undefined){
            currData.count = 0
            unique_AP_chart.push(currData)
          //}
      }

      if(existsSSID[0]){
          unique_SSID_chart[oldIDSSID].count = 0
          if(allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID]){
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID].push(currData.SIGNAL)
          }else{
            allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID] = [currData.SIGNAL]
          }
          unique_SSID_chart[oldIDSSID].SIGNAL = getMaxOfArray(allSignalsSSD[unique_SSID_chart[oldIDSSID].SSID])
      }else{
            currData.count = 0
            unique_SSID_chart.push(currData)
      }   
  }
  
  for(var i = 0; i<unique_AP_chart.length; ++i){
    if(unique_AP_chart[i].count >=10){
      unique_AP_chart.splice(i,1)
      console.log("removed")
    }
    
  }

  for(var i = 0; i<unique_SSID_chart.length; ++i){
    if(unique_SSID_chart[i].count >=10){
      unique_SSID_chart.splice(i,1)
      console.log("removed")
    }
    
  }
  
  for(var i = 0; i<unique_AP_chart.length; ++i){
      var values = []
      if(unique_AP_chart[i] == undefined){
        continue  
      }
      var channel = unique_AP_chart[i].CHANNEL
      channel += 1
      for(var j = 0 ; j<15; ++j){
          var currSignal = unique_AP_chart[i].SIGNAL
          
          if(j == channel - 2){
              values.push(-100)
          }else if(j == channel - 1){
              values.push(null)
          }else if(j ==  channel){
              values.push(currSignal)
          }else if(j ==  channel +1){
              values.push(null)
          }else if(j ==  channel +2){
              values.push(-100)
          }else{
              values.push(null)
          }
      }
      /*
        highlightFill: "rgba("+r+","+g+","+b+",0.75)",
        highlightStroke: "rgba("+r+","+g+","+b+",1)",
       * */
      var r = Math.floor((Math.random() * 220) + 20).toString();
      var g = Math.floor((Math.random() * 220) + 20).toString();
      var b = Math.floor((Math.random() * 220) + 20).toString();
      var dataset = {
          label: unique_AP_chart[i].SSID +" - "+unique_AP_chart[i].MAC_ADDRESS.substring(0,5) ,
          fillColor: "rgba("+r+","+g+","+b+",0)",
          strokeColor: "rgba("+r+","+g+","+b+",0.9)",
          pointHighlightFill: "rgba("+r+","+g+","+b+",1)",
          pointHighlightStroke: "rgba("+r+","+g+","+b+",1)",
          data: values
      }

      finalData_AP.datasets.push(dataset)
  }

  for(var i = 0; i<unique_SSID_chart.length; ++i){
      var values = []
      if(unique_SSID_chart[i] == undefined){
        continue  
      }
      var channel = unique_SSID_chart[i].CHANNEL
      channel += 1
      for(var j = 0 ; j<15; ++j){
          var currSignal = unique_SSID_chart[i].SIGNAL
          
          if(j == channel - 2){
              values.push(-100)
          }else if(j == channel - 1){
              values.push(null)
          }else if(j ==  channel){
              values.push(currSignal)
          }else if(j ==  channel +1){
              values.push(null)
          }else if(j ==  channel +2){
              values.push(-100)
          }else{
              values.push(null)
          }
      }
      /*
        highlightFill: "rgba("+r+","+g+","+b+",0.75)",
        highlightStroke: "rgba("+r+","+g+","+b+",1)",
       * */
      var r = Math.floor((Math.random() * 220) + 20).toString();
      var g = Math.floor((Math.random() * 220) + 20).toString();
      var b = Math.floor((Math.random() * 220) + 20).toString();
      var dataset = {
          label: unique_SSID_chart[i].SSID  ,
          fillColor: "rgba("+r+","+g+","+b+",0)",
          strokeColor: "rgba("+r+","+g+","+b+",0.9)",
          pointHighlightFill: "rgba("+r+","+g+","+b+",1)",
          pointHighlightStroke: "rgba("+r+","+g+","+b+",1)",
          data: values
      }
      finalData_SSID.datasets.push(dataset)
  }

  for(var i = 0; i<unique_AP_chart.length; ++i){
    unique_AP_chart[i].count++
  }
  for(var i = 0; i<unique_SSID_chart.length; ++i){
    unique_SSID_chart[i].count++
  }

  //console.log(finalData.datasets)
  if(groupType == "ssid"){
    res.send(finalData_SSID)
  }else{
    res.send(finalData_AP)
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
//app.use('/index', routes);
//app.use('/users', users);

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
