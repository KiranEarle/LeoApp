var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var passport = require("passport");
var session = require("express-session");
var flash = require("connect-flash");
var expressValidator = require("express-validator");

var routes = require("./routes/index");
var users = require("./routes/users")

//var setUpPassport = require("./setuppassport");

var app = express();


mongoose.connect("mongodb://localhost:27017/Lion", function(){
	console.log('Connected to Mongo server')
});
//setUpPassport();
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));


app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(session({
	secret:"TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
	resave: true,
	saveUninitialized: true
}));

app.use(flash());
app.use(function(req, res, next){
	res.locals.errors = req.flash("error");
	res.locals.infos = req.flash("info");
	next();
});
//app.use(passport.initialize());
//app.use(passport.session());
app.use(routes);

app.use(users, function(req, res, next){
	var err = new Error();
	err.status = 404;
	next(err);
});

app.use(function(err, req, res, next){
	res.status(400).render('404', {
		title: 404 + ' Sorry page not found'
	});
});




app.listen(app.get("port"), function(){
	console.log("Server started on port " + app.get("port"));
});