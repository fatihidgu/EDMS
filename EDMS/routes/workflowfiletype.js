const express = require('express')
const Swal = require('sweetalert2')
const router = express.Router()
const Filetype = require('../models/WorkflowFileType')


router.get('/addworkflowfiletype', (req, res) => {
    if (req.session.userId) {
        Filetype.find().lean().then(filetypes => {
            return res.render('site/workflowfiletype', { filetypes: filetypes })

        })
    }
    else {
        res.redirect('/registeredusers/login')
    }
})

router.post('/addworkflowfiletype', (req, res) => {

    try {
        const { workflowfilename, workflowfilecode } = req.body
        if (typeof workflowfilename === 'object') {
            for (let index = 0; index < workflowfilename.length; index++) {
                const filetypestr = JSON.stringify(workflowfilename[index]);
                const codetypestr = JSON.stringify(workflowfilecode[index]);
                if (filetypestr.charAt(1) == " " || workflowfilename[index] == "" || workflowfilecode[index] == "" || codetypestr.charAt(1) == " ") {
                    //console.log('olusturulamaz', filetypestr)
                    //console.log('olusturulamaz', codetypestr)
                }
                else {
                    Filetype.create({
                        workflowFileTypeName: workflowfilename[index],
                        workflowFileTypeCode: workflowfilecode[index],

                    }, (err, result) => {
                        if (err) {
                            req.session.sessionFlash = {
                                type: 'alert alert-warning',
                                message: 'Workflow File Type is not unique.'
                            }
                        }
                        else {
                        }
                    }
                    )

                }
            }
            return res.redirect('/workflowfiletype/addworkflowfiletype')
        } else {
            if (workflowfilename == null || workflowfilename.charAt(0) == ' ' || workflowfilename == '' ||
                workflowfilecode == null || workflowfilecode.charAt(0) == ' ' || workflowfilecode == '') {
                //console.log('olusturulamaz')

            }
            else {

                Filetype.create({
                    workflowFileTypeName: workflowfilename,
                    workflowFileTypeCode: workflowfilecode,

                }, (err, result) => {
                    if (err) {
                        req.session.sessionFlash = {
                            type: 'alert alert-warning',
                            message: 'Workflow File Type is not unique.'
                        }
                        return res.redirect('/workflowfiletype/addworkflowfiletype')
                    }
                    else {
                        req.session.sessionFlash = {
                            type: 'alert alert-success',
                            message: 'Your Workflow File Type added.'
                        }
                        return res.redirect('/workflowfiletype/addworkflowfiletype')
                    }
                })
            }
        }
    } catch (err) {
        return res.redirect('/workflowfiletype/addworkflowfiletype')
    }

})



router.post('/disable', (req, res) => {
    Filetype.findOne({ _id: req.body.filtypeid }).then(file => {
        if (file.deleteDate) {
            //console.log("silinmis")
            file.updateOne({ deleteDate: null }).exec()
        }
        else {
            //console.log("silinmemis")
            file.updateOne({ deleteDate: Date.now() }).exec()
        }
    })
    return res.redirect("/workflowfiletype/addworkflowfiletype")
})

module.exports = router
