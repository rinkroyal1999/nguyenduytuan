const { mapReduce } = require("../app/models/user")

module.exports = {
    arraytoObject:function (params) {
        return params.map(data=>data.toObject());
    }

};

