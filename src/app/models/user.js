const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    username:{
        type:String,
        required:true,
        minlength:6
    },
    email:{
        type:String,
        require:true,
        minlength:6
    },
    phone:{
        type:String,
        require:true,
        minlength:6
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    permission:{
        type:Number,
        default:0
    },
    image:{
        type:String,
        default:'https://loremflickr.com/50/50'
    }
},{
    timestamps:true
});
module.exports  = mongoose.model('User',user);