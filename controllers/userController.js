const User = require("../models/user");
const bigPromise = require('../middleware/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require("../utils/cookieToken")
const fileUpload = require('express-fileupload');
const mailHelper = require("../utils/emailHelper");
const crypto = require('crypto');
const { nextTick } = require("process");
const user = require("../models/user");
const userMiddleware = require("../middleware/user");
const { findByIdAndDelete, findById } = require("../models/user");

exports.signup = bigPromise(async (req, res, next)=>{
    const { name, email, password }=req.body;    
    
 /*   let result;
    if(req.files){
        let file = req.files.photo;
        result = await cloudinary.v2.uploader.upload(file,{
            folders: "users",
            width: 150,
            crop: "scale"
        });
    }
*/
    if(!(email && password))
    {
        return next(new CustomError('Invalid Credentials', 400));            
    }

    const user = await User.create({
        name,
        email,
        password,
    })
    
    cookieToken(user,res);
});

exports.login = bigPromise(async (req, res, next)=>{
    const { email, password } = req.body;

    if(!(email && password)){
        return next(new CustomError('Enter credentials',400))
    }

    //Select is called because we have turned select as false
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new CustomError('Invalid email or Password'))
    }

    if(!(await user.isValidPassword(password))){
        return next(new CustomError('Invalid email or Password'))
    }

    cookieToken(user,res);
})

exports.logout = bigPromise(async (req, res, next)=>{
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    res.status(200).json({
        success: true,
        message: "Logout Success"
    });
});

exports.forgotPassword = bigPromise(async (req, res, next)=>{
    const { email } = req.body;
    
    const user = await User.findOne(email)
    if(!user)
    {
        return next(new CustomError('Email does not exist'))
    }

    const forgotToken = user.getForgotPassword()

    await user.save({validateBeforeSave: false});


    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

    const message = `Open this link URL \n\n ${myUrl}`;

    try{
        await mailHelper({
            email: user.email,
            subject: "Password reset email",
            message
        })
    }catch(error){
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({validateBeforeSave: false});

        return next(new CustomError(error.message, 500));
    }
});

exports.resetPassword = bigPromise(async (req,res,next)=>{
    const token  = req.params.token;

    const encryToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    User.findOne({encryToken ,
        forgotPasswordExpiry: {$gt: Date.now()}
    })

    if(!user){
        return next(new CustomError('Token Expired'));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new CustomError('Password do not match',400))
    }

    user.password = req.body.password;

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    //Send json response, or send Token

    cookieToken(user,res);
    
});

exports.getLoggedInUserDetails = bigPromise(async (req, res, next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
});

exports.passwordUpdate = bigPromise(async (req, res, next)=>{
    const userId = req.user.id;
    const user = await User.findById(userId).select("+password");

    const { oldPassword, newPassowrd } = req.body;

    const isCorrectPassword = await user.isValidPassword(oldPassword);

    if(!isCorrectPassword){
        return next(new CustomError('Password Incorrect',400));
    }
    
    user.password = newPassowrd;

    await user.save();

    cookieToken(user,res);
});

exports.updateUser = bigPromise(async (req, res, next)=>{
  
    const { name, email } = req.body;
    const newData = {
        name,
        email
    };
    
    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true
    })
});

exports.adminAllUser = bigPromise(async (req, res, next)=>{
    //Shows all users
    //Return an array of users named users
    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    });
});

exports.managerUsers = bigPromise(async (req, res, next)=>{
    const users = await User.find({role: 'user'}).select('name');
    
    res.status(200).json({
        success: true,
        users
    })
});

exports.admingetOneUser = bigPromise(async (req, res, next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        next(new CustomError('No User Found',400));
    }

    res.json({
        success: true,
        user
    })
});

exports.adminUpdateUser = bigPromise(async (req, res, next)=>{
    
    const { name, email, role} = req.body;

    const Data = {
        name,email,role
    };

    const user = await User.findByIdAndUpdate(req.params.id, Data, {
        new: true,
        runValidators: true,
    });

    res.json({
        success: true,
        user
    })
});

exports.admingetDeleteUser = bigPromise(async (req, res, next)=>{
    const user = await findById(req.params.id);

    if(!user){
        return next(new CustomError('No Such user exists',401));
    }

    await user.remove();

    res.status(200).json({
        success: true
    })
});