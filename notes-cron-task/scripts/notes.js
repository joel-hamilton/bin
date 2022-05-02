const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const glob = require("glob");
const { promisify } = require("util");
const fs = require("fs");

module.exports = class Notes {
  constructor() {}

  async getFileList() {
    if (!process.env.NOTES_PATH) {
      throw new Error("no NOTES_PATH");
    }

    const files = await promisify(glob)(process.env.NOTES_PATH + "/**/*.md");
    return files;
  }

  async getContent(filePath) {
    return await promisify(fs.readFile)(filePath, "utf-8");
  }

  async putContent(filePath, content) {
    return await promisify(fs.writeFile)(filePath, content);
  }
};
