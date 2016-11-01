var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var	passport = require('passport');

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		next();
	}else{
		req.flash("info", "You must be logged in to see this page.");
		res.redirect("/login");
	}
}


function adminValidator(req, res, next){
	if(!req.user.isAdmin == true){
		res.redirect('/home')
	}
	next();
}

router.get('/admin',ensureAuthenticated, adminValidator, function(req, res, next){
	res.render('admin', {
		title: "Admin"
	});
});

router.get('/admin/searchUser',ensureAuthenticated, adminValidator, function(req, res, next){
	
	User.find()
	.sort({createAt:'descending'})
	.exec(function(err, users){
		if(err){throw err}
		
		res.render('adminSearchUser', {
			title: "Search users",
			users: users
		});			
	});
});


router.post('/admin/searchUser',ensureAuthenticated, adminValidator, function(req, res, next){
	var username_name = req.body.userSearch;

	User.find({$or:[{username:username_name},{name:username_name}]})
	.sort({createAt:'descending'})
	.exec(function(err, users){
		if(err){throw err}

		res.render('adminSearchUser', {
			title: "Search users",
			users: users
		});
	});

});
module.exports = router;