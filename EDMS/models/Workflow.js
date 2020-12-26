const mongoose = require('mongoose')
const Administrator = require('./Administrator')
const MainProcess = require('./MainProcess')


const Schema = mongoose.Schema;
const WorkflowSchema = new Schema({

    workprocessName:{type:String ,required:true},
    acad:{type:Number, required:true}, // 1=Academic 0=Administrative
    mainProcessId:{type: Schema.Types.ObjectId, ref: 'MainProcess',require:true},
    workflowNo:{type: Number,require:true},
    creatorId:{type: Schema.Types.ObjectId, ref: 'Administrator',require:true},
    creationDate:{type:Date, default:Date.now, require:true},
    deleteDate:{type:Date,default:null}
})

module.exports = mongoose.model('Workflow',WorkflowSchema) //önce model ismi,sonra kullanacığım schema ismi
