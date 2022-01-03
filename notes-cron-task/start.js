const Task = require("./task");
const task = new Task();
const fs = require("fs");

(async function () {
  await task.run();
})();
