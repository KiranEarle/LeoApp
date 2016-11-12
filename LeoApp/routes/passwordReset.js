var express = require('express');
var router = express.Router();
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var mailer = nodemailer.createTransport('smtps://lionbrandtv%40gmail.com:Myleskusume1@smtp.gmail.com')
var User = require("../models/user.js");
var hbs = require('nodemailer-express-handlebars');

mailer.use('compile', hbs({
	viewPath: 'views/email',
	extName: '.hbs'
}));

router.get('/forgotPassword', function(req, res, next){
	res.render('forgotPassword', {
		user: req.user,
		title: 'Forgot Password'
	});
});

router.post('/forgotPassword', function(req, res, next){

	var email = req.body.email;

	req.checkBody('email','Please enter your email address').notEmpty();
	var errors = req.validationErrors();
	if(errors){
		res.render('forgotPassword', {
		user: req.user,
		title: 'Forgot Password',
		errors: errors
	});
	} else {

	async.waterfall([
		function(done){
			crypto.randomBytes(20, function(err, buf){
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		function(token, done){
			User.findOne({email: email}, function(err, user){
				if(!user){
					req.flash('error','No account has this email address, please contact admin for more help');
					res.redirect('forgotPassword');
				}

				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000;

				user.save(function(err){
					done(err, token, user)
				});
			});
		},
		function(token, user, done){

			var mailOptions = {
			from:'lionbrandtv@gmail.com',
			to: user.email,
			subject: 'Reset Password',
			template:'passwordReset',
			context:{
				url: req.headers.host + '/resetPassword/' + token
				}
			}
			mailer.sendMail(mailOptions, function(err){
				req.flash('info', 'An email has been sent to ' + user.email + ' with further instructions.')
				done(err, 'done');
			});
		 
		}

	], function(err){
		if(err){throw err}
		res.redirect('/forgotPassword');
	});
}
});

router.get('/resetPassword/:token', function(req, res){
	var token = req.params.token;
	User.findOne({resetPasswordToken: token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
		if(!user){
		req.flash('error', 'Your password reset token is invalid or has expired');
		res.redirect('/forgotPassword');
	}
		res.render('resetPassword',{
			user: user,
			title: 'Reset Password'
		});
	});
});

router.post('/resetPassword/:token', function(req, res){
	var token = req.params.token;
	var password = req.body.password;
	async.waterfall([
		function(done){
			User.findOne({ resetPasswordToken: token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
				if(!user){
					req.flash('error','Your password reset token is invalid or has expired');
					res.redirect('back');
				}

				user.password =  password;
				user.resetPasswordToken = undefined;
				user.resetPasswordExpires = undefined;

				user.save(function(err){
					req.logIn(user, function(err){
						done(err, user)
					});
				});
			});
		},
		function(user, done){
			
			var mailOptions = {
			from:'lionbrandtv@gmail.com',
			to: user.email,
			subject: 'Your password has been changed',
			template:'passwordResetConfirmed',
			context:{
				username: user.username
				}
			}
			mailer.sendMail(mailOptions, function(err){
				req.flash('info', 'You have successfully changed your password!.')
				done(err);
			});			
		}
		], function(err){
			res.redirect('/')
		});
});
module.exports = router;