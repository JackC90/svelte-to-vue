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

function getDataType(value) {
  let dataType;
  if (value.match(/^["']|["']$/)) {
    dataType = "String";
  } else if (!isNaN(value)) {
    dataType = "Number";
  } else if (value.match(/^\[|\]$/)) {
    dataType = "Array";
  } else if (value.match(/^\{|\}$/)) {
    dataType = "Object";
  } else if (value === "null") {
  }
  return dataType;
}

function parseProp(line) {
  try {
    if (typeof line === "string") {
      const prms = line.match(/^export let (.+) = (.+);/);
      const name = get(prms, "[1]");
      const defaultValue = get(prms, "[2]");
      return {
        name,
        defaultValue,
        dataType: getDataType(defaultValue),
      };
    }
  } catch (e) {
    return null;
  }
}

function parseData(line) {
  try {
    if (typeof line === "string") {
      let prms;
      if (line.includes("let ")) {
        prms = line.match(/^let (.+) = (.+);/);
      } else if (line.includes("$: ")) {
        prms = line.match(/^\$: (.+) = (.+);/);
      }
      const name = get(prms, "[1]");
      const defaultValue = get(prms, "[2]");
      return {
        name,
        defaultValue,
        dataType: getDataType(defaultValue),
      };
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

      function startLine(_mLType, _line) {
        isLineEnd = false;
        mLType = _mLType;
        multiline += ` ${_line}`;
      }

      function endLine(_line) {
        multiline += ` ${_line}`;
        multiline = multiline.trim();
        isLineEnd = true;
      }

      function resetLine() {
        multiline = "";
        mLType = null;
        isLineEnd = true;
      }

      // Imports
      if (c.match(/^import/) || mLType === "import") {
        // Multi-line
        // - Set multi-line
        if (!c.match(/;$/)) {
          startLine("import", c);
        } else {
          // - End line
          endLine(c);
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
          resetLine();
        }
        continue;
      }

      // Props
      if (c.match(/export let/)) {
        // Multi-line
        // - Set multi-line
        if (!c.match(/;$/) && !parseFunction(multiline || c)) {
          startLine("prop", c);
        } else {
          // - End line
          endLine(c);
        }

        if (isLineEnd) {
          line = multiline || c;
          const p = parseProp(line);
          if (p) {
            props.push(p);
          }
          resetLine();
        }
        continue;
      }

      // Data
      if (c.match(/let /) || c.match(/\$: (.+) =/)) {
        // Multi-line
        // - Set multi-line
        if (!c.match(/;$/) && !parseFunction(multiline || c)) {
          startLine("data", c);
        } else {
          // - End line
          endLine(c);
        }

        if (isLineEnd) {
          line = multiline || c;
          const p = parseData(line);
          if (p) {
            data.push(p);
          }
          resetLine();
        }
        continue;
      }

      // Method
      if (c.match(/=>/) || c.match(/function/)) {
        // Multi-line
        // - Set multi-line
        if (!c.match(/;$/) && !parseFunction(multiline || c)) {
          startLine("method", c);
        } else {
          // - End line
          endLine(c);
        }

        if (isLineEnd) {
          line = multiline || c;
          const f = parseFunction(line);
          if (f) {
            methods.push(f);
          }
          resetLine();
        }
        continue;
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
