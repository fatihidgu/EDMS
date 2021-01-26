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
const Approve = require('../models/Approve');
const SharedWorkflows = require('../models/SharedWorkflows');



//date formatter
function formatDate(date) {
  if(date == null){
    return "-"
  }
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
  //console.log(req.body)
  if (req.body.isSharedWff) {
    Administrator.findOne(({ endDate: null, registeredUserId: res.locals.userid })).lean().then(admin => {
      if (req.body.selectedWorkUnitId2 != "") {
        //2
        Workflow.find({ mainProcessId: req.body.mainProcessId }).then(async (count) => {
          const mp = await MainProcess.findOne({ _id: req.body.mainProcessId }).exec()
          //console.log(mp.workUnitId)
          const man = await Manager.findOne({ workUnitId: mp.workUnitId }).exec()
          Workflow.create({ ...req.body, creatorId: admin._id, workflowNo: count.length + 1, isShared: true, managerId: man._id, organiserId1: req.body.selectedOrganisertId1, organiserId2: req.body.selectedOrganisertId2 }, (error, wf) => {
            //console.log("wfff",wf)
            SharedWorkflow.create({ workflowId: wf._id, organiserId: req.body.selectedOrganisertId1, workUnitId: req.body.selectedWorkUnitId1 }, (error, sharedwf) => {
              SharedWorkflow.create({ workflowId: wf._id, organiserId: req.body.selectedOrganisertId2, workUnitId: req.body.selectedWorkUnitId2, }, (error, sharedwf2) => {
                //console.log(error)
                return res.redirect('/')
              })
            })

          })
        })
      } else {
        //1
        Workflow.find({ mainProcessId: req.body.mainProcessId }).then(async (count) => {
          const mp = await MainProcess.findOne({ _id: req.body.mainProcessId }).exec()
          //console.log(mp.workUnitId)
          const man = await Manager.findOne({ workUnitId: mp.workUnitId }).exec()
          Workflow.create({ ...req.body, creatorId: admin._id, workflowNo: count.length + 1, isShared: true, managerId: man._id, organiserId1: req.body.selectedOrganisertId1 }, (error, wf) => {
            //console.log("wfff",wf)
            SharedWorkflow.create({ workflowId: wf._id, organiserId: req.body.selectedOrganisertId1, workUnitId: req.body.selectedWorkUnitId1 }, (error, sharedwf) => {

              return res.redirect('/')
            })

          })
        })
      }

    })
  }
  else {
    Administrator.findOne(({ endDate: null, registeredUserId: res.locals.userid })).lean().then(admin => {
      Workflow.find({ mainProcessId: req.body.mainProcessId }).then(async (count) => {
        const mp = await MainProcess.findOne({ _id: req.body.mainProcessId }).exec()
        //console.log(mp.workUnitId)
        const man = await Manager.findOne({ workUnitId: mp.workUnitId }).exec()
        Workflow.create({ ...req.body, creatorId: admin._id, workflowNo: count.length + 1, isShared: false, managerId: man._id }, (error, wf) => {
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
    var edit = false
    var addNewFile = 0
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
    // org 1

    const currentorg = await Organiser.findOne({
      _id: wf.organiserId,
      endDate: null
    }, 'registeredUserId').lean().populate({
      path: 'registeredUserId',
      select: 'name surname email'
    }).lean().exec()

    const organisers = await Organiser.find({
      workUnitId: mp.workUnitId,
      endDate: null
    }, 'registeredUserId').lean().populate({
      path: 'registeredUserId',
      select: '_id name surname email'
    }).lean().exec()
    //console.log(organisers)
    var org_array = []
    organisers.forEach(organiser => org_array.push({
      organiserId: organiser._id,
      registeredUserId: organiser.registeredUserId._id,
      name: organiser.registeredUserId.name,
      surname: organiser.registeredUserId.surname,
      email: organiser.registeredUserId.email
    }))
    var organisersIds = org_array.map(function (element) {
      return element.registeredUserId;
    });
    const organiserOptions = await RegisteredUser.find({
      _id: {
        $in: organisersIds,
        $ne: currentorg.registeredUserId._id
      },
      endDate: null,
      isBlocked: false,
      isOrganiser: true
    }, null, {
      sort: {
        email: 1
      }
    }).lean().exec()
    //
    const manager = await Manager.findOne({
      workUnitId: mp.workUnitId,
      endDate: null
    });
    const administrator = await Administrator.findOne({
      acad: wf.acad,
      endDate: null
    });
    const committee = await Committee.find({
      endDate: null
    });


    const isOrganiser = (organiser.registeredUserId == req.session.userId)
    const isManager = (manager.registeredUserId == req.session.userId)
    const isAdministrator = (administrator.registeredUserId == req.session.userId)
    const isCommittee = (committee.some(committeeMember => committeeMember.registeredUserId == req.session.userId))

    //console.log(isOrganiser, "-", isManager, "-", isAdministrator, "-", isCommittee)
    //console.log("ONCHANGE")
    //console.log(onChangeFiles)
    var a = []
    var i = 0
    var fileValues = {}
    for (var onChangeFile of onChangeFiles) {
      i = i + 1
      var change = await Change.findOne({
        fileNo: onChangeFile._id,
        deleteDate: null
      }, {}, {
        sort: {
          'creationDate': -1
        }
      })
      fileValues = {
        approvalStatus: onChangeFile.approvalStatus,
        fileNo: onChangeFile.fileNo,
        _id: onChangeFile._id,
        changeReason: "-",
        rejectReason: "-",
        rejectStatus: "-",
        isOrganiser: isOrganiser,
        isManager: isManager,
        isAdministrator: isAdministrator,
        isCommittee: isCommittee,
        userId: req.session.userId
      };

      if (change !== null) {
        var approve = await Approve.findOne({
          changeId: change._id,
          approverId: req.session.userId,
          deleteDate: null
        });
        // console.log(change._id)
        // console.log(approve)
        var reject = await Reject.findOne({
          changeId: change._id,
          deleteDate: null
        })
        if (reject == null) {
          fileValues.changeReason = change.changeReason
        } else {
          var role = {
            1: "Manager",
            2: "Administrator",
            3: "Committee"
          };
          fileValues.changeReason = change.changeReason
          fileValues.rejectReason = reject.rejectReason
          fileValues.rejectStatus = role[reject.rejectRole]
        }
        if (approve !== null) {
          fileValues.isCommittee = false
        }
      }
      a.push(fileValues)
    }
    var approvWfFiles = await File.find({ approvalStatus: 4, deleteDate: null, workflowId: req.params.id }).exec()
    var approvedWFFiles = []

    approvWfFiles.forEach(approvedFile => approvedWFFiles.push({ _id: approvedFile._id,version:(approvedFile.version+1),revisionDate:formatDate(approvedFile.revisionDate), fileNo: approvedFile.fileNo, approvalDate: formatDate(approvedFile.approvalDate),isAdministrator:isAdministrator }))
    var oldWfFiles = await File.find({ approvalStatus: 5, workflowId: req.params.id }).exec()
    oldFiles = []
    oldWfFiles.forEach(function(file) {
         oldFiles.push({fileNo:file.fileNo,approvalDate:formatDate(file.approvalDate),version:(file.version+1),revisionDate:formatDate(file.revisionDate),_id:file._id});
     });

    //new
    File.find({
      deleteDate: null,
      approvalStatus: 4,
      workflowId: req.params.id,
    }).lean().then(async (wff) => {
      Workflow.findById(req.params.id).populate([{ path: 'mainProcessId', model: MainProcess }, { path: 'creatorId', model: Administrator }]).lean().then(async (workf) => {
        if (res.locals.userid == workf.creatorId.registeredUserId && workf.deleteDate == null) {
          edit = true
        }
        if (res.locals.admin && workf.deleteDate == null) {
          addNewFile = 1
        }
        // var a = []
        // var i = 0
        // onChangeFiles.forEach(onChangeFile => {
        //   i = i + 1
        //   a.push({ approvalStatus: onChangeFile.approvalStatus, fileNo: onChangeFile.fileNo, _id: onChangeFile._id, changeReason: "-", rejectReason: "-", rejectStatus: "-" });
        // });
        // console.log("a", a);

        if (wf.organiserId2 == null && wf.organiserId1 != null) {
          //2 but only 2
          const currentorg2 = await Organiser.findOne({
            _id: wf.organiserId1,
            endDate: null
          }, 'registeredUserId').lean().populate({
            path: 'registeredUserId',
            select: 'name surname email'
          }).lean().exec()
          const shwfmp = await SharedWorkflows.findOne({
            workflowId: wf._id,
            organiserId: wf.organiserId1
          }).lean().exec()
          const organisers2 = await Organiser.find({
            workUnitId: shwfmp.workUnitId,
            endDate: null
          }, 'registeredUserId').lean().populate({
            path: 'registeredUserId',
            select: '_id name surname email'
          }).lean().exec()
          var org_array2 = []
          organisers2.forEach(organiser => org_array2.push({
            organiserId: organiser._id,
            registeredUserId: organiser.registeredUserId._id,
            name: organiser.registeredUserId.name,
            surname: organiser.registeredUserId.surname,
            email: organiser.registeredUserId.email
          }))
          var organisersIds2 = org_array2.map(function (element) {
            return element.registeredUserId;
          });
          const organiserOptions2 = await RegisteredUser.find({
            _id: {
              $in: organisersIds2,
              $ne: currentorg2.registeredUserId._id
            },
            endDate: null,
            isBlocked: false,
            isOrganiser: true
          }, null, {
            sort: {
              email: 1
            }
          }).lean().exec()
          return res.render('site/onchange', {
            approvedFiles: approvedWFFiles,
            workf: workf,
            onChangeFiles: a,
            oldFiles:oldFiles,
            edit: edit,
            addNewFile: addNewFile,
            organiserOptions: organiserOptions,
            currentOrganiser: currentorg,
            organiserOptions2: organiserOptions2,
            currentorg2: currentorg2,
          })
        } else if (wf.organiserId2 != null) {
          //2
          const currentorg2 = await Organiser.findOne({
            _id: wf.organiserId1,
            endDate: null
          }, 'registeredUserId').lean().populate({
            path: 'registeredUserId',
            select: 'name surname email'
          }).lean().exec()
          const shwfmp = await SharedWorkflows.findOne({
            workflowId: wf._id,
            organiserId: wf.organiserId1,
          }).lean().exec()
          const organisers2 = await Organiser.find({
            workUnitId: shwfmp.workUnitId,
            endDate: null
          }, 'registeredUserId').lean().populate({
            path: 'registeredUserId',
            select: '_id name surname email'
          }).lean().exec()
          var org_array2 = []
          organisers2.forEach(organiser => org_array2.push({
            organiserId: organiser._id,
            registeredUserId: organiser.registeredUserId._id,
            name: organiser.registeredUserId.name,
            surname: organiser.registeredUserId.surname,
            email: organiser.registeredUserId.email
          }))
          var organisersIds2 = org_array2.map(function (element) {
            return element.registeredUserId;
          });
          const organiserOptions2 = await RegisteredUser.find({
            _id: {
              $in: organisersIds2,
              $ne: currentorg2.registeredUserId._id
            },
            endDate: null,
            isBlocked: false,
            isOrganiser: true
          }, null, {
            sort: {
              email: 1
            }
          }).lean().exec()
          //3
          const currentorg3 = await Organiser.findOne({
            _id: wf.organiserId2,
            endDate: null
          }, 'registeredUserId').lean().populate({
            path: 'registeredUserId',
            select: 'name surname email'
          }).lean().exec()
          const shwfmp2 = await SharedWorkflows.findOne({
            workflowId: wf._id,
            organiserId: wf.organiserId2
          }).lean().exec()
          const organisers3 = await Organiser.find({
            workUnitId: shwfmp2.workUnitId,
            endDate: null
          }, 'registeredUserId').lean().populate({
            path: 'registeredUserId',
            select: '_id name surname email'
          }).lean().exec()
          var org_array3 = []
          organisers3.forEach(organiser => org_array3.push({
            organiserId: organiser._id,
            registeredUserId: organiser.registeredUserId._id,
            name: organiser.registeredUserId.name,
            surname: organiser.registeredUserId.surname,
            email: organiser.registeredUserId.email
          }))
          var organisersIds3 = org_array3.map(function (element) {
            return element.registeredUserId;
          });
          const organiserOptions3 = await RegisteredUser.find({
            _id: {
              $in: organisersIds3,
              $ne: currentorg3.registeredUserId._id
            },
            endDate: null,
            isBlocked: false,
            isOrganiser: true
          }, null, {
            sort: {
              email: 1
            }
          }).lean().exec()

          return res.render('site/onchange', {
            approvedFiles: approvedWFFiles,
            workf: workf,
            onChangeFiles: a,
            oldFiles:oldFiles,
            edit: edit,
            addNewFile: addNewFile,
            organiserOptions: organiserOptions,
            currentOrganiser: currentorg,
            organiserOptions2: organiserOptions2,
            currentorg2: currentorg2,
            organiserOptions3: organiserOptions3,
            currentorg3: currentorg3
          })

        }
        else {
          return res.render('site/onchange', {
            approvedFiles: approvedWFFiles,
            workf: workf,
            onChangeFiles: a,
            oldFiles:oldFiles,
            edit: edit,
            addNewFile: addNewFile,
            organiserOptions: organiserOptions,
            currentOrganiser: currentorg,
          })
        }

      })


    })
  } else {
    res.redirect('/registeredusers/login')
  }

})

router.post('/:id', async (req, res) => {
  //console.log("deneme2")
  if (req.session.userId) {
    //ilgili filelar ve düzenleme yerleri olacak
    // console.log("----------------------------------------------")
    console.log(req.body)
    //console.log(req.params.id)
    // console.log("----------------------------------------------")
    // organiserId:
    // organiserId1:
    // organiserId2:
    const organiserId = await Organiser.findOne({ registeredUserId: req.body.organiserId, endDate: null })
    const organiserId1 = await Organiser.findOne({ registeredUserId: req.body.organiserId1, endDate: null })
    const organiserId2 = await Organiser.findOne({ registeredUserId: req.body.organiserId2, endDate: null })
    if (req.body.workprocessName) {
      //console.log(req.body.workprocessName)
      Workflow.findByIdAndUpdate(req.params.id, {
        workprocessName: req.body.workprocessName,
        organiserId: organiserId._id
      }).then(wf => {
        if (organiserId2) {
          Workflow.findByIdAndUpdate(req.params.id, {
            organiserId1:organiserId1._id,
            organiserId2:organiserId2._id
          }).then(async (wf) => {
           const shwfs= await  SharedWorkflow.find({workflowId:wf._id}).exec()
            for(i=0; i<shwfs.length;i++){
              if(i==0){
                shwfs[i].organiserId=organiserId1._id
                shwfs[i].save()
              }
              else{
                shwfs[i].organiserId=organiserId2._id
                shwfs[i].save()
              }
            }
           })
        }
        else if (organiserId1) {
          Workflow.findByIdAndUpdate(req.params.id, {
            organiserId1:organiserId1._id,
          }).then(async (wf) => {
            await  SharedWorkflow.findOneAndUpdate({workflowId:wf._id},{organiserId:organiserId1._id} ).exec()
          })
        }
      })
    }
    res.redirect('/onchangefiles/' + req.params.id)
  } else {
    res.redirect('/registeredusers/login')
  }

})


module.exports = router
