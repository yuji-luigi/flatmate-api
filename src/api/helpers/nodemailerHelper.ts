import Mail from 'nodemailer/lib/mailer';
import vars from '../../config/vars';

import nodemailer from 'nodemailer';

// const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN';

const auth = {
  user: vars.gmailAddress,
  pass: vars.gmailAppPassword
};

export async function notifyMaintainerByEmail({ maintainer }: { maintainer: MaintainerInterface }) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth
    });

    const mailOptions: Mail.Options = {
      from: vars.displayMail,
      to: maintainer.email,
      subject: 'Subject',
      text: ''
      // html: '<h1>HTML content</h1>'
    };
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + result.response);
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function _() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: vars.gmailAddress,
        pass: vars.gmailAppPassword
      }
    });
    const mailOptions = {
      from: vars.displayMail,
      to: vars.testMail,
      subject: 'Subject',
      text: 'Email content'
    };
    const result = await transporter.sendMail(
      mailOptions /* , function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        // do something useful
      }
    } */
    );
    console.log('Email sent: ' + result.response);
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
