const express = require("express");
var bodyParser = require("body-parser");
const db = require("./config/db");
const app = express();
require("dotenv").config();
const debug = require('debug')('myapp:server');

const cors = require("cors");
const nodemailer = require("nodemailer");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
const path = require('path');
const multer = require('multer');
const logger = require('morgan');
const serveIndex = require('serve-index')

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

//will be using this for uplading
const upload = multer({ storage: storage });

//get the router

app.use(logger('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(express.static('public'));
app.use('/ftp', express.static('public'), serveIndex('public', {'icons': true}));

app.get('/', function(req,res) {
    return res.send("hello from my app express server!")
})

app.post('/testUpload', upload.single('file'), function(req,res) {
    debug(req.file);
    console.log('storage location is ', req.hostname +'/' + req.file.path);
    return res.send(req.file);
})


app.get("/api/getUserDetails/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM UserDetails WHERE UserId = ?", id, (err, result) => {
    if (err) {
      console.log(err);
    }

    res.send(result);
  });
});

app.post("/api/createUser", (req, res) => {
  const UserId = req.body.UserId;
  const EmailId = req.body.EmailId;
  const BirthDate = req.body.BirthDate;
  const Gender = req.body.Gender;
  const Name = req.body.Name;
  const ProfileImg = req.body.ProfileImg;
  const InstaId = req.body.InstaId;
  const Vaccine = req.body.Vaccine;


  db.query(
    `insert into UserDetails (UserId,EmailId,BirthDate,Gender,Name,ProfileImg,InstaId,Vaccine ) values ('${UserId}', '${EmailId}', '${BirthDate}', '${Gender}', '${Name}',  '${ProfileImg}', '${InstaId}', '${Vaccine}');`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(result);
    }
  );
  res.send("Succefully added to db");
});

app.get("/api/getFromId/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM myusers WHERE Id = ?", id, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

app.post("/api/createUserPhotos", (req, res) => {
  const Id = req.body.Id;
  const UserId = req.body.UserId;
  const EmailId = req.body.EmailId;
  const PhotoUrl = req.body.PhotoUrl;
  


  db.query(
    `insert into UserPhotos (Id,UserId,EmailId,PhotoUrl  ) values ('${Id}', '${UserId}', '${EmailId}', '${PhotoUrl}');`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.send(err.sqlMessage);
      }
      else{
          console.log(result);
          res.send("Succefully added to db");
      }
      
    }
  );
  
});

app.get("/api/getUserPhotos/:id", (req, res) => {
    const id = req.params.id;
    db.query("SELECT * FROM UserPhotos WHERE UserId = ?", id, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
  });


  app.post("/api/createScaape", (req, res) => {
    const ScaapeId = req.body.ScaapeId;
    const UserId = req.body.UserId;
    const ScaapeName = req.body.ScaapeName;
    const Description = req.body.Description;
    const ScaapePref = req.body.ScaapePref;
    const Location = req.body.Location;
    const ScaapeImg = req.body.ScaapeImg;
    const Status = req.body.Status;
  
  
    db.query(
      `insert into Scaapes (ScaapeId, UserId,ScaapeName,Description,ScaapePref,Location,ScaapeImg,Status ) values ('${ScaapeId}', '${UserId}', '${ScaapeName}', '${Description}', '${ScaapePref}', '${Location}',  '${ScaapeImg}', '${Status}');`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.send(err.sqlMessage);
        }
        else{
          console.log(result); 
           res.send("Succefully added to db");
        }
        
      }
    );
    
  });
  app.post("/api/createParticipant", (req, res) => {
    const ScaapeId = req.body.ScaapeId;
    const TimeStamp = req.body.TimeStamp;
    const UserId = req.body.UserId;
    const Accepted = req.body.Accepted;
 
  
  
    db.query(
      `insert into ScaapeParticipant (ScaapeId, TimeStamp,UserId,Accepted ) values ('${ScaapeId}', '${TimeStamp}', '${UserId}', '${Accepted}');`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.send(err.sqlMessage);
        }
        else{
          console.log(result); 
           res.send("Succefully added to db");
        }
        
      }
    );
    
  });

app.get("/api/getScaapes", (req, res) => {
    const id = req.params.id;
    db.query("select Scaapes.*, UserDetails.* from Scaapes inner join UserDetails on Scaapes.UserId = UserDetails.UserId ;", id, (err, result) => {
      if (err) {
        console.log(err);
        res.send(err.sqlMessage);  

      }
      else{
       res.send(result);   
      }
      
    });
  });

app.get("/api/getParticipants/ScaapeId=:ScaapeId", (req, res) => {
    const ScaapeId = req.params.ScaapeId;
    db.query(`SELECT ScaapeParticipant.*, UserDetails.* FROM scaape.ScaapeParticipant inner join UserDetails on UserDetails.UserId = ScaapeParticipant.UserId where ScaapeParticipant.ScaapeId = '${ScaapeId}' ;`, (err, result) => {
      if (err) {
        console.log(err);
        res.send(err.sqlMessage);  
      }
      else{
          console.log(result);
       res.send(result);   
      }
      
    });
  });

  app.get("/api/getScaapesById/UserId=:UserId/Status=:Status", (req, res) => {
    const Status = req.params.Status;
    const UserId = req.params.UserId;
    db.query(`SELECT * FROM scaape.Scaapes where UserId = "${UserId}" and Status = "${Status}";`, (err, result) => {
      if (err) {
        console.log(err);
        res.send(err.sqlMessage);  
      }
      else{
          console.log(result);
       res.send(result);   
      }
      
    });
  });
  app.post("/api/UpdateParticipant", (req, res) => {
    const Accepted = req.body.Accepted;
    const UserId = req.body.UserId;
    console.log(UserId, Accepted);
  
  
    db.query(
      `update ScaapeParticipant set Accepted = ${Accepted} where UserId = ${UserId};`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.send(err.sqlMessage);
        }
        else{
          console.log(result); 
           res.send("Succefully added to db");
        }
        
      }
    );
    
  });
  app.get("/api/getAcceptedParticipant/ScaapeId=:ScaapeId", (req, res) => {
    const Status = req.params.Status;
    const ScaapeId = req.params.ScaapeId;
    db.query(`SELECT ScaapeParticipant.*, UserDetails.* FROM scaape.ScaapeParticipant inner join UserDetails on UserDetails.UserId = ScaapeParticipant.UserId where ScaapeParticipant.ScaapeId = '${ScaapeId}' and ScaapeParticipant.Accepted = 1  ;`, (err, result) => {
      if (err) {
        console.log(err);
        res.send(err.sqlMessage);  
      }
      else{
          console.log(result);
       res.send(result);   
      }
      
    });
  });


app.listen(process.env.PORT || 4000, () => {
  console.log(`Example app listening at http://localhost: 4000`);
});
