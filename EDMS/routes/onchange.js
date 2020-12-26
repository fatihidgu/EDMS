const express = require('express')
const router = express.Router()
const Workflow = require('../models/Workflow')

const File = require('../models/File');
const RegisteredUser = require('../models/RegisteredUser');
const WorkUnit = require('../models/WorkUnit');
const MainProcess = require('../models/MainProcess');
const Administrator = require('../models/Administrator');
const Manager = require('../models/Manager');


router.post('/addworkflow', (req, res) => {
  const {
    create
  } = req.body
  Workflow.create({
    ...req.body,
    creatorid: req.session.userId
  }, (error) => {
    return res.render('site/onchange', {
      create: create
    })
  })
})

router.get('/:id', async(req, res) => {
  if (req.session.userId) {
    //file olmayacak boş bakınma

    const onChangeFiles = await File.find({workflowId:req.params.id,approvalStatus:{ $gte: 0, $lt: 4 },deleteDate:null}).exec();
    console.log("ONCHANGE")
    console.log(onChangeFiles)
    File.find({
      deleteDate: null,
      approvalStatus: 4,
      workflowId:req.params.id,
    }).lean().then(wff => {
      Workflow.findById(req.params.id).lean().then(workf => {

        var a = []
        var i = 0
        onChangeFiles.forEach(onChangeFile => {
          i = i+1
          a.push({approvalStatus:onChangeFile.approvalStatus,fileNo:onChangeFile.fileNo,_id:onChangeFile._id,changeReason:"-",rejectReason:"-",rejectStatus:"-"});
        });
        console.log("a",a);

        return res.render('site/onchange', {
          wff: wff,
          workf: workf,
          onChangeFiles: a
        })
      })


    })
  } else {
    res.redirect('/registeredusers/login')
  }

})

router.post('/:id', (req, res) => {
  if (req.session.userId) {
    //ilgili filelar ve düzenleme yerleri olacak
    const edit = true
    if (req.body.workprocess) {
      console.log(req.body.workprocess)
      Workflow.findByIdAndUpdate(req.params.id, {
        workprocess: req.body.workprocess
      }).then(us => {
        console.log("Updateeee", us)
        // console.log("error oldu"+err)
      })
    }
    File.find({
      deleteDate: null
    }).lean().then(wff => {
      Workflow.findById(req.params.id).lean().then(workf => {

        return res.render('site/onchange', {
          wff: wff,
          workf: workf,
          edit: edit
        })
      })
    })
  } else {
    res.redirect('/registeredusers/login')
  }

})


module.exports = router
