var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/register",function(req,res){
    res.render("register");
});

router.post("/register",function(req,res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        } 
        passport.authenticate("local")(req,res,function(){
            res.redirect("/admin");
        })
    });
});

router.get("/login",function(req,res){
    res.render("login");
});

router.post("/login", passport.authenticate("local",
    {
    successRedirect: "/admin",
    failureRedirect: "login"
    }), function(req,res){
    res.send("LOGIN LOGIC HAPPENS HERE");
});

router.get("/logout", function(req,res){
    req.logout();
    res.redirect("/login");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Please login first");
    res.redirect("/login");
}
module.exports = router;