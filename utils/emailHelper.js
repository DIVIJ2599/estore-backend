const nodemailer = require('nodemailer');

const mailHelper = async (options) => {
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMPT_PORT,
        secure: false, 
        auth: {
          user: process.env.SMTP_USER, // generated ethereal user
          pass: process.env.SMTP_PASS, // generated ethereal password
        },
      });
    
      const message = {
      //Enter email  from: '', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.message, // plain text body
        //html: "<a>Hello world?</a>", 
      }
      // send mail with defined transport object
       await transporter.sendMail(message);
}

module.exports = mailHelper;