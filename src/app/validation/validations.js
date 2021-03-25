const Joi = require('@hapi/joi');

class Validation {
    registerValidation(data){
        const schema = Joi.object({
            username: Joi.string().min(6).required(),
            email: Joi.string().min(6).required().email(),
            phone : Joi.string().min(10).max(10).required(),
            password: Joi.string().min(6).required(),
            password2: Joi.string().min(6).required(),
          });
          return schema.validate(data);
    }
    loginValidation(data){
        const schema = Joi.object({ 
            email: Joi.string().min(6).required().email(),         
            password: Joi.string().min(6).required(),            
          });
          return schema.validate(data);
    }
}

module.exports = new Validation;
