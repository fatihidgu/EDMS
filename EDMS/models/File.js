const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const FileSchema = new Schema(
    {
        workflowId:Number,
        fileId:Number,
        fileNo:String,
        organiserId:[Number],
        creatorId:Number,
        creatDate:Date,
        revisionDate:Date,
        approvalStatus:Number,
        approvalDate:Date,
        filePath: String,
        deleteDate:Date
    }
);

const File = mongoose.model('File', FileSchema);

module.exports = File;
