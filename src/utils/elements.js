import get from "lodash.get";

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
