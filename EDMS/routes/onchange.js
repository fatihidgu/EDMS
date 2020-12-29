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
  const { acadadm, workprocessName } = req.body
  console.log(req.body)
  Administrator.findOne(({ endDate: null, registeredUserId: res.locals.userid })).lean().then(admin => {
    Workflow.create({
      ...req.body,
      creatorId: admin._id,
      workflowNo: 1,

    }, (error) => {
      return res.redirect('/')
    })
  })
})

router.post('/addworkflow2', (req, res) => {
  const { create, acadadm } = req.body
  //console.log(req.body)

  WorkUnit.find({ endDate: null }).lean().then(workunits => {
    MainProcess.find({ deletedate: null }).lean().then(mainprocesses => {
    //  MainProcess.find({ deletedate: null, workUnitId: workunits[0]._id }).lean().then(maprocess => {
        //console.log(maprocess)
        return res.render('site/onchange', { create: create, acadadm: acadadm, mainprocesses: mainprocesses })
     // })

      // return res.render('site/workflows', { workflows: workflows, myworkflows: myworkflows, oldworkflows: oldworkflows, acada: admin.acad })

    })
  })


  // WorkUnit.find // workUnitCode
  // MainProcess // workUnitId mainProcessName mainProcessNo
  // Administrator // registeredUserId _id

})

router.get('/:id', async (req, res) => {
  if (req.session.userId) {
    //file olmayacak boş bakınma
    
    const onChangeFiles = await File.find({ workflowId: req.params.id, approvalStatus: { $gte: 0, $lt: 4 }, deleteDate: null }).exec();
    //console.log("ONCHANGE")
    //console.log(onChangeFiles)
    File.find({
      deleteDate: null,
      approvalStatus: 4,
      workflowId: req.params.id,
    }).lean().then(wff => {
      Workflow.findById(req.params.id).lean().then(workf => {

        var a = []
        var i = 0
        onChangeFiles.forEach(onChangeFile => {
          i = i + 1
          a.push({ approvalStatus: onChangeFile.approvalStatus, fileNo: onChangeFile.fileNo, _id: onChangeFile._id, changeReason: "-", rejectReason: "-", rejectStatus: "-" });
        });
       // console.log("a", a);

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
    if (req.body.workprocessName) {
      console.log(req.body.workprocessName)
      Workflow.findByIdAndUpdate(req.params.id, {
        workprocessName: req.body.workprocessName
      }).then(us => {
      })
    }
    File.find({
      deleteDate: null
    }).lean().then(wff => {
      Workflow.findById(req.params.id).lean().then(workf => {
        console.log("buraya girmmeis olmasi lazim")
        return res.render('site/onchange', {
          wff: wff,
          workf: workf,
          edit: edit,
          addNewFile:req.body.addNewFile
        })
      })
    })
  } else {
    res.redirect('/registeredusers/login')
  }

})


module.exports = router
