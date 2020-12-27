const mongoose = require('mongoose')

const RegisteredUserSchema = new mongoose.Schema({
    name:{type:String, required:true},
    surname:{type:String, required:true},
    email:{type:String, required:true, unique:true,},
    password:{type:String, required:true},
    isBlocked:{type:Boolean, default:false},
    isAdmin:{type:Boolean, default:false},
    isOrganiser:{type:Boolean, default:false},
    isCommittee:{type:Boolean, default:false},
    isManager:{type:Boolean, default:false},

})

module.exports = mongoose.model('RegisteredUser',RegisteredUserSchema) //önce model ismi,sonra kullanacığım schema ismi
