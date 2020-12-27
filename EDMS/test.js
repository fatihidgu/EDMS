const mongoose = require("mongoose")
const Workflow=require('./models/Workflow')
const unint=require('./models/WorkUnit')

mongoose.connect("mongodb://127.0.0.1/EDMS", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

unint.create({
  workUnitCode:"IK",
  workUnitName:"insan kaynaklari",
  acad:0,
}, (error, user) => {
console.log(error)
console.log(user)
})

unint.create({
  workUnitCode:"prs",
  workUnitName:"prs bisi",
  acad:0,
}, (error, user) => {
console.log(error)
console.log(user)
})

unint.create({
  workUnitCode:"sad",
  workUnitName:"insan uzgunler",
  acad:0,
  endDate:Date.now()
}, (error, user) => {
console.log(error)
console.log(user)
})

unint.create({
  workUnitCode:"zenci",
  workUnitName:"insan zenci",
  acad:1,
}, (error, user) => {
console.log(error)
console.log(user)
})
