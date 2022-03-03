require('dotenv').config();

const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

//express specific middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//file middleware
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

//morgan middleware
app.use(morgan("tiny"));

//import routes here
const home = require('./routes/home');
const user = require('./routes/user');
const product = require('./routes/product');
const payment = require('./routes/payment');


app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("api/v1", payment);

module.exports=app;