import { parse } from "svelte-parse";
import yargs from "yargs";
import { writeToVue } from "./writer.js";
import fs from "fs-extra";
import path from "path";
const __dirname = path.resolve();

const setupYargOptions = () => {
  const args = process.argv;
  const yargOptions = yargs(args)
    .usage(
      "Usage: -s <source_location> -t <target_location> -c <configuration_location>"
    )
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

export const parseFile = (fileName, sourceDir, targetDir, config, options) => {
  const sourceFilePath = `${sourceDir}/${fileName}`;
  const isSvelteFile = !!fileName.match(/.svelte$/);
  if (isSvelteFile) {
    fs.readFile(sourceFilePath, "utf8", function (err, data) {
      if (err) throw err;
      const parseResult = parse({
        generatePositions: false,
        ...(options || null),
        value: data,
      });

      const fn = fileName.split(".svelte")[0];
      const vFileName = `${fn}/index.vue`;
      const targetFilePath = `${targetDir}/${vFileName}`;

      // Content
      const content = writeToVue(fn, parseResult, config);

      fs.outputFile(targetFilePath, content, err => {
        if (err) throw err;
        console.log(`File saved to ${targetFilePath}`);
      });
    });
  }
};

function getAllFileNames(sourceDir, targetDir, arrayOfFiles) {
  const files = fs.readdirSync(sourceDir);

  let _arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(sourceDir + "/" + file).isDirectory()) {
      _arrayOfFiles = getAllFileNames(
        sourceDir + "/" + file,
        targetDir + "/" + file,
        _arrayOfFiles
      );
    } else {
      _arrayOfFiles.push({
        fileName: file,
        sourceDir: sourceDir,
        targetDir: targetDir,
      });
    }
  });
  return _arrayOfFiles;
}

function readDir(sourceDir, targetDir, config) {
  // Get all file names
  const fileNames = getAllFileNames(sourceDir, targetDir, []);
  console.log(`Processing ${fileNames.length} files...`);

  // Parse files
  fileNames.forEach(function ({ fileName, sourceDir, targetDir }) {
    parseFile(fileName, sourceDir, targetDir, config, {});
  });
}

export const processFiles = () => {
  const argv = setupYargOptions();
  const sourceDir = argv.s.replace(/\/$/g, "");
  const targetDir = argv.t.replace(/\/$/g, "");
  const configPath = argv.c;

  if (configPath) {
    fs.readFile(configPath, "utf8", function (err, data) {
      if (err) {
        console.log("No config file found.");
      }
      try {
        const config = JSON.parse(data);
        readDir(sourceDir, targetDir, config);
      } catch (e) {
        readDir(sourceDir, targetDir, {});
      }
    });
  } else {
    readDir(sourceDir, targetDir, {});
  }
};
