var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    mongoose = require("mongoose"),
    User = require("./models/user"),
    Ddos = require('ddos'),
    ddos = new Ddos({burst: 2, limit: 6});

//requiring routes
var appointmentRoutes = require("./routes/appointments"),
    authRoutes = require("./routes/auth");

mongoose.connect("mongodb://localhost/hair_salon");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(ddos.express);
app.set("view engine","ejs");

app.use(require("express-session")({
    secret: "hairy hair",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//currently blank
app.get("/",function(req,res){
    res.render("landing");
});

app.use(appointmentRoutes);
app.use(authRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Hair Salon server has started");
});     