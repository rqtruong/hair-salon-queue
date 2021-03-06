require('dotenv').config();
const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    User = require("./models/user");

//requiring routes
var appointmentRoutes = require("./routes/appointments"),
    authRoutes = require("./routes/auth");

mongoose.connect(process.env.DATABASEURL || "mongodb://localhost/hair_salon", { useNewUrlParser: true });
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());
app.set("view engine","ejs");

app.use(require("express-session")({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.get("/",function(req,res){
    res.render("landing");
});

app.use(appointmentRoutes);
app.use(authRoutes);

app.listen(process.env.PORT || 8080, process.env.IP, function(){
    console.log("Hair Salon server has started");
});