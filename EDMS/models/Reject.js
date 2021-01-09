const mongoose = require('mongoose')
const RegisteredUser = require('./RegisteredUser')
const Change = require('./Change')


const Schema = mongoose.Schema;
const RejectSchema = new Schema({
    changeId:{type: Schema.Types.ObjectId, ref: 'Change',required:true},
    rejectReason:{type:String,required:true},
    rejectRole:{type:Number,required:true},
    rejecterId:{type: Schema.Types.ObjectId, ref: 'RegisteredUser',required:true},
    creationDate:{type:Date, default:Date.now, required:true},
    deleteDate:{type:Date,default:null}
})

module.exports = mongoose.model('Reject',RejectSchema)
