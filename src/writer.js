import get from "lodash.get";
import camelCase from "lodash.camelcase";

function parseImport(line) {
  if (typeof line === "string") {
    let vars = get(line.match(/^import (.+) from/), "[1]");
    vars = vars
      .split(",")
      .map(c => c.replace(/\{/g, "").replace(/\}/g, "").trim())
      .filter(c => c);

    let lib = get(line.match(/ from ["'](.+)["'];$/), "[1]");
    let category = get(lib.match("^@[a-zA-Z0-9]*"), "[0]");
    lib = lib.split("/");
    lib = get(lib, `[${lib.length - 1}]`);
    lib = lib ? lib.replace(".js", "") : "";

    return {
      vars,
      lib,
      category,
    };
  }
  return null;
}

function parseFunction(line) {
  try {
    if (typeof line === "string") {
      const f = Function(line);
      return f;
    }
  } catch (e) {
    return null;
  }
}

export function writeScript(schema) {
  if (
    get(schema, "type") === "svelteScript" &&
    get(schema, "tagName") === "script"
  ) {
    const children = get(schema, "children[0].value");

    // Item types
    let svelteCmpts = [];
    let importVars = [];
    let props = [];
    let methods = [];
    let data = [];
    let computed = [];
    let mounted = null;

    const cs = children
      .split("\n")
      .map(c => c.trim())
      .filter(c => c);
    console.log(cs);
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];

      // Multi-line code
      let multiline = "";
      let mLType = null;
      let isLineEnd = true;

      // Imports
      if (c.match(/^import/) || mLType === "import") {
        // Multi-line
        // - Set multi-line
        if (!c.match(/;$/)) {
          isLineEnd = false;
          mLType = "import";
          multiline += c;
        } else {
          // - End line
          multiline += c;
          isLineEnd = true;
        }

        // Complete line
        if (isLineEnd) {
          line = multiline || c;
          if (line.includes(".svelte")) {
            svelteCmpts.push(line);
          } else if (line.match(/(store\/|stores\/)/g)) {
            let params = parseImport(line);
            importVars.push(params);
          }
          multiline = "";
        }
      }

      if (c.match(/=>/) || c.match(/function/)) {
        // Multi-line
        // - Set multi-line
        if (!c.match(/;$/) && !parseFunction(multiline || c)) {
          isLineEnd = false;
          mLType = "function";
          multiline += c;
        } else {
          // - End line
          multiline += c;
          isLineEnd = true;
        }

        if (isLineEnd) {
          line = multiline || c;
          const f = parseFunction(line);
          if (f) {
            methods.push(f);
          }
          multiline = "";
        }
      }
    }
  }
}

export function writeToVue(name, schema) {
  if (get(schema, "type") === "root") {
    const children = get(schema, "children");
    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      // Handle <script>
      if (
        get(child, "type") === "svelteScript" &&
        get(child, "tagName") === "script"
      ) {
        writeScript(child);
      }
    }
  }
}
