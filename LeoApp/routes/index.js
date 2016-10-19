var express = require('express');
var	router = express.Router();
var	passport = require('passport');
var User = require("../models/user.js");

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

router.get('/', function(req, res, next){
	res.render('index', {
		title:'Dashboard'
	});
});

router.get('/editProfile', function(req, res, next){
	res.render('editProfile', {
		title: 'Edit Profile'
	});
});

router.post('/editProfile', function(req, res, next){
	var name = req.body.name;
	var password = req.body.password;
	var confirmPW = req.body.confirmPW;

	req.checkBody('name','Please enter a display name').notEmpty();
	req.checkBody('password','Please enter in a new password').notEmpty();
	req.checkBody('confirmPW','Your password does not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('editProfile',{
			title:'Edit Profile',
			errors: errors
		});
	}else{

		var user =  req.user;

		user.password = password;
		user.save(function(err){
			if(err){throw(err)}
				req.flash('info','You have updated your account');
				res.redirect('/');
		});
	};
});
router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/')
});
module.exports = router;