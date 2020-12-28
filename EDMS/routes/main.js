const express = require('express')
const router = express.Router()
const User = require('../models/RegisteredUser')
const Mainprocess = require('../models/MainProcess')
const Workunit = require('../models/WorkUnit')

router.get('/', (req, res) => {
    res.redirect('/workflows/allworkflows')
})

router.get('/mainprocess', (req, res) => {
    Workunit.find({ endDate: null }).lean().then(workunits => {
        Mainprocess.find({ deleteDate: null }).lean().then(mainprocesses => {
          return  res.render('site/mainprocess', { mainprocesses: mainprocesses, workunits: workunits })
        })
    })
})
router.post('/mainprocess', (req, res) => {

    const mainname = req.body.workprocess
    const mainno = req.body.workprocessno
    const mainwid=req.body.workunitid
    
    if (typeof mainname === 'object') {
        for (let index = 0; index < mainname.length; index++) {
            const mainnamestr = JSON.stringify(mainname[index]);
            if (mainnamestr.charAt(1) == " " || mainname[index] == "" || mainno[index] == "") {
                //console.log('olusturulamaz',mainnamestr)
            }
            else {
                Mainprocess.create({
                    mainProcessName: mainname[index],
                    mainProcessNo: mainno[index],
                    workUnitId:mainwid[index]
                })
            }

        }
        return res.redirect('mainprocess')
    } else {
        if (mainname==null || mainname.charAt(0) == ' ' || mainname == '' || mainno == "") {
            //console.log('olusturulamaz')
        }
        else {
            Mainprocess.create({
                mainProcessName: mainname,
                mainProcessNo: mainno,
                workUnitId:mainwid
            })
        }
        return res.redirect('mainprocess')
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

router.get('/ornek', (req, res) => {
    User.find().lean().then(us => {
        res.send(({ user: us }))
    })
})

router.post('/roles', (req, res) => {
    User.findOneAndUpdate({ email: req.body.email }, { ...req.body }).then(us => {
        
    })



    res.redirect('/roles')
})

router.get('/editworkunit', (req, res) => {
    if (req.session.userId) {
        res.render('site/editworkunits')
    }
    else {
        res.redirect('/registeredusers/login')
    }
})





module.exports = router