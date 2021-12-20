const express = require('express')
const index = express();

const mongoose = require('mongoose');
const session = require("express-session");

const fileupload = require('express-fileupload');
const { name } = require('ejs');

index.use(
    session({
      secret: "anyseceretkey",
      saveUninitialized: true,
      cookie: { maxAge: 1000 * 60 * 60 * 24 },
      resave: false,
    })
  );


mongoose.connect("mongodb://localhost/temp",{useNewUrlParser:true,useUnifiedTopology:true},(err)=>console.log(err))

const userSchema = new mongoose.Schema({
    name: String,
    address:String,
    pic:String,
    email:String,
    password:String
})


const UserModel = mongoose.model('students',userSchema)

index.use(express.urlencoded({extended:true}))

//const routes = express().router();

//index.set("static","./public/");
index.set('view engine','ejs');
index.set("static","./views/");


index.get("/getImage/:image",(req,res)=>{
    return res.sendFile("./public/images/"+req.params.image, {root: "./"})
})

index.get('/loginpage',(req,res)=>{
    res.render('login');
})

index.post("/login", (req, res) => {
    const userName = req.body.name;
    const password = req.body.password;
    UserModel.findOne({name:name}).then(data => {
        req.session.userName=name;
        res.redirect("/");
    }).catch(error => {
        return res.status(201).json(error)
    })
})

index.get("/logout", (req,res) => {
    req.session.destroy((err) => {
        if(err)
        {
           console.log(err);
        }
        else{
            res.redirect("/loginpage");
        }
    })
})





index.get('/',(req,res)=>{
    
    // UserModel.find((err,data)=>{
    //     if(err) console.log(err);
    //     else return res.render('display',{data})
    // })
    if(req.session.userName){
        UserModel.find({}).then(data => {
            return res.render('display',{data})
            // return res.status(200).json(result)
        }).catch(error => {
            return res.status(201).json(error)
        })
    }
    else
    {
        res.redirect("/loginpage");
    }
    
})

index.get('/insertPage',(req,res)=>{
    if(req.session.userName)
    {
        res.render('insert');
    }
    else{
        res.redirect("/loginpage");
    }
   
})





index.post('/insert',fileupload({
    useTempFiles:true,
    tempFileDir:'/tmp/'
}),(req,res)=>{

    req.files.image.mv('./public/images/'+req.files.image.name);
    var image = req.files.image.name
    const data = new UserModel({
        name:req.body.name,
        address:req.body.address,
        pic:image,
        email:req.body.email,
        password:req.body.password
    })
    data.save().then(result => {
        res.redirect("/")
    }).catch(error => console.log(error))
})

index.get('/display/:id',(req,res)=>{
    UserModel.findOne({_id:req.params.id}).then(data => {
        return res.render('update',{data})
    }).catch(error => {
        return res.status(201).json(error)
    })
})

index.post('/update/:id',fileupload({
    useTempFiles:true,
    tempFileDir:'/temp/'
}),(req,res)=>{
    req.files.image.mv('/../images/'+req.files.images);
    var image = req.files.image.name
    UserModel.updateOne({_id:req.params.id},{
        $set:{
            name:req.body.name,
            address:req.body.address, 
            pic:image
        }
    },(err,data)=>{
        if(err) return res.status(201).json(err)
        else return res.redirect("/")
    })
})

index.get('/delete/:id',(req,res)=>{
    UserModel.deleteOne({_id:req.params.id}).then(result => {
        return res.redirect("/");
    }).catch(error => {
        return res.status(201).json(error)
    })
})

index.listen(5000);