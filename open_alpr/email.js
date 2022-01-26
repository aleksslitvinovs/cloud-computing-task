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

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

const formatDuration = (duration) => {
  if (duration.asHours() < 1) {
    if (duration.asMinutes() < 1) {
      return `${duration.seconds()} seconds`;
    }

    return `${duration.minutes()} minutes ${duration.seconds()} seconds`;
  }

  return `${duration.hours()} hours ${duration.minutes()} minutes ${duration.seconds()} seconds`;
};

export const sendDurationEmail = (plate, duration) => {
  return transporter
    .sendMail({
      from: { name: "Open ALPR", address: "alpr@alpr.com" },
      to: testAccount.user,
      subject: `Your parking duration for car '${plate}'`,
      text: `Duration: ${formatDuration(duration)}`,
    })
    .then((value) => console.log(nodemailer.getTestMessageUrl(value)));
};
