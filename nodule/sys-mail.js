const nodemailer = require('nodemailer');
const errors = require('restify-errors');

const Config = require('../models/configuration');
const MainConf = require('../models/mainconf');
const Recipient = require('../models/recipient');

function sendAlerts(subject, mess){

  MainConf.findOne({ blip: 1 }, function(err, mc) {

    if(err){
      console.error("ERROR".red, err);
      return next(
        new errors.InvalidContentError(err)
      );
    }

    Config.findOne({ cid: mc.currentconfig }, function(err, configuration) {

      if(err){
        console.error("ERROR".red, err);
        return next(
          new errors.InvalidContentError(err)
        );
      }

      Recipient.apiQuery({}, function(err, docs){

        if(err){
          console.error("ERROR".red, err);
          return next(
            new errors.InvalidContentError(err)
          );
        }

        if(docs != null){ // If there are recpients

          for(var i=0; i < docs.length; i++){

            let doc = docs[i];

            var mailOptions = {
              from: configuration.mailuser,
              to: doc.address,
              subject: subject,
              text: mess,
            };

            var transporter = nodemailer.createTransport({
              name: 'Godwatch',
              host: configuration.mailhost,
              port: configuration.mailport,
              secure: configuration.securemail,
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

              //console.log('Alert Sent to ' + doc.address + ': ' + info.response + ' | Message: ' + mess);

            });

          }

        }

      });

    });

  });

}

module.exports = {sendAlerts}
