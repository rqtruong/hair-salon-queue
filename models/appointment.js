var mongoose = require("mongoose");

var appointmentSchema = new mongoose.Schema({
    name: String,
    phone: String,
    madeAppointment: Boolean
});

var Appointment = mongoose.model("Appointment", appointmentSchema);

// Appointment.create(
//     {
//         name:"Jello the Cat",
//         phone:"555-555-5555"
//     }, function(err, appointment){
//         if(err){
//             console.log(err);
//         } else{
//             console.log("NEWLY CREATED APPOINTMENT: ");
//             console.log(appointment);
//         }
//     }
// );
// Appointment.deleteMany({name: 'Jello the Cat'}, function(err){
//     if(err){
//         console.log(err);
//     } else{
//         console.log("JELLO DELETED");
//     }
// });