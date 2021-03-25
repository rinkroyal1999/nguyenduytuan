const Auth = require('./auth');
const mainController = require('../app/controllers/mainController');
const homeController = require('../app/controllers/homeController');
const express = require('express');
const router = express.Router();



//get all homes sort
router.get('/product/sort',Auth.authUser,homeController.getHomeSort);
//get all homes
router.get('/product',Auth.authUser,homeController.getAllHome);
//get home detail
router.get('/product/:id/detail',Auth.authUser,homeController.getHomeDetail);
//get home area
router.get('/product/info',Auth.authUser,homeController.getHomeInfo)
router.post('/product/contact',homeController.sendEmailHome)
router.get('/',mainController.index);
module.exports = router;

