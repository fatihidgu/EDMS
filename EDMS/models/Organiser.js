const mongoose = require('mongoose')
const RegisteredUser = require('./RegisteredUser')
const WorkUnit = require('./WorkUnit')


const Schema = mongoose.Schema;
const OrganiserSchema = new Schema({
    workUnitId:{type: Schema.Types.ObjectId, ref: 'WorkUnit',require:true},
    startDate:{type: Date, default:Date.now, require:true},
    endDate:{type:Date, default:null, require:true},
    registeredUserId:{type: Schema.Types.ObjectId, ref: 'RegisteredUser',require:true}
})

module.exports = mongoose.model('Organiser',OrganiserSchema)
