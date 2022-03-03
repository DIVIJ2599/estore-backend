const bigPromise = require('./bigPromise');
const User = require('../models/user');
const CustomError = require('../utils/customError');
const jwt = require('jsonwebtoken');

exports.isLoggedIn = bigPromise(async (req, res, next)=>{
    const token = 
    req.cookies.token || 
    req.header("Authorization").replace("Bearer ","");

    if(!token){
        return next(new CustomError('Please Login to continue',401));
    }

    const decoded = jwt.verify(token, process.env.SECRET);

    req.user = await User.findById(decoded.id); 

    next();
});

exports.customRole = (...roles) =>{
    return(req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new CustomError('Not Allowed',402));
        }
        next();
    };     
};

