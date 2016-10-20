var express = require('express');
var	router = express.Router();
var	passport = require('passport');
var Articles = require('../models/articles.js');

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

router.get('/articles', function(req, res, next){
	res.render('articles', {
		title:'Articles'
	});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		next();
	}else{
		req.flash("info", "You must be logged in to see this page.");
		res.redirect("/login");
	}
}

router.get('/newArticle',ensureAuthenticated, function(req, res, next){
	res.render('newArticles', {
		title:'Post Article'
	});
});

router.post('/newArticle', function(req, res, next){
	var title = req.body.title;
	var text = req.body.text;

	req.checkBody('title','Please enter a title').notEmpty();
	req.checkBody('text','Please enter some text').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('newArticles',{
			title:'Post Article',
			errors: errors
		});
	} else {
		
		var newArticle = new Articles({
			title: title,
			articleText: text,
			author: req.user.username,
			createdAt: Date.now()
		});

	newArticle.save(function(err, article){
		if (err){throw err}
			console.log(newArticle)
	});
	req.flash('info','Your article has been posted');
	res.redirect('/articles');
	}


});

module.exports = router;