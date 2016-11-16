var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var crypto = require('crypto');
var path = require('path');
var Grid = require('gridfs-stream');
var mongoose = require('mongoose');
var conn = mongoose.connection;
	Grid.mongo = mongoose.mongo;

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
	var imagePath = '/articleImages/' + imageName;
	var filePath = path.join(__dirname, '../' + imagePath);


	var gfs = Grid(conn.db);
	var writestream = gfs.createWriteStream({
		filename: imageName
	});

	fs.createReadStream(filePath).pipe(writestream);

	writestream.on('close', function(file){
		console.log(file.filename + ' Wrtten to DB')
	});

	req.flash('info', 'Uploaded picture');
	res.redirect('/imageUploader');

	
});

router.get('/viewImage/:image', function(req, res, next){
	var imageName = req.params.image;
	var imagePath = '/articleImages/' + imageName;
	var filePath = path.join(__dirname, '../' + imagePath);

		console.log('Connection open');
		var gfs = Grid(conn.db);

		var writeStream = fs.createWriteStream(filePath);

		var readStream = gfs.createReadStream({
			filename: imageName
		});

		readStream.pipe(writeStream);

		writeStream.on('close', function(){
			console.log('File has been written');
		});

	var imageDir = '/' + imageName
	res.render('showImage',{
		title: "Show Image",
		image: imageDir
	});

});

module.exports = router;