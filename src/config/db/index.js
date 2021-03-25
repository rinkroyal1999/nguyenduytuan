const mongoose = require('mongoose');
require('dotenv').config();



async function connect(){
    try {
        await mongoose.connect(process.env.DB_CONNECT, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log('kết nối thành công');
    } catch (error) {
        console.log('kết nối thất bại');
    }
}

module.exports = connect; 