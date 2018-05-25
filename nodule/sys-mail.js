const nodemailer = require('nodemailer');
const errors = require('restify-errors');

const transporter = nodemailer.createTransport({
  host: '',
  port: 465,
  secureConnection: true,
  auth: {
    user: '',
    pass: ''
  },
  tls: {
    rejectUnauthorized: false
  }
});

function sendVerificationEmail(user, secrets){
  var mailOptions = {
    from: '"Samusoidal Games" <info@samusoidal.com>',
    to: secrets.email,
    subject: 'Verify your Samusoidal account',
    text: '',
    html: ``

  };

  transporter.sendMail(mailOptions, function(err, info){
    if(err){
      return console.log(err);
    }
    console.log('User Verification Sent: ' + info.response + ' | User: ' + user.username);
  });
}

module.exports = {sendVerificationEmail}
