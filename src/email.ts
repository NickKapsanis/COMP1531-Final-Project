
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  // was having lots of issues with maximum sessions and emails so these limit
  maxConnections: 1,
  pool: true,
  // defie the host and login to the email to send from
  host: 'smtp-mail.outlook.com', // hostname
  secureConnection: false, // TLS requires secureConnection to be false
  port: 587, // port for secure SMTP
  tls: {
    ciphers: 'SSLv3'
  },
  auth: {
    user: 'm13aboost.passwordreset@hotmail.com',
    pass: 'ThisIsATestingAccount123'
  }
});
  // defines the transport oobject that nodemailer uses
  // to send emails, currently set to mailtrap SMTP server
  // for testing
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.mailtrap.io',
//     port: 2525,
//     auth: {
//       user: '1369792c5646c2',
//       pass: '52934923474d4e'
//     }
//   });
// actual transporter object for use with email.
// const transporter = nodemailer.createTransport({
//     service: 'SendPulse',
//     auth: {
//       user: 'm13aboost.testingemail@gmail.com',
//       pass: 'ThisIsATestingAccount123'
//     }
//   });

// email reset code will check when the last call was made to send an email, and wait 11 seconds to avoid triggering spam filter
// and getting the email blocked.
export function emailResetCode(email: string, newResetcode: string, timeToWait: number) {
  // execute the rest after timeToWait;
  setTimeout(() => {
    // define the message to be sent
    const message = {
      from: 'm13aboost.passwordreset@hotmail.com',
      to: email,
      subject: 'UNSW Treats Passoword Reset Requested',
      text: newResetcode
    };

    transporter.sendMail(message, function(error: any, info: any) {
      if (error) {
        return console.log(error);
      }
      console.log('message sent: ' + info.response);
    });
  }, timeToWait);
}
