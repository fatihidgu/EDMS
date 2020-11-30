const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const mongoose = require("mongoose")
const bodyParser=require('body-parser')
const app = express()
const hostname = '127.0.0.1'
const port = 3000


mongoose.connect("mongodb://127.0.0.1/EDMS", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

app.use(express.static('public'))

app.engine('handlebars',exphbs())
app.set('view engine','handlebars')


app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

const main = require('./routes/main')
const users = require('./routes/registeredusers')
app.use('/',main)
app.use('/registeredusers',users)

app.listen(port, hostname,()=>{
    console.log( 'Server Çalışıyor, http://'+hostname+":"+port+"/")
})

