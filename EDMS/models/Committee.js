const mongoose = require('mongoose')
const RegisteredUser = require('./RegisteredUser')


const Schema = mongoose.Schema;
const CommissionSchema = new Schema({
  startDate:{type:Date, default:Date.now, require:true},
  endDate:{type:Date},
  registeredUserId:{type: Schema.Types.ObjectId, ref:'RegisteredUser'}
})

module.exports = mongoose.model('Commission',CommissionSchema)
