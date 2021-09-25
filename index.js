const express = require("express")
var bodyParser = require('body-parser')
const db = require('./config/db')
const app = express()
require("dotenv").config()


const cors = require("cors")
const nodemailer = require("nodemailer")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cors())

app.get("/api/getFromId/:id", (req,res)=>{

    const id = req.params.id;
        db.query("SELECT * FROM user WHERE Id = ?", id, (err,result)=>{
            if(err) {
            console.log(err)
            } 
            
        res.send(result)
        }
        );   
        });

app.listen(process.env.PORT || 4000, () => {
	console.log(`Example app listening at http://localhost: 4000`)
  })