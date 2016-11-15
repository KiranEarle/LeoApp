var express = require('express');
var router = express.Router();
var fs = require('fs');
var Image = require('../models/testImageUploader');
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


router.get('/imageUploader', function(req, res, next){
	res.render('image', {
		title: 'Image Uploader'
	});
});

router.post('/imageUploader', upload.single('image'), function(req, res, next){
	var imageName = req.file.filename;
	var imagePath = 'articleImages/' + imageName 

	var newImage = Image();
		newImage.img.data = fs.readFileSync(imagePath);
		newImage.img.contentType = 'image/png';
		newImage.img.name = imageName;
	

	newImage.save(function(err, image){
		if(err){throw err}
		req.flash('info','Sucessfully uploaded image')
		res.redirect('/imageUploader')
	});
});

router.get('/getImage', function(req, res, next){

	Image.find()
	.exec(function(err, images){
	fs.writeFile('articleImages/', images.data, function(err){
		if(err){throw err}
	});

	});
	res.render('image', {
		title: 'Image Uploader'
	});
});

module.exports = router;