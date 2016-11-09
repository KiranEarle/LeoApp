var mongoose = require('mongoose');
var User = require('./user.js');


var articleSchema = mongoose.Schema({
	title:{type:String, required:true},
	articleText: {type:String},
	slug: {type:String, unique:true},
	author: {type:String},
	createdAt: {type:Date},
	updated: {type:Date, default: Date.now},
	status: {type:String},
	headerImg : {type:String},
	comment:[
				{
				articleComment: {type:String},
				commentAuthor:{type:String},
				createdAt: {type:Date, default: Date.now}
				}
			],
	tags:
		[
			{tag: {type:String}}
		]
});


var Articles = module.exports = mongoose.model("Articles", articleSchema);
