const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sojusesu@gmail.com",
    pass: "siandienyra22", // naturally, replace both with your real credentials or an application-specific password
  },
});

module.exports.SendRealEmail = (receiver, html, title) => {
  const mailOptions = {
    from: "testemail@gamil.com",
    to: receiver,
    subject: title,
    html: html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
