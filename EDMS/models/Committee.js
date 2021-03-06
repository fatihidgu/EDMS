const mongoose = require('mongoose')
const RegisteredUser = require('./RegisteredUser')


const Schema = mongoose.Schema;
const CommitteeSchema = new Schema({
  startDate:{type:Date, default:Date.now, required:true},
  endDate:{type:Date, default:null},
  registeredUserId:{type: Schema.Types.ObjectId, ref:'RegisteredUser'}
})

module.exports = mongoose.model('Committee',CommitteeSchema)
