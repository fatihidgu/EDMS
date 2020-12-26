const mongoose = require('mongoose')
const WorkUnit = require('./WorkUnit')


const Schema = mongoose.Schema;
const MainProcessSchema = new Schema({
    mainProcessNo:{type:Number,require:true},
    mainProcessName:{type: String,require:true},
    workUnitId:{type: Schema.Types.ObjectId, ref: 'WorkUnit',require:true},
    creationDate:{type: Date, default:Date.now, require:true},
    deleteDate:{type:Date, default:null, require:true}
})

module.exports = mongoose.model('MainProcess',MainProcessSchema)
