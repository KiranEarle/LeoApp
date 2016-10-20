var mongoose = require('mongoose');
var User = require('./user.js');


var articleSchema = mongoose.Schema({
	title:{type:String, required:true, unique:true},
	articleText: {type:String},
	author: {type:String},
	createdAt: {type:Date},
	updated: {type:Date, default: Date.now},
	comment:[
				{
				articaleText: {type:String},
				author:{type:String},
				createdAt: {type:Date, default: Date.now}
				}
			],
	tags:
		[
			{articaleText: {type:String}}
		]
});

var Articles = module.exports = mongoose.model("Articles", articleSchema);
