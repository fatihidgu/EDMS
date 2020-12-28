const express = require('express')
const router = express.Router()
const User = require('../models/RegisteredUser')

router.get('/register', (req, res) => {
    if(res.locals.userid){
        res.redirect('/')
    }
    else{
        res.render('site/register')
    }
})

router.post('/register', (req, res) => {
    const { password, password2 } = req.body
   
    if (password == password2) {
        User.create(req.body, (error, user) => {
            if (error == null) {
               
                req.session.sessionFlash = {
                    type: 'alert alert-success',
                    message: 'Registered Successfully'
                }
                
                res.redirect('/registeredusers/login')
            }
            else {
               
                req.session.sessionFlash = {
                    type: 'alert alert-success',
                    message: 'Email is not unique'
                }
                res.render('site/register', { User: req.body, sessionFlash: req.session.sessionFlash })
                delete req.session.sessionFlash
            }

        })
    }
    else {
        ////console.log('passwordlar uyuşmuyor')
        req.session.sessionFlash = {
            type: 'alert alert-success',
            message: 'Passwords are not match'
        }
        res.render('site/register', { User: req.body, sessionFlash: req.session.sessionFlash })
        delete req.session.sessionFlash
    }
}
)


router.get('/login', (req, res) => {
    if (res.locals.userid) {
        res.redirect('/')
    }
    else {
        res.render('site/login')
    }
})

router.post('/login', (req, res) => {
    if (res.locals.userid) {
        res.redirect('/')
    }
    else {

        const { email, password } = req.body
        User.findOne({ email }, (error, user) => {
            if (user) {
                if (user.password == password) {
                    // User session
                    //console.log(user._id)
                  
                    if (user.isBlocked) {
                        req.session.isBlockedSession = true
                        req.session.sessionFlash = {
                            type: 'alert alert-danger',
                            message: 'Your account is disabled. Please contact an Admin'
                        }
                    res.render('site/login', { User: req.body, sessionFlash: req.session.sessionFlash })
                    delete req.session.sessionFlash
                    
                }else{
                    req.session.userId = user._id
                    req.session.isBlockedSession = false

                    res.redirect('/')
                }
                  
                    
                }
                else {
                    //console.log('şifre yanlış')
                    req.session.sessionFlash = {
                        type: 'alert alert-success',
                        message: 'Password is wrong'
                    }
                    res.render('site/login', { User: req.body, sessionFlash: req.session.sessionFlash })
                    delete req.session.sessionFlash
                }
            } else {
                //console.log('kullanıcı yokk')
                req.session.sessionFlash = {
                    type: 'alert alert-success',
                    message: 'There is no user with that e-mail.'
                }
                res.render('site/login', { User: req.body, sessionFlash: req.session.sessionFlash })
                delete req.session.sessionFlash
            }
        })
    }
}
)

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/registeredusers/login')
    })

})

module.exports = router