var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

var appointmentSchema = new mongoose.Schema({
    name: String,
    phone: String,
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
    var name = req.body.name;
    var phone = req.body.phone;
    var newAppointment = {name:name, phone:phone, madeAppointment:true};
    //Create a new campground and save to a database
    Appointment.create(newAppointment, function(err,newAppointment){
        if(err){
            console.log(err);
        } else{
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
    var name = req.body.name;
    var phone = req.body.phone;
    console.log(req.body.madeAppointment);
    if(req.body.madeAppointment === "true"){
        var madeAppointment = true;
        console.log("Appointment was made");
    } else if(req.body.madeAppointment === "false"){
        var madeAppointment = false;
        console.log("This was a walk-in");
    }
    var newAppointment = {name:name, phone:phone, madeAppointment:madeAppointment};
    //Create a new campground and save to a database
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
    res.redirect("/login");
}

module.exports = router;