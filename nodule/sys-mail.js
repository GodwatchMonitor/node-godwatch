const nodemailer = require('nodemailer');
const errors = require('restify-errors');

const Config = require('../models/configuration');
const MainConf = require('../models/mainconf');
const Recipient = require('../models/recipient');

function sendAlert(id, mess){

  Recipient.findOne({ rid: id }, function(err, doc){
    if(err){
      console.error(err.red);
      return next(
        new errors.InvalidContentError(err.errors.name.message)
      );
    }

    if(doc != null){ // If it DOES exist

      MainConf.findOne({ blip: 1 }, function(err, mc) {
        if(err){
          console.error(err.red);
          return next(
            new errors.InvalidContentError(err.errors.name.message)
          );
        }

        Config.findOne({ cid: mc.currentconfig }, function(err, configuration) {
          if(err){
            console.error(err.red);
            return next(
              new errors.InvalidContentError(err.errors.name.message)
            );
          }

          var mailOptions = {
            from: configuration.mailuser,
            to: doc.address,
            subject: 'TEST',
            text: mess,
          };

          var transporter = nodemailer.createTransport({
            host: configuration.mailhost,
            port: configuration.mailport,
            secureConnection: configuration.securemail,
            auth: {
              user: configuration.mailuser,
              pass: configuration.mailpass
            },
            tls: {
              rejectUnauthorized: configuration.mailRejectUnauthorized
            }
          });

          transporter.sendMail(mailOptions, function(err, info){
            if(err){
              return console.log("ERROR".red, err);
            }
            console.log('Alert Sent to ' + doc.address + ': ' + info.response + ' | Message: ' + mess);
          });

        });

      });

      }
      
  });

}

module.exports = {sendAlert}
