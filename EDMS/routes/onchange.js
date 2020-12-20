const express = require('express')
const router = express.Router()
const Workflow = require('../models/Workflow')
const WorkflowFile = require('../models/File')


router.post('/addworkflow', (req, res) => {
    const { create } = req.body
    Workflow.create({ 
       ...req.body, 
        creatorid: req.session.userId }, (error) => {
        return res.render('site/onchange', { create: create })
    }
    )
})

 router.get('/:id', (req, res) => {
    if (req.session.userId) {
        //file olmayacak boş bakınma
        WorkflowFile.find({ deleteDate: null }).lean().then(wff => {
            Workflow.findById(req.params.id).lean().then(workf => {
                return res.render('site/onchange', { wff: wff,workf: workf })
         })
         
            
        })
    } else {
        res.redirect('/registeredusers/login')
    }

 })

 router.post('/:id', (req, res) => {
    if (req.session.userId) {
        //ilgili filelar ve düzenleme yerleri olacak
        const edit=true
        if(req.body.workprocess){
            console.log(req.body.workprocess)
            Workflow.findByIdAndUpdate(req.params.id,{workprocess:req.body.workprocess}).then(us=>{
                console.log("Updateeee",us)
               // console.log("error oldu"+err)
            })
        }
        WorkflowFile.find({ deleteDate: null }).lean().then(wff => {
            Workflow.findById(req.params.id).lean().then(workf => {
                return res.render('site/onchange', { wff: wff,workf: workf,edit:edit })
         })   
        })
    } else {
        res.redirect('/registeredusers/login')
    }

 })


module.exports = router