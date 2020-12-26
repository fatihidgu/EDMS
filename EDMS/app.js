const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const mongoose = require("mongoose")
const connectMongo = require('connect-mongo')
const bodyParser=require('body-parser')
const expressSession = require('express-session')
const User=require('./models/RegisteredUser')
const app = express()
const hostname = '127.0.0.1'
const port = 3000

mongoose.connect("mongodb://127.0.0.1/EDMS", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
mongoose.set('useFindAndModify', false);
app.use(express.static('public'))

//app.engine('handlebars',exphbs())
//app.set('view engine','handlebars')
var hbsHelpers = exphbs.create({
  helpers: require("./helpers/handlebars").helpers,

//  defaultLayout: '',

});
const mongoStore = connectMongo(expressSession)

app.use(expressSession({
  secret: 'testotesto',
  resave: false,
  saveUninitialized: true,
  store: new mongoStore({ mongooseConnection: mongoose.connection })
}))

//middle ware
app.use((req,res,next)=>{
  const {userId,isBlocked} = req.session
  User.findOne({_id:userId},(error,user)=>{
 if(userId && !isBlocked){
   res.locals ={
     userid:userId,
     links:true,
     usernameye: user.name+" "+user.surname,
     admin:user.isadmin,
     isblocked:user.isblocked
   }

 }else{
   res.locals ={
    links:false,
    userid:null,
    admin:false,
    isblocked:false
   }
 }

 next()
 })
})

//mesaj
app.use((req,res,next)=>{
  res.locals.sessionFlash=req.session.sessionFlash
  delete req.session.sessionFlash
  next()
})

app.engine('handlebars', hbsHelpers.engine);
app.set('view engine', '.handlebars');

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

const main = require('./routes/main')
const users = require('./routes/registeredusers')
const createfile = require('./routes/createfile')
const workflows = require('./routes/workflows')
const onchange = require('./routes/onchange')

app.use('/',main)
app.use('/registeredusers',users)
app.use('/createfile',createfile)
app.use('/workflows',workflows)
app.use('/onchangefiles',onchange)

app.listen(port, hostname,()=>{
    console.log( 'Server Çalışıyor, http://'+hostname+":"+port+"/")
})
