const express = require('express')
const router = express.Router()
const WorkUnit = require('../models/WorkUnit')
const RegisteredUser = require('../models/RegisteredUser')
const Organiser = require('../models/Organiser')
const Manager = require('../models/Manager')
const Administrator = require('../models/Administrator')
const MainProcess = require('../models/MainProcess')
const Workflow = require('../models/Workflow')
const File = require('../models/File')
const Committee = require('../models/Committee')




router.get('/allworkunits', async (req, res) => {
  if (res.locals.userid) {

    const workUnitManager = await Manager.find({}).populate({
      path: 'workUnitId',
      select: 'workUnitCode workUnitName acad'
    }).populate({
      path: 'registeredUserId',
      select: 'email'
    }).exec();

    var workunits = []
    var oldworkunits = await WorkUnit.find({
      endDate: {
        $ne: null
      }
    }).lean().exec();

    var isCommittee = await Committee.findOne({endDate:null,registeredUserId:res.locals.userid}).exec();

    var myworkunits = []

    for(const b of workUnitManager){
      if (b.endDate == null) {
        const workUnitExist =await WorkUnit.findOne({
          _id: b.workUnitId._id
        }).lean().exec();

        const isOrganiser = await Organiser.findOne({workUnitId:b.workUnitId._id,endDate:null,registeredUserId:res.locals.userid})
        const isAdministrator = await Administrator.findOne({endDate:null,registeredUserId:res.locals.userid,acad:b.workUnitId.acad}).exec();
        const isManager = (b.registeredUserId._id==res.locals.userid)

        if (workUnitExist.endDate == null) {

          workunits.push({
            workUnitId: b.workUnitId._id,
            workUnitName: b.workUnitId.workUnitName,
            workUnitCode: b.workUnitId.workUnitCode,
            managerEmail: b.registeredUserId.email,
            isManager: isManager,
            isAdministrator: (isAdministrator!=null && b.workUnitId.acad == isAdministrator.acad),
            isOrganiser:(isOrganiser!=null),
            isCommittee:(isCommittee!=null)
          })
          isPartOfWorkUnit = ((isManager) || ((isAdministrator != null)&&(b.workUnitId.acad == isAdministrator.acad)) || (isOrganiser != null) || (isCommittee !=null) )
          if (isPartOfWorkUnit) {
            myworkunits.push({
              workUnitId: b.workUnitId._id,
              workUnitName: b.workUnitId.workUnitName,
              workUnitCode: b.workUnitId.workUnitCode,
              managerEmail: b.registeredUserId.email,
              isAdministrator: (isAdministrator!=null && b.workUnitId.acad == isAdministrator.acad)
            })
          }

        }
      }
    }

    return res.render('site/workunits', {
      workunits: workunits,
      myworkunits: myworkunits,
      oldworkunits: oldworkunits
    })

  } else {
    res.redirect('/registeredusers/register')
  }

})

router.get('/treeview', async (req, res) => {
  if (res.locals.userid) {

    var workUnits = await WorkUnit.find({
      endDate: null
    }).lean().exec()
    var mainProcesses = await MainProcess.find({
      deleteDate: null
    }).lean().exec()
    var workflows = await Workflow.find({
      deleteDate: null
    }).lean().exec()
    var files = await File.find({
      deleteDate: null
    }).lean().exec()
    //var files = await File.find({endDate:null}).exec()
    var result = []
    var k = []
    var m = []
    var n = []
    workUnits.forEach(workUnit => {
      m = []
      var mainProc = mainProcesses.filter(x => x.workUnitId.toString() === workUnit._id.toString());
      if (mainProc == null) {
        m = [{
          mainProcess: null,
          workflows: []
        }]
      } else {
        mainProc.forEach(mp => {
          var workf = workflows.filter(x => x.mainProcessId.toString() === mp._id.toString());

          if (workf == null) {
            m.push({
              mainProcess: mp,
              workflows: []
            })
          } else {
            n = []
            workf.forEach(wf => {
              var fileFiltered =  files.filter(x => x.workflowId.toString() === wf._id.toString());
              if(fileFiltered == null){
                n.push({workflow:wf.workprocessName,files:[]})
              }else{
                n.push({workflow:wf.workprocessName,files:fileFiltered})
              }

            })
            m.push({
              mainProcess: mp.mainProcessName,
              workflows: n
            })
          }
        })
      }
      k.push({
        workUnit: workUnit.workUnitName,
        mainProcesses: m
      })

    })
    return res.render('site/treeview', {
      workUnits: k
    });
  } else {
    res.redirect('/registeredusers/register')
  }
})

router.post('/editworkunit/:id?', async (req, res) => {

  try {

    if (req.session.userId) {
      if (req.params.id) {

        const ru = req.session.userId
        RegisteredUser.findOneAndUpdate({
          _id: req.body.manager
        }, {
          isManager: true
        }).exec()
        const workUnit = await WorkUnit.findOne({
          _id: req.params.id
        }).exec();
        const endDate = new Date()
        WorkUnit.findOneAndUpdate({
          _id: workUnit._id
        }, {
          $set: {
            workUnitCode: req.body.work_unit_code,
            workUnitName: req.body.work_unit_name
          }
        }).exec()


        const managerExist = await Manager.findOne({
          registeredUserId: req.body.manager,
          workUnitId: workUnit._id,
          endDate: null
        }).exec();
        if (managerExist == null) {
          Manager.updateMany({
            workUnitId: workUnit._id,
            endDate: null,
            registeredUserId: {
              $ne: req.body.manager
            }
          }, {
            $set: {
              endDate: endDate
            }
          }).exec();

          const manager = new Manager({
            workUnitId: workUnit._id,
            registeredUserId: req.body.manager,
            endDate: null
          });
          manager.save();
        }

        req.session.sessionFlash = {
          type: 'alert alert-success',
          message: 'Your Work Unit updated Successfully.'
        }

        const address = '' + workUnit._id
        return res.redirect(address)


      } else {
        const ru = req.body.manager

        RegisteredUser.findOneAndUpdate({
          _id: ru
        }, {
          isManager: true
        }).exec()

        const workUnitExist = await WorkUnit.findOne({
          workUnitCode: req.body.work_unit_code
        }).exec();
        if (workUnitExist == null) {

          const workUnit = new WorkUnit({
            workUnitCode: req.body.work_unit_code,
            workUnitName: req.body.work_unit_name,
            acad: req.body.acad
          });
          workUnit.save();
          const managerExist = await Manager.findOne({
            registeredUserId: ru,
            workUnitId: workUnit._id,
            endDate: null
          }).exec();
          if (!(managerExist)) {
            const manager = new Manager({
              workUnitId: workUnit._id,
              registeredUserId: ru
            });
            manager.save()
          }

          req.session.sessionFlash = {
            type: 'alert alert-success',
            message: 'Work Unit created.'
          }

          const address = 'editworkunit/' + workUnit._id
          return res.redirect(address)
        } else {

          req.session.sessionFlash = {
            type: 'alert alert-warning',
            message: 'Your Work Unit Code already exist.'
          }

          const address = 'editworkunit'
          return res.redirect(address)
        }
      }

    } else {
      res.redirect('/registeredusers/login')
    }
  } catch (err) {
  }

})

router.post('/addPersonel', async (req, res) => {
  try {

    if (req.session.userId) {
      const ruExist = await RegisteredUser.findOne({
        _id: req.body.organiserId,
        isOrganiser: true,
        isBlocked: false
      }).lean().exec();
      if (ruExist == null) {
        return res.redirect('/registeredusers/login')
      }


      const workUnit = await WorkUnit.findById(req.body.workUnitId).exec()

      const organiserExist = await Organiser.findOne({
        registeredUserId: req.body.organiserId,
        workUnitId: req.body.workUnitId,
        endDate: null
      }).exec();


      if (organiserExist == null && !(workUnit == null)) {
        const organiser = new Organiser({
          workUnitId: workUnit._id,
          registeredUserId: ruExist._id,
          endDate: null
        });
        organiser.save();
      }
      req.session.sessionFlash = {
        type: 'alert alert-success',
        message: 'Personel added.',
        personel:true
      }

      const address = 'editworkunit/' + workUnit._id
      return res.redirect(address)

    } else {
      res.redirect('/registeredusers/login')
    }
  } catch (err) {
  }


})

router.post('/removePersonel', async (req, res) => {

  try {

    if (req.session.userId) {
      req.session.sessionFlash = []
      const organiserExist = await Organiser.findOne({
        _id: req.body.organiserId,
        endDate: null
      }).exec();

      var isOrganiserWorking = await Workflow.find({ $or:[ {'organiserId':organiserExist._id}, {'organiserId1':organiserExist._id}, {'organiserId2':organiserExist._id} ]})

      if(isOrganiserWorking.length != 0){
        var msg = "Personel can not be removed until following workflows assigned to another personel; "
        for(workflow of isOrganiserWorking){
          msg = msg + workflow.workprocessName +", "
        }
        msg = msg.slice(0,-2)
        req.session.sessionFlash =
          {
            type: 'alert alert-warning',
            message: msg,
            personel: true
          }

      }else{
      if (!(organiserExist == null)) {
        Organiser.findOneAndUpdate({
          _id: organiserExist._id
        }, {
          endDate: (new Date())
        }).exec();
      }

      req.session.sessionFlash = {
          type: 'alert alert-success',
          message: 'Personel removed.',
          personel:true
        }

      }


      const address = 'editworkunit/' + organiserExist.workUnitId
      return res.redirect(address)

    } else {
      res.redirect('/registeredusers/login')
    }
  } catch (err) {
  }

})

router.post('/deleteworkunit/:id', async (req, res) => {

  try {

    if (req.session.userId) {
      req.session.sessionFlash = [];
      const activeMainProcesses = await MainProcess.find({
        workUnitId:req.params.id,
        deleteDate: null
      }).exec();

      if(activeMainProcesses.length==0){
        Manager.updateMany({
          workUnitId: req.params.id,
          endDate: null
        }, {
          $set: {
            endDate: Date.now()
          }
        }).exec();
        Organiser.updateMany({
          workUnitId: req.params.id,
          endDate: null
        }, {
          $set: {
            endDate: Date.now()
          }
        }).exec();
        WorkUnit.updateMany({
          _id: req.params.id,
          endDate: null
        }, {
          $set: {
            endDate: Date.now()
          }
        }).exec();

        req.session.sessionFlash = {
          type: 'alert alert-success',
          message: "Work unit is deleted",
        }

      }else{
        var msg = "You have to disable following main processes to delete that work unit; "
        for(activeMainProcess of activeMainProcesses){
          msg = msg + activeMainProcess.mainProcessNo +"-"+ activeMainProcess.mainProcessName+ " , "
        }
        msg = msg.slice(0,-2)
        req.session.sessionFlash = {
          type: 'alert alert-warning',
          message: msg
        }
      }


       res.redirect("/workunits/allworkunits")

    } else {
      res.redirect('/registeredusers/login')
    }
  } catch (err) {
  }

})



router.get('/editworkunit/:id?', async (req, res) => {
  try {
    if (req.session.userId) {
      if (req.params.id) {
        var edit = 0
        const workUnit = await WorkUnit.findById(req.params.id).exec();

        const workUnitManager = await Manager.find({
          workUnitId: workUnit._id,
          endDate: null
        }, 'registeredUserId').populate({
          path: 'registeredUserId',
          select: 'name surname email'
        }).exec()

        const administrator = await Administrator.findOne({endDate:null,acad:workUnit.acad}).exec();

        const manager = await Manager.findOne({
          workUnitId: workUnit._id,
          endDate: null
        }, 'registeredUserId').lean().populate({
          path: 'registeredUserId',
          select: 'name surname email'
        }).lean().exec()

        const organisers = await Organiser.find({
          workUnitId: workUnit._id,
          endDate: null
        }, 'registeredUserId').lean().populate({
          path: 'registeredUserId',
          select: '_id name surname email'
        }).lean().exec()
        a = []
        organisers.forEach(organiser => a.push({
          organiserId: organiser._id,
          registeredUserId: organiser.registeredUserId._id,
          name: organiser.registeredUserId.name,
          surname: organiser.registeredUserId.surname,
          email: organiser.registeredUserId.email
        }))

        const managerOptions = await RegisteredUser.find({
          _id: {
            $ne: manager.registeredUserId._id
          },
          endDate: null,
          isBlocked: false,
          isManager: true
        }, null, {
          sort: {
            email: 1
          }
        }).lean().exec()
        var organisersIds = a.map(function(element) {
          return element.registeredUserId;
        });
        //organisersIds.push(manager.registeredUserId._id)
        const organiserOptions = await RegisteredUser.find({
          _id: {
            $nin: organisersIds
          },
          endDate: null,
          isBlocked: false,
          isOrganiser: true
        }, null, {
          sort: {
            email: 1
          }
        }).lean().exec()

        acad = "" + workUnit.acad


        res.render('site/editworkunits', {
          create: "0",
          edit: edit,
          currentManager: manager.registeredUserId,
          managerOptions: managerOptions,
          work_unit_id: workUnit._id,
          work_unit_code: workUnit.workUnitCode,
          work_unit_name: workUnit.workUnitName,
          acad: acad,
          organisers: a,
          organiserOptions: organiserOptions,
          managerRUId:manager.registeredUserId._id.toString(),
          administratorRUId:administrator.registeredUserId.toString(),
          userId:req.session.userId
        })
      } else {
        const managerOptions = await RegisteredUser.find({
          endDate: null,
          isBlocked: false,
          isManager: true
        }, null, {
          sort: {
            email: 1
          }
        }).lean().exec()
        const admin = await Administrator.findOne({
          registeredUserId: req.session.userId
        }).exec();

        acad = "" + admin.acad
        res.render('site/editworkunits', {
          create: "1",
          acad: acad,
          managerOptions: managerOptions
        })
      }
    } else {
      res.redirect('/registeredusers/login')
    }
  } catch (err) {
  }
})

module.exports = router
