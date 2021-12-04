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
const serveIndex = require('serve-index');
const { wrap } = require("module");
const { match } = require("assert/strict");

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
  const UserId = req.params.id;
  db.query(`SELECT UserDetails.*, (select count(*) from Scaapes where UserId = "${UserId}") as ScaapesCreated, ((select count(*) from ScaapeParticipant where UserId = "${UserId}") - (select count(*) from Scaapes where UserId = "${UserId}")) as ScaapesJoined FROM scaape.UserDetails where UserId="${UserId}";`, (err, result) => {
    if (err) {
      console.log(err);
    }
    else{
      console.log(result);
      res.send(result);
    }

    
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
  const Bio = req.body.Bio;
  const TimeStamp = new Date().valueOf();

  db.query(
    `insert into UserDetails (UserId,EmailId,BirthDate,Gender,Name,ProfileImg,InstaId,Vaccine,Bio ) values ('${UserId}', '${EmailId}', '${BirthDate}', '${Gender}', '${Name}',  '${ProfileImg}', '${InstaId}', '${Vaccine}','${Bio}');`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(result);
    }
  );
  db.query(
    `insert into Notification (UserId,TimeStamp,MsgCode ) values ('${UserId}', '${TimeStamp}', 'UserWlcm');`,
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
      res.status(400).send(err.sqlMessage);
    }
    else{
        console.log(result);
        res.send("Succefully added to db");
    }
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
        res.status(400).send(err.sqlMessage);
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
    db.query(`SELECT * FROM UserPhotos WHERE UserId = '${id}'`, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
  });

  app.post("/api/DeleteUserPhotos", (req, res) => {
    const Id = req.body.Id;
    const UserId = req.body.UserId;
  
    
  
  
    db.query(
      `delete from UserPhotos where Id = "${Id}" and UserId = "${UserId}";`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        }
        else{
            console.log(result);
            res.send("Succefully added to db");
        }
        
      }
    );
    
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
    const ScaapeDate = req.body.ScaapeDate;
    const Activity = req.body.Activity;
    const City = req.body.City;
    const TimeStamp = new Date().valueOf();
    const Accepted = '1';
     
  
  
    db.query(
      `insert into Scaapes (ScaapeId, UserId,ScaapeName,Description,ScaapePref,Location,ScaapeImg,Status, ScaapeDate, Activity, City ) values ('${ScaapeId}', '${UserId}', '${ScaapeName}', '${Description}', '${ScaapePref}', '${Location}',  '${ScaapeImg}', '${Status}', '${ScaapeDate}', '${Activity}', '${City}');`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        }
        else{
          console.log(result); 
           
           db.query(
            `insert into ScaapeParticipant (ScaapeId, TimeStamp,UserId,Accepted ) values ('${ScaapeId}', '${TimeStamp}', '${UserId}', '${Accepted}');`,
            (error, resu) => {
              if (error) {
                console.log(error);
                res.status(400).send(error.sqlMessage);
              }
              else{
                console.log(resu); 
                db.query(
                  `insert into UserPhotos (Id,UserId,PhotoUrl  ) values ('${ScaapeId}', '${UserId}', '${ScaapeImg}');`,
                  (err, result) => {
                    if (err) {
                      console.log(err);
                      res.status(400).send(err.sqlMessage);
                    }
                    else{
                        console.log(result);
                        res.send("Succefully added to db");
                    }
                    
                  }
                );
              }
              
            }
          );
          db.query(
            `insert into Notification (UserId,ScaapeId,TimeStamp,MsgCode ) values ('${UserId}','${ScaapeId}', '${TimeStamp}', 'OnScaape');`,
            (err, result) => {
              if (err) {
                console.log(err);
              }
              console.log(result);
            }
          );
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
          res.status(400).send(err.sqlMessage);
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
        res.status(400).send(err.sqlMessage);  

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
        res.status(400).send(err.sqlMessage);  
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
    db.query(`SELECT *, (select count(*) from ScaapeParticipant where ScaapeParticipant.ScaapeId = Scaapes.ScaapeId ) as count FROM scaape.Scaapes where UserId = "${UserId}" and Status = "${Status}";`, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);  
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
    const ScaapeId = req.body.ScaapeId;
    console.log(UserId, Accepted);
    const TimeStamp = new Date().valueOf();

  
    db.query(
      `insert into Notification (UserId,ScaapeId,TimeStamp,MsgCode ) values ('${UserId}','${ScaapeId}', '${TimeStamp}', 'OnAccept');`,
      (err, result) => {
        if (err) {
          console.log(err);
        }
        console.log(result);
      }
    );
    db.query(
      `update ScaapeParticipant set Accepted = ${Accepted} where UserId = '${UserId}' and ScaapeId = '${ScaapeId}';`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        }
        else{
          console.log(result); 
          if(result.affectedRows == 0){
            res.status(400).send(result.message);
          }
          else{
            res.send("Succefully added to db");
          }
           
        }
        
      }
    );
    
  });
  app.post("/api/DeleteParticipant", (req, res) => {
    const ScaapeId = req.body.ScaapeId;
    const UserId = req.body.UserId;
    console.log(UserId, ScaapeId);
  
  
    db.query(
      `delete from ScaapeParticipant where ScaapeId = "${ScaapeId}" and UserId = "${UserId}";`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        }
        else{
          console.log(result); 
          if(result.affectedRows === 0){
            res.status(400).send("No rows changed");
          }
          else{
            res.send("Succefully deleted from db");
          }
           
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
        res.status(400).send(err.sqlMessage);  
      }
      else{
          console.log(result);
       res.send(result);   
      }
      
    });
  });
  app.get("/api/getScaapesWithAuth/UserId=:UserId", (req, res) => {
    const UserId = req.params.UserId;
    console.log(UserId);
    db.query(`SELECT * , case when exists( SELECT * FROM ScaapeParticipant WHERE UserId = '${UserId}' and ScaapeId = Scaapes.ScaapeId ) then 'True' else 'False' end as isPresent, case when UserId = '${UserId}' then 'True' else 'False' end as Admin, (select count(*) from ScaapeParticipant where ScaapeParticipant.ScaapeId = Scaapes.ScaapeId) as count, (select UserDetails.Name from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminName , (select UserDetails.EmailId from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminEmail , (select UserDetails.ProfileImg from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminDP , (select UserDetails.Vaccine from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminVaccine , (select UserDetails.Gender from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminGender,(select UserDetails.InstaId from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminInsta FROM scaape.Scaapes order by rand();;`, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);  
      }
      else{
          console.log(result);
       res.send(result);   
      }
      
    });
  });
  app.get("/api/getTrendingScaapesWithAuth/UserId=:UserId", (req, res) => {
    const UserId = req.params.UserId;
    console.log(UserId);
    db.query(`SELECT * , case when exists( SELECT * FROM ScaapeParticipant WHERE UserId = '${UserId}' and ScaapeId = Scaapes.ScaapeId ) then 'True' else 'False' end as isPresent, case when UserId = '${UserId}' then 'True' else 'False' end as Admin, (select count(*) from ScaapeParticipant where ScaapeParticipant.ScaapeId = Scaapes.ScaapeId) as count, (select UserDetails.Name from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminName , (select UserDetails.EmailId from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminEmail , (select UserDetails.ProfileImg from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminDP , (select UserDetails.Vaccine from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminVaccine ,(select UserDetails.InstaId from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminInsta, (select UserDetails.Gender from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminGender, (2*(select count(*) from ScaapeParticipant where ScaapeParticipant.ScaapeId = Scaapes.ScaapeId) + Scaapes.ClickCount) as rankpoints FROM scaape.Scaapes order by rankpoints desc;`, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);  
      }
      else{
          console.log(result);
       res.send(result);   
      }
      
    });
  });
  app.get("/api/getRecentRequest/UserId=:UserId", (req, res) => {
    const UserId = req.params.UserId;
    console.log(UserId);
    db.query(`SELECT Scaapes.Location, ScaapeParticipant.*, (select UserDetails.Name from UserDetails where UserDetails.UserId = ScaapeParticipant.UserId) as Name, (select UserDetails.EmailId from UserDetails where UserDetails.UserId = ScaapeParticipant.UserId) as Email, (select UserDetails.InstaId from UserDetails where UserDetails.UserId = ScaapeParticipant.UserId) as InstaId, (select UserDetails.ProfileImg from UserDetails where UserDetails.UserId = ScaapeParticipant.UserId) as DP, (select UserDetails.Vaccine from UserDetails where UserDetails.UserId = ScaapeParticipant.UserId) as Vaccine FROM scaape.ScaapeParticipant inner join Scaapes on Scaapes.ScaapeId = ScaapeParticipant.ScaapeId where Scaapes.UserId = '${UserId}';`, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);  
      }
      else{
          console.log(result);
       res.send(result);   
      }
      
    });
  });
 
  app.post("/api/UpdateScaapeStatus", (req, res) => {
    const ScaapeId = req.body.ScaapeId;
    const Status = req.body.Status;
    console.log(Status, ScaapeId);
  
  
    db.query(
      `update Scaapes set Scaapes.Status = '${Status}' where Scaapes.ScaapeId = '${ScaapeId}';`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        }
        else{
          console.log(result); 
          if(result.affectedRows === 0){
            res.status(400).send("No rows changed");
          }
          else{
            res.send("Succefully updated db");
          }
           
        }
        
      }
    );
    
  });
  app.post("/api/DeleteScaape", (req, res) => {
    const ScaapeId = req.body.ScaapeId;
    const UserId = req.body.UserId;
    console.log(UserId, ScaapeId);
  
  
    db.query(
      `delete from Scaapes where ScaapeId = "${ScaapeId}" and UserId = "${UserId}";`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        }
        else{
          console.log(result); 
          if(result.affectedRows === 0){
            
            res.status(400).send("No rows changed");
            
          }
          else{
            res.send("Succefully deleted from db");
          }
           
        }
        
      }
    );
    
  });
 app.get("/api/getUserScaapes/UserId=:UserId", (req, res) => {
    const UserId = req.params.UserId;
    console.log(UserId);
    db.query(`SELECT ScaapeParticipant.*, Scaapes.Description, Scaapes.Location, Scaapes.ScaapeDate, Scaapes.ScaapeId, Scaapes.ScaapeImg, Scaapes.ScaapeName, Scaapes.ScaapePref, Scaapes.Status ,Scaapes.UserId as AdminUserId FROM scaape.ScaapeParticipant inner join Scaapes on Scaapes.ScaapeId = ScaapeParticipant.ScaapeId where ScaapeParticipant.UserId = '${UserId}';`, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);  
      }
      else{
          console.log(result);
       res.send(result);   
      }
      
    });
  });
  app.post("/api/OnClick", (req, res) => {
    const ScaapeId = req.body.ScaapeId;
  
  
    db.query(
      `update Scaapes set Scaapes.ClickCount = Scaapes.ClickCount + 1 where Scaapes.ScaapeId = '${ScaapeId}';`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        }
        else{
          console.log(result); 
          if(result.affectedRows === 0){
            
            res.status(400).send("No rows changed");
            
          }
          else{
            res.send("Succefully updated db");
          }
           
        }
        
      }
    );
    
  });
  app.get("/api/getPrefScaapesWithAuth/UserId=:UserId/Pref=:Pref", (req, res) => {
    const UserId = req.params.UserId;
    const Pref = req.params.Pref
    console.log(UserId);
    db.query(`SELECT * , case when exists( SELECT * FROM ScaapeParticipant WHERE UserId = '${UserId}' and ScaapeId = Scaapes.ScaapeId ) then 'True' else 'False' end as isPresent, case when UserId = '${UserId}' then 'True' else 'False' end as Admin, (select count(*) from ScaapeParticipant where ScaapeParticipant.ScaapeId = Scaapes.ScaapeId) as count, (select UserDetails.Name from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminName , (select UserDetails.EmailId from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminEmail ,(select UserDetails.InstaId from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminInsta,    (select UserDetails.ProfileImg from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminDP , (select UserDetails.Vaccine from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminVaccine , (select UserDetails.Gender from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminGender, (2*(select count(*) from ScaapeParticipant where ScaapeParticipant.ScaapeId = Scaapes.ScaapeId) + Scaapes.ClickCount + (case when Activity = '${Pref}' then 100 else 0 end )) as rankpoints FROM scaape.Scaapes order by rankpoints desc;`, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);  
      }
      else{
          console.log(result);
       res.send(result);   
      }
      
    });
  });
  app.get("/api/getLatestScaapesWithAuth/UserId=:UserId", (req, res) => {
    const UserId = req.params.UserId;
    console.log(UserId);
    db.query(`SELECT * , case when exists( SELECT * FROM ScaapeParticipant WHERE UserId = '${UserId}' and ScaapeId = Scaapes.ScaapeId ) then 'True' else 'False' end as isPresent, case when UserId = '${UserId}' then 'True' else 'False' end as Admin, (select count(*) from ScaapeParticipant where ScaapeParticipant.ScaapeId = Scaapes.ScaapeId) as count, (select UserDetails.Name from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminName , (select UserDetails.InstaId from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminInsta,    (select UserDetails.EmailId from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminEmail , (select UserDetails.ProfileImg from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminDP , (select UserDetails.Vaccine from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminVaccine , (select UserDetails.Gender from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminGender, (2*(select count(*) from ScaapeParticipant where ScaapeParticipant.ScaapeId = Scaapes.ScaapeId) + Scaapes.ClickCount) as rankpoints FROM scaape.Scaapes order by ScaapeDate desc;`, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);  
      }
      else{
          console.log(result);
       res.send(result);   
      }
      
    });
  });
  app.post("/api/UpdateVaccineCert", (req, res) => {
    const VaccineCert = req.body.VaccineCert;
    const UserId = req.body.UserId;
  
  
    db.query(
      `update UserDetails set VaccineCert = '${VaccineCert}' where UserId = '${UserId}';`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        }
        else{
          console.log(result); 
          if(result.affectedRows == 0){
            res.status(400).send(result.message);
          }
          else{
            res.send("Succefully added to db");
          }
           
        }
        
      }
    );
    
  });
  app.post("/api/newsletter", (req, res) => {
    const Email = req.body.Email;
    const Name = req.body.Name;
    const Message = req.body.Message;
  
  
    db.query(
      `insert into Newsletter (Email,Name,Message) values ('${Email}', '${Name}', '${Message}');`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        }
        else{
          console.log(result); 
          if(result.affectedRows == 0){
            res.status(400).send(result.message);
          }
          else{
            res.send("Succefully added to db");
          }
           
        }
        
      }
    );
    
  });
  app.get("/api/getNewsletter", (req, res) => {
    const UserId = req.params.UserId;
    console.log(UserId);
    db.query(`SELECT * FROM scaape.Newsletter;`, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);  
      }
      else{
          console.log(result);
       res.send(result);   
      }
      
    });
  });
  app.get("/api/getNotifications/UserId=:UserId", (req, res) => {
    const UserId = req.params.UserId;
    console.log(UserId);
    db.query(`SELECT Notification.*, UserDetails.*, Scaapes.*, MessageCode.Message FROM scaape.Notification inner join UserDetails on UserDetails.UserId = Notification.UserId inner join Scaapes on Scaapes.ScaapeId = Notification.ScaapeId inner join MessageCode on MessageCode.MsgCode = Notification.MsgCode where Notification.UserId = "${UserId}";`, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);  
      }
      else{
          console.log(result);
       res.send(result);   
      }
      
    });
  });

  // app.get("/api/getPlacesNearby", (req, res) => {

  //   const sdk = require('api')('@fsq-docs/v1.0#1xlrgkw44nr4y');

  //   sdk['place-search']({
  //     ll: '23.5046%2C87.4977',
  //     categories: '18021',
  //     sort: 'POPULARITY',
  //     limit: '10',
  //     Authorization: 'fsq3MVOGtijr4At219b3/T5QyxSX5ZYGeikpq92vn1icWIM='
  //   })
  //     .then(res => console.log(res))
  //     .catch(err => console.error(err));
  // });
  app.post("/api/UpdateTutorial", (req, res) => {
    const showTutorial = req.body.showTutorial;
    const UserId = req.body.UserId;
  
  
    db.query(
      `update UserDetails set showTutorial = ${showTutorial} where UserId = '${UserId}';`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        }
        else{
          console.log(result); 
          if(result.affectedRows == 0){
            res.status(400).send(result.message);
          }
          else{
            res.send("Succefully added to db");
          }
           
        }
        
      }
    );
    
  });
  function isBoundingBox(minLat, minLong, maxLat, maxLong, Long, Lat){
    let isLonginRange;
    let isLatinRange;

    wrapMaxLon = (minLong>maxLong)? maxLong + 360 : maxLong;
    wrapMinLon = (minLong>maxLong)?minLong - 360 : minLong;


    isLonginRange = Long >= minLong && Long <= maxLong;
    console.log(Long,minLong,maxLong);
    isLatinRange = Lat >= minLat && Lat <= maxLat;
    console.log(isLonginRange);
    return (isLonginRange && isLatinRange);

     }

  app.get("/api/getGeoScaapes", (req, res) => {
    const minLat = req.body.minLat;
    const minLong = req.body.minLong;
    // const maxLat = req.body.maxLat;
    // const maxLong = req.body.maxLong;
    const UserId = req.body.UserId;
    // const Long = req.body.Long;
    // const Lat = req.body.Lat;
    const radMinLat = minLat*(Math.PI/180);
    const radMinLong = minLong*(Math.PI/180);
    maxLat = Math.asin(Math.sin(radMinLat)*Math.cos(50/6400) + Math.cos(radMinLat)*Math.sin(50/6400)*Math.cos(1.57));
    maxLong = radMinLong + Math.atan2(Math.sin(1.57)*Math.sin(50/6400)*Math.cos(radMinLat), Math.cos(50/6400) - Math.sin(radMinLat)*Math.sin(maxLat)); 
    maxLat = maxLat*(180/Math.PI);
    maxLong = maxLong*(180/Math.PI);
    console.log("ye h ",maxLat, maxLong);



    var allScaapes = {};
    var geoscaape = {};
    var lng = 0;
  // console.log(maxLong);
    db.query(
      `SELECT * , case when exists( SELECT * FROM ScaapeParticipant WHERE UserId = '${UserId}' and ScaapeId = Scaapes.ScaapeId ) then 'True' else 'False' end as isPresent, case when UserId = '${UserId}' then 'True' else 'False' end as Admin, (select count(*) from ScaapeParticipant where ScaapeParticipant.ScaapeId = Scaapes.ScaapeId) as count, (select UserDetails.Name from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminName , (select UserDetails.EmailId from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminEmail , (select UserDetails.ProfileImg from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminDP , (select UserDetails.Vaccine from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminVaccine ,(select UserDetails.InstaId from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminInsta, (select UserDetails.Gender from UserDetails where UserDetails.UserId = Scaapes.UserId) as AdminGender, (2*(select count(*) from ScaapeParticipant where ScaapeParticipant.ScaapeId = Scaapes.ScaapeId) + Scaapes.ClickCount) as rankpoints FROM scaape.Scaapes order by rankpoints desc;`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        }
        else{
          // console.log(result); 
          if(result.affectedRows == 0){
            res.status(400).send(result.message);
          }
          else{
            allScaapes["All"] = result;
            var j=0;
            for(var i=0;  i<allScaapes['All'].length; i++){
              // console.log(allScaapes["All"][i]['Lng']);
              // console.log(isBoundingBox(minLat, minLong, maxLat,  maxLong, 85.090210, 23.717049))
              if(isBoundingBox(minLat, minLong, maxLat,  maxLong, allScaapes["All"][i]['Lng'], allScaapes["All"][i]['Lat'])){
                console.log(allScaapes["All"][i]);
                
                geoscaape[j] = allScaapes["All"][i];
                j=j+1;
              }
            }
            res.send(geoscaape);
          }
           
        }
        
      }
    );

    
  });

app.listen(process.env.PORT || 4000, () => {
  console.log(`Example app listening at http://localhost: 4000`);
});
