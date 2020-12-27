const mongoose = require('mongoose')
const RegisteredUser = require('./RegisteredUser')
const WorkUnit = require('./WorkUnit')


const Schema = mongoose.Schema;
const ManagerSchema = new Schema({
    workUnitId:{type: Schema.Types.ObjectId, ref: 'WorkUnit',required:true},
    startDate:{type: Date, default:Date.now, required:true},
    endDate:{type:Date, default:null, required:true},
    registeredUserId:{type: Schema.Types.ObjectId, ref: 'RegisteredUser',required:true}
})

module.exports = mongoose.model('Manager',ManagerSchema)
