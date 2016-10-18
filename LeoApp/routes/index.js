var express = require('express'),
	router = express.Router();
	
	router.use(function(req, res, next){
		res.locals.currentUser = req.user;
		next();
	});

router.get('/', function(req, res, next){
	res.render('index', {
		title:'Index'
	});
});


module.exports = router;