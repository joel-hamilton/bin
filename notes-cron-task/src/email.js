const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

module.exports = class Email {
  async send(to, subject, html) {
    if (process.env.NODE_ENV !== "test" && !process.env.AWS_ACCESS_KEY_ID) {
      throw new Error("no AWS_ACCESS_KEY_ID");
    }

    if (process.env.NODE_ENV !== "test" && !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error("no AWS_SECRET_ACCESS_KEY");
    }

    const client = new SESClient({ region: "ca-central-1" });
    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: html,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: to,
    });

    await client.send(command);
  }
};
