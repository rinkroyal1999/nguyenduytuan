const jwt = require('jsonwebtoken'); 
const user = require('../app/models/user');
const User = require('../app/models/user');
module.exports.auth = function(req,res,next) {
    const token = req.cookies.userID;
    if(!token){
        next();
        return;
    }
        
    try {
        jwt.verify(token,process.env.TOKEN_SCRET,(err,decoded)=>{
            if(err){
                console.log(err);
                return;
            };
            User.findOne({_id : decoded.userid})
            .then(user=>{ 
                req.userid = user.id;
                res.redirect('/user');
                return
            })
            .catch(err=>console.log(err))
        })

    } catch (error) {
        res.status(401).send('lỗi rồi')
    }    
}