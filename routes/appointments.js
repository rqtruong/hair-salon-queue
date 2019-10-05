const express = require("express"),
    app = express(),
    router = express.Router(),
    mongoose = require("mongoose"),
    rateLimit = require("express-rate-limit"),
    sanitizer = require("string-sanitizer");
    
//setup rate limiter
app.set('trust proxy', 1);
const appointmentCreationLimiter = rateLimit({
    windowMs: 240 * 60 * 1000, // 4 hours * 60 minutes
    max: 2,
    message:
        "Too many appointments created from this IP. Please call In 2 Cuts at (408) 435-2887"
});


var appointmentSchema = new mongoose.Schema({
    name: String,
    phone: String,
    customerCount: Number,
    madeAppointment: Boolean
});

var Appointment = mongoose.model("Appointment", appointmentSchema);

//time estimate variables
var numWorkers = 1;
var numAppointments = 0;
var numQueue = 0;
var estimateValueLow = 0;
var estimateValueHigh = estimateValueLow + 10;
function updateNumAppointments(){
    Appointment.countDocuments({}, function(err,count){
        numAppointments = count;
        console.log("Number of appointments now: " + count);
    });
    Appointment.find({}, function(err, appoints){
        numQueue = 0;
        appoints.forEach(function(appt){
            numQueue += appt.customerCount;
        });
        console.log("Number in queue: " + numQueue);
        console.log("Number of workers: " + numWorkers);
        estimateValueLow = Math.max(0, numQueue*20 - numWorkers*20);
        estimateValueHigh = estimateValueLow + 10;
        console.log("Time estimate is " + estimateValueLow + " — "  + estimateValueHigh + " minutes");
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
            res.render("admin",{appointments:allAppointments, numWorkers:numWorkers, estimateValueLow:estimateValueLow, estimateValueHigh:estimateValueHigh});
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