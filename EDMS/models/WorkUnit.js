const mongoose = require('mongoose')


const Schema = mongoose.Schema;
const WorkUnitSchema = new Schema({
    workUnitCode:{type:String,required:true, unique:true},
    workUnitName:{type: String,required:true,unique:true},
    acad:{type:Number, required:true},
    startDate:{type: Date, default:Date.now, required:true},
    endDate:{type:Date, default:null}
})

module.exports = mongoose.model('WorkUnit',WorkUnitSchema)
