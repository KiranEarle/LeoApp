var express = require('express');
var	router = express.Router();
var	passport = require('passport');
var Articles = require('../models/articles.js');

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

router.get('/articles', function(req, res, next){

	Articles.find()
	.sort({createdAt: 'descending'})
	.exec(function(err, articles){
		if(err){throw err;}

	res.render('articles', {
		title:'Articles',
		articles:articles
		});
	});
});


router.get('/articles/:articleTitle', function(req, res, next){
	var slug = req.params.articleTitle;

	Articles.find({slug:slug}) 
	.exec(function(err, article){
		if(err){throw err}

		res.render('oneArticle',{
			title:article.title,
			article:article
		});	
	});
});

router.post('articles/:articleTitle', function(req, res, next){
	var slug = req.params.articleTitle;
	var comment = req.body.comment;

	req.checkBody('comment','Please add a comment').notEmpty();

	var errors = validationErrors();

	Articles.find({slug:slug}) 
		.exec(function(err, article){
			if(err){throw err}
		if(errors){
			res.render('oneArticle', {
				title:article.title,
				article:article,
				errors:errors
			})
		} else {

			article.comment = comment;
			article.save();
			req.flash("info", "Comment posted");
			res.redirect("/articles/"+ slug +"");
		};
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

router.get('/article/:user', ensureAuthenticated, function(req, res, next){
	var user = req.params.user;
	Articles.find({author:user})
	.exec(function(err, articles){
		if(err){throw err}
			console.log(articles)
			res.render('articles',{
				title:'My articles',
				articles:articles
			});
	});
});
router.get('/newArticle',ensureAuthenticated, function(req, res, next){
	res.render('newArticles', {
		title:'Post Article'
	});
});

router.post('/newArticle', ensureAuthenticated, function(req, res, next){
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
			slug: title.replace(/\s/g,''),
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