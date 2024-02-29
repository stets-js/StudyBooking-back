const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // create a transporter

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    service: process.env.EMAIL_SERVICE,
    port: 587,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
    // activate in gmail 'less secure app' option
  });
  //Define the email options
  const mailOptions = {
    from: 'Booking',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<h1>Forgot password?</h1>` + options.html
  };
  // send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
