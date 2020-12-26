const mongoose = require('mongoose');
const Organiser = require('./Organiser')
const Administrator = require('./Administrator')
const WorkflowFileType = require('./WorkflowFileType')
const WorkUnit = require('./WorkUnit')
const Workflow = require('./Workflow')

const Schema = mongoose.Schema;
const FileSchema = new Schema(
    {
        workflowId:{type: Schema.Types.ObjectId, ref: 'Workflow',require:true},
        fileNo:{type: String,require:true},
        organiserId:{type: Schema.Types.ObjectId, ref: 'Organiser',require:true},
        administratorId:{type: Schema.Types.ObjectId, ref: 'Administrator',require:true},
        creationDate:{type: Date,default:Date.now,require:true},
        revisionDate:{type:Date},
        approvalStatus:{type:Number,default:0,require:true},
        approvalDate:{type:Date,default:null},
        filePath:{type:String,require:true},
        deleteDate:{type:Date,default:null},
        version:{type:Number,require:true},
        workflowFileTypeId:{type: Schema.Types.ObjectId, ref: 'WorkflowFileType',require:true},
        creatorId:{type: Schema.Types.ObjectId, ref: 'Administrator',require:true},
        workUnitId:{type: Schema.Types.ObjectId, ref: 'WorkUnit',require:true}
    }
);

const File = mongoose.model('File', FileSchema);

module.exports = File;
