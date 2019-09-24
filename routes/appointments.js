var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var sanitizer = require("string-sanitizer");

var appointmentSchema = new mongoose.Schema({
    name: String,
    phone: String,
    customerCount: Number,
    madeAppointment: Boolean
});

var Appointment = mongoose.model("Appointment", appointmentSchema);

router.get("/appointments",function(req,res){
    Appointment.find({},function(err,allAppointments){
        if(err){
            console.log(err);
        } else{
            res.render("appointments",{appointments:allAppointments});
        }
    });
});

router.post("/appointments", function(req,res){
    var name = sanitizer.sanitize.keepSpace(req.body.name);
    var phone = sanitizer.sanitize.addDash(req.body.phone);
    var customerCount = req.body.customerCount;
    var newAppointment = {name:name, phone:phone, madeAppointment:true, customerCount:customerCount};
    Appointment.create(newAppointment, function(err,newAppointment){
        if(err){
            console.log(err);
        } else{
            req.flash("success","Your appointment was successfully created!");
            res.redirect("/appointments");    
        }
    })
});

router.get("/admin", isLoggedIn, function(req,res){
    Appointment.find({},function(err,allAppointments){
        if(err){
            console.log(err);
        } else{
            res.render("admin",{appointments:allAppointments});
        }
    });
});

router.post("/admin", function(req,res){
    var name = sanitizer.sanitize.keepSpace(req.body.name);
    var phone = sanitizer.sanitize.addDash(req.body.phone);
    var customerCount = req.body.customerCount;
    if(req.body.madeAppointment === "true"){
        var madeAppointment = true;
        console.log("Appointment was made");
    } else if(req.body.madeAppointment === "false"){
        var madeAppointment = false;
        console.log("This was a walk-in");
    }
    var newAppointment = {name:name, phone:phone, madeAppointment:madeAppointment, customerCount:customerCount};
    Appointment.create(newAppointment, function(err,newAppointment){
        if(err){
            console.log(err);
        } else{
            res.redirect("/admin");    
        }
    })
});

router.delete("/admin/:id",function(req,res){
    Appointment.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
        } else{
            res.redirect("/admin");
        }
    })
})

router.get("/display",function(req,res){
    Appointment.find({},function(err,allAppointments){
        if(err){
            console.log(err);
        } else{
            res.render("display",{appointments:allAppointments});
        }
    });
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = router;