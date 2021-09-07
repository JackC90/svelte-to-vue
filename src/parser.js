import { parse } from "svelte-parse";
import { writeToVue } from "./writer.js";
import fs from "fs";
import path from "path";
const __dirname = path.resolve();

const fileUrl = __dirname + "/src/Carousel.svelte"; // provide file location

export const parseFile = (filename, options) => {
  fs.readFile(filename, "utf8", function (err, data) {
    if (err) throw err;
    const result = parse({
      generatePositions: false,
      ...options,
      value: data,
    });

    const fn = filename.split(".svelte")[0];
    const content = writeToVue(fn, result);
    const vFileName = `${fn}.vue`;

    fs.writeFile(vFileName, content, (err) => {
      if (err) throw err;
      console.log(`${vFileName} has been saved!`);
    });
  });
};

parseFile(fileUrl);
