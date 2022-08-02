
export function emailResetCode(email: string, newResetcode: string) {
  const nodemailer = require('nodemailer');

  // defines the transport oobject that nodemailer uses
  // to send emails, currently set to mailtrap SMTP server
  // for testing
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '1369792c5646c2',
      pass: '52934923474d4e'
    }
  });

  // define the message to be sent
  const message = {
    from: 'from-example@email.com',
    to: email,
    subject: 'UNSW Treats Passoword Reset Requested',
    text: newResetcode
  };

  transport.sendMail(message);
}
