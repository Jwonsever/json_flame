// Requiring fs module in which writeFile function is defined.
const fs = require("fs");
const m = require("./measure.js");

var s = fs
  .readFileSync("data.json")
  .toString()
  .trim();

// Measure the input file.
var output = m.measureObject(s, "root", "ak");
console.log(output);

// Write data in 'flame.json'.
fs.writeFile("flame.json", JSON.stringify(output), err => {
  // In case of a error throw err.
  if (err) throw err;
});
