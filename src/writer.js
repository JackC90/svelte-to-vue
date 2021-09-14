import get from "lodash.get";
import { printSvEl } from "./utils/elements.js";
import { parseScript, printScript } from "./utils/script.js";

export function writeToVue(name, schema, config) {
  if (get(schema, "type") === "root") {
    const children = get(schema, "children");

    // Scripts
    let scriptStr = "";
    const scripts = children.filter((child) => {
      return (
        get(child, "type") === "svelteScript" &&
        get(child, "tagName") === "script" &&
        // Skip modules
        !(
          Array.isArray(child.properties) &&
          child.properties.find(
            (prop) =>
              prop.name === "context" &&
              Array.isArray(prop.value) &&
              prop.value.find((val) => val.value === "module")
          )
        )
      );
    });
    scripts.forEach((script) => {
      const parsedScripts = parseScript(script);
      scriptStr += `\n${printScript(parsedScripts, name, config)}\n`;
    });

    const elements = children.filter((child) => {
      return !(
        get(child, "type") === "svelteScript" ||
        get(child, "tagName") === "script"
      );
    });

    let templateStr = "";
    if (elements.length) {
      let str = "<template>\n";
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        str += printSvEl(el);
      }
      str += "\n</template>";
      templateStr = str;
    }

    let fileStr = `${templateStr}\n${scriptStr}`;
    return fileStr;
  }
  return "";
}
