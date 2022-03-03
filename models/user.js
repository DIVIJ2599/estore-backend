const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt=require('bcryptjs');
const { Schema }=mongoose;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new Schema({
    name:{
        type: String,
        required: [true,'Field cannot be empty'],
    },
    email:{
        type: String,
        required: [true,'Field cannot be empty'],
        unique: true,
        validate: [validator.isEmail,'Invalid email']
    },
    password:{
        type: String,
        required: true,
        minlength: [8,'Password cannot be shorter than eight'],
        select: false
    },
    role:{
        type: String,
        default: 'user'
    },
    photo: {
        id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

//encrypt password-HOOKS
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password,10);
})

//Validate the password with user password - Will return true or false 
userSchema.methods.isValidPassword = async function(userPassword){
   return await bcrypt.compare(userPassword,this.password)
}

userSchema.methods.getJwtToken = function(){
    return jwt.sign({id: this._id},process.env.SECRET,{
        expiresIn: process.env.JWT_EXPIRY,
    });
}

userSchema.methods.getForgotPassword = function(){
    const forgotToken = crypto.randomBytes(20).toString('hex');

    // getting a hash - make sure to get a hash on backend as well
    this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

    //time of expiry
    this.forgotPasswordExpiry = Date.now() + 20*60*1000;

    return forgotToken;
}


module.exports = mongoose.model('User',userSchema);