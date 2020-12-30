const express = require('express')
const router = express.Router()
const Mainprocess = require('../models/MainProcess')
const Workunit = require('../models/WorkUnit')

router.get('/addmainprocess', (req, res) => {
    Workunit.find({ endDate: null }).lean().then(workunits => {
        Mainprocess.find({}).lean().then(mainprocesses => {
            return res.render('site/mainprocess', { mainprocesses: mainprocesses, workunits: workunits })
        })
    })
})

router.post('/addmainprocess', (req, res) => {
    try {
        const mainname = req.body.workprocess
        const mainno = req.body.workprocessno
        const mainwid = req.body.workunitid

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
                        workUnitId: mainwid[index]
                    })
                }

            }
            req.session.sessionFlash = {
                type: 'alert alert-success',
                message: 'Your main processess successfully added'
            }
            return res.redirect('/mainprocess/addmainprocess')
        } else {
            if (mainname == null || mainname.charAt(0) == ' ' || mainname == '' || mainno == "") {
                //console.log('olusturulamaz')
            }
            else {
                Mainprocess.create({
                    mainProcessName: mainname,
                    mainProcessNo: mainno,
                    workUnitId: mainwid
                })
            }
            req.session.sessionFlash = {
                type: 'alert alert-success',
                message: 'Your main process successfully added.'
            }
            return res.redirect('/mainprocess/addmainprocess')
        }
    }
    catch (err) {
        console.log(err)
    }
})

router.post('/disable', (req, res) => {
    Mainprocess.findOne({ _id: req.body.mainprocid }).then(mainproc => {
        if (mainproc.deleteDate) {
            //console.log("silinmis")
            mainproc.updateOne({ deleteDate: null }).exec()
        }
        else {
            //console.log("silinmemis")
            mainproc.updateOne({ deleteDate: Date.now() }).exec()
        }
    })
    return res.redirect("/mainprocess/addmainprocess")
})


module.exports = router