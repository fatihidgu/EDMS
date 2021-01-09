const express = require('express')
const router = express.Router()
const Workflow = require('../models/Workflow')
const File = require('../models/File');
const RegisteredUser = require('../models/RegisteredUser');
const WorkUnit = require('../models/WorkUnit');
const MainProcess = require('../models/MainProcess');
const Administrator = require('../models/Administrator');
const Manager = require('../models/Manager');
const Organiser = require('../models/Organiser');
const Registereduser = require('../models/RegisteredUser');
const SharedWorkflow = require('../models/SharedWorkflows');

router.post('/addworkflow', async (req, res) => {
  const { acadadm, workprocessName } = req.body
  console.log(req.body)
  if (req.body.isSharedWff) {
    Administrator.findOne(({ endDate: null, registeredUserId: res.locals.userid })).lean().then(admin => {
      if (req.body.selectedWorkUnitId2 != "") {
        //2
        Workflow.find({ mainProcessId: req.body.mainProcessId }).then(count => {
          Workflow.create({ ...req.body, creatorId: admin._id, workflowNo: count.length + 1, isShared: true }, (error, wf) => {
            //console.log("wfff",wf)
            SharedWorkflow.create({ workflowId: wf._id, organiserId: req.body.selectedOrganisertId1, workUnitId: req.body.selectedWorkUnitId1 }, (error, sharedwf) => {
              SharedWorkflow.create({ workflowId: wf._id, organiserId: req.body.selectedOrganisertId2, workUnitId: req.body.selectedWorkUnitId2 }, (error, sharedwf2) => {
                console.log(error)
                return res.redirect('/')
              })
            })

          })
        })
      } else {
        //1
        Workflow.find({ mainProcessId: req.body.mainProcessId }).then(count => {
          Workflow.create({ ...req.body, creatorId: admin._id, workflowNo: count.length + 1, isShared: true }, (error, wf) => {
            //console.log("wfff",wf)
            SharedWorkflow.create({ workflowId: wf._id, organiserId: req.body.selectedOrganisertId1, workUnitId: req.body.selectedWorkUnitId1 }, (error, sharedwf) => {
              console.log(error)
              return res.redirect('/')
            })

          })
        })
      }

    })
  }
  else {
    Administrator.findOne(({ endDate: null, registeredUserId: res.locals.userid })).lean().then(admin => {
      Workflow.find({ mainProcessId: req.body.mainProcessId }).then(count => {
        Workflow.create({ ...req.body, creatorId: admin._id, workflowNo: count.length + 1, isShared: false }, (error, wf) => {
          //console.log("wfff",wf)
          return res.redirect('/')
        })
      })

    })
  }

})

router.get('/addworkflow', async (req, res) => {
  // WorkUnit.find // workUnitCode
  // MainProcess // workUnitId mainProcessName mainProcessNo
  // Administrator // registeredUserId _id
  //create: create, acadadm: acadadm,
  const admin = await Administrator.findOne(({ registeredUserId: res.locals.userid })).lean().exec();
  const workunits = await WorkUnit.find({ endDate: null }).lean().exec()
  if (admin) {
    MainProcess.find({ deleteDate: null }).populate({ path: "workUnitId", model: WorkUnit }).lean().then(mainprocesses => {
      Organiser.find({ endDate: null }).populate({ path: 'registeredUserId', model: RegisteredUser }).lean().then(organiser => {
        return res.render('site/onchange', { create: "1", acadadm: admin.acad, mainprocesses: mainprocesses, organiser: organiser, workunits: workunits })
      })
    })
  }
  else {
    res.redirect('/')
  }

})

router.get('/secureOrganiser', (req, res) => {
  Organiser.find({ endDate: null }).populate([{ path: 'workUnitId', model: WorkUnit }, { path: 'registeredUserId', model: RegisteredUser }]).lean().then(organiser => {
    MainProcess.find({ deleteDate: null }).populate({ path: "workUnitId", model: WorkUnit }).lean().then(mainprocesses => {
      WorkUnit.find({ endDate: null }).lean().then(workunits => {
        res.send(({ organiser: organiser, mainprocesses: mainprocesses, workunits: workunits }))
      })
    })
  })
})

router.get('/:id', async (req, res) => {
  //console.log("deneme1")
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
      Workflow.findById(req.params.id).populate({ path: 'mainProcessId', model: MainProcess }).lean().then(workf => {

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
  //console.log("deneme2")
  if (req.session.userId) {
    //ilgili filelar ve düzenleme yerleri olacak
    const edit = true
    if (req.body.workprocessName) {
      //console.log(req.body.workprocessName)
      Workflow.findByIdAndUpdate(req.params.id, {
        workprocessName: req.body.workprocessName
      }).then(us => {
      })
    }
    File.find({
      deleteDate: null
    }).lean().then(wff => {
      Workflow.findById(req.params.id).populate({ path: 'mainProcessId', model: MainProcess }).lean().then(workf => {
        //console.log("buraya girmmeis olmasi lazim")
        return res.render('site/onchange', {
          wff: wff,
          workf: workf,
          edit: edit,
          addNewFile: req.body.addNewFile
        })
      })
    })
  } else {
    res.redirect('/registeredusers/login')
  }

})


module.exports = router
