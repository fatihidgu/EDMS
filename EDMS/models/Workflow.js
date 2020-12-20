const mongoose = require('mongoose')

const WorkflowSchema = new mongoose.Schema({

    workprocess:{type:String ,required:true},
    acad:{type:Number, required:true}, // 1=Academic 0=Administrative
    //mainprocessid:{type:number, required:true},
    creatorid:{type: String, required:true},
    creationdate:{type:Date, default:Date.now, require:true},
    deletedate:{type:Date}
})

module.exports = mongoose.model('Workflow',WorkflowSchema) //önce model ismi,sonra kullanacığım schema ismi
