'use strict';

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
    auth: {
    user: 'nodeappcl@gmail.com',
    pass: 'Testing1234'
  }
});

// Note: if you change email address please update the setting via the following url under the email account.
// https://myaccount.google.com/lesssecureapps

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _send_email(email='', tsubject='', body=''){

  var mailOptions = {
    from: 'Do Not Reply<nodeappcl@gmail.com>',
    to: email,
    subject: tsubject,
    html: body
  };

  await transporter.sendMail(mailOptions, function(error, info){
    /*if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }*/
  }); 
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////


module.exports = {
  send_email : (email, subject, body) => {
    _send_email(email, subject, body);        
  }
}