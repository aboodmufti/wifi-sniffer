var express = require('express');
var router = express.Router();
var PythonShell = require("python-shell")

  
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*
router.get('/data', 
});*/


module.exports = router;


