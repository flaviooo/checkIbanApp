var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  //  result = JSON.parse(toJson(mokRres));
  res.render('index', { title: "checkIban Page" });
  //res.json(jsonFormatted);
});

module.exports = router;
