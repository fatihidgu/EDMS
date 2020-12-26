const mongoose = require('mongoose')


const Schema = mongoose.Schema;
const WorkflowFileTypeSchema = new Schema({
    WorkflowFileTypeCode:{type:String,require:true},
    WorkflowFileTypeName:{type: String,require:true},
    creationDate:{type: Date, default:Date.now, require:true},
    deleteDate:{type:Date, default:null, require:true}
})

module.exports = mongoose.model('WorkflowFileType',WorkflowFileTypeSchema)
