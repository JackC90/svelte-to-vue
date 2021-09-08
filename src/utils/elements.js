import get from "lodash.get";

// Elements
function printProperties(properties) {
  let str = "";

  // Parameters for creating parent, e.g. wrapper <template>
  let params = {};
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
          let varName = "";
          const isDynamic = get(value, "[0].expression");
          if (type === "svelteDirective") {
            if (name === "on") {
              varName += `@${specifier}`;
            } else if (name.match(/^v-.+/g)) {
              varName += `${name}`;
            } else if (name === "let") {
              // Slot params
              slotVars.push(specifier);
            } else {
              varName += `:${specifier}`;
            }
          } else if (shorthand === "expression" && name.match(/^\.\.\.(.+)$/)) {
            // Destructuring
            varName += `v-bind`;
          } else if (name !== "slot") {
            // Other properties
            varName += `${isDynamic ? ":" : ""}${name}`;
          }
          // Slot - move to parent
          if (type === "svelteProperty" && name === "slot") {
            slotName = get(value, "[0]value");
          }
          // Value
          let valStr = "";
          if (name !== "slot") {
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
            if (varName && valStr) {
              str += valStr ? ` ${varName} = "${valStr}"` : ` ${varName}`;
            }
          }
        }
      }
    }
    // Handle slots
    if (slotVars.length) {
      const sn = slotName ? slotName : "default";
      const propertyString = ` #${sn}="{ ${slotVars.join(", ")} }"`;
      params.parent = {
        tagName: "template",
        propertyString,
      };
    }
  }
  return { content: str, params };
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
    // Index variable
    let index;
    if (item.match(/[\[\{\}\]]/)) {
      index = get(
        item.match(/(?<=([\]\}.]+, *))(\b.+\b)(?=(( *\()|$))/g),
        "[0]"
      );
    } else {
      index = get(item.match(/(?<=(.+, *))(\b.+\b)(?=(( *\()|$))/g), "[0]");
    }

    const varsStr = vars.length > 1 ? `(${vars.join(", ")})` : get(vars, "[0]");
    exp = `${varsStr} in ${collection}`;
    return {
      exp,
      key,
      index,
    };
  }
  return null;
};

function generateForKey(key, place) {
  if (key) {
    const length = place;
    let res = `\`\${${key}}`;
    for (let i = 0; i < length; i++) {
      res += `-\`\${${key}}`;
    }
    res += `\``;
  }
  return key;
}

const empty = [];

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
    str += `<!--  ${value} -->`;
  } else if (type === "svelteDynamicContent") {
    str += `{{ ${get(expression, "value")} }}`;
  } else if (type === "svelteElement" || type === "svelteComponent") {
    const { params: elPropParams, content: elPropContent } =
      printProperties(properties);
    let elStr = "";
    elStr += `<${tagName}`;
    elStr += elPropContent;
    elStr += selfClosing ? ` />` : `>`;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      elStr += printSvEl(child);
    }
    if (!selfClosing) {
      elStr += `</${tagName}>`;
    }
    // Wrap with parent element
    const parent = get(elPropParams, "parent");
    if (parent) {
      const { tagName, propertyString } = parent;
      elStr = `<${tagName}${propertyString}>${elStr}</${tagName}>`;
    }

    str += elStr;
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
          const elNum = get(
            brChildren.filter(
              (ch) =>
                ch.type === "svelteElement" || ch.type === "svelteComponent"
            ),
            "length",
            0
          );
          const isSingleEl = elNum === 1;

          let blockStr = "";
          let svelteCmpCount = 0;
          if (get(brChildren, "length")) {
            for (let i = 0; i < brChildren.length; i++) {
              const ch = brChildren[i];
              // Add keys to children
              if (
                (ch.type === "svelteElement" ||
                  ch.type === "svelteComponent") &&
                !get(ch, "properties", empty).find((pr) => pr.name === "key")
              ) {
                const key = {
                  type: "svelteProperty",
                  name: "key",
                  value: [
                    {
                      type: "svelteDynamicContent",
                      expression: {
                        type: "svelteExpression",
                        value: generateForKey(
                          get(exp, "key") || get(exp, "index") || "",
                          svelteCmpCount
                        ),
                      },
                    },
                  ],
                  modifiers: [],
                  shorthand: "none",
                };
                if (Array.isArray(ch.properties)) {
                  if (isSingleEl) {
                    ch.properties.push({
                      type: "svelteDirective",
                      name: "v-for",
                      value: [
                        {
                          type: "svelteDynamicContent",
                          expression: {
                            type: "svelteExpression",
                            value: get(exp, "exp", ""),
                          },
                        },
                      ],
                      modifiers: [],
                      shorthand: "none",
                    });
                  }
                  ch.properties.push(key);
                } else {
                  ch.properties = [key];
                }
                svelteCmpCount += 1;
              }
              blockStr += printSvEl(ch, null, {
                tagInner: [""],
              });
            }
          }
          // Wrap in <template> if multiple child elements
          if (!isSingleEl) {
            const vFor = `v-for="${get(exp, "exp", "")}"`;
            blockStr = `<template ${vFor}>\n${blockStr}\n</template>`;
          }
          str += blockStr;
        }
      }
    }
  }

  initString += str;
  return initString;
}
