const mongoose = require('mongoose')
const WorkUnit = require('./WorkUnit')


const Schema = mongoose.Schema;
const MainProcessSchema = new Schema({
    mainProcessNo:{type:Number,required:true},
    mainProcessName:{type: String,required:true},
    workUnitId:{type: Schema.Types.ObjectId, ref: 'WorkUnit',required:true},
    creationDate:{type: Date, default:Date.now, required:true},
    deleteDate:{type:Date, default:null}
})

module.exports = mongoose.model('MainProcess',MainProcessSchema)
