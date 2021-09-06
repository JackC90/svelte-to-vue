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

export const HOOKS = {
  onMount: "mounted",
  beforeUpdate: "beforeUpdate",
  afterUpdate: "updated",
  onDestroy: "destroyed",
};

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
    let hookKeys = Object.keys(HOOKS);
    let hookVals = Object.values(HOOKS);
    let hooks = {};
    let hookMatch = new RegExp(`^(${hookKeys.join("|")})`);

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
          const f = line;
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

export function writeScript(parsed) {}

// Elements
function printProperties(properties) {
  let str = "";
  if (Array.isArray(properties) && properties.length) {
    const types = ["svelteProperty", "svelteDirective"];
    const slotVars = [];
    let slotName;

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const { type, name, value, specifier, shorthand } = property;

      if (types.includes(type)) {
        if (name) {
          // Name
          const isDynamic = get(value, "[0].expression");
          if (type === "svelteDirective") {
            if (name === "on") {
              str += ` @${specifier}`;
            } else if (name === "let") {
              slotVars.push(specifier);
            } else {
              str += ` :${specifier}`;
            }
          } else if (shorthand === "expression" && name.match(/^\.\.\.(.+)$/)) {
            // Destructuring
            str += ` v-bind`;
          } else {
            str += ` ${isDynamic ? ":" : ""}${name}`;
          }
          // Slot
          if (type === "svelteProperty" && name === "slot") {
            slotName = get(value, "value");
          }
          // Value
          let valStr = "";
          value.forEach(({ type, value, expression }) => {
            if (type === "text") {
              valStr += value;
            }
            if (type === "svelteDynamicContent") {
              let val = get(expression, "value");
              // Destructuring shorthand
              if (shorthand === "expression") {
                const matches = val.match(/^\.\.\.(.+)$/);
                const destruct = get(matches, "[1]");
                val = destruct ? destruct : val;
              }
              valStr += val;
            }
          });
          str += valStr ? `="${valStr}"` : ``;
        }
      }
    }
    // Handle slots
    if (slotVars.length) {
      const sn = slotName ? slotName : "default";
      str += ` #${sn}="{ ${slotVars.join(", ")} }"`;
    }
  }
  return str;
}

const ifBlocks = {
  if: "if",
  "else if": "else-if",
  else: "else",
};
const ifBlockNames = Object.keys(ifBlocks);

const parseEachExp = eachExp => {
  if (typeof eachExp === "string") {
    let key;
    let exp = "";
    let vars = [];
    const matches = eachExp.trim().match(/^(.+) as (.+)$/);
    const collection = get(matches, "[1]");
    const item = get(matches, "[2]");
    if (!item) {
      return null;
    }
    item.split(/[, ]/).forEach(w => {
      const wt = w.trim();
      if (wt) {
        // Value in brackets are keys
        const k = wt.match(/^\((.+)\)$/);
        if (k) {
          key = get(k, "[1]");
        } else {
          vars.push(wt);
        }
      }
    });
    const varsStr = vars.length > 1 ? `(${vars.join(", ")})` : get(vars, "[0]");
    exp = `${varsStr} in ${collection}`;
    return {
      exp,
      key,
    };
  }
  return null;
};

export function printSvEl(el, initialString) {
  let initString = initialString || "";
  let str = initString ? initString : "";
  const {
    type,
    tagName,
    name,
    properties,
    selfClosing,
    children,
    branches,
    expression,
    value,
  } = el;
  if (type === "text") {
    str += value || "";
  } else if (type === "comment") {
    str += `// ${value}`;
  } else if (type === "svelteDynamicContent") {
    str += `{{ ${get(expression, "value")} }}`;
  } else if (type === "svelteElement" || type === "svelteComponent") {
    str += `<${tagName}`;
    str += printProperties(properties);
    str += selfClosing ? ` />` : `>`;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      str += printSvEl(child);
    }
    if (!selfClosing) {
      str += `</${tagName}>`;
    }
  } else if (type === "svelteBranchingBlock") {
    if (ifBlockNames.includes(name)) {
      if (get(branches, "length")) {
        for (let i = 0; i < branches.length; i++) {
          const branch = branches[i];
          const {
            expression: brExpression,
            children: brChildren,
            name: brName,
          } = branch;
          const repPropName = ifBlocks[brName];
          const brExprVal = get(brExpression, "value");
          str += `<template v-${repPropName}${
            brExprVal ? `="${brExprVal}"` : ""
          }>`;
          if (get(brChildren, "length")) {
            brChildren.forEach(ch => {
              str += printSvEl(ch);
            });
          }
          str += `</template>`;
        }
      }
    } else if (name === "each") {
      if (get(branches, "length")) {
        for (let i = 0; i < branches.length; i++) {
          const branch = branches[i];
          const { expression: brExpression, children: brChildren } = branch;
          const exp = parseEachExp(get(brExpression, "value"));
          const key = get(exp, "key");
          str += `<template v-for="${get(exp, "exp", "")}" ${
            key ? `:key="${key}"` : ""
          }>`;
          if (get(brChildren, "length")) {
            brChildren.forEach(ch => {
              str += printSvEl(ch);
            });
          }
          str += `</template>`;
        }
      }
    }
  }

  initString += str;
  return initString;
}
