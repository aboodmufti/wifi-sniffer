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
var serverData = []
pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement) 
    var obj = JSON.parse(message)
    //console.log(obj)
    serverData.push(obj)
    
});


app.get("/data", function(req, res) {

  
  var finalData = {
        labels: [0,1,2,3,4,5,6,7,8,9,10,11],
        datasets: []
    };
    
  //console.log(finalData)
  var unique_AP = []
  //console.log("DEBUG 2")
  function inUnique(BSSID){
      //console.log(unique_AP)
      
      for(var i = 0; i<unique_AP.length; ++i){
          if(unique_AP[i] && BSSID == unique_AP[i].SSID){
              return [true,i]
          }
      }
      return [false,null] 
  }
  
  //console.log("DEBUG 3")
  for(var i = 0; i<serverData.length; ++i){
      currData = serverData[i]
      exists = inUnique(currData.SSID)
      oldID = exists[1]
      if(currData.CHANNEL > 11){
          continue
      }
      if(exists[0]){
          if(currData.SIGNAL < unique_AP[oldID]){
              unique_AP[oldID].SIGNAL = currData.SIGNAL
          }
      }else{
          //if(currData != undefined){
            unique_AP.push(currData)
          //}
      }   
  }
  
  //console.log("DEBUG 4")
  for(var i = 0; i<unique_AP.length; ++i){
      var values = []
      if(unique_AP[i] == undefined){
        continue  
      }
      var channel = unique_AP[i].CHANNEL
      //console.log("channel: "+channel)
      for(var j = 0 ; j<11; ++j){
        
          if(j == channel - 1){
              values.push(-90)
          }else if(j ==  channel){
              //console.log(unique_AP[i])
              values.push(unique_AP[i].SIGNAL)
          }else if(j ==  channel +1){
              values.push(-90)
          }else{
              values.push(null)
          }
      }
      
      var r = Math.floor((Math.random() * 220) + 20).toString();
      var g = Math.floor((Math.random() * 220) + 20).toString();
      var b = Math.floor((Math.random() * 220) + 20).toString();
      var dataset = {
          label: unique_AP[i].SSID ,
          fillColor: "rgba("+r+","+g+","+b+",0.5)",
          strokeColor: "rgba("+r+","+g+","+b+",0.8)",
          highlightFill: "rgba("+r+","+g+","+b+",0.75)",
          highlightStroke: "rgba("+r+","+g+","+b+",1)",
          data: values
      }
      finalData.datasets.push(dataset)
  }
  console.log(unique_AP)
  res.json(finalData)
  
  finalData = []

})
  
  
app.get('/', function(req, res, next) {
  console.log("DEBUG 1")
  res.render('index', { title: 'Express' });
});
//app.use('/index', routes);
app.use('/users', users);

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
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
