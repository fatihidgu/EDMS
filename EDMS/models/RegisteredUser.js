const mongoose = require('mongoose')

const RegisteredUserSchema = new mongoose.Schema({
    name:{type:String, require:true},
    surname:{type:String, require:true},
    email:{type:String, require:true, unique:true,},
    password:{type:String, require:true}
})

module.exports = mongoose.model('RegisteredUser',RegisteredUserSchema) //önce model ismi,sonra kullanacığım schema ismi
