var express = require('express');
var mongoose = require('mongoose');
var Articles = require('../models/articles.js');
var User = require('../models/user.js');

function articles(callback){
	Articles.find()
	.sort({createdAt: 'descending'})
	.exec(callback);
}

function articleBySlug(slug, callback){
	Articles.findOne({slug:slug}, callback)
}

function users(callback){
	User.find()
	.sort({createdAt: 'descending'})
	.exec(callback);
}

module.exports.users = users;
module.exports.articleBySlug = articleBySlug;
module.exports.articles = articles;