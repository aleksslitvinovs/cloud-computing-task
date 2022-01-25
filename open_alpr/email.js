import nodemailer from "nodemailer";

const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user, // generated ethereal user
    pass: testAccount.pass, // generated ethereal password
  },
});


// TODO: Check if this really works
// console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// https://nodemailer.com/about/
export const sendDurationEmail = (plate, duration) => {
  transporter
    .sendMail({
      from: { name: "Open ALPR", address: "alpr@alpr.com" },
      to: "a.litvinovs123@gmail.com",
      subject: `Your parking duration for car '${plate}'`,
      // TODO: Use better duration format
      text: `Duration: ${duration.asHours()} h ${duration.asMinutes()} m ${duration.asSeconds()} s`,
    })
    .then((value) => console.log(value))
    .catch((err) => console.error(err));
};
