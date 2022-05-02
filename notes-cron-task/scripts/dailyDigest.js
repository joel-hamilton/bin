// Send a daily digest email with selection frrom Box1/2/3

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const showdown = require("showdown");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const Notes = require('./notes');

module.exports = class DailyDigest {
  constructor() {
    this.priorityContent = {
      LOW: [], // box3,
      MEDIUM: [], // box2,
      HIGH: [], // box3
    };

    this.htmlContent = "";
    this.notes = new Notes();
  }

  async run() {
    if (process.env.NODE_ENV !== "test" && !process.env.AWS_ACCESS_KEY_ID) {
      throw new Error("no AWS_ACCESS_KEY_ID");
    }

    if (process.env.NODE_ENV !== "test" && !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error("no AWS_SECRET_ACCESS_KEY");
    }

    if (!process.env.NOTES_EMAIL) {
      throw new Error("no NOTES_EMAIL");
    }

    await this.processFiles();
    const rawContent = this.getRawContent();
    const sortedRawContent = this.sortByLength(rawContent);
    this.htmlContent = this.convertToHtml(sortedRawContent);

    if (process.env.NODE_ENV !== "test") {
      await this.sendEmail();
    }
  }

  async processFiles() {
    const files = await this.notes.getFileList();
    for (const file of files) {
      const content = await this.notes.getContent(file);
      this.addPriorityContent(path.basename(file, ".md"), content);
    }
  }

  addPriorityContent(filename, content) {
    function getPriorityBucket(string) {
      if (/\[\[box1\]\]/i.test(string)) {
        return "HIGH";
      }

      if (/\[\[box2\]\]/i.test(string)) {
        return "MEDIUM";
      }
      if (/\[\[box3\]\]/i.test(string)) {
        return "LOW";
      }
    }

    const firstLine = content.match(/^.*$/m)[0];
    const firstLinePriorityBucket = getPriorityBucket(firstLine);
    if (firstLinePriorityBucket) {
      this.priorityContent[firstLinePriorityBucket].push(
        `#${filename}\n\n${content}`
      );
    }

    const paragraphs = content.split(/\n\s*\n/);
    paragraphs.forEach((paragraph, i) => {
      if (firstLinePriorityBucket && i === 0) return;

      paragraph = paragraph.trim();
      const priorityBucket = getPriorityBucket(paragraph);

      if (priorityBucket) {
        this.priorityContent[priorityBucket].push(
          `#${filename}\n\n${paragraph}`
        );
      }
    });
  }

  getRawContent() {
    let content = [];
    for (let bucket of ["HIGH", "HIGH", "HIGH", "MEDIUM", "MEDIUM", "LOW"]) {
      const itemRand = getRandomInt(0, this.priorityContent[bucket].length - 1);
      content.push(this.priorityContent[bucket][itemRand]);
    }

    return content;

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  }

  sortByLength(stringArr) {
    return stringArr.sort((a, b) => (a.length > b.length ? 1 : -1));
  }

  convertToHtml(rawContent) {
    let html = [];
    for (let md of rawContent) {
      const converter = new showdown.Converter();
      html.push(converter.makeHtml(md));
    }

    return html.join("\n<hr>\n");
  }

  async sendEmail() {
    const client = new SESClient({ region: "ca-central-1" });
    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [process.env.NOTES_EMAIL],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: this.htmlContent,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Daily Digest",
        },
      },
      Source: process.env.NOTES_EMAIL,
    });

    await client.send(command);
  }

  getEnv(prop) {
    return process.env[prop];
  }
};
