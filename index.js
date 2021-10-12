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


  db.query(
    `insert into UserDetails (UserId,EmailId,BirthDate,Gender,Name,ProfileImg,InstaId,Vaccine,Bio ) values ('${UserId}', '${EmailId}', '${BirthDate}', '${Gender}', '${Name}',  '${ProfileImg}', '${InstaId}', '${Vaccine}','${Bio}');`,
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


app.listen(process.env.PORT || 4000, () => {
  console.log(`Example app listening at http://localhost: 4000`);
});
