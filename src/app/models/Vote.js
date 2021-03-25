const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voteSchema = new Schema({
    area:{
        type:String,
        required:true
    },
    points:{
        type:String,
        required:true
    }
},{
    timestamps:true
});

//create  collection and add Schema
module.exports  = mongoose.model('Vote',voteSchema);    
