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
    const content = await this.notes.getContent(notePath);
    const newContent = this.runFns(content);

    if (content !== newContent) {
      console.log({ notePath, newContent });
      await this.notes.putContent(notePath, newContent);
    }
  }

  runFns(content) {
    const fnDefinitions = [
      { name: "ago", fn: this.parseAgo.bind(this) },
      { name: "age", fn: this.parseAge.bind(this) },
      { name: "for", fn: this.parseFor.bind(this) },
    ];

    for (let fnDefinition of fnDefinitions) {
      content = this.runFn(content, fnDefinition.name, fnDefinition.fn);
    }

    return content;
  }

  // for all instances of `$fnName($param)` in string, call fn with params and
  // replace with `$fnName($param [returnedValue])`
  runFn(content, fnName, fn) {
    const regex = new RegExp(`${fnName}\\(([^\)]*)\\)`, "g");
    const matches = [...content.matchAll(regex)];
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const fnDef = match[0];
      const param = match[1].split("~")[0].trim(); // split param from previous fnReturnValue
      const index = match.index;
      let fnReturnValue;

      try {
        fnReturnValue = fn(param);
      } catch (e) {
        console.log(`Skipping ${fnDef}`, e);
        continue;
      }

      const newFnDef = `${fnName}(${param} ~ ${fnReturnValue})`;

      content =
        content.substring(0, index) +
        newFnDef +
        content.substring(index + fnDef.length);
    }

    return content;
  }

  parseAgo(dateString) {
    const date = moment(dateString);
    if (!date.isValid()) {
      throw new Error("Invalid date");
    }

    return moment(dateString).fromNow();
  }

  parseAge(dateString) {
    const agoString = this.parseAgo(dateString);
    return agoString.replace("ago", "old");
  }

  parseFor(dateString) {
    const agoString = this.parseAgo(dateString);
    return 'for ' + agoString.replace("ago", "").trim();
  }
};
