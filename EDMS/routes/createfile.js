const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
var app = require('../app');
const File = require('../models/File');
const fs = require('fs');

//Create file
var filePath = path.join(__dirname, '..', 'uploads');
if (fs.existsSync(('../EDMS/uploads/' + 'files/0.pdf'))) {
  console.log('exist');
} else {
  console.log("not existy");
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, filePath)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    //const id = uuid();
    const fileN = path.basename(file.originalname, ext);
    var filePath = `files/${fileN}${ext}`;
    console.log(filePath);

    while (fs.existsSync(('../EDMS/uploads/' + filePath))) {
      lastIndex = filePath.lastIndexOf(ext);
      filePath = filePath.slice(0, lastIndex);
      filePath = filePath + '(1)' + ext;
    }
    console.log("multer end" + filePath);

    cb(null, filePath);
  }
})



const upload = multer({
  storage
}); // or simply { dest: 'uploads/' }
router.use(express.static('public'));
router.use(express.static('uploads'));
router.post('/upload', upload.single('file'), (req, res) => {

  console.log(JSON.stringify(req.body));
  const file_type = req.body.file_type;
  const main_process = req.body.main_process;
  const work_unit = req.body.work_unit;
  const work_process = req.body.workflow;
  var fileNo = file_type + "-" + main_process + "-" + work_unit + "-" + work_process + "-" + "0";
  const ext = path.extname(req.file.path);
  var filen=fileNo+ext
  
  //start
  const oldFilePath = req.file.path;
  
  const newFilePath = path.join(__dirname, '..', 'uploads', 'files', filen);
  fs.rename(oldFilePath, newFilePath, function(err) {
    if (err) {
      console.log(err);
    }
  });
  const fileObject = new File({
    workflowId: 2,
    fileId: 6,
    fileNo: fileNo,
    organiserId: [1],
    creatorId: 1,
    creatDate: new Date(),
    revisionDate: null,
    approvalStatus: 0,
    approvalDate: null,
    filePath: newFilePath,
    deleteDate: null
  });
  fileObject.save();

  //end
  req.session.sessionFlash={
    type:'alert alert-success',
    message:'Your file created Successfully.'
}
 return res.redirect('/onchangefiles');
  
});

function oneFileUpdate(filter, update) {
  File.findOneAndUpdate(filter, update, {
    new: true
  }, (err, doc) => {
    if (err) {
      console.log("Something wrong when updating data!");
    }
    //console.log(doc);
  });
}


router.post('/delete', (req, res) => {

  const filterId = {
    //_id: req.body.fileId
    fileId: 6
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

  console.log("*******");

  File.findOne(filterId, function(err, choosenFile) {
    if (err) {
      console.log("File Approval Status Can Not Be Accessed", err);
      res.rendder('site/onchange');
    } else {

      fileAttributes.approvalStatus = choosenFile.approvalStatus;
      fileAttributes.filePath = choosenFile.filePath;

      if (fileAttributes.approvalStatus == 0) {
        fileAttributes.approvalStatus = 5;
        const oldFilePath = choosenFile.filePath;
        console.log("old",oldFilePath);
        const fileName = choosenFile.fileNo +"("+todayStrDate+")"+".pdf";
        const newFilePath = path.join(__dirname, '..', 'uploads', 'oldFiles', fileName);
        console.log("ne",newFilePath);
        fileAttributes.approvalStatus = choosenFile.approvalStatus;
        fileAttributes.filePath = newFilePath
        oneFileUpdate(filterId, fileAttributes);
        fs.rename(oldFilePath, newFilePath, function(err) {
          if (err) {
            console.log(err);
          }
        });
      } else {
        
        const oldFilePath = choosenFile.filePath;
        const fileName = choosenFile.fileNo + fileAttributes.deleteDate+".pdf";
        const newFilePath = path.join(__dirname, '..', 'uploads', 'oldFiles', fileName);
        fileAttributes.approvalStatus = choosenFile.approvalStatus;
        fileAttributes.filePath = newFilePath
        oneFileUpdate(filterId, fileAttributes);
        fs.rename(oldFilePath, newFilePath, function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
    }
  });


  // File.find({
  //   fileId: req.body.fileId
  // }).
  // then(files => {
  //   console.log(files[0]);
  //
  //   files[0].approvalStatus = files[0].approvalStatus + 1;
  //   files.save();
  //   console.log(files);
  // });
  console.log("Bitti");
  req.session.sessionFlash={
    type:'alert alert-success',
    message:'Your file deleted successfully.'
}
 return res.redirect('/onchangefiles');
});


//Create file
// router.get('/', (req, res) => {
//   res.render('site/createfile');
// });
router.get('/createfile', (req, res) => {
  if(req.session.userId){
  res.render('site/createfile');
}
else{
  res.redirect('/registeredusers/login')
}
});

module.exports = router
