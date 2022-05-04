#!/usr/bin/env node

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const DailyDigest = require("./src/dailyDigest");
const Update = require("./src/update");
const Notes = require("./src/notes");
const Email = require("./src/email");
const fs = require("fs");

console.log(`${new Date().toISOString()}: running notes cron`);

(async function () {
  if (!process.env.NOTES_PATH) {
    throw new Error("no NOTES_PATH");
  }

  if (!fs.existsSync(process.env.NOTES_PATH)) {
    throw new Error("invalid NOTES_PATH");
  }

  if (!process.env.NOTES_EMAIL) {
    throw new Error("no NOTES_EMAIL");
  }

  try {
    const dailyDigest = new DailyDigest(process.env.NOTES_PATH);
    const update = new Update(process.env.NOTES_PATH);
    const notes = new Notes(process.env.NOTES_PATH);
    const email = new Email();

    await update.runAllFunctions();

    const [markdown, html] = await dailyDigest.get();
    await notes.putContent(
      path.join(process.env.NOTES_PATH, "../Daily Digest.md"),
      markdown
    );
    await email.send(process.env.NOTES_EMAIL, "Daily Digest", html);
  } catch (e) {
    console.error(e);
  }
})();
