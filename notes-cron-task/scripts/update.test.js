const Update = require("../scripts/update");
const fileList = require("../test/fileList");

describe("Updates", () => {
  let update;

  beforeEach(() => {
    update = new Update();
  });

  describe('updateNote', () => {
    // test that it loads a file list, calls out to save a file
  });

  describe('runFns', () => {
    it('runs fns', () => {
      const content = `Testing ago(2020-01-01), and age(Feb 1987)`
      update.runFns(content);
      //
    })
  })
});
