import { parse } from "svelte-parse";
import yargs from "yargs";
import { writeToVue } from "./writer.js";
import fs from "fs";
import path from "path";
const __dirname = path.resolve();

const setupYargOptions = () => {
  const args = process.argv;
  const yargOptions = yargs(args)
    .usage("Usage: -s <location> -t <location>")
    .option("s", {
      alias: "source",
      describe: "Source location",
      type: "string",
      demandOption: true,
    })
    .option("t", {
      alias: "target",
      describe: "Target location",
      type: "string",
      demandOption: true,
    })
    .option("c", {
      alias: "config",
      describe: "Config file location",
      type: "string",
      demandOption: false,
    }).argv;
  return yargOptions;
};

export const parseFile = (fileName, sourceDir, targetDir, options) => {
  const sourceFilePath = `${sourceDir}${fileName}`;
  fs.readFile(sourceFilePath, "utf8", function (err, data) {
    if (err) throw err;
    const result = parse({
      generatePositions: false,
      ...(options || null),
      value: data,
    });

    const fn = fileName.split(".svelte")[0];
    const vFileName = `${fn}.vue`;
    const targetFilePath = `${targetDir}${vFileName}`;

    // Content
    const content = writeToVue(fn, result);

    fs.writeFile(targetFilePath, content, (err) => {
      if (err) throw err;
      console.log(`File saved to ${targetFilePath}`);
    });
  });
};

export const processFiles = () => {
  const argv = setupYargOptions();
  const sourceDir = argv.s;
  const targetDir = argv.t;

  fs.readdir(sourceDir, function (err, fileNames) {
    if (err) throw err;
    fileNames.forEach(function (fileName) {
      parseFile(fileName, sourceDir, targetDir, {});
    });
  });
};
