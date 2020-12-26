const mongoose = require('mongoose')

const RegisteredUserSchema = new mongoose.Schema({
    name:{type:String, required:true},
    surname:{type:String, required:true},
    email:{type:String, required:true, unique:true,},
    password:{type:String, required:true},
    isblocked:{type:Boolean, default:false},
    isadmin:{type:Boolean, default:false},
    isorganiser:{type:Boolean, default:false},
    iscommission:{type:Boolean, default:false},
    ismanager:{type:Boolean, default:false},

})

module.exports = mongoose.model('RegisteredUser',RegisteredUserSchema) //önce model ismi,sonra kullanacığım schema ismi
