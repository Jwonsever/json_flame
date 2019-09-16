// Requiring fs module in which writeFile function is defined.
const fs = require("fs");
const m = require("./measure.js");
const { exec } = require("child_process");
var open = require("open");

if (process.argv.length == 2) {
  console.log(
    "Must supply an input file. ex: `node parser.js input.json [flags]`"
  );
  process.exit(1);
}

// Read input paramters.
let keyMode = false;
let arrayMode = false;
for (let j = 3; j < process.argv.length; j++) {
  if (process.argv[j] == "-a") {
    arrayMode = true;
  } else if (process.argv[j] == "-k") {
    keyMode = true;
  } else {
    console.log("Unknown arg, skipping: -> " + process.argv[j]);
  }
}

let s = fs
  .readFileSync(process.argv[2])
  .toString()
  .trim();

// Make them mode arg for measure
let mode = "";
if (keyMode) {
  mode = mode + "k";
}
if (arrayMode) {
  mode = mode + "a";
}

// Measure the input file.
let output = m.measureObject(s, "root", mode);
console.log(output);

// Write data in 'out.json'.
fs.writeFile("out.json", JSON.stringify(output), err => {
  // In case of a error throw err.
  if (err) throw err;
});

// Spawn a node process to open the app.
const child = exec(`node app.js`);
child.stdout.setEncoding("utf8");
child.stdout.on("data", chunk => {
  console.log(chunk);
});

child.stderr.on("data", chunk => {
  console.log(chunk);
});

child.on("close", code => {
  console.log(`child process exited with code ${code}`);
});

// opens the url in the default browser
open("http://localhost:5000/flame.html");
