const express = require("express"),
    app = express(),
    router = express.Router(),
    mongoose = require("mongoose"),
    rateLimit = require("express-rate-limit"),
    validator = require('validator');

//setup rate limiter
app.set('trust proxy', 1);
const appointmentCreationLimiter = rateLimit({
    windowMs: 240 * 60 * 1000, // 4 hours * 60 minutes
    max: 2,
    message:
        "Too many appointments created from this IP. Please call the salon"
});

var appointmentSchema = new mongoose.Schema({
    name: String,
    phone: String,
    customerCount: Number,
    madeAppointment: Boolean,
    dateString: String,
    createdAt: {type: Date, default: Date.now}
});

var Appointment = mongoose.model("Appointment", appointmentSchema);

//time estimate variables
var numWorkers = 1;
var numQueue = 0;
var estimateValueLow = 0;
var estimateValueHigh = estimateValueLow + 10;
function updateNumAppointments(){
    Appointment.countDocuments({}, function(err,count){
        numAppointments = count;
    });
    Appointment.find({}, function(err, appoints){
        numQueue = 0;
        appoints.forEach(function(appt){
            numQueue += appt.customerCount;
        });
        estimateValueLow = Math.max(0, numQueue*20 - numWorkers*20);
        estimateValueHigh = estimateValueLow + 10;
    });
}

updateNumAppointments();

router.get("/appointments",function(req,res){
    Appointment.find({},function(err,allAppointments){
        if(err){
            console.log(err);
        } else{
            res.render("appointments",{appointments:allAppointments, estimateValueLow:estimateValueLow, estimateValueHigh:estimateValueHigh});
        }
    });
});

router.post("/appointments", appointmentCreationLimiter, function(req,res){
    var name = validator.whitelist(req.body.name, 'A-Za-z0-9[\s]');
    var phone = phone = validator.whitelist(req.body.phone, '\(\)\+0-9[\s][\-]');
    var customerCount = validator.toInt(req.body.customerCount);
    let date = new Date();
    var dateString = date.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'});
    var newAppointment = {name:name, phone:phone, madeAppointment:true, customerCount:customerCount, dateString:dateString};
    Appointment.create(newAppointment, function(err,newAppointment){
        if(err){
            console.log(err);
        } else{
            updateNumAppointments();
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
            res.render("admin",{appointments:allAppointments, numWorkers:numWorkers, estimateValueLow:estimateValueLow, estimateValueHigh:estimateValueHigh});
        }
    });
});

router.post("/admin", function(req,res){
    var name = validator.whitelist(req.body.name, 'A-Za-z0-9[\s]');
    var phone = phone = validator.whitelist(req.body.phone, '\(\)\+0-9[\s]\-');
    var customerCount = validator.toInt(req.body.customerCount);
    let date = new Date();
    var dateString = date.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'});

    if(req.body.madeAppointment === "true"){
        var madeAppointment = true;
        console.log("Appointment was made");
    } else if(req.body.madeAppointment === "false"){
        var madeAppointment = false;
        console.log("This was a walk-in");
    }
    var newAppointment = {name:name, phone:phone, madeAppointment:madeAppointment, customerCount:customerCount, dateString:dateString};
    Appointment.create(newAppointment, function(err,newAppointment){
        if(err){
            console.log(err);
        } else{
            updateNumAppointments();
            res.redirect("/admin");
        }
    })
});

router.delete("/admin/:id",function(req,res){
    Appointment.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
        } else{
            updateNumAppointments();
            res.redirect("/admin");
        }
    });
});

router.post("/workers", function(req,res){
    numWorkers = req.body.workers;
    console.log(req.body.workers);
    updateNumAppointments();
    res.redirect("/admin");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = router;