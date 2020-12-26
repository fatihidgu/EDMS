const mongoose = require('mongoose')


const Schema = mongoose.Schema;
const WorkUnitSchema = new Schema({
    WorkUnitCode:{type:String,require:true},
    WorkUnitName:{type: String,require:true},
    acad:{type:Number, required:true},
    startDate:{type: Date, default:Date.now, require:true},
    endDate:{type:Date, default:null, require:true}
})

module.exports = mongoose.model('WorkUnit',WorkUnitSchema)
