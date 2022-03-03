const mongoose = require('mongoose');

const connection = () =>{ 
    mongoose.connect('mongodb://localhost:27017/ecomm',{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log(`Db Connection Successfull`))
    .catch(error=>{
        console.log(`Connection Issues`);
        console.log(error);
        process.exit(1)
    });
};

module.exports=connection;