const Notes = require("../src/notes");
const fileList = require("../_test/fileList");
const path = require("path");

describe("Notes", () => {
  let notes;

  beforeEach(() => {
    notesPath = path.resolve("./_test/mock-files");
    notes = new Notes(notesPath);
  });

  describe("getFileList", () => {
    it("iterates through files", async () => {
      await expect(notes.getFileList()).resolves.toEqual(fileList);
    });
  });

  describe("getContent", () => {
    it("loads file content correctly", async () => {
      await expect(notes.getContent(fileList[0])).resolves.toBe(
        "file content"
      );
    });
  });
});
