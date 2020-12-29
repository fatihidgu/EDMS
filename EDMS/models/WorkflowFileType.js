const mongoose = require('mongoose')


const Schema = mongoose.Schema;
const WorkflowFileTypeSchema = new Schema({
    workflowFileTypeCode:{type:String,required:true, unique:true},
    workflowFileTypeName:{type: String,required:true, unique:true},
    creationDate:{type: Date, default:Date.now, required:true},
<<<<<<< HEAD
    deleteDate:{type:Date, default:null}
=======
    deleteDate:{type:Date, default:null,}
>>>>>>> b49a054497a39e7c885295610287b39bfcca5fac
})

module.exports = mongoose.model('WorkflowFileType',WorkflowFileTypeSchema)
