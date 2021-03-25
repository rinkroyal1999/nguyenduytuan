const User = require('../models/user');
const Home = require('../models/houses');
const Validation = require('../validation/validations');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {arraytoObject} = require('../../util/convertObject');
const multer = require('multer');
const category = require('../models/category');
const Vote = require('../models/Vote');
const nodemailer = require("nodemailer");
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
}).single("fileupload") 
class SiteController{
    async index(req,res){
        const page = (req.query.page)?parseInt(req.query.page):1;
        const limit = 6;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
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
        var home;
        const admin = await User.findById(req.userid);
        if(admin.permission==1){
            Home.find({}).limit(6).skip(startIndex)
            .then(data=>home=data)
            .catch(err=>console.log(err))
        }
        else{
            Home.find({user:req.userid}).limit(6).skip(startIndex)
            .then(data=>home=data)
            .catch(err=>console.log(err))   
        }
         
        User.findOne({_id:req.userid})
        .then(user=>{
            console.log(user);
             res.render('sites/user',{
                result:result, 
                user:user.toObject(),
                home:arraytoObject(home)
            })
        })
        .catch(err=>res.send(err+"lỗi rồi"))
    }
    login(req,res){
        res.render('sites/login');
    }
    //post login
    register(req,res){
        res.render('sites/register');
    };
    // validation 
    
    // post register
    async postRegister(req,res){
        //validation data register
        const {error} = Validation.registerValidation(req.body);
         if(error){
            res.render('sites/register',{
                err :error.details[0].message
            });
            return;
            
         }
         //check confirm password
         if(req.body.password != req.body.password2){
            return res.render('sites/register',{
                err :'Nhập lại mật khẩu'
            });
         }
         //check email exits in database 
         const checkemail = await User.findOne({
             email:req.body.email
         })
         if(checkemail)
            return res.render('sites/register',{
                err :'Email đã được đăng ký'
            });

        //hash password
        const salt = await bcrypt.genSalt(10); 
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        //cretae user in database
        const user = await new User({
            username:req.body.username,
            email:req.body.email,
            phone:req.body.phone,
            password:hashPassword
       });
       user.save().then(user=>{
           res.render('./sites/login',{
                success:'Đăng ký thành công'
           })
       })
       .catch(err=>console.log(err))
    }
    async postLogin(req,res,next){
        //validation data login
        const {error} = Validation.loginValidation(req.body);
         if(error){
            res.render('sites/login',{
                err :error.details[0].message
            });
            return;
            
         }
        const findUser = await User.findOne({
            email:req.body.email
        });
        if(findUser){
           const validate = await bcrypt.compare(req.body.password,findUser.password);
           if(validate){
            const token = jwt.sign({ userid : findUser._id }, process.env.TOKEN_SCRET);
               res.cookie('userID',token);
                res.redirect('/user');
           }
           else{
               res.render('sites/login',{
                   err:'Mật khẩu không đúng'
               });
               return;
           }
        }
        else{
            res.render('sites/login',{
                err:'Email chưa được đăng ký'
            });
            return;
        }
        
        
    }
    getEditUser(req,res,next){
        User.findById(req.userid,(err,docs)=>{
            if(err)
                res.send("lỗi rồi");
            else{
                res.render("sites/editUser",{
                    user:docs.toObject(),
                })
            }    
        }) 
    }
    // get forgot password
    getForgotPassword(req,res){
        res.render('sites/forgotPassword')
    }
    async postForgotPassword(req,res){
        let user  = await User.findOne({email:req.body.email});
        return;
    }
    postEditUser(req,res,next){
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
              console.log("A Multer error occurred when uploading."); 
            } else if (err) {
              console.log("An unknown error occurred when uploading." + err);
            }else{
               
                console.log(req.file);
                if(req.file){
                    const arrfile = req.file.filename;
                    User.updateOne({_id:req.params.id},{
                    username:req.body.username,
                    phone:req.body.phone,
                    image:arrfile
                    })
                    .then(data=> {return res.redirect('/user')})
                    .catch(err=>{return res.send("loi roi")});
                }
                else{
                    User.updateOne({_id:req.params.id},{
                        username:req.body.username,
                        phone:req.body.phone,
                        })
                    .then(data=> {return res.redirect('/user')})
                    .catch(err=>{return res.send("loi roi")});
                }
                
            }
        })
    }
    //PUT EDIT PASSWORD
    async putEditPassword(req,res){
            const findUser = await User.findById(req.params.id);
            if(findUser){
                
                const validate = await bcrypt.compare(req.body.oldpassword,findUser.password)
                if(validate)
                    if(req.body.newpassword != req.body.confirmpassword){
                        res.render("sites/editpassword",{
                            user:findUser.toObject(),
                            error:"password incorrect"
                        })
                    }
                    else{
                        //hash password
                        const salt = await bcrypt.genSalt(10);
                        const hashPassword = await bcrypt.hash(req.body.newpassword, salt);
                        const updatepassword = await User.updateOne({_id:findUser._id},{
                            password:hashPassword
                        })
                        if(updatepassword)
                            res.redirect('/user')
                        else{
                            res.render("sites/editpassword",{
                                user:findUser.toObject(),
                                error:"Update password failed"
                            })
                        }    
                    }
                else{
                    res.render("sites/editpassword",{
                        user:findUser.toObject(),
                        error:"wrong old password"
                    })
                }
            }  


    }
    //GET EDIT PASSWORD
    getEditPassword(req,res){

        User.findById(req.userid,(err,docs)=>{
            if(err)
                res.send("lỗi rồi");
            else{
                res.render("sites/editpassword",{
                    user:docs.toObject(),
                })
            }    
        }) 
    }
    //GET ADMIN ADD CATEGORY
    getAddCategory(req,res){
        User.findById(req.userid,(err,docs)=>{
            if(err)
                res.send("lỗi rồi");
            else{
                res.render("admin/addCategory",{
                    user:docs.toObject(),
                })
            }    
        }) 
    }
    async postAddCategory(req,res){
        const dm = await new  category({
            name:req.body.category,
        })
        const user  = await User.findById(req.userid);
        dm.save()
        .then(data=>{
            res.render('admin/addCategory',{
                user:user.toObject(),
                success:"Thêm thành công"
            })
        }) 
        .catch(data=>{
            res.render('admin/addCategory',{
                user:user.toObject(),
                success:"Thêm thất  bại"
            })
        }) 
    }
    async getListUser(req,res){
        const admin = await User.findById(req.userid);
        console.log(admin);
        const listuser = await User.find({permission:0});
        if(admin){
            res.render("admin/listUser",{
                user:admin.toObject(),
                listuser:arraytoObject(listuser)
            })
        }
    }
    //DELETE USER
    async deleteListUser(req,res){
        const deleteuser = await User.deleteOne({_id:req.params.id})
        if(deleteuser)
            return res.redirect('/user/admin/list-user');     
    }
    //get logout
    logout(req,res){
        res.clearCookie('userID');
        res.redirect('/user/login');
    }
    // getStatistical
    getStatistical(req,res){
        User.findById(req.userid,(err,docs)=>{
            if(err)
                res.send("lỗi rồi");
            else{
                
                res.render("sites/statistical",{
                    user:docs.toObject(),
                })
            }    
        }) 
        
    }
    //get vote area
    getVote(req,res){
        Vote.find().then(votes=>{
            res.json({
                success:true,
                votes:votes
            })
        })
    }
    
} 

module.exports = new SiteController;