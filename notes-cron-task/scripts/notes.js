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

  async getFileContent(file) {
    return await promisify(fs.readFile)(file, "utf-8");
  }
};
