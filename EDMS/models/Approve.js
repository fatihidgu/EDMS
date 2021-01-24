const mongoose = require('mongoose')
const RegisteredUser = require('./RegisteredUser')
const Change = require('./Change')


const Schema = mongoose.Schema;
const ApproveSchema = new Schema({
    changeId:{type: Schema.Types.ObjectId, ref: 'Change',required:true},
    approverId:{type: Schema.Types.ObjectId, ref: 'RegisteredUser',required:true},
    creationDate:{type:Date, default:Date.now, required:true},
    deleteDate:{type:Date,default:null}
})

module.exports = mongoose.model('Approve',ApproveSchema)
