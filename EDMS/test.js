const mongoose = require("mongoose")
const Workflow=require('./models/Workflow')

mongoose.connect("mongodb://127.0.0.1/EDMS", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

Workflow.create({
    workprocess : 'deneme1',
    acad : '1' ,
    creatorid:'2',
}, 
     (err, post)=> {
    console.log(err,post)
    // saved!
  });
  Workflow.create({
    workprocess : 'deneme2',
    acad : '1' ,
    creatorid:'1',
}, 
     (err, post)=> {
    console.log(err,post)
    // saved!
  });
  Workflow.create({
    workprocess : 'deneme3',
    acad : '1' ,
    creatorid:'2',
}, 
     (err, post)=> {
    console.log(err,post)
    // saved!
  });
  Workflow.create({
    workprocess : 'deneme4',
    acad : '1' ,
    creatorid:'2',
}, 
     (err, post)=> {
    console.log(err,post)
    // saved!
  });
  Workflow.create({
    workprocess : 'deneme5',
    acad : '0' ,
    creatorid:'1',
}, 
     (err, post)=> {
    console.log(err,post)
    // saved!
  });
  Workflow.create({
    workprocess : 'deneme6',
    acad : '0' ,
    creatorid:'1',
    deletedate:'12.12.2020'
}, 
     (err, post)=> {
    console.log(err,post)
    // saved!
  });
  Workflow.create({
    workprocess : 'deneme7',
    acad : '0' ,
    creatorid:'2',
    deletedate:'12.12.2020'
}, 
     (err, post)=> {
    console.log(err,post)
    // saved!
  });