var mongoose = require('mongoose');

var adminHomeArticle = mongoose.Schema({
	title: {type:String, required:true},
	img: {type:String, required:true},
	text: {type:String, required:true},
	dateCreated: {type:Date}
});

var HomeArticle = module.exports = mongoose.model("HomeArticle", adminHomeArticle);