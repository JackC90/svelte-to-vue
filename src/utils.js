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

export function parseImport(line) {
  if (typeof line === "string") {
    const sngLn = line.replace("\n", "");
    let vars = get(sngLn.match(/^import (.+) from/), "[1]");
    vars = vars
      .split(",")
      .map((c) => c.replace(/\{/g, "").replace(/\}/g, "").trim())
      .filter((c) => c);

    let lib = get(sngLn.match(/ from ["'](.+)["'];$/), "[1]");
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

export function parseFunction(line) {
  try {
    if (typeof line === "string") {
      const f = Function(line);
      return f ? line : null;
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
      const sngLn = line.replace("\n", "");
      const prms = sngLn.match(/^export let (.+) = (.+);/);
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

export function parseData(line) {
  try {
    if (typeof line === "string") {
      const sngLn = line.replace("\n", "");
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
      };
    }
  } catch (e) {
    return null;
  }
}

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

const parseEachExp = (eachExp) => {
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
    item.split(/[, ]/).forEach((w) => {
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
            brChildren.forEach((ch) => {
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
            brChildren.forEach((ch) => {
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
