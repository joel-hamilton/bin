const Update = require("../scripts/update");
const fileList = require("../test/fileList");

describe("Updates", () => {
  let update;

  beforeEach(() => {
    update = new Update();
  });

  describe("updateNote", () => {
    // test that it loads a file list, calls out to save a file
  });

  describe("runFn", () => {
    it("correctly replaces function strings with updated values", () => {
      const content = `Testing doubleupper(joel) and doubleupper(joel ~ JOELJOEL)`;
      const updatedContent = update.runFn(content, "doubleupper", (param) =>
        (param + param).toUpperCase()
      );
      expect(updatedContent).toEqual(
        "Testing doubleupper(joel ~ JOELJOEL) and doubleupper(joel ~ JOELJOEL)"
      );
    });
  });
});
