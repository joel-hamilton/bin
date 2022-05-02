const Notes = require("../scripts/notes");
const fileList = require("../test/fileList");
const path = require("path");

describe("Notes", () => {
  let notes;

  beforeEach(() => {
    notes = new Notes();
    process.env.NOTES_PATH = path.resolve("./test/mock-files");
  });

  describe("getFileList", () => {
    it("throws an error if no NOTES_PATH env", async () => {
      delete process.env.NOTES_PATH;
      await expect(notes.getFileList()).rejects.toEqual(
        new Error("no NOTES_PATH")
      );
    });

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
