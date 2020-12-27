const mongoose = require('mongoose');
const Organiser = require('./Organiser')
const Administrator = require('./Administrator')
const WorkflowFileType = require('./WorkflowFileType')
const WorkUnit = require('./WorkUnit')
const Workflow = require('./Workflow')

const Schema = mongoose.Schema;
const FileSchema = new Schema(
    {
        workflowId:{type: Schema.Types.ObjectId, ref: 'Workflow',required:true},
        fileNo:{type: String,required:true},
        organiserId:{type: Schema.Types.ObjectId, ref: 'Organiser',required:true},
        administratorId:{type: Schema.Types.ObjectId, ref: 'Administrator',required:true},
        creationDate:{type: Date,default:Date.now,required:true},
        revisionDate:{type:Date},
        approvalStatus:{type:Number,default:0,required:true},
        approvalDate:{type:Date,default:null},
        filePath:{type:String,required:true},
        deleteDate:{type:Date,default:null},
        version:{type:Number,required:true},
        workflowFileTypeId:{type: Schema.Types.ObjectId, ref: 'WorkflowFileType',required:true},
        creatorId:{type: Schema.Types.ObjectId, ref: 'Administrator',required:true},
        workUnitId:{type: Schema.Types.ObjectId, ref: 'WorkUnit',required:true}
    }
);

const File = mongoose.model('File', FileSchema);

module.exports = File;
