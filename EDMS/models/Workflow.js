const mongoose = require('mongoose')

const WorkflowSchema = new mongoose.Schema({

    workprocess:{type:String ,required:true},
    acad:{type:Number, required:true},
    //mainprocessid:{type:number, required:true},
    creatorid:{type: Number, required:true},
    creationdate:{type:Date, default:Date.now, require:true},
    deletedate:{type:Date}
})

module.exports = mongoose.model('Workflow',WorkflowSchema) //önce model ismi,sonra kullanacığım schema ismi
