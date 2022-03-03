const BigPromise = require('../middleware/bigPromise');

//Big Promise can be replaced with simple try-catch
exports.home = BigPromise((req,res)=>{
    res.status(200).json({
        success: true,
        greetings: "Hello"
    })
})
