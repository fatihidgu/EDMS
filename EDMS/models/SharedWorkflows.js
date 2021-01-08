const mongoose = require('mongoose')
const WorkUnit = require('./WorkUnit')
const Organiser = require('./Organiser')
const Workflow = require('./Workflow')

const Schema = mongoose.Schema;
const SharedWorkflowSchema = new Schema({

    workflowId:{type: Schema.Types.ObjectId, ref: 'Workflow',required:true},
    organiserId:{type: Schema.Types.ObjectId, ref: 'Organiser', required:true},
    workUnitId:{type: Schema.Types.ObjectId, ref: 'WorkUnit', required:true},   
    creationDate:{type:Date, default:Date.now, required:true},
    deleteDate:{type:Date,default:null},
})

module.exports = mongoose.model('SharedWorkflow',SharedWorkflowSchema) //önce model ismi,sonra kullanacığım schema ismi
