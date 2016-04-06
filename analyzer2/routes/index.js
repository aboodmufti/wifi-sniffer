var express = require('express');
var router = express.Router();
var PythonShell = require("python-shell")

var pyshell = new PythonShell('wifi_sniffer.py');
var allData = []
pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement) 
    var obj = JSON.parse(message)
    //console.log(JSON.parse(message))
    allData.push(obj)
    
});
  
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/data', function(req, res, next) {
  res.json(allData)
  //console.log(allData)
  allData = []
});


module.exports = router;


