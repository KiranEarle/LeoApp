var express = require('express');
var	router = express.Router();
var	User = require('../models/user.js');
var	passport = require('passport');

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

router.get('/signup', function(req, res, next){
	res.render('signup', {
		title:'Sign Up'
	});
});

router.post('/signup', function(req, res, next){
	var username = req.body.username;
	var name = req.body.firstname;
	var email = req.body.email
	var password = req.body.password;
	var confirmPw = req.body.confirm_password;

	req.checkBody('username','Please enter a username').notEmpty();
	req.checkBody('firstname','Please enter in your name').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password','Please enter in a password').notEmpty();
	req.checkBody('confirm_password','Please make sure your password matches').equals(req.body.password);

	var errors = req.validationErrors();
	

	if(errors){
		res.render('signup',{
			title:'Sign Up',
			errors:errors
		});
		
	} else {
	
		var newUser = new User({
			username: username,
			name: name,
			email: email,
			password: password,
			createAt: Date.now(),
			isAdmin: false
		});
		User.findOne({$or:[{username: newUser.username},{email:newUser.email}]}, function(err, user){
			if(err){ return next(err)}
				if(user){
					req.flash('info','Either your username or email already exist, please use a different one');
					return res.redirect("/signup");
				}
			newUser.save(next);
		});
					
	req.flash('info', 'You have signed up successfully');
	return res.redirect('/login');
				
	};
});

router.get('/login', function(req, res, next){
	res.render('login', {
		title:'Log in'
	})
});

router.post('/login', function(req, res, next){

	var username = req.body.username;
	var password = req.body.password;

	req.checkBody('username','Please enter your username').notEmpty();
	req.checkBody('password','Please enter your password').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		
		return res.render('login', {
			errors: errors,
			title: 'Log in' 
		});
	}
	next();

},passport.authenticate("login",{
	successRedirect: "/home",
	failureRedirect: "/login",
	failureFlash: true
}));


module.exports = router;