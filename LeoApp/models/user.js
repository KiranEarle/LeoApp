var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var SALT_FACTOR = 10;

var userSchema = mongoose.Schema({
	username: {type:String, required:true, unique:true},
	name: {type:String, required:true},
	email: {type:String, required:true, unique:true},
	password: {type:String, required:true},
	createAt: {type:Date, default:Date.now}
});


userSchema.pre('save', function(done){
	var user = this;
	if(!user.isModified("password")){
		return done();
	};

	user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(SALT_FACTOR), null);
	done();
});

userSchema.methods.checkPassword = function(guess, done){
	bcrypt.compare(guess, this.password, function(err, isMatch){
		done(err, isMatch);
	})
}

userSchema.methods.displayName = function(){
	return this.name;
};

var noop = function(){};

var User = module.exports = mongoose.model("User", userSchema);

module.exports.createUser = function(newUser, callback){

	bcrypt.genSalt(SALT_FACTOR, function(err, salt){
		if(err){return done(err);}
		bcrypt.hash(newUser.password, salt, noop, function(err, hashedPassword){
			if(err){return done(err);}
			newUser.password = hashedPassword;
			newUser.save(callback);
		});
	});
};

