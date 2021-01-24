const mongoose = require("mongoose")
const Workflow=require('./models/Workflow')
const unint=require('./models/WorkUnit')
const adm=require('./models/Administrator')
const org=require('./models/Organiser')

mongoose.connect("mongodb://127.0.0.1/EDMS", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})


adm.create({
  acad:0,
  registeredUserId:"600d65e2aee6f91768bf4cd7"
}, (error, user) => {
})
adm.create({
  acad:1,
  registeredUserId:"600d6627aee6f91768bf4cd8"
}, (error, user) => {
})
// org.create({
//   workUnitId:"5fffece346b0ba37f8ab3284",
//   startDate:Date.now(),
//   registeredUserId:"5fffe7a6cede2124e84beae7"
// })
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