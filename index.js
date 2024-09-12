const { input } = require("@inquirer/prompts");
const yargs = require("yargs");
const colors = require("@colors/colors/safe");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");

let isVerboseOn = false;

process.on("uncaughtException", function (err) {
  if (isVerboseOn) {
    console.log(colors.red(err.stack));
  } else {
    console.log(colors.red(err));
  }
});

const argv = yargs
  .usage("Usage: $0 -f [input JSON file] -i [Elasticsearch index to write to]")
  .alias("f", "file")
  .describe("f", "Path to input JSON file")
  .alias("i", "index")
  .describe("i", "Elasticsearch index to write to")
  .alias("o", "output")
  .describe("o", "Output path of the request body data file")
  .default("o", ".")
  .alias("v", "verbose")
  .describe("v", "Verbose error output")
  .boolean("v")
  .default("v", false)
  .help("h")
  .alias("h", "help")
  .epilog("Copyright 2024").argv;

if (argv.verbose) {
  isVerboseOn = true;
}

(async () => {
  const file = argv.file || (await input({ message: "Enter JSON file:" }));

  const index =
    argv.index || (await input({ message: "Enter Elasticsearch index name:" }));

  const outDir = argv.output || ".";

  console.log(`\nFile: ${colors.magenta(file)}`);
  console.log(`Index: ${colors.magenta(index)}`);
  console.log(`Output: ${colors.magenta(`${outDir}/data.txt`)}\n`);

  let stats;
  try {
    stats = fs.statSync(file);
  } catch {
    console.log(colors.red("Unable to find input file:", file));
    process.exit(1);
  }

  if (!stats.isFile()) {
    console.log(colors.red("Invalid file:", file));
    process.exit(1);
  }

  if (!index) {
    console.log(colors.red("Index must be provided"));
    process.exit(1);
  }

  let inputJson;
  const inputJsonString = fs.readFileSync(file, "utf-8");
  try {
    inputJson = JSON.parse(inputJsonString);
  } catch (err) {
    console.log(
      colors.red("Unable to parse input JSON contents\n", colors.grey(err)),
    );
    process.exit(1);
  }

  if (!_.isArray(inputJson)) {
    console.log(colors.red("Contents of the JSON input file must be an array"));
    process.exit(1);
  }

  let outputStats;
  try {
    outputStats = fs.statSync(outDir);
  } catch {
    console.log(colors.red("Path does not exist:", outDir));
    process.exit(1);
  }

  if (!outputStats.isDirectory()) {
    console.log(colors.red("Invalid directory:", outDir));
    process.exit(1);
  }

  console.log(colors.gray("Writing records..."));

  let counter = 0;
  const stream = fs.createWriteStream(path.join(outDir, "data.txt"));
  stream.once("open", function () {
    _.each(inputJson, function (record) {
      const recordPrologue = { index: { _index: index, _id: record.id } };
      stream.write(JSON.stringify(recordPrologue) + "\n");
      stream.write(JSON.stringify(record) + "\n");
      counter++;
    });

    stream.end();
  });

  stream.on("finish", function () {
    console.log(colors.green("Completed: wrote " + counter + " record(s)"));
  });
})();
