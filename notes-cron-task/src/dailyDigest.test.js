const DailyDigest = require("../src/dailyDigest.js");
const fileList = require("../_test/fileList");

describe("DailyDigest", () => {
  let dailyDigest;

  beforeEach(() => {
    dailyDigest = new DailyDigest();
    process.env.TEST_VAR = "test";
    process.env.PRIORITY_NOTES_PER_DAY = 2;
    process.env.NOTES_EMAIL = "test@example.com";
    process.env.NOTES_PATH = "/tmp/notes";
  });

  describe("parsing content", () => {
    const TITLE = "test title";
    let dailyDigest;

    beforeEach(() => {
      dailyDigest = new DailyDigest();
    });

    it('adds entire content if "[[box...]]" on first line', () => {
      const contentLow = `[[Box3]] [[Done]]
Author: [[Donella Meadows]]`;

      const contentMedium = `first line [[box2]]
Author: [[Donella Meadows]]`;

      const contentHigh = `first line [[box1]]
Author: [[Donella Meadows]] [[Box1]]`;

      dailyDigest.addPriorityContent(TITLE, contentLow);
      dailyDigest.addPriorityContent(TITLE, contentMedium);
      dailyDigest.addPriorityContent(TITLE, contentHigh);
      expect(dailyDigest.priorityContent).toEqual({
        LOW: [
          `# ${TITLE}

${contentLow}`,
        ],
        MEDIUM: [
          `# ${TITLE}

${contentMedium}`,
        ],
        HIGH: [
          `# ${TITLE}

${contentHigh}`,
        ],
      });
    });

    it("adds only the current paragraph, if [[box...]] not in first line", () => {
      const expectedValueLow = `I'm a quote - Voltaire [[Box3]]`;
      const allContentLow = `I'm some
    content.
    
    ${expectedValueLow}`;

      const expectedValueMedium = `[[box2]] I'm a quote - Voltaire`;
      const expectedValueHigh = `I'm a quote - [[Box1]] Voltaire`;

      const allContentMediumAndHigh = `I'm some
    content.
    
    more stuff

    ${expectedValueHigh}

    ${expectedValueMedium}`;

      dailyDigest.addPriorityContent(TITLE, allContentLow);
      dailyDigest.addPriorityContent(TITLE, allContentMediumAndHigh);

      expect(dailyDigest.priorityContent).toEqual({
        LOW: [`# ${TITLE}\n\n${expectedValueLow}`],
        MEDIUM: [`# ${TITLE}\n\n${expectedValueMedium}`],
        HIGH: [`# ${TITLE}\n\n${expectedValueHigh}`],
      });
    });

    it("adds content multiple times if [[box...]] in multiple paragraphs", () => {
      const contentMedium = `things that are
of medium
importance
[[box2]]`;

      const contentLow = `[[box3]]
    
and more stuff
    
    ${contentMedium}`;

      dailyDigest.addPriorityContent(TITLE, contentLow);
      expect(dailyDigest.priorityContent).toEqual({
        LOW: [
          `# ${TITLE}

${contentLow}`,
        ],
        MEDIUM: [
          `# ${TITLE}

${contentMedium}`,
        ],
        HIGH: [],
      });
    });
  });

  describe("sorting/selecting content", () => {
    let dailyDigest;

    beforeEach(() => {
      dailyDigest = new DailyDigest();
    });

    it("sorts priority content by length", () => {
      const strArr = ["bye", "hi", "nope"];
      const expectedOutput = ["hi", "bye", "nope"];
      expect(dailyDigest.sortByLength(strArr)).toEqual(expectedOutput);
    });

    it("adds raw content", () => {
      // TODO check selection is valid
      dailyDigest.priorityContent = {
        LOW: ["a", "b", "c"],
        MEDIUM: ["d", "e", "f"],
        HIGH: ["g", "h", "i"],
      };

      const content = dailyDigest.getRawContent();
      expect(content).not.toBeUndefined();
    });

    it("converts markdown to html", () => {
      const input = `# test title
## subheading
    
- bullet list
- item2
    `;

      const output = dailyDigest.convertToHtml([input]);

      const expectedOutput = `<h1 id="testtitle">test title</h1>
<h2 id="subheading">subheading</h2>
<ul>
<li>bullet list</li>
<li>item2</li>
</ul>`;

      expect(output).toEqual(expectedOutput);
    });
  });
});
