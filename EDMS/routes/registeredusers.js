const express = require('express')
const router = express.Router()
const User=require('../models/RegisteredUser')

router.get('/register',(req,res)=>{
    res.render('site/register')
})

router.post('/register',(req,res)=>{
    const {password, password2} = req.body 
    if(password==password2){
        User.create(req.body, (error,user)=>{
            if(error==null){
                User.update({password})
             res.redirect('/registeredusers/login')
            }
            else{
                console.log('email unieq değil')
            }
           
        })
    }
    else{
        console.log('password yanluş')
    }
}
)

router.get('/login', (req, res) => {
    res.render('site/login')
})

router.post('/login', (req, res) => {
    const {email,password} =req.body
    User.findOne({email},(error,user)=>{
        if(user){
            if(user.password==password){
            // User session
            console.log('giriş yapıldı')
            }
            else{
                console.log('şifre yanlış')
            }
        }else{
            console.log('kullanıcı yokk')
        }
    })
})
    
module.exports = router