const mongoose = require('mongoose')


const Schema = mongoose.Schema;
const WorkflowFileTypeSchema = new Schema({
    workflowFileTypeCode:{type:String,required:true, unique:true},
    workflowFileTypeName:{type: String,required:true, unique:true},
    creationDate:{type: Date, default:Date.now, required:true},
    deleteDate:{type:Date, default:null}
})

module.exports = mongoose.model('WorkflowFileType',WorkflowFileTypeSchema)
