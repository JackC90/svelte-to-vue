import { FileHandler } from "./fileHandler";
import { ParserStore } from "./parsers/store";

export class StoreFileHandler extends FileHandler {
  constructor() {
    super();
    this.parser = ParserStore;
  }
}
