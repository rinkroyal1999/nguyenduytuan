const User = require('../models/user');
const Home = require('../models/houses');
const Vote = require('../models/Vote')
const Validation = require('../validation/validations');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {arraytoObject} = require('../../util/convertObject');
const multer = require('multer');
const Category = require('../models/category');
const request = require('request');
const nodemailer = require("nodemailer");
const Pusher = require("pusher");
const user = require('../models/user');
//pusher----------
const pusher = new Pusher({
    appId: "1114657",
    key: "63990e6e49ea692758a7",
    secret: "c207dcbfce61b0ecabb2",
    cluster: "ap1",
    useTLS: true
  });
//config upload files
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/public/upload');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+'-'+ file.originalname  );
    }
  })
var upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if(file.mimetype=="image/bmp" || file.mimetype=="image/png" || file.mimetype=="image/jpg" || file.mimetype=="image/jpeg" || file.mimetype=="image/gif"){
            cb(null, true);  
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
}).array("fileupload",12) 
class HomeController{
    addHome(req,res,next){
        let user;
        User.findById(req.userid).then(data=>{user = data.toObject()})
        .catch(err=>next)
        Category.find({})
        .then(data=>{
            return res.render('home/addHome',{
                categories:arraytoObject(data),
                user:user,
            })})
        .catch(next)
    }
    postaddHome(req,res,next){
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
              console.log("A Multer error occurred when uploading."); 
            } else if (err) {
              console.log("An unknown error occurred when uploading." + err);
            }else{
                var lat=1;
                var long =1;
                let myAdress = `${req.body.adress},${req.body.area}`;
                let encodeString = encodeURIComponent(myAdress);
                const url  = `https://api.opencagedata.com/geocode/v1/json?q=${encodeString}&key=f83ea3d8638a4421ac6581cecf878d4d&pretty=1`;
                request({url:url,json:true},(err,response)=>{
                    var data = response.body;
                    
                    lat = data.results[0].geometry.lat;
                    long = data.results[0].geometry.lng;
                    //  res.json(req.files[0].filename);
                    const arrfile = req.files;
                    const images =  arrfile.map((image)=>{
                            return image.filename;
                    });
                    if(images.length>0){
                        
                        const home = new Home({
                        name:req.body.nameHome,
                        category:req.body.category,
                        adress:{
                            street:req.body.adress,
                            district:req.body.district,
                            city:req.body.area,
                            geo:{
                                lat:lat,
                                lng:long
                            }
                        },
                        acreage:Number(req.body.acreage),
                        description:req.body.description,
                        price:req.body.price,
                        image:images,
                        user:req.userid,
                        room:{
                            bedroom:Number(req.body.bedroom),
                            livingroom:Number(req.body.livingroom),
                            bathroom:Number(req.body.bathroom)
                        }
                    })
                    home.save()
                    .then(home=> {return res.redirect('/user')})
                    .catch(err=>{return res.send("loi roi")});
                    }
                    else{
                        const home = new Home({
                            name:req.body.nameHome,
                            category:req.body.category,
                            adress:{
                                street:req.body.adress,
                                district:req.body.district,
                                city:req.body.area,
                                geo:{
                                    lat:lat,
                                    lng:long
                                }
                            },
                            acreage:Number(req.body.acreage),
                            description:req.body.description,
                            price:req.body.price,
                            image:[],
                            user:req.userid,
                            room:{
                                bedroom:Number(req.body.bedroom),
                                livingroom:Number(req.body.livingroom),
                                bathroom:Number(req.body.bathroom)
                            }
                        })
                        home.save()
                        .then(home=> {return res.redirect('/user')})
                        .catch(err=>{return res.send("loi roi")});

                    }
                })
               
            }
        })
    }
    updateHome(req,res,next){
        let user;
        let home;
        let categories;
        Home.findById(req.params.id,(err,docs)=>{
            if(err)
                console.log("loi");
            else{
                home = docs.toObject();
                User.findById(req.userid,(err,docs)=>{
                    if(err)
                        console.log(err);
                    else{
                        user = docs.toObject();
                        Category.find({},(err,docs)=>{
                             if(err)
                                console.log(err);
                             else{
                                 categories = arraytoObject(docs);
                                 return res.render('home/editHome',{
                                    home:home,
                                    user:user,
                                    categories:categories
                                })
                             }    
                        })

                    }    
                })
            }
        })
    }
    postUpdateHome(req,res,next){
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
              console.log("A Multer error occurred when uploading."); 
            } else if (err) {
              console.log("An unknown error occurred when uploading." + err);
            }else{
                var lat=1;
                var long =1;
                let myAdress = `${req.body.adress},${req.body.area}`;
                let encodeString = encodeURIComponent(myAdress);
                const url  = `https://api.opencagedata.com/geocode/v1/json?q=${encodeString}&key=f83ea3d8638a4421ac6581cecf878d4d&pretty=1`;
               const arrfile = req.files;
               const images =  arrfile.map((image)=>{
                    return image.filename;
                });
                
                request({url:url,json:true},(err,response)=>{
                    var data = response.body;
                    
                    lat = data.results[0].geometry.lat;
                    long = data.results[0].geometry.lng;
                    const arrfile = req.files;
                    const images =  arrfile.map((image)=>{
                            return image.filename;
                    });
                    if(images.length>0)
                    {
                            Home.updateOne({_id:req.params.id},{
                            name:req.body.nameHome,
                            category:req.body.category,
                            adress:{
                                street:req.body.adress,
                                district:req.body.district,
                                city:req.body.area,
                                geo:{
                                    lat:lat,
                                    lng:long
                                }
                            },
                            room:{
                                bedroom:Number(req.body.bedroom),
                                livingroom:Number(req.body.livingroom),
                                bathroom:Number(req.body.bathroom)
                            },
                            acreage:Number(req.body.acreage),
                            description:req.body.description,
                            price:req.body.price,
                            image:images,
                        })
                        .then(home=> {return res.redirect('/user')})
                        .catch(err=>{return res.send("loi roi")});
                    }
                    else{
                        Home.updateOne({_id:req.params.id},{
                            name:req.body.nameHome,
                            category:req.body.category,
                            adress:{
                                street:req.body.adress,
                                district:req.body.district,
                                city:req.body.area,
                                geo:{
                                    lat:lat,
                                    lng:long
                                }
                            },
                            room:{
                                bedroom:Number(req.body.bedroom),
                                livingroom:Number(req.body.livingroom),
                                bathroom:Number(req.body.bathroom)
                            },
                            acreage:Number(req.body.acreage),
                            description:req.body.description,
                            price:req.body.price,
                        })
                        .then(home=> {return res.redirect('/user')})
                        .catch(err=>{return res.send("loi roi")});   
                        
                    }
                    
                })
            }
        })
    }
    deleteHome(req,res){
        Home.deleteOne({_id:req.params.id})
        .then(home=>{return res.redirect('/user')})
        .catch(err=>{console.log(err)})
    }
    //get all home
    async getAllHome(req,res){
        const page = (req.query.page)?parseInt(req.query.page):1;
        const valueSearch = req.query.search;
        const limit = 9;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        let listhome = await Home.find().limit(limit).skip(startIndex).exec();
        if(valueSearch && valueSearch.length>0){
                let houses = await Home.find().exec();
                listhome = houses.filter((data)=>{
                    const district = data.adress.district.toLocaleLowerCase().replace(/\s/g, '');
                    const value = valueSearch.toLocaleLowerCase().replace(/\s/g, '');
                    return district.includes(value);
            })
           
        }
        const user = await User.findById(req.userid);

        const categories = await Category.find({});
        const result ={};
        if(startIndex > 0){
            result.previous = {
                pagePre:page - 1,
                limit:limit
            }
        }
        if(endIndex < await Home.countDocuments().exec()){
            result.next = {
                pageNext:page + 1,
                limit:limit
            }
        }
        if(listhome){
            if(categories){
                res.render('home/viewHome',{
                    listhome:arraytoObject(listhome),
                    user:user?user.toObject():undefined,
                    categories:arraytoObject(categories),
                    result:result,
                    count: await Home.countDocuments().exec()
                })
            }
            
        }
        return;
        
    }
    //get all home sort
    async getHomeSort(req,res){
        const page = (req.query.page)?parseInt(req.query.page):1; 
        const limit = 9;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const listhome = await Home.find().limit(limit).skip(startIndex).exec();
        const categories = await Category.find({});
        const result ={};
        if(startIndex > 0){
            result.previous = {
                pagePre:page-1,
                limit:limit
            }
        }
        if(endIndex < await Home.countDocuments().exec()){
            result.next = {
                pageNext:page+1,
                limit:limit
            }
        }
        
        if(listhome){
            if(categories){
                res.json({
                    listhome:arraytoObject(listhome),
                    result:result,
                    categories:arraytoObject(categories),
                    user: await User.findById(req.userid),
                    count: await Home.countDocuments().exec()
                })
            }
            
        }
        return;
    }
    async getHomeDetail(req,res){
        const home_id = req.params.id;
        const listhomenew = await Home.find().sort({
            createdAt:-1
        });
        const listhome =  await Home.find();
        const home_detail = await Home.findById(home_id)
        console.log(req.userid)
        if(home_detail){
            res.render('home/homeDetail',{
                home:home_detail.toObject(),
                listHomeNew:arraytoObject(listhomenew),
                user: req.userid?(await User.findById(req.userid)).toObject():null,
                listhome:arraytoObject(listhome)
            });
        }
    }
    async sendEmailHome(req,res){
        let home = await Home.findById(req.body.houseId);
        let user  = await User.findById(home.user);
        
        const newVote = {
            area:home.adress.district,
            points:1
        }
        new Vote(newVote).save()
        .then(vote=>{
            pusher.trigger("house-change", "house-vote", {
                points:parseInt(vote.points),
                district:vote.area
              });

        })
          
          ///---------------
        let html =`
        <p>Bạn có một liên hệ mới</p>
        <h3>Chi tiết </h3>
        <ul>
            <li>Tên Nhà:  ${home.name}</li>
            <li>Địa chỉ nhà: ${home.adress.street},${home.adress.district},${home.adress.city}</li>
            <li>Tên người gửi :${req.body.userName}</li>
            <li>Số điện thoại:${req.body.userPhone}</li>
            <li>Email ${req.body.userEmail}</li>
            <li>Tin nhắn :${req.body.userMessage}</li>
        </ul>
        `;
        let testAccount = await nodemailer.createTestAccount();
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
         service:'gmail',
          auth: {
            user: 'duyson120699@gmail.com', // generated ethereal user
            pass: 'nguyenduyson11', // generated ethereal password
          },
          tls:{
              rejectUnauthorrized:false 
          }
        });
      
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"Fred Foo 👻" <foo@example.com>', // sender address
          to: `${user.email}`, // list of receivers
          subject: "Hello ✔", // Subject line
          text: "Hello world?", // plain text body
          html: html, // html body
        });
        
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        if(info){
            res.json({
                message:'thành công'    
            })
        }
    }
    async getHomeInfo(req,res){
        console.log(req.userid)
        const user = await User.findById(req.userid);
        res.render('home/homeInfo',{
            user:user?user.toObject():undefined
        });
    }
}

module.exports = new HomeController;