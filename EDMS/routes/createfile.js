const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
var app = require('../app');
const fs = require('fs');
//models
const File = require('../models/File');
const RegisteredUser = require('../models/RegisteredUser');
const Workflow = require('../models/Workflow');
const WorkUnit = require('../models/WorkUnit');
const MainProcess = require('../models/MainProcess');
const WorkflowFileType = require('../models/WorkflowFileType');
const Administrator = require('../models/Administrator');
const Manager = require('../models/Manager');


//variables
var filePath = path.join(__dirname, '..', 'uploads');

router.use(express.static('public'));
router.use(express.static('uploads'));

//UPDATE ONE File
function oneFileUpdate(filter, update) {
  File.findOneAndUpdate(filter, update, {
    new: true
  }, (err, doc) => {
    if (err) {
      console.log("Something wrong when updating data!");
    }
  });
}

//MOVE File PATH
function changeFilePath(currentPath, newPath) {
  fs.rename(currentPath, newPath, function(err) {
    if (err) {
      console.log(err);
    }
  });
}


//MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, filePath)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileN = path.basename(file.originalname, ext);
    var filePath = `files/${fileN}${ext}`;

    while (fs.existsSync(('../EDMS/uploads/' + filePath))) {
      lastIndex = filePath.lastIndexOf(ext);
      filePath = filePath.slice(0, lastIndex);
      filePath = filePath + '(1)' + ext;
    }
    cb(null, filePath);
  }
})

const upload = multer({
  storage
}); // or simply { dest: 'uploads/' }



// UPLOAD FILE
router.post('/upload', upload.single('file'), async (req, res) => {
  console.log("upload");
  console.log(req.body);
  const file_type = await WorkflowFileType.findById(req.body.file_type_id).exec();
  const work_unit = await WorkUnit.findById(req.body.work_unit_id).exec();
  const work_process = await Workflow.findById(req.body.workflow_id).exec();
  const main_process = await MainProcess.findById(req.body.main_process_id).exec();
  const userAdmin = await RegisteredUser.findById(req.session.userId).exec();
  const admin = await Administrator.findOne({
    registeredUserId: userAdmin._id
  }).exec();
  const manager = await Manager.findOne({
    workUnitId: work_unit._id,
    endDate: null
  }).exec();

  const ext = path.extname(req.file.path);
  const oldFilePath = req.file.path;

  var fileNo = file_type.WorkflowFileTypeCode + "-" + main_process.mainProcessNo + "-" + work_unit.WorkUnitCode +
    "-" + work_process._id + "-" + "0";

  var filen = fileNo + ext


  const newFilePath = path.join(__dirname, '..', 'uploads', 'files', filen);
  fs.rename(oldFilePath, newFilePath, function(err) {
    if (err) {
      //console.log(err);
    }
  });
  const fileObject = new File({
    workflowId: work_process._id,
    fileNo: fileNo,
    organiserId: null,
    filePath: newFilePath,
    administratorId: userAdmin._id,
    workflowFileTypeId: file_type._id,
    workUnitId: work_unit._id,
    creatorId: userAdmin._id
  });
  fileObject.save();

  //end
  req.session.sessionFlash = {
    type: 'alert alert-success',
    message: 'Your file created Successfully.'
  }
  const address = '/onchangefiles/'+work_process._id;
  return res.redirect(address);

});

// DELETE FILE
router.post('/delete', (req, res) => {
  file_id = req.body.file_id;
  console.log("delete",file_id)

  const filterId = {
    _id: file_id
  };

  var todayDate = new Date();
  var year = todayDate.getFullYear();
  var month = todayDate.getMonth() + 1;
  var day = todayDate.getDate();
  var todayStrDate = day + "-" + month + "-" + year;

  var fileAttributes = {
    approvalStatus: null,
    filePath: null,
    deleteDate: todayDate
  };
  var update = {};
  var a = []
  File.findOne(filterId, function(err, choosenFile) {
    if (err) {
      //console.log("File Approval Status Can Not Be Accessed", err);
      res.render('site/onchange');
    } else {

      fileAttributes.approvalStatus = choosenFile.approvalStatus;
      fileAttributes.filePath = choosenFile.filePath;
      const ext = path.extname(choosenFile.filePath);
      a.push({_id:choosenFile._id});

      if (fileAttributes.approvalStatus == 4) {
        fileAttributes.approvalStatus = 5;
        const oldFilePath = choosenFile.filePath;


        const fileName = choosenFile.fileNo + "(" + todayStrDate + ")" + ext;
        const newFilePath = path.join(__dirname, '..', 'uploads', 'oldFiles', fileName);
        //fileAttributes.approvalStatus = choosenFile.approvalStatus;
        fileAttributes.filePath = newFilePath

        oneFileUpdate(filterId, fileAttributes);
        fs.rename(oldFilePath, newFilePath, function(err) {
          if (err) {
            //console.log(err);
          }
        });
        const address = '/onchangefiles/' + choosenFile.workflowId;
        return res.redirect(address);
      } else {
        const oldFilePath = choosenFile.filePath;
        const fileName = choosenFile.fileNo + fileAttributes.deleteDate + ext;
        const newFilePath = path.join(__dirname, '..', 'uploads', 'oldFiles', fileName);
        fileAttributes.approvalStatus = choosenFile.approvalStatus;
        fileAttributes.filePath = newFilePath
        oneFileUpdate(filterId, fileAttributes);
        fs.rename(oldFilePath, newFilePath, function(err) {
          if (err) {
            console.log(err);
          }
        });
        const address = '/onchangefiles/' + choosenFile.workflowId;
        return res.redirect(address);
      }
    }
  });

  req.session.sessionFlash = {
    type: 'alert alert-success',
    message: 'Your file deleted successfully.'
  }
  console.log("a",a);
  //const address = '/onchangefiles/' + a._id;
  //return res.redirect(address);
});

// DOWNLOAD FILE
router.post('/download', (req, res) => {
  file_id = req.body.file_id;
  console.log("download",file_id)
  filter = {
    fileId: file_id
  }
  File.findById(file_id).then(file => {
    fileDownload = path.basename(file.filePath);
    //console.log(file.filePath,"-",fileDownload);
    res.download(file.filePath, fileDownload, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });
  });
});


//UPDATE File
router.post('/update', upload.single('file'), (req, res) => {
  console.log("update")
  //const ext = path.extname(req.file.path);
  //const oldFilePath = req.file.path;
  console.log("update",req.body);
  //
  id = req.body.fileId;
  filterId = {
    _id: id
  }
  File.findOne(filterId, function(err, choosenFile) {
    if (err) {
      //console.log("File Approval Status Can Not Be Accessed", err);
      res.render('site/onchange');
    } else {
      console.log("choosenfile",choosenFile);
      const filen = path.basename(choosenFile.filePath);
      console.log(filen,"filen")

      if (choosenFile.approvalStatus == 4) {
        var todayDate = new Date();
        var year = todayDate.getFullYear();
        var month = todayDate.getMonth() + 1;
        var day = todayDate.getDate();
        var todayStrDate = day + "-" + month + "-" + year;

        fileOldN = filen + "(" + todayStrDate + ")";
        const oldFileCurrentPath = path.join(__dirname, '..', 'uploads', 'files', filen);
        const oldFileGoesTo = path.join(__dirname, '..', 'uploads', 'oldFiles', fileOldN);
        changeFilePath(oldFileCurrentPath, oldFileGoesTo);
        var fileAttributes = {
          approvalStatus: 5,
          filePath: oldFileGoesTo,
          deleteDate: todayDate
        };
        oneFileUpdate(filterId, fileAttributes);

        const newFileCurrentPath = req.file.path;
        const newFileGoesTo = path.join(__dirname, '..', 'uploads', 'files', filen);
        changeFilePath(newFileCurrentPath, newFileGoesTo);
        console.log("fileNo",choosenFile.fileNo);

        const fileObject = new File({
          workflowId: choosenFile.workflowId,
          fileNo: choosenFile.fileNo,
          organiserId: choosenFile.organiserId,
          creatorId: req.session.userId,
          creatDate: new Date(),
          revisionDate: null,
          approvalStatus: 0,
          approvalDate: null,
          filePath: newFileGoesTo,
          deleteDate: null
        });
        fileObject.save();
        console.log("saved");
        const address = '/onchangefiles/'+fileObject.workflowId;
        return res.redirect(address);

      } else {
        const newFileCurrentPath = req.file.path;
        const newFileGoesTo = path.join(__dirname, '..', 'uploads', 'files', filen);
        changeFilePath(newFileCurrentPath, newFileGoesTo);


        const update =({
          workflowId: choosenFile.workflowId,
          fileNo: choosenFile.fileNo,
          workflowFileTypeId:choosenFile.workflowFileTypeId,
          organiserId: choosenFile.organiserId,
          creatorId: choosenFile.creatorId,
          revisionDate: new Date(),
          filePath: newFileGoesTo
        });
        File.findByIdAndUpdate({_id:id},update).exec()
        console.log("*-*-");


        req.session.sessionFlash = {
          type: 'alert alert-success',
          message: 'Your file updated Successfully.'
        }
        const address = '/onchangefiles/'+update.workflowId;
        return res.redirect(address);


      }
    }
  });

  //end
  req.session.sessionFlash = {
    type: 'alert alert-success',
    message: 'Your file created Successfully.'
  }
  //return res.render('site/workflows');
  //return res.redirect('onchangefiles/'+update.workflowId);

});
//Create file
// router.get('/', (req, res) => {
//   res.render('site/createfile');
// });

router.get('/create/:workflowId', (req, res) => {
  filterIdWF = {
    _id: req.params.workflowId
  };
  //findQuery(RegisteredUser,null);
  if (req.session.userId) {
    Workflow.findOne(filterIdWF, function(err, choosenWF) {
      if (err) {
        res.render('site/onchange');
      } else {

        filterMP = {
          _id: choosenWF.mainProcessId
        }
        MainProcess.findOne(filterMP, function(err, mainProcess) {
          main_process_id = mainProcess._id;
          main_process_name = mainProcess.mainProcessName;

          filterWU = {
            endDate: null
          }
          WorkUnit.find(filterWU, function(err, workUnits) {
            var work_unit = [];
            workUnits.forEach(workUnit => {
              work_unit.push({
                work_unit_id: workUnit._id,
                work_unit_name: workUnit.WorkUnitName
              });
            })

            WorkflowFileType.find({
              deleteDate: null
            }, function(err, fileTypes) {
              var file_type = [];


              fileTypes.forEach(fileType => {
                file_type.push({
                  file_type_id: fileType._id,
                  file_type_name: fileType.WorkflowFileTypeName
                });
              });

              return res.render('site/createfile', {
                main_process_id: main_process_id,
                main_process_name: main_process_name,
                work_unit: work_unit,
                file_type: file_type,
                workflow_id: choosenWF._id,
                workflow_name: choosenWF.workprocessName
              });
            });
          });
        });
      }
    });

  } else {
    res.redirect('/registeredusers/login')
  }
});

router.get('/upload/:fileId', async (req, res) => {
  var fileId = req.params.fileId;
  if (req.session.userId) {
    const file = await File.findById(fileId).exec();
    const workflow = await Workflow.findById(file.workflowId).exec();
    const mainProcess = await MainProcess.findById(workflow.mainProcessId).exec();
    const workUnit = await WorkUnit.findById(file.workUnitId).exec();
    const file_type = await WorkflowFileType.findById(file.workflowFileTypeId).exec();

    return res.render('site/createfile', {
      fileId: fileId,
      fileNo: file.fileNo,
      workflow_id: workflow._id,
      workflow_name: workflow.workprocessName,
      main_process_id: mainProcess._id,
      main_process_name: mainProcess.mainProcessName,
      work_unit_id: workUnit._id,
      work_unit_name: workUnit.WorkUnitName,
      file_type_id: file_type._id,
      file_type_name: file_type.WorkflowFileTypeName,
    });
  } else {
    res.redirect('/registeredusers/login')
  }
});



module.exports = router
