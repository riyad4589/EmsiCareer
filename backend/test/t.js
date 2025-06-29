import nodemailer from "nodemailer";

const test = async () => {
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  let info = await transporter.sendMail({
    from: '"EMSI Test" <no-reply@emsi.ma>',
    to: "azzam.moo10@gmail.com",
    subject: "Test EMSI",
    html: "<b>Email test depuis Ethereal</b>",
  });

  console.log("✅ Email envoyé :", nodemailer.getTestMessageUrl(info));
};

test();
