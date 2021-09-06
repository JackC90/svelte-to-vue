import get from "lodash.get";

export function checkBrackets(expr) {
  const holder = [];
  const openBrackets = ["(", "{", "["];
  const closedBrackets = [")", "}", "]"];
  for (let letter of expr) {
    // loop trought all letters of expr
    if (openBrackets.includes(letter)) {
      // if its oppening bracket
      holder.push(letter);
    } else if (closedBrackets.includes(letter)) {
      // if its closing
      const openPair = openBrackets[closedBrackets.indexOf(letter)]; // find its pair
      if (holder[holder.length - 1] === openPair) {
        // check if that pair is the last element in the array
        holder.splice(-1, 1); // if so, remove it
      } else {
        // if its not
        holder.push(letter);
        break; // exit loop
      }
    }
  }
  return holder.length === 0; // return true if length is 0, otherwise false
}

// Hooks
export const HOOKS = {
  onMount: "mounted",
  beforeUpdate: "beforeUpdate",
  afterUpdate: "updated",
  onDestroy: "destroyed",
};
// Hooks
const hookKeys = Object.keys(HOOKS);
const hookVals = Object.values(HOOKS);
const hookMatch = new RegExp(`^(${hookKeys.join("|")})`);

export function parseImport(line) {
  if (typeof line === "string") {
    const lineTr = line.trim();
    const type = lineTr.includes(".svelte") ? "svelteComponent" : "library";
    const sngLn = lineTr.replace("\n", "");
    let varsParsed = get(sngLn.match(/^import (.+) from/), "[1]");

    let isChild = false;
    let defaultVars = [];
    let vars = [];
    varsParsed.split(",").forEach(c => {
      if (c) {
        if (c.includes("{")) {
          isChild = true;
        }

        const clean = c.replace(/\{/g, "").replace(/\}/g, "").trim();
        if (isChild) {
          vars.push(clean);
        } else {
          defaultVars.push(clean);
        }

        if (c.includes("}")) {
          isChild = false;
        }
      }
    });

    let lib = get(sngLn.match(/ from ["'](.+)["'];$/), "[1]");
    let category = get(lib.match("^@[a-zA-Z0-9]*"), "[0]");
    lib = lib.split("/");
    lib = get(lib, `[${lib.length - 1}]`);
    lib = lib ? lib.replace(".js", "") : "";

    return {
      vars,
      lib,
      type,
      category,
      script: line,
    };
  }
  return null;
}

export function parseFunction(line) {
  try {
    if (typeof line === "string") {
      const lineTr = line.trim();
      const f = Function(lineTr);
      if (f) {
        let p = lineTr.match(/^(const|let) (.+) = /);
        p = p || lineTr.match(/^(function|async function) (.+)\(/);
        const name = get(p, `[2]`);

        // Definition - Async? Arrow function with let / const?
        const def = get(p, `[1]`);
        return {
          name,
          def,
          script: line,
        };
      }
    }
  } catch (e) {
    return null;
  }
}

export function parseHook(line) {
  try {
    if (typeof line === "string") {
      const lineTr = line.trim();
      // Hooks
      const hook = get(lineTr.match(hookMatch), `[1]`);
      const f = Function(lineTr);
      if (f) {
        return {
          hookKey: hook,
          hookVal: get(HOOKS, hook),
          script: line,
        };
      }
    }
  } catch (e) {
    return null;
  }
}

export function getDataType(value) {
  let dataType;
  if (value.match(/^["']|["']$/)) {
    dataType = "String";
  } else if (!isNaN(value)) {
    dataType = "Number";
  } else if (value.match(/^\[|\]$/)) {
    dataType = "Array";
  } else if (value.match(/^\{|\}$/)) {
    dataType = "Object";
  } else if (value === "true" || value === "false") {
    dataType = "Boolean";
  } else if (value === "null") {
  }
  return dataType;
}

export function parseProp(line) {
  try {
    if (typeof line === "string") {
      const lineTr = line.trim();
      const sngLn = lineTr.replace("\n", "");
      const prms = sngLn.match(/^export let (.+) = (.+);/);
      const name = get(prms, "[1]");
      const defaultValue = get(prms, "[2]");
      return {
        name,
        defaultValue,
        dataType: getDataType(defaultValue),
        script: line,
      };
    }
  } catch (e) {
    return null;
  }
}

export function parseData(line) {
  try {
    if (typeof line === "string") {
      const lineTr = line.trim();
      const sngLn = lineTr.replace("\n", "");
      let prms;
      if (sngLn.includes("let ")) {
        prms = sngLn.match(/^let (.+) = (.+);/);
      } else if (sngLn.includes("$: ")) {
        prms = sngLn.match(/^\$: (.+) = (.+);/);
      }
      const name = get(prms, "[1]");
      const defaultValue = get(prms, "[2]");
      return {
        name,
        defaultValue,
        dataType: getDataType(defaultValue),
        script: line,
      };
    }
  } catch (e) {
    return null;
  }
}

export function parseScript(schema) {
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
    let watch = [];

    // Hooks
    const hooks = [];

    const cs = children.split("\n").filter(c => c);
    // Multi-line code
    let multiline = "";
    let mLType = null;
    let isLineEnd = true;

    function startLine(_mLType, _line) {
      if (isLineEnd && !multiline) {
        isLineEnd = false;
        mLType = _mLType;
        multiline += multiline ? `\n${_line}` : `${_line}`;
      }
    }

    function contLine(_line) {
      if (!isLineEnd) {
        multiline += multiline ? `\n${_line}` : `${_line}`;
      }
    }

    function endLine() {
      multiline = multiline.trim();
      isLineEnd = true;
    }

    function resetLine() {
      multiline = "";
      mLType = null;
      isLineEnd = true;
    }

    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];
      const cTr = c.trim();
      contLine(c);

      // Imports
      if (mLType === "import" || cTr.match(/^import/)) {
        // Multi-line
        // - Set multi-line
        if (!cTr.match(/;$/)) {
          startLine("import", c);
        } else {
          // - End line
          endLine();
        }

        // Complete line
        if (isLineEnd) {
          const line = multiline || c;
          if (line) {
            let params = parseImport(line);
            if (params && params.type === "svelteComponent") {
              svelteCmpts.push(params);
            } else {
              importVars.push(params);
            }
          }
          resetLine();
        }
        continue;
      }

      // Props
      if (mLType === "prop" || cTr.match(/export let/)) {
        // Multi-line
        // - Set multi-line
        if (!checkBrackets(multiline || c)) {
          startLine("prop", c);
        } else {
          // - End line
          endLine();
        }

        if (isLineEnd) {
          const line = multiline || c;
          const p = parseProp(line);
          if (p) {
            props.push(p);
          }
          resetLine();
        }
        continue;
      }

      // Hooks
      if (mLType === "hooks" || cTr.match(hookMatch)) {
        // Multi-line
        // - Set multi-line
        if (!checkBrackets(multiline || c)) {
          startLine("hooks", c);
        } else {
          // - End line
          endLine();
        }

        if (isLineEnd) {
          const line = multiline || c;
          const f = parseHook(line);
          if (f) {
            hooks.push(f);
          }
          resetLine();
        }
        continue;
      }

      // Watch methods
      if (mLType === "watch" || cTr.match(/^\$: \{/)) {
        // Multi-line
        // - Set multi-line
        if (!checkBrackets(multiline || c)) {
          startLine("watch", c);
        } else {
          // - End line
          endLine();
        }

        if (isLineEnd) {
          const line = multiline || c;
          const f = line;
          if (f) {
            watch.push(f);
          }
          resetLine();
        }
        continue;
      }

      // Method
      if (
        mLType === "method" ||
        (!cTr.match(/^\$: /) && (cTr.match(/=>/) || cTr.match(/function/)))
      ) {
        // Multi-line
        // - Set multi-line
        if (!parseFunction(multiline || c)) {
          startLine("method", c);
        } else {
          // - End line
          endLine();
        }

        if (isLineEnd) {
          const line = multiline || c;
          const f = parseFunction(line);
          if (f) {
            methods.push(f);
          }
          resetLine();
        }
        continue;
      }

      // Data
      if (mLType === "data" || cTr.match(/let /) || cTr.match(/\$: (.+) =/)) {
        // Multi-line
        // - Set multi-line
        if (!checkBrackets(multiline || c)) {
          startLine("data", c);
        } else {
          // - End line
          endLine();
        }

        if (isLineEnd) {
          const line = multiline || c;
          const p = parseData(line);
          if (p) {
            data.push(p);
          }
          resetLine();
        }
        continue;
      }
    }

    const opts = {
      svelteCmpts,
      importVars,
      props,
      methods,
      data,
      watch,
      hooks,
    };
    return opts;
  }
}

export function printScript(parsed) {}
