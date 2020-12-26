const mongoose = require('mongoose')
const RegisteredUser = require('./RegisteredUser')
const Change = require('./Change')


const Schema = mongoose.Schema;
const RejectSchema = new Schema({
    changeId:{type: Schema.Types.ObjectId, ref: 'Change',require:true},
    rejectReason:{type:String,require:true},
    rejectRole:{type:Number,require:true},
    rejecterId:{type: Schema.Types.ObjectId, ref: 'RegisteredUser',require:true}
})

module.exports = mongoose.model('Reject',RejectSchema)
