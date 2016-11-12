var express = require('express');
var	router = express.Router();
var	passport = require('passport');
var Articles = require('../models/articles.js');
var hbs = require('nodemailer-express-handlebars')
var nodemailer = require('nodemailer');
var mailer = nodemailer.createTransport('smtps://lionbrandtv%40gmail.com:Myleskusume1@smtp.gmail.com')
var Searches = require('../libraries/searches.js')
var multer = require('multer');
var crypto = require('crypto');
var path = require('path');
var storage = multer.diskStorage({
	destination: 'articleImages/',
	filename: function(req, file, callback){
		crypto.pseudoRandomBytes(16, function(err, raw){
			callback(null, raw.toString('hex') + path.extname(file.originalname));
		});
	}

});
var upload = multer({storage: storage});

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

mailer.use('compile', hbs({
	viewPath: 'views/email',
	extName: '.hbs'
}));

function articleApproved(req, res, next){
	var slug = req.params.articleTitle;
	Searches.articleBySlug(slug, function(err, article){
		if(article.status == "Posted"){
			next();			
		} else {
			res.redirect('/articles');
		}
	});
}


router.get('/articles',  function(req, res, next){
	Searches.articles(function(err, articles){
		if(err){throw err;}
	res.render('articles', {
		title:'Articles',
		articles:articles,
		});
	});
});


router.get('/articles/:articleTitle', articleApproved, function(req, res, next){
	var slug = req.params.articleTitle;

	Articles.find({_id:slug}) 
	.exec(function(err, article){
		if(err){throw err}
		res.render('oneArticle',{
			title:article.title,
			article:article
		});
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
	Searches.articleBySlug(slug, function(err, article){
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
	if(!req.user){
		res.redirect('/articles')
	}
	Articles.find({author:user})
	.exec(function(err, articles){
		if(err){throw err}
			res.render('articles',{
				title:'My articles',
				articles:articles
			});
	});
});

router.get('/editArticle/:article', ensureAuthenticated, function(req, res, next){
	var id = req.params.article
	Articles.findOne({_id:id}, function(err, article){
		if(err){throw err}
	if(article.author == req.user.username){
		res.render('editArticle', {
			title:'Edit Article',
			article:article
		});	
	} else {
		res.redirect('/articles')
	}
	});
});

router.post('/editArticle/:article', ensureAuthenticated, function(req, res, next){
	var slug = req.params.article;
	var title = req.body.title;
	var articleText = req.body.articleText
	Articles.update({_id:slug}, {$set:{title:title, articleText:articleText}}, function(err, article){
		if(err){throw err}
	})
	req.flash('info','Updated the article');
	res.redirect("/articles/"+ slug )
})


router.get('/newArticle',ensureAuthenticated, function(req, res, next){
	res.render('newArticles', {
		title:'Post Article'
	});
});

router.post('/newArticle', ensureAuthenticated, upload.single('articleHeader'), function(req, res, next){
	var title = req.body.title;
	var text = req.body.text;
	var username = req.user.username;
	var headerImage = req.file.filename;
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
			author: username,
			createdAt: Date.now(),
			status: "for_Review",
			headerImg: headerImage
		});

	Searches.articleBySlug(newArticle.slug, function(err, article){
		if(err){throw err}
		if(req.user.level == "approved"){
			newArticle.status = "Posted"
		}


		newArticle.save(function(err, article){
			if (err){throw err}
		});
		mailer.sendMail({
			from:'lionbrandtv@gmail.com',
			to:'lionbrandtv@gmail.com',
			subject: 'Leo Test',
			template:'articleApproval',
			context:{
				username: newArticle.author,
				title: newArticle.title
			}
		}, function(err, response){
			if(err){
				throw err;
				console.log(err)
				res.redirect('/forgotPassword');
			}
			
		})
	})

	req.flash('info','You have posted an article for review');
	res.redirect('/articles');
	}


});

module.exports = router;