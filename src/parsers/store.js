import fs from "fs-extra";
import { parse } from "svelte-parse";
import { writeToVue } from "../utils/writer.js";

import { Parser } from "./parser.js";

export class ParserSvelte extends Parser {
  constructor(fileName, sourceDir, targetDir, config, options) {
    super();
    this.fileName = fileName;
    this.sourceDir = sourceDir;
    this.targetDir = targetDir;
    this.config = config;
    this.options = options;
  }

  parseFile() {
    const sourceFilePath = `${this.sourceDir}/${this.fileName}`;

    const fileName = this.fileName;
    const targetDir = this.targetDir;
    const config = this.config;
    const options = this.options;

    const isSvelteFile = !!fileName.match(/.svelte$/);
    if (isSvelteFile) {
      fs.readFile(sourceFilePath, "utf8", function (err, data) {
        if (err) throw err;
        const parseResult = parse({
          generatePositions: false,
          ...(options || null),
          value: data,
        });

        const fn = fileName.split(".js")[0];
        const vFileName = `${fn}.js`;
        const targetFilePath = `${targetDir}/$${vFileName}`;

        // Content
        const content = writeToVue(fn, parseResult, config);

        fs.outputFile(targetFilePath, content, (err) => {
          if (err) throw err;
          console.log(`File saved to ${targetFilePath}`);
        });
      });
    }
  }
}
