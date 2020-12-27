const mongoose = require('mongoose')
const Administrator = require('./Administrator')
const MainProcess = require('./MainProcess')


const Schema = mongoose.Schema;
const WorkflowSchema = new Schema({

    workprocessName:{type:String ,required:true},
    acad:{type:Number, required:true}, // 1=Academic 0=Administrative
    mainProcessId:{type: Schema.Types.ObjectId, ref: 'MainProcess',required:true},
    workflowNo:{type: Number,required:true},
    creatorId:{type: Schema.Types.ObjectId, ref: 'Administrator',required:true},
    creationDate:{type:Date, default:Date.now, required:true},
    deleteDate:{type:Date,default:null}
})

module.exports = mongoose.model('Workflow',WorkflowSchema) //önce model ismi,sonra kullanacığım schema ismi
