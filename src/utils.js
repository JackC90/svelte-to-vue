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
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const { type, name, value, specifier } = property;
      if (types.includes(type)) {
        if (name) {
          // Name
          const isDynamic = get(value, "[0].expression");
          if (type === "svelteDirective") {
            str += ` @${specifier}="`;
          } else {
            str += ` ${isDynamic ? ":" : ""}${name}="`;
          }
          // Value
          value.forEach(({ type, value, expression }) => {
            if (type === "text") {
              str += value;
            }
            if (type === "svelteDynamicContent") {
              str += expression.value;
            }
          });
          str += `"`;
        }
      }
    }
  }
  return str;
}

function printSvEl(el, initialString) {
  let initString = initialString;
  const { type, tagName, properties, selfClosing, children } = el;
  if (type === "svelteElement") {
    initString += `<${tagName}${selfClosing ? " " : ">"}`;
    initString += printProperties(properties);
    initString += selfClosing ? ` />` : `</${tagName}>`;
  }

  if (type === "svelteBranchingBlock" && name === "each") {
    const branches = property.branches;
  }
}
