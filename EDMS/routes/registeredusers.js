const express = require('express')
const router = express.Router()
const User = require('../models/RegisteredUser')
const Committee = require('../models/Committee')
var bcrypt = require('bcrypt');
var BCRYPT_SALT_ROUNDS = 12;

router.get('/register', (req, res) => {
    if (res.locals.userid) {
        res.redirect('/')
    }
    else {
        res.render('site/register')
    }
})

router.post('/register', (req, res) => {
    const { password, password2 } = req.body

    if (password == password2) {
        bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
            .then(function (hashedPassword) {
                //password:hashedPassword,
                User.create({ ...req.body, password: hashedPassword }, (error, user) => {
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
        User.findOne({ email }, async (error, user) => {
            if (user) {
                const isPasswordMatch = await bcrypt.compare(password, user.password)
                if (isPasswordMatch) {
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

                    } else {
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

router.post('/roles', (req, res) => {
    // console.log(req.body)
    User.findOne({ email: req.body.email }).then(user => {
        if (req.body.isCommittee === JSON.stringify(user.isCommittee)) {
            //console.log("comiteye bisi yapilmadi")
        } else {
            //console.log("komitenin isi yapildi")
            if (req.body.isCommittee == "true") {
                //olusturuldu
                Committee.create({ registeredUserId: user._id, startDate: Date.now() })
            } else {
                //silindi
                console.log()
                Committee.findOneAndUpdate({ registeredUserId: user._id }, { endDate: Date.now() }).then(sa => {
                })
            }
        }
    })
    User.findOneAndUpdate({ email: req.body.email }, { ...req.body }).then(us => {
    })
    if (true) {
        res.redirect('registeredusers/roles')
    }
    else {
        res.redirect('/roles')
    }




})

router.get('/roles', (req, res) => {
    if (res.locals.userid && res.locals.admin) {
        User.find().lean().then(us => {
            // console.log(us)

            res.render('site/roles', { user: us })
        })

    }
    else {
        res.redirect('/registeredusers/login')
    }
})

router.get('/secureUsers', (req, res) => {
    User.find().lean().then(us => {
        res.send(({ user: us }))
    })
})



router.get('/changepassword', (req, res) => {
    if (res.locals.userid) {
        res.render('site/changepassword')
    }
    else {
        res.render('site/login')
    }
})


router.post('/changepassword', (req, res) => {
    if (res.locals.userid) {
        User.findById(res.locals.userid).then(async (user) => {
            const isPasswordMatch = await bcrypt.compare(req.body.oldPassword, user.password)
            if (isPasswordMatch) {
                if (req.body.newPassword1 == req.body.newPassword2) {
                    bcrypt.hash(req.body.newPassword1, BCRYPT_SALT_ROUNDS)
                        .then(function (hashedPassword) {
                            user.password = hashedPassword
                            user.save()
                        })
                    req.session.sessionFlash = {
                        type: 'alert alert-success',
                        message: 'Your password changed'
                    }
                    res.redirect('/registeredusers/changepassword')
                }
                else {
                    req.session.sessionFlash = {
                        type: 'alert alert-success',
                        message: 'New passwords are not match'
                    }
                    res.render('site/changepassword', { User: req.body, sessionFlash: req.session.sessionFlash })
                    delete req.session.sessionFlash
                }

            }
            else {
                req.session.sessionFlash = {
                    type: 'alert alert-success',
                    message: 'Your old password is not match'
                }
                res.render('site/changepassword', { User: req.body, sessionFlash: req.session.sessionFlash })
                delete req.session.sessionFlash
            }
        })
    }
    else {
        res.render('site/login')
    }
})

router.get('/forgetpassword', (req, res) => {
    if (res.locals.userid) {
        res.redirect('/')
    }
    else {
        res.render('site/forgetpassword')
    }
})


router.post('/forgetpassword', async (req, res) => {
    if (res.locals.userid) {
        res.redirect('/')
    }
    else {
        const userExist = await User.findOne({ email: req.body.email }).exec()
        if (userExist) {
            var randompass = Math.random().toString(36).slice(-8);
            console.log(randompass)
            bcrypt.hash(randompass, BCRYPT_SALT_ROUNDS)
                .then(function (hashedPassword) {
                    userExist.password = hashedPassword
                    userExist.save()
                })
            const outputHTML = `
            <h2>You requested a password change.</h2>
            <p>Your password has been changed. You can login with your new password to the E-Document Management System</p>
            <h3>Your new password is below.</h3>
            <li>Your new password: ${randompass}</li>
            `

            "use strict";
            const nodemailer = require("nodemailer");


            async function main() {
                let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true, // true for 465, false for other ports
                    auth: {
                        user: "edmanagementsystem@gmail.com", // generated ethereal user
                        pass: "ed_123456", // generated ethereal password
                    },
                });

                // send mail with defined transport object
                let info = await transporter.sendMail({
                    from: `edmanagementsystem@gmail.com`,// sender address
                    to: req.body.email, // list of receivers
                    subject: "Your Password Has Changed", // Subject line
                    text: "Passwrod Change", // plain text body
                    html: outputHTML, // html body
                });
            }

            main().catch(console.error);
            req.session.sessionFlash = {
                type: 'alert alert-success',
                message: 'We sent new password to your email.'
            }
            res.redirect('/registeredusers/forgetpassword')
        }
        else {
            req.session.sessionFlash = {
                type: 'alert alert-warning',
                message: 'There is no user with that email.'
            }
            res.redirect('/registeredusers/forgetpassword')
        }

    }
})



module.exports = router