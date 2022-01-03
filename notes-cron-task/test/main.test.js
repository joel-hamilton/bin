const path = require("path");
const Task = require("../task.js");

describe("getting file content", () => {
  let task;

  beforeEach(() => {
    task = new Task();
    process.env.TEST_VAR = "test";
    process.env.NOTES_PATH = path.resolve("./test/mock-files");
    process.env.PRIORITY_NOTES_PER_DAY = 2;
    process.env.NOTES_EMAIL = "test@example.com";
  });

  it("loads env", async () => {
    await task.run();
    expect(task.getEnv("TEST_VAR")).toBe("test");
  });

  it("throws an error if no NOTES_PATH env", async () => {
    delete process.env.NOTES_PATH;
    await expect(task.run()).rejects.toEqual(new Error("no NOTES_PATH"));
  });

  it("throws an error if no NOTES_EMAIL env", async () => {
    delete process.env.NOTES_EMAIL;
    await expect(task.run()).rejects.toEqual(new Error("no NOTES_EMAIL"));
  });

  it("iterates through files", async () => {
    await expect(task.getFileList()).resolves.toHaveLength(3);
  });

  it("loads file content correctly", async () => {
    const files = await task.getFileList();
    await expect(task.getFileContent(files[0])).resolves.toBe("file content");
  });
});

describe("parsing content", () => {
  const TITLE = 'test title';
  let task;

  beforeEach(() => {
    task = new Task();
  });

  it('adds entire content if "[[box...]]" on first line', () => {
    const contentLow = `[[Box3]] [[Done]]
Author: [[Donella Meadows]]`;

    const contentMedium = `first line [[box2]]
Author: [[Donella Meadows]]`;

    const contentHigh = `first line [[box1]]
Author: [[Donella Meadows]] [[Box1]]`;

    task.addPriorityContent(TITLE,contentLow);
    task.addPriorityContent(TITLE,contentMedium);
    task.addPriorityContent(TITLE,contentHigh);
    expect(task.priorityContent).toEqual({
      LOW: [`#${TITLE}

${contentLow}`],
      MEDIUM: [`#${TITLE}

${contentMedium}`],
      HIGH: [`#${TITLE}

${contentHigh}`],
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

    task.addPriorityContent(TITLE,allContentLow);
    task.addPriorityContent(TITLE,allContentMediumAndHigh);

    expect(task.priorityContent).toEqual({
      LOW: [`#${TITLE}\n\n${expectedValueLow}`],
      MEDIUM: [`#${TITLE}\n\n${expectedValueMedium}`],
      HIGH: [`#${TITLE}\n\n${expectedValueHigh}`],
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

    task.addPriorityContent(TITLE, contentLow);
    expect(task.priorityContent).toEqual({
      LOW: [`#${TITLE}

${contentLow}`],
      MEDIUM: [`#${TITLE}

${contentMedium}`],
      HIGH: [],
    });
  });
});

describe("sorting/selecting content", () => {
  let task;

  beforeEach(() => {
    task = new Task();
  });

  it('sorts priority content by length', () => {
    const strArr = ['bye', 'hi', 'nope'];
    const expectedOutput = ['hi', 'bye', 'nope'];
    expect(task.sortByLength(strArr)).toEqual(expectedOutput);
  });

  it("adds raw content", () => {
    // TODO check selection is valid
    task.priorityContent = {
      LOW: ["a", "b", "c"],
      MEDIUM: ["d", "e", "f"],
      HIGH: ["g", "h", "i"],
    };

    const content = task.getRawContent();
    expect(content).not.toBeUndefined();
  });

  it("converts markdown to html", () => {
    const input = `# test title
## subheading
    
- bullet list
- item2
    `;

    const output = task.convertToHtml([input]);

    const expectedOutput = `<h1 id="testtitle">test title</h1>
<h2 id="subheading">subheading</h2>
<ul>
<li>bullet list</li>
<li>item2</li>
</ul>`;

    expect(output).toEqual(expectedOutput);
  });
});
