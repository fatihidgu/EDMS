const mongoose = require('mongoose')
const RegisteredUser = require('./RegisteredUser')

const Schema = mongoose.Schema;
const AdministratorSchema = new Schema({
    acad:{type:Number, required:true}, // 1=Academic 0=Administrative
    startDate:{type: Date, default:Date.now, require:true},
    endDate:{type:Date, default:null, require:true},
    registeredUserId:{type: Schema.Types.ObjectId, ref: 'RegisteredUser',require:true}
})

module.exports = mongoose.model('Administrator',AdministratorSchema)
