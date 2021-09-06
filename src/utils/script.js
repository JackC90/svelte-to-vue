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
      block: "import",
      defaultVars,
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
          block: "method",
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
          block: "hook",
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
        block: "prop",
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

export function parseComp(line) {
  try {
    if (typeof line === "string") {
      const lineTr = line.trim();
      const isAsync = !!lineTr.match(/(async)/);
      return {
        block: isAsync ? "watch" : "computed",
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
        block: "data",
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

const scriptBlockTypes = [
  {
    key: "import",
    match: content => {
      return content.match(/^import/);
    },
    checkMultiline: content => {
      return !content.match(/;$/);
    },
    parse: content => {
      let params = parseImport(content);
      return params;
    },
  },
  {
    key: "prop",
    match: content => {
      return content.match(/export let/);
    },
    checkMultiline: content => {
      return !checkBrackets(content);
    },
    parse: content => {
      let params = parseProp(content);
      return params;
    },
  },
  {
    key: "hook",
    match: content => {
      return content.match(hookMatch);
    },
    checkMultiline: content => {
      return !checkBrackets(content);
    },
    parse: content => {
      let params = parseHook(content);
      return params;
    },
  },
  {
    key: "watch",
    match: content => {
      return content.match(/^\$: \{/);
    },
    checkMultiline: content => {
      return !checkBrackets(content);
    },
    parse: content => {
      let params = parseComp(content);
      return params;
    },
  },
  {
    key: "method",
    match: content => {
      return (
        !content.match(/^\$: /) &&
        (content.match(/=>/) || content.match(/function/))
      );
    },
    checkMultiline: content => {
      return !parseFunction(content);
    },
    parse: content => {
      let params = parseFunction(content);
      return params;
    },
  },
  {
    key: "data",
    match: content => {
      return content.match(/let /) || content.match(/\$: (.+) =/);
    },
    checkMultiline: content => {
      return !checkBrackets(content);
    },
    parse: content => {
      let params = parseData(content);
      return params;
    },
  },
];

export function parseScript(schema) {
  if (
    get(schema, "type") === "svelteScript" &&
    get(schema, "tagName") === "script"
  ) {
    const children = get(schema, "children[0].value");

    // Item types
    let blocks = [];

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

      for (let i = 0; i < scriptBlockTypes.length; i++) {
        const { key, match, checkMultiline, parse } = scriptBlockTypes[i];

        if (mLType === key || match(cTr)) {
          // Multi-line
          // - Set multi-line
          if (checkMultiline(multiline || c)) {
            startLine(key, c);
          } else {
            // - End line
            endLine();
          }

          // Complete line
          if (isLineEnd) {
            const line = multiline || c;
            if (line) {
              let params = parse(line);
              if (params) {
                blocks.push(params);
              }
            }
            resetLine();
          }
          continue;
        }
      }
    }
    return blocks;
  }
  return null;
}

export function printScript(parsed) {
  let scrStr = "";
  let impCmpApi = "";
  // Script tags
  impCmpApi += "\n<script>\n";
  // Import composition API
  impCmpApi += `import { defineComponent, ref, reactive } from '@nuxtjs/composition-api';\n`;

  // Imports
  let imports = [];
  let otherScripts = [];
  let props = [];

  parsed.forEach(p => {
    if (p.block === "import") {
      imports.push(p);
    } else if (p.block === "prop") {
      props.push(p);
    } else {
      otherScripts.push(p);
    }
  });
  imports.forEach(i => {
    impCmpApi += `${i.script.trim()}\n`;
  });

  impCmpApi += `\nexport default defineComponent({\n
  setup(${props.length ? "props" : ""}) {\n`;

  const sp = "    ";

  let bodyScr = "";
  bodyScr += props.length
    ? `${sp}const { ${props.map(p => p.name).join(", ")} } = reactive(props);\n`
    : "";
  if (parsed) {
    for (let i = 0; i < otherScripts.length; i++) {
      const el = otherScripts[i];
      if (el.block === "data") {
        const { name, defaultValue, dataType } = el;
        const ref = defaultValue.trim().match(/^(\[|\{)/) ? "reactive" : "ref";
        bodyScr += `${sp}const ${name}${
          defaultValue
            ? ` = ${ref}${ref ? "(" : ""}${defaultValue}${ref ? ")" : ""}`
            : ""
        };\n`;
      } else if (el.block === "prop") {
      }
    }
  }

  impCmpApi += `${bodyScr}\n  }\n`;
  impCmpApi += `});\n`;
  impCmpApi += "</script>";
  return impCmpApi;
}
