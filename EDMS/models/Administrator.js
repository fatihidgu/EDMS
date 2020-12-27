const mongoose = require('mongoose')
const RegisteredUser = require('./RegisteredUser')

const Schema = mongoose.Schema;
const AdministratorSchema = new Schema({
    acad:{type:Number, required:true}, // 1=Academic 0=Administrative
    startDate:{type: Date, default:Date.now, required:true},
    endDate:{type:Date, default:null, required:true},
    registeredUserId:{type: Schema.Types.ObjectId, ref: 'RegisteredUser',required:true}
})

module.exports = mongoose.model('Administrator',AdministratorSchema)
