var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var SALT_FACTOR = 10;

var userSchema = mongoose.Schema({
	username: {type:String, required:true, unique:true},
	name: {type:String, required:true},
	email: {type:String, required:true},
	password: {type:String, required:true},
	createAt: {type:Date, default:Date.Now}
});


var noop = function(){};

	// var user = this;
	// 	if(!user.isModified("password")){
	// 	return done();
	// }

var User = module.exports = mongoose.model("User", userSchema);

module.exports.createUser = function(newUser, callback){

	User.findOne({username: newUser.username}, function(err, user){
		if(err){ return next(err)}
			if(user){
				req.flash('info','This username already exists');
			};
		});

	bcrypt.genSalt(SALT_FACTOR, function(err, salt){
		if(err){return done(err);}
		bcrypt.hash(newUser.password, salt, noop, function(err, hashedPassword){
			if(err){return done(err);}
			newUser.password = hashedPassword;
			newUser.save(callback);
		});
	});
};