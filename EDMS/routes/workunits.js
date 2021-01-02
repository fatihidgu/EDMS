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



router.get('/allworkunits', async (req, res) => {
  if (res.locals.userid) {

    const workUnitManager = await Manager.find({}).populate({
      path: 'workUnitId',
      select: 'workUnitCode workUnitName'
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

    var myworkunits = []
    //console.log("a",workUnitManager)


    workUnitManager.forEach(b => {
      //console.log("b",b)
      if (b.endDate != null) {
        // oldworkunits.push({
        //   workUnitId: b.workUnitId._id,
        //   workUnitName: b.workUnitId.workUnitName,
        //   workUnitCode: b.workUnitId.workUnitCode
        // })
      } else {

        const workUnitExist = WorkUnit.findOne({
          _id: b.workUnitId._id
        }).lean().exec();

        if (workUnitExist.endDate == null) {
          workunits.push({
            workUnitId: b.workUnitId._id,
            workUnitName: b.workUnitId.workUnitName,
            workUnitCode: b.workUnitId.workUnitCode,
            managerEmail: b.registeredUserId.email
          })


          if (b.registeredUserId._id == req.session.userId) {
            myworkunits.push({
              workUnitId: b.workUnitId._id,
              workUnitName: b.workUnitId.workUnitName,
              workUnitCode: b.workUnitId.workUnitCode,
              managerEmail: b.registeredUserId.email
            })
          }
        }
      }
    });

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
      endDate: null
    }).lean().exec()
    var workflows = await Workflow.find({
      endDate: null
    }).lean().exec()
    var files = await File.find({
      endDate: null
    }).lean().exec()
    //var files = await File.find({endDate:null}).exec()
    console.log(mainProcesses)
    var result = []
    var k = []
    var m = []
    var n = []
    console.log("*********")
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
          // console.log(workf)
          // console.log(mp.mainProcessName)
          // console.log(workUnit.workUnitName)
          // console.log("^^^^^")
          if (workf == null) {
            m.push({
              mainProcess: mp,
              workflows: []
            })
          } else {
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
      console.log(m)
      k.push({
        workUnit: workUnit.workUnitName,
        mainProcesses: m
      })
      //workUnit.endDate = t;
      //console.log("*",workUnit)
      //console.log(t);
    })

    console.log("-----k0-----")
    console.log(k[0])
    console.log("------m0----")
    console.log(k[0].mainProcesses[0])
    console.log("------w----")
    //console.log(k[0].mainProcesses[0].workflows)
    //console.log(workUnits)


    workflows1 = {
      name: "wf1",
      files: [{
        name: "a",
        id: 1
      }, {
        name: "b",
        id: 2
      }, {
        name: "c",
        id: 3
      }]
    }
    workflows2 = {
      name: "wf2",
      files: [{
        name: "aa",
        id: 1
      }, {
        name: "bb",
        id: 2
      }, {
        name: "cc",
        id: 3
      }]
    }
    workflows3 = {
      name: "wf3",
      files: [{
        name: "x",
        id: 1
      }, {
        name: "y",
        id: 2
      }, {
        name: "z",
        id: 3
      }]
    }
    workflows4 = {
      name: "wf4",
      files: [{
        name: "xx",
        id: 1
      }, {
        name: "yy",
        id: 2
      }, {
        name: "zz",
        id: 3
      }]
    }
    mainProcesses1 = {
      name: "Aprocess",
      workflows: [workflows1, workflows2]
    }
    mainProcesses2 = {
      name: "Bprocess",
      workflows: [workflows2, workflows4]
    }
    mainProcesses3 = {
      name: "Cprocess",
      workflows: [workflows3, workflows4]
    }
    workUnit1 = {
      name: "İK",
      mainProcesses: [mainProcesses1, mainProcesses2]
    }
    workUnit2 = {
      name: "REK",
      mainProcesses: [mainProcesses1, mainProcesses2]
    }
    workUnit3 = {
      name: "MF",
      mainProcesses: [mainProcesses3]
    }
    workUnitss = [workUnit1, workUnit2, workUnit3]



    return res.render('site/treeview', {
      workUnits: workUnitss,
      workUnits: k
    });
  } else {
    res.redirect('/registeredusers/register')
  }
})

router.post('/editworkunit/:id?', async (req, res) => {
  console.log("post")
  console.log(req.body)
  try {

    if (req.session.userId) {
      if (req.params.id) {

        console.log("body", req.body)
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
          console.log("if de")
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
    console.log("error", err);
  }

})

router.post('/addPersonel', async (req, res) => {
  console.log(req.body)
  try {

    if (req.session.userId) {
      const ruExist = await RegisteredUser.findOne({
        _id: req.body.organiserId,
        isOrganiser: true,
        isBlocked: false
      }).lean().exec();
      console.log(ruExist)
      if (ruExist == null) {
        return res.redirect('/registeredusers/login')
      }


      const workUnit = await WorkUnit.findById(req.body.workUnitId).exec()

      const organiserExist = await Organiser.findOne({
        registeredUserId: req.body.organiserId,
        workUnitId: req.body.workUnitId,
        endDate: null
      }).exec();
      console.log("wu", workUnit)
      console.log("re", organiserExist)

      if (organiserExist == null && !(workUnit == null)) {
        const organiser = new Organiser({
          workUnitId: workUnit._id,
          registeredUserId: ruExist._id,
          endDate: null
        });
        organiser.save();
        console.log(organiser)
      }
      req.session.sessionFlash = {
        type: 'alert alert-success',
        message: 'Personel added.'
      }

      const address = 'editworkunit/' + workUnit._id
      console.log("add", address)
      return res.redirect(address)

    } else {
      console.log("else")
      res.redirect('/registeredusers/login')
    }
  } catch (err) {
    console.log("error", err);
  }


})

router.post('/removePersonel', async (req, res) => {

  try {

    if (req.session.userId) {
      const organiserExist = await Organiser.findOne({
        _id: req.body.organiserId,
        endDate: null
      }).exec();

      console.log("re", organiserExist)

      if (!(organiserExist == null)) {
        Organiser.findOneAndUpdate({
          _id: organiserExist._id
        }, {
          endDate: (new Date())
        }).exec();
      }

      req.session.sessionFlash = [{
          type: 'alert alert-success',
          message: 'Personel removed.'
        },
        {
          type: 'alert alert-warning',
          message: 'Personel removed!.'
        }
      ]

      //return res.redirect(req.headers.referer)
      //
      const address = 'editworkunit/' + organiserExist.workUnitId
      // console.log("add",address)
      return res.redirect(address)

    } else {
      console.log("else")
      res.redirect('/registeredusers/login')
    }
  } catch (err) {
    console.log("error", err);
  }

})

router.get('/editworkunit/:id?', async (req, res) => {
  try {
    if (req.session.userId) {
      console.log("hello")
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
        organisersIds.push(manager.registeredUserId._id)
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
          organiserOptions: organiserOptions
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
        console.log(acad)
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
    console.log("error", err);
  }
})

module.exports = router
