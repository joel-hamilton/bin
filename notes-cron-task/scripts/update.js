const Notes = require("./notes");
const moment = require("moment");

module.exports = class Update {
  constructor() {
    this.notes = new Notes();
  }

  async run() {
    const list = await this.notes.getFileList();
    await Promise.all(list.map((notePath) => this.updateNote(notePath)));
  }

  async updateNote(notePath) {
    console.log(this);
    const content = await this.notes.getFileContent(notePath);
    const newContent = this.runFns(content);
    // save note
  }

  runFns(content) {
    // `Started coming to WLA ago(April 2020/two years ago). Blah blah blah.`
    // `Smithy is age(April 2020/2 and a half). Blah blah blah.`
    const fnDefinitions = [
      { name: "ago", fn: this.parseAgo.bind(this) },
      { name: "age", fn: this.parseAge.bind(this) },
    ];

    for (let fnDefinition of fnDefinitions) {
      const regex = new RegExp(`${fnDefinition.name}\\(([^\)]*)\\)`, "g");
      const matches = [...content.matchAll(regex)];
      if (matches) {
        for (const match of matches) {
          const fnDef = match[0];
          const param = match[1];
          const index = match.index;
          const value = fnDefinition.fn(param);
          console.log(value);
        }
      }
    }
  }

  parseAge(dateString) {
      const agoString = this.parseAgo(dateString);
      return agoString.replace('ago', 'old');
  }

  parseAgo(dateString) {
    return moment(dateString).fromNow();
  }
};
