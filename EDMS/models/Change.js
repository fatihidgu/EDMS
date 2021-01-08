const mongoose = require('mongoose')
const File = require('./File')
const Organiser = require('./Organiser')
const Manager = require('./Manager')
const Administrator = require('./Administrator')
const Commission = require('./Committee')


const Schema = mongoose.Schema;
const ChangeSchema = new Schema({
    fileNo:{type:Schema.Types.ObjectId, ref: 'File',required:true},
    organiserId:{type:Schema.Types.ObjectId, ref: 'Organiser',required:true},
    changeReason:{type:String,required:true},
    managerId:{type: Schema.Types.ObjectId, ref: 'Manager'},
    managerApprovalDate:{type:Date,default:null},
    administratorId:{type: Schema.Types.ObjectId, ref: 'Administrator'},
    administratorApprovalDate:{type:Date,default:null},
    committeeId:{type: Schema.Types.ObjectId, ref: 'Committee'},
    committeeApprovalDate:{type:Date,default:null},
    creationDate:{type:Date, default:Date.now, required:true},
    deleteDate:{type:Date,default:null},
})

module.exports = mongoose.model('Change',ChangeSchema)
