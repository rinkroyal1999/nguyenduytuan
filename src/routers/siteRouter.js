const siteController = require('../app/controllers/siteController');
const homeController  = require('../app/controllers/HomeController');
const express = require('express');
const router = express.Router();
const Auth = require('./auth');
const Authlogin = require('./authlogin');

router.get('/login',Authlogin.auth,siteController.login);
router.get('/register',siteController.register);
//post login
router.post('/login',siteController.postLogin);
// post register
router.post('/register',siteController.postRegister);
//get add home
router.get('/add-home',Auth.auth,homeController.addHome);
//post add home
router.post('/add-home',Auth.auth,homeController.postaddHome);

//get update home
router.get('/edit-home/:id',Auth.auth,homeController.updateHome);
//put update home
router.put('/edit-home/:id',Auth.auth,homeController.postUpdateHome);
//delete home
router.delete('/delete-home/:id',homeController.deleteHome);
//get edit user
router.get('/editUser/:id',Auth.auth,siteController.getEditUser)
//post edit user
router.put('/editUser/:id',Auth.auth,siteController.postEditUser)
//get forgot password
router.get('/forgot',siteController.getForgotPassword)
//post forgot password 
router.post('/forgot',siteController.postForgotPassword)
//get logout
//get edit pasword
router.get('/editpassword/:id',Auth.auth,siteController.getEditPassword)
//put edit password
router.put('/editpassword/:id',Auth.auth,siteController.putEditPassword)
// admin get list user
router.get('/admin/list-user',Auth.auth,siteController.getListUser)
// admin delete list user
router.delete('/admin/delete-user/:id',Auth.auth,siteController.deleteListUser)
//get admin add category
router.get('/admin/add-category',Auth.auth,siteController.getAddCategory)
//post add adđ category
router.post('/admin/add-category',Auth.auth,siteController.postAddCategory)
//get chartjs
router.get('/statistical',Auth.auth,siteController.getStatistical)
//get vote
router.get('/vote',Auth.auth,siteController.getVote)
router.get('/logout',siteController.logout);
router.get('/',Auth.auth,siteController.index);


module.exports = router;