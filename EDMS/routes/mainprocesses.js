const express = require('express')
const router = express.Router()
const Mainprocess = require('../models/MainProcess')
const Workunit = require('../models/WorkUnit')

router.get('/addmainprocess', (req, res) => {
    Workunit.find({ endDate: null }).lean().then(workunits => {
        Mainprocess.find({}).populate({ path: 'workUnitId', model: Workunit }).lean().then(mainprocesses => {
            //console.log(mainprocesses)
            return res.render('site/mainprocess', { mainprocesses: mainprocesses, workunits: workunits })
        })
    })
})

router.post('/addmainprocess', async (req, res) => {
    try {
        const mainname = req.body.workprocess
        const mainwid = req.body.workunitid

        if (typeof mainname === 'object') {
            for (let index = 0; index < mainname.length; index++) {
                const mainnamestr = JSON.stringify(mainname[index]);
                const notUnique = await Mainprocess.find({ mainProcessName: mainname[index], workUnitId: mainwid[index] }).exec();
                //console.log(notUnique)
                if (mainnamestr.charAt(1) == " " || mainname[index] == "" || notUnique[0] != null) {
                }
                else {
                    Mainprocess.find({ workUnitId: mainwid[index] }).then(count => {
                        Mainprocess.create({
                            mainProcessName: mainname[index],
                            workUnitId: mainwid[index],
                            mainProcessNo: count.length + 1
                        })
                    })
                }
            }
            req.session.sessionFlash = {
                type: 'alert alert-success',
                message: 'Your main processes successfully added.'
            }
            return res.redirect('/mainprocess/addmainprocess')
        } else {
            //uniq deilse

            const notUnique = await Mainprocess.findOne({ mainProcessName: mainname, workUnitId: mainwid }).exec();
            if (mainname == null || mainname.charAt(0) == ' ' || mainname == '' || notUnique != null) {
                //console.log('olusturulamaz')
                req.session.sessionFlash = {
                    type: 'alert alert-warning',
                    message: 'Mainprocess name and workunit must be unique!'
                }
                return res.redirect('/mainprocess/addmainprocess')
            }
            else {
                Mainprocess.find({ workUnitId: mainwid }).then(count => {
                    Mainprocess.create({
                        mainProcessName: mainname,
                        workUnitId: mainwid,
                        mainProcessNo: count.length + 1
                    })
                })
                req.session.sessionFlash = {
                    type: 'alert alert-success',
                    message: 'Your main process successfully added.'
                }
                return res.redirect('/mainprocess/addmainprocess')
            }
        }
    }
    catch (err) {
        //console.log(err)
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