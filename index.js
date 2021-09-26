const express = require("express");
var bodyParser = require("body-parser");
const db = require("./config/db");
const app = express();
require("dotenv").config();

const cors = require("cors");
const nodemailer = require("nodemailer");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

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

app.listen(process.env.PORT || 4000, () => {
  console.log(`Example app listening at http://localhost: 4000`);
});
