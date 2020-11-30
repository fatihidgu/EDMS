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
             res.redirect('/login')
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


module.exports = router