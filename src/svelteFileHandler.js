import { FileHandler } from "./fileHandler.js";
import { ParserSvelte } from "./parsers/svelte.js";

export class SvelteFileHandler extends FileHandler {
  constructor() {
    super();
    this.parser = ParserSvelte;
  }
}
