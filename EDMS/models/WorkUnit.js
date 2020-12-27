const mongoose = require('mongoose')


const Schema = mongoose.Schema;
const WorkUnitSchema = new Schema({
    workUnitCode:{type:String,require:true},
    workUnitName:{type: String,require:true},
    acad:{type:Number, required:true},
    startDate:{type: Date, default:Date.now, require:true},
    endDate:{type:Date, default:null, require:true}
})

module.exports = mongoose.model('WorkUnit',WorkUnitSchema)
