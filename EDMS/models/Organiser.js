const mongoose = require('mongoose')
const RegisteredUser = require('./RegisteredUser')
const WorkUnit = require('./WorkUnit')


const Schema = mongoose.Schema;
const OrganiserSchema = new Schema({
    workUnitId:{type: Schema.Types.ObjectId, ref: 'WorkUnit',required:true},
    startDate:{type: Date, default:Date.now, required:true},
    endDate:{type:Date, default:null},
    registeredUserId:{type: Schema.Types.ObjectId, ref: 'RegisteredUser',required:true}
})

module.exports = mongoose.model('Organiser',OrganiserSchema)
