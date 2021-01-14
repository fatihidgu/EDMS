const mongoose = require("mongoose")
const Workflow=require('./models/Workflow')
const unint=require('./models/WorkUnit')
const adm=require('./models/Administrator')

mongoose.connect("mongodb://127.0.0.1/EDMS", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})


adm.create({
  acad:1,
  registeredUserId:"5ffd8b8e266adf3804fbe5b3"
}, (error, user) => {
})

// var user_id = '5fef67cfe5478f1668bf4caf'; 
// Workflow.findByIdAndUpdate(user_id, { organiserId: '5fef65fbe5478f1668bf4caa' }, 
//                             function (err, docs) { 
//     if (err){ 
//         console.log(err) 
//     } 
//     else{ 
//         console.log("Updated User : ", docs); 
//     } 
// });