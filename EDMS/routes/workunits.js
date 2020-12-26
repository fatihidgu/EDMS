const express = require('express')
const router = express.Router()
const WorkUnit = require('../models/WorkUnit')
const RegisteredUser = require('../models/RegisteredUser')
const Manager = require('../models/Manager')


router.get('/allworkunits', async (req, res) => {
  if (res.locals.userid) {

    const workUnitManager = await Manager.find({
    }).populate({path: 'workUnitId',select: 'WorkUnitCode WorkUnitName'
    }).populate({path: 'registeredUserId',select: 'email'
    }).exec();

    var workunits = []
    var oldworkunits = []
    var myworkunits = []
    workUnitManager.forEach(b => {
      if (b.endDate != null) {
        oldworkunits.push({
          workUnitId: b.workUnitId._id,
          workUnitName: b.workUnitId.WorkUnitName,
          workUnitCode: b.workUnitId.WorkUnitCode
        })
      } else {
        workunits.push({
          workUnitId: b.workUnitId._id,
          workUnitName: b.workUnitId.WorkUnitName,
          workUnitCode: b.workUnitId.WorkUnitCode,
          managerEmail: b.registeredUserId.email
        })
        console.log("1",b.registeredUserId._id)
        console.log("2",req.session.userId)
        if(b.registeredUserId._id==req.session.userId){
          myworkunits.push({
            workUnitId: b.workUnitId._id,
            workUnitName: b.workUnitId.WorkUnitName,
            workUnitCode: b.workUnitId.WorkUnitCode,
            managerEmail: b.registeredUserId.email
          })
        }
      }

    })
    console.log(myworkunits)



    return res.render('site/workunits', {
      workunits: workunits,
      myworkunits: myworkunits,
      oldworkunits: oldworkunits
    })

  } else {
    res.redirect('/registeredusers/register')
  }

})

module.exports = router
