require('dotenv').config();
const app = require('./app');
const connectWithDB = require('./config/databse');
const cloudinary = require('cloudinary');

connectWithDB();

//cloudinary config here
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.listen(process.env.PORT,()=>{
    console.log(`Port ${process.env.PORT}`);
})