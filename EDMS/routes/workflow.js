const mongoose = require("mongoose")
const express = require('express')
const router = express.Router()
const Workflow=require('../models/Workflow')

mongoose.connect("mongodb://127.0.0.1/EDMS", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

Workflow.create({
    workprocess : 'also_awesome' 
}, 
     (err, post)=> {
    console.log(err,post)
    // saved!
  });
