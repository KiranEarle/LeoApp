var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var	passport = require('passport');
var Articles = require('../models/articles.js');

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

//Users admin
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

router.get('/admin/:user',ensureAuthenticated, adminValidator, function(req, res, next){
	var users = req.params.user;

	User.findOne({username:users}, function(err, user){
		if(err){throw err}
		if(user){
			res.render('adminUserProfile',{
				title: "User Profile",
				user: user
			
			});
		};	
	});

});


router.post('/admin/:user',ensureAuthenticated, adminValidator, function(req, res, next){ 
	var users = req.params.user;
	var username = req.body.username;
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var confrimPW = req.body.confirmPW;

	req.checkBody('confirmPW', 'Please make sure your password matches').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		User.findOne({username:users}, function(err, user){
		if(err){throw err}
		if(user){
			res.render('adminUserProfile',{
				title: "User Profile",
				user: user,
				errors: errors
			});
		};	
	});
		
	}else{

		User.findOne({username:users}, function(err, user){
			if(err){throw err}
			if(password == ""){
				user.username = username;
				user.name = name;
				user.email = email;

				user.save()
			}else{
				user.username = username;
				user.name = name;
				user.email = email;
				user.password = password;
				user.save()
			}
			req.flash("info", "Profile updated!");
			res.redirect("/admin/"+ users +"")
		});
	}

});

router.post('/adminDeactivate/:user', function(req, res, next){
	var username = req.params.user;
	var deactivated = "deactive"
	User.findOne({username: username}, function(err, user){
		if(err){ throw err}
			user.status = deactivated;
		user.save()
	});
		req.flash("info", "User has been deactivated");
		res.redirect("/admin/"+ username +"");
});

router.post('/adminActivate/:user', function(req, res, next){
	var username = req.params.user;
	var Activated = "active"
	User.findOne({username: username}, function(err, user){
		if(err){ throw err}
			user.status = Activated;
		user.save()
	});
		req.flash("info", "User has been activated");
		res.redirect("/admin/"+ username +"");
});

router.post('/approveUser/:username', function(req, res, next){
	var username = req.params.username;
	var approved = "approved";

	User.findOne({username:username}, function(err, user){
		if(err){throw err}
		user.level = approved;
		user.save();
	});

	req.flash("info", "User is apporved");
	res.redirect("/admin/"+ username +"");
});

router.post('/unapproveUser/:username', function(req, res, next){
	var username = req.params.username;
	var userLevel = "user";

	User.findOne({username:username}, function(err, user){
		if(err){throw err}
		user.level = userLevel;
		user.save();
	});

	req.flash("info", "User has been unapporved");
	res.redirect("/admin/"+ username +"");
});

router.get('/adminSearchArticle',ensureAuthenticated, adminValidator, function(req, res, next){
	
	Articles.find()
	.sort({createdAt:"descending"})
	.exec(function(err, articles){
		if(err){throw err}

		res.render('adminSearchArticles', {
			title: 'Article Search',
			articles:articles
		});
	});
});

router.get('/adminSearchArticle/:article',ensureAuthenticated, adminValidator, function(req, res, next){
	var slug = req.params.article;
	Articles.findOne({slug:slug}, function(err, article){
		if(err){throw err}
			res.render('adminArticle', {
				title: article.title,
				article: article
			});
	});
});


router.post('/adminSearchArticleCommentRemoved/:article',ensureAuthenticated, adminValidator, function(req, res, next){
	var author = req.body.author;
	var comment = req.body.comment;
	var slug = req.params.article;
	Articles.update({slug:slug}, {$pull:{comment:{articleComment:comment, commentAuthor:author}}}, function(err, article){
		if(err){throw err}
	});
		req.flash("info", "Comment removed");
		res.redirect('/adminSearchArticle/'+ slug +'')
});


router.post('/adminArticleRemove/:article', ensureAuthenticated, adminValidator, function(req, res, next){
	var slug = req.params.article
	Articles.findOne({slug:slug})
	.remove(function(err, article){
		if(err){throw err}
	});

	req.flash("info", "Article has been deleted")
	res.redirect('/adminSearchArticle')
});

router.post('/adminArticleUpdate/:article', ensureAuthenticated, adminValidator, function(req, res, next){
	var slug = req.params.article;
	var title = req.body.title;
	var text = req.body.articleText;
	Articles.update({slug:slug}, {$set:{title:title, articleText:text}}, function(err, article){
		if(err){throw err}
	});
	req.flash('info','Updated the article');
	res.redirect('/adminSearchArticle/' + slug + '');

});

router.post('/approveArticle/:article', function(req, res, next){
	var slug = req.params.article;

	Articles.update({slug:slug},{$set:{status:"Posted"}}, function(err, article){
		if(err){throw err}
	});

	req.flash("info", "Article has been approved and posted");
	res.redirect("/adminSearchArticle/"+ slug +"");
});

router.post('/unapproveArticle/:article', function(req, res, next){
	var slug = req.params.article;

	Articles.update({slug:slug},{$set:{status:"for_Review"}}, function(err, article){
		if(err){throw err}
	});

	req.flash("info", "Article has been set to review and has not been posted");
	res.redirect("/adminSearchArticle/"+ slug +"");
});

module.exports = router;

