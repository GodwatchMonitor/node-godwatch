const nodemailer = require('nodemailer');
const errors = require('restify-errors');

const Config = require('../models/configuration');
const MainConf = require('../models/mainconf');
const Recipient = require('../models/recipient');

const Configurate = require('../nodule/configurate');
const Bunyan = require('../nodule/bunyan');

function sendAlerts(subject, mess){

  Configurate.getConfig(function(err, configuration){

    if(err){
      Bunyan.conclude("ERROR: ".red + err.red);
      return next(
        new errors.InvalidContentError(err)
      );
    }

    Recipient.apiQuery({}, function(err, docs){

      if(err){
        Bunyan.error("ERROR: ".red + err.red);
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
              return Bunyan.log("ERROR: ".red + err.red);
            }

          });

        }

      }

    });

  });

}

module.exports = {sendAlerts}
