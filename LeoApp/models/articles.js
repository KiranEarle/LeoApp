var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var User = require('./user.js');


var articleSchema = mongoose.Schema({
	title:{type:String, required:true, unique:true},
	articleText: {type:String},
	slug: {type:String},
	author: {type:String},
	createdAt: {type:Date},
	updated: {type:Date, default: Date.now},
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

articleSchema.plugin(mongoosePaginate);

var Articles = module.exports = mongoose.model("Articles", articleSchema);
