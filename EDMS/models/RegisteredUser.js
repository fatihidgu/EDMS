const mongoose = require('mongoose')

const RegisteredUserSchema = new mongoose.Schema({
    name:{type:String, required:true},
    surname:{type:String, required:true},
<<<<<<< HEAD
    email:{type:String, required:true, unique:true,},
    password:{type:String, required:true},
    isblocked:{type:Boolean, default:false},
    isadmin:{type:Boolean, default:false},
    isorganiser:{type:Boolean, default:false},
    iscommission:{type:Boolean, default:false},
    ismanager:{type:Boolean, default:false},

=======
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    isBlocked:{type:Number,default:0, required:true},
    isOrganiser:{type:Number,default:0,required:true},
    isManager:{type:Number,default:0,require:true},
    isAdministrator:{type:Number,default:0,require:true},
    isCommission:{type:Number,default:0,required:true}
>>>>>>> 9d7eea54da5526dd40113d2b18893e1aef97fcc7
})

module.exports = mongoose.model('RegisteredUser',RegisteredUserSchema) //önce model ismi,sonra kullanacığım schema ismi
