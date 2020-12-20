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
                //User.update({password})
                req.session.sessionFlash={
                    type:'alert alert-success',
                    message:'Registered Successfully'
                }
            ////console.log("Burası çıkış",res.locals.sessionFlash)    
            ////console.log("Buraadn dönüyorum",req.session.sessionFlash)
            res.redirect('/registeredusers/login')
            }
            else{
                ////console.log('email unieq değil')
                req.session.sessionFlash={
                    type:'alert alert-success',
                    message:'Email is not unique'
                }
                res.render('site/register', {User:req.body,sessionFlash: req.session.sessionFlash})
                delete req.session.sessionFlash
            }
           
        })
    }
    else{
        ////console.log('passwordlar uyuşmuyor')
        req.session.sessionFlash={
            type:'alert alert-success',
            message:'Passwords are not match'
        }
        res.render('site/register', {User:req.body,sessionFlash: req.session.sessionFlash})
       delete req.session.sessionFlash
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
            //console.log(user._id)
            req.session.userId = user._id
            res.redirect('/')
            //console.log('giriş yapıldı')
            }
            else{
                //console.log('şifre yanlış')
                req.session.sessionFlash={
                    type:'alert alert-success',
                    message:'Password is wrong'
                }
               res.render('site/login', {User:req.body,sessionFlash: req.session.sessionFlash})
               delete req.session.sessionFlash
            }
        }else{
            //console.log('kullanıcı yokk')
            req.session.sessionFlash={
                type:'alert alert-success',
                message:'There is no user with that e-mail.'
            }
           res.render('site/login', {User:req.body,sessionFlash: req.session.sessionFlash})
           delete req.session.sessionFlash
        }
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy(()=>{
        res.redirect('/')
    })
    
})

module.exports = router