var mongoose = require('mongoose');

var imageSchema = mongoose.Schema({
	img: { data: Buffer, contentType:String, name:String }
});

 var image = module.exports = mongoose.model("Image", imageSchema);