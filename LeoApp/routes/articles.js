var express = require('express');
var	router = express.Router();
var	passport = require('passport');
var Articles = require('../models/articles.js');
var paginate = require('express-paginate');

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.paginate = paginate.href;
	res.locals.hasPreviousPages = paginate.hasPreviousPages;
	res.locals.hasNextPages = paginate.hasNextPages;
	next();
});

router.get('/articles', function(req, res, next){

	Articles.find()
	.sort({createdAt: 'descending'})
	.exec(function(err, articles){
		if(err){throw err;}

	res.render('articles', {
		title:'Articles',
		articles:articles,
		});
	});
});


router.get('/articles/:articleTitle', function(req, res, next){
	var slug = req.params.articleTitle;

	Articles.find({slug:slug}) 
	.exec(function(err, article){
		if(err){throw err}
		if(!article.status == "Posted"){
			res.redirect('/articles');
		} else {
		res.render('oneArticle',{
			title:article.title,
			article:article
		});
		}	
	});

});

router.post('/articles/:articleTitle', function(req, res, next){
	var comment = req.body.comment;
	var slug = req.params.articleTitle
	req.checkBody('comment','Please add a comment').notEmpty();
		var errors = req.validationErrors();

	if(errors){
		res.render('oneArticle', {
			title:req.params.articleTitle,
			article:article,
			errors:errors
			})
		} else {
	Articles.findOne({slug:slug}, function(err, article){
		if(err){throw err}
			article.comment.push({
				articleComment:comment,
				commentAuthor:req.user.username,
				createdAt: Date.now()
			});
			article.save();
			req.flash("info", "Comment posted");
			res.redirect("/articles/"+ slug +"");
		});
	};
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		next();
	}else{
		req.flash("info", "Please log in.");
		res.redirect("/login");
	}
}

router.get('/article/:user', ensureAuthenticated, function(req, res, next){
	var user = req.params.user;

	Articles.find({author:user})
	.exec(function(err, articles){
		if(err){throw err}
			res.render('articles',{
				title:'My articles',
				articles:articles
			});
	});
});

router.get('/editArticle/:article/:user', ensureAuthenticated, function(req, res, next){
	var slug = req.params.article;
	var user = req.params.user;
	if(!user == req.user){
		res.redirect('/articles')
	}
	Articles.findOne({slug:slug, author:user}, function(err, article){
		if(err){throw err}
		res.render('editArticle', {
			title:'Edit Article',
			article:article
		});
	});
});

router.post('/editArticle/:article/:user', ensureAuthenticated, function(req, res, next){
	var slug = req.params.article;
	var user = req.params.user;
	var title = req.body.title;
	var articleText = req.body.articleText
	Articles.update({slug:slug}, {$set:{title:title, articleText:articleText}}, function(err, article){
		if(err){throw err}
	})
	req.flash('info','Updated the article');
	res.redirect('/editArticle/'+ slug +'/'+ user +'')
})


router.get('/newArticle',ensureAuthenticated, function(req, res, next){
	res.render('newArticles', {
		title:'Post Article'
	});
});

router.post('/newArticle', ensureAuthenticated, function(req, res, next){
	var title = req.body.title;
	var text = req.body.text;
	var username = req.user.username;
	var slug = req.user.username +'_'+ req.body.title.replace(/\s/g,'')
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
			slug: slug,
			author: username,
			createdAt: Date.now(),
			status: "for_Review"
		});

	Articles.findOne({slug:slug}, function(err, article){
		if(err){throw err}
			if(article){
				while(article.slug == newArticle.slug){
					newArticle.slug = slug + Math.random() * 9;
				}
			}
		if(req.user.level == "approved"){
			newArticle.status = "Posted"
		}

		newArticle.save(function(err, article){
			if (err){throw err}
		});
	})

	req.flash('info','Your article has been posted');
	res.redirect('/articles');
	}


});

module.exports = router;