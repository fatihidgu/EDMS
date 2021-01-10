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
const Committee = require('../models/Committee');
const Change = require('../models/Change');
const Reject = require('../models/Reject');



//date formatter
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [day, month, year].join('/');
}

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
    var edit=false
    var addNewFile=0
    //const edit = true // check
    //addNewFile: req.body.addNewFile
    //const onChangeFiles = await File.find({ workflowId: req.params.id, approvalStatus: { $gte: 0, $lt: 4 }, deleteDate: null }).exec();
    //console.log("ONCHANGE")
    //console.log(onChangeFiles)

    //newPath
    const onChangeFiles = await File.find({
      workflowId: req.params.id,
      approvalStatus: {
        $gte: 0,
        $lt: 4
      },
      deleteDate: null
    }).exec();
    const wf = await Workflow.findById(req.params.id).exec();
    const mp = await MainProcess.findById(wf.mainProcessId).exec();
    const organiser = await Organiser.findById(wf.organiserId).exec();
    const manager = await Manager.findOne({
      workUnitId: mp.workUnitId,
      endDate: null
    });
    const administrator = await Administrator.findOne({
      acad: wf.acad,
      endDate: null
    });
    const committee = await Committee.findOne({
      endDate: null
    });

    const userO = await RegisteredUser.findById(organiser.registeredUserId).exec();
    const userM = await RegisteredUser.findById(manager.registeredUserId).exec();
    const userA = await RegisteredUser.findById(administrator.registeredUserId).exec();
    const userC = await RegisteredUser.findById(committee.registeredUserId).exec();
    //console.log("ONCHANGE")
    //console.log(onChangeFiles)
    var a = []
    var i = 0
    for (var onChangeFile of onChangeFiles) {
      i = i + 1
      var change = await Change.findOne({
        fileNo: onChangeFile._id
      }, {}, {
        sort: {
          'creationDate': -1
        }
      })
      if (change == null) {
        a.push({
          approvalStatus: onChangeFile.approvalStatus,
          fileNo: onChangeFile.fileNo,
          _id: onChangeFile._id,
          changeReason: "-",
          rejectReason: "-",
          rejectStatus: "-",
          organiserRUId: userO._id.toString(),
          managerRUId: userM._id.toString(),
          administratorRUId: userA._id.toString(),
          committeeRUId: userC._id.toString(),
          userId: req.session.userId
        });

      } else {
        var reject = await Reject.findOne({
          changeId: change._id,
          deleteDate: null
        })
        if (reject == null) {
          a.push({
            approvalStatus: onChangeFile.approvalStatus,
            fileNo: onChangeFile.fileNo,
            _id: onChangeFile._id,
            changeReason: change.changeReason,
            rejectReason: "-",
            rejectStatus: "-",
            organiserRUId: userO._id.toString(),
            managerRUId: userM._id.toString(),
            administratorRUId: userA._id.toString(),
            committeeRUId: userC._id.toString(),
            userId: req.session.userId
          });

        } else {
          var role = {
            1: "Manager",
            2: "Administrator",
            3: "Committee"
          };


          a.push({
            approvalStatus: onChangeFile.approvalStatus,
            fileNo: onChangeFile.fileNo,
            _id: onChangeFile._id,
            changeReason: change.changeReason,
            rejectReason: reject.rejectReason,
            rejectStatus: role[reject.rejectRole],
            organiserRUId: userO.id.toString(),
            managerRUId: userM._id.toString(),
            administratorRUId: userA._id.toString(),
            committeeRUId: userC.id.toString(),
            userId: req.session.userId
          });
        }
      }
    }
    var approvWfFiles = await File.find({approvalStatus:4,deleteDate:null,workflowId:req.params.id},'fileNo approvalDate').exec()
    var approvedWFFiles =[]
    approvWfFiles.forEach(approvedFile => approvedWFFiles.push({_id:approvedFile._id,fileNo:approvedFile.fileNo,approvalDate:formatDate(approvedFile.approvalDate)}))


    //new
    File.find({
      deleteDate: null,
      approvalStatus: 4,
      workflowId: req.params.id,
    }).lean().then(wff => {
      Workflow.findById(req.params.id).populate([{ path: 'mainProcessId', model: MainProcess }, { path: 'creatorId', model: Administrator }]).lean().then(workf => {
        if(res.locals.userid==workf.creatorId.registeredUserId && workf.deleteDate==null){
          edit=true
        }
        if(res.locals.admin && workf.deleteDate==null){
          addNewFile=1
        }
        // var a = []
        // var i = 0
        // onChangeFiles.forEach(onChangeFile => {
        //   i = i + 1
        //   a.push({ approvalStatus: onChangeFile.approvalStatus, fileNo: onChangeFile.fileNo, _id: onChangeFile._id, changeReason: "-", rejectReason: "-", rejectStatus: "-" });
        // });
        // console.log("a", a);

        return res.render('site/onchange', {
          approvedFiles: approvedWFFiles,
          workf: workf,
          onChangeFiles: a,
          edit: edit,
          addNewFile: addNewFile
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

    if (req.body.workprocessName) {
      //console.log(req.body.workprocessName)
      Workflow.findByIdAndUpdate(req.params.id, {
        workprocessName: req.body.workprocessName
      }).then(us => {
      })
    }
       res.redirect('/onchangefiles/'+req.params.id)


  } else {
    res.redirect('/registeredusers/login')
  }

})


module.exports = router
