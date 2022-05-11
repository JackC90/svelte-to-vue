import yargs from "yargs";
import fs from "fs-extra";
import { ParserSvelte } from "./parsers/svelte.js";
import { getAllFileNames } from "./utils/file.js";

export class FileHandler {
  constructor() {
    this.parser = ParserSvelte;
  }

  setupYargOptions() {
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
  }

  readDir(Parser, sourceDir, targetDir, config) {
    // Get all file names
    const fileNames = getAllFileNames(sourceDir, targetDir, []);
    console.log(`Processing ${fileNames.length} files...`);

    // Parse files
    fileNames.forEach(function ({ fileName, sourceDir, targetDir }) {
      const parseInst = new Parser(fileName, sourceDir, targetDir, config, {});
      parseInst.parseFile();
    });
  }

  processFiles() {
    const argv = this.setupYargOptions();
    const sourceDir = argv.s.replace(/\/$/g, "");
    const targetDir = argv.t.replace(/\/$/g, "");
    const configPath = argv.c;

    const readDir = this.readDir;
    const Parser = this.parser;

    if (configPath) {
      fs.readFile(configPath, "utf8", function (err, data) {
        if (err) {
          console.log("No config file found.");
        }
        try {
          const config = JSON.parse(data);
          readDir(Parser, sourceDir, targetDir, config);
        } catch (e) {
          readDir(Parser, sourceDir, targetDir, {});
        }
      });
    } else {
      readDir(Parser, sourceDir, targetDir, {});
    }
  }
}
