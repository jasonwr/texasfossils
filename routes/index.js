var express = require('express');
var router = express.Router();

/* GET main page (index.ejs combining index.html): */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'Paleo Services'});
});

module.exports = router;

							   