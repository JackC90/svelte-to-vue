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

function cleanStr(value) {
  if (typeof value === "string") {
    const cleaned = value.trim().replace(/;$/g, "");
    return cleaned;
  }
  return "";
}

function printList(array, separator, isIncludeUndefined) {
  if (Array.isArray(array)) {
    const filterLmbd = isIncludeUndefined
      ? (a) => a
      : (a) => a && a !== "undefined";
    return array.filter(filterLmbd).join(separator || ", ");
  }
  return "";
}

// PARSE SCRIPT
// Hooks
export const HOOKS = {
  onMount: "onMounted",
  beforeUpdate: "onBeforeUpdate",
  afterUpdate: "onUpdated",
  onDestroy: "onUnmounted",
};
export const VUE_COMP_API = {
  computed: "computed",
  watch: "watchEffect",
};
// Hooks
const hookKeys = Object.keys(HOOKS);
const hookVals = Object.values(HOOKS);
const hookMatch = new RegExp(`^(${hookKeys.join("|")})`);

const NUXT_PACKAGES = {
  // Route - get route params, query
  useRoute: {},

  // Router - change url
  useRouter: {},
  useStore: {},
  useMeta: {},
  useContext: {},
  useAsync: {},
};

export function parseImport(line) {
  if (typeof line === "string") {
    const lineTr = line.trim();
    const type = lineTr.includes(".svelte") ? "svelteComponent" : "library";
    const sngLn = lineTr.replace("\n", "");
    const mtc = sngLn.match(/^import (.+) from/);
    let varsParsed = get(mtc, "[1]", "");

    let isChild = false;
    let defaultVars = [];
    let vars = [];
    varsParsed.split(",").forEach((c) => {
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

    const libMtc = sngLn.match(/ from ["'](.+)["'];$/);
    let lib = get(libMtc, "[1]", "");
    const path = lib;
    let category = get(lib.match("^@[a-zA-Z0-9]*"), "[0]");
    lib = lib.split("/");
    lib = get(lib, `[${lib.length - 1}]`);
    lib = lib ? lib.replace(".js", "") : "";

    return {
      block: "import",
      defaultVars,
      vars,
      lib,
      path,
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
          name: cleanStr(name),
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
  let dataType = null;
  const valClean = cleanStr(value);
  if (typeof valClean === "string") {
    if (valClean.match(/^["']|["']$/)) {
      dataType = "String";
    } else if (valClean === "true" || valClean === "false") {
      dataType = "Boolean";
    } else if (!isNaN(valClean)) {
      dataType = "Number";
    } else if (valClean.match(/(\=\>)/) || valClean.match(/(function)/)) {
      dataType = "Function";
    } else if (valClean.match(/^\[((.|\n|\r)*)\]$/)) {
      dataType = "Array";
    } else if (valClean.match(/^\{((.|\n|\r)*)\}$/)) {
      dataType = "Object";
    } else if (valClean === "null") {
    }
  }
  return dataType;
}

export function parseProp(line) {
  try {
    if (typeof line === "string") {
      const lineTr = line.trim();
      if (!lineTr.match(/^\/\//)) {
        const sngLn = lineTr;
        let prms = sngLn.match(/^export let (.+)[ \n]+=[^>][ \n]*((.|\n|\r)*)/);
        // No default value
        if (!prms) {
          prms = sngLn.match(/^export let (.+)/);
        }
        const name = get(prms, "[1]");
        const defaultValue = get(prms, "[2]");
        return {
          block: "prop",
          name: cleanStr(name),
          defaultValue: cleanStr(defaultValue),
          dataType: getDataType(defaultValue),
          script: line,
        };
      }
      return null;
    }
  } catch (e) {
    return null;
  }
}

export function parseWatch(line) {
  try {
    if (typeof line === "string") {
      const lineTr = line.trim();
      const sngLn = lineTr;
      const isComp = !!lineTr.match(/\$: (.+)[ \n]+=/);
      let prms;
      let name;
      let expression;
      if (isComp) {
        prms = sngLn.match(/^\$: (.+)[ \n]+=[ \n]+((.|\n|\r)*)/);
        name = get(prms, "[1]");
        expression = get(prms, "[2]");
        if (!(expression.match(/\=\>/) || expression.match(/function/))) {
          expression = `() => ${expression}`;
        }
      } else {
        let exp = lineTr.replace(/^\$:[ \n]+/g, "");
        if (exp.match(/^\{(.|\n|\r)*\}$/g)) {
          expression = `() => ${exp}`;
        } else if (checkBrackets(exp)) {
          expression = `() => {${exp}}`;
        }
      }

      return {
        block: isComp ? "computed" : "watch",
        name: cleanStr(name),
        expression: cleanStr(expression),
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
      const sngLn = lineTr;
      let prms;
      let ref = true;
      if (sngLn.includes("let ")) {
        prms = sngLn.match(/^let (.+)[ \r\n]*=[ \r\n]*((.|\n|\r)*)(;$)/);

        // States with no default value
        if (!prms) {
          prms = sngLn.match(/^let (.+)(;$)/);
        }
      } else if (sngLn.includes("const ")) {
        ref = false;
        prms = sngLn.match(/^const (.+)[ \r\n]*=[ \r\n]*((.|\n|\r)*)(;$)/);
      }
      const name = get(prms, "[1]");
      const defaultValue = get(prms, "[2]");
      return {
        block: "data",
        name: cleanStr(name),
        defaultValue: cleanStr(defaultValue),
        dataType: getDataType(defaultValue),
        script: line,
        ref,
      };
    }
  } catch (e) {
    return null;
  }
}

const scriptBlockTypes = [
  {
    key: "import",
    match: (content) => {
      return content.match(/^import/);
    },
    checkMultiline: (content) => {
      return !content.match(/;$/);
    },
    parse: (content) => {
      let params = parseImport(content);
      return params;
    },
  },
  {
    key: "prop",
    match: (content) => {
      return content.match(/export let/);
    },
    checkMultiline: (content) => {
      return !checkBrackets(content);
    },
    parse: (content) => {
      let params = parseProp(content);
      return params;
    },
  },
  {
    key: "hook",
    match: (content) => {
      return content.match(hookMatch);
    },
    checkMultiline: (content) => {
      return !checkBrackets(content);
    },
    parse: (content) => {
      let params = parseHook(content);
      return params;
    },
  },
  {
    key: "watch",
    match: (content) => {
      return content.match(/^\$: */);
    },
    checkMultiline: (content) => {
      return !checkBrackets(content);
    },
    parse: (content) => {
      let params = parseWatch(content);
      return params;
    },
  },
  {
    key: "method",
    match: (content) => {
      return (
        !content.match(/^\$: /) &&
        (content.match(/=>/) || content.match(/function/))
      );
    },
    checkMultiline: (content) => {
      return !parseFunction(content);
    },
    parse: (content) => {
      let params = parseFunction(content);
      return params;
    },
  },
  {
    key: "data",
    match: (content) => {
      return content.match(/let /) || content.match(/const /);
    },
    checkMultiline: (content) => {
      return !checkBrackets(content);
    },
    parse: (content) => {
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
    const children = get(schema, "children[0].value", "");

    // Item types
    let blocks = [];

    const cs = children.split("\n").filter((c) => c);
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
          break;
        }
      }
    }
    return blocks;
  }
  return null;
}

function replaceStates(content, states) {
  if (content && typeof content === "string") {
    let newStr = content;
    const keys = Object.keys(states);
    for (let i = 0; i < keys.length; i++) {
      const stateKey = keys[i];
      const stateParams = states[stateKey];
      for (let j = 0; j < stateParams.length; j++) {
        const { block, name, dataType } = stateParams[j];
        if (block === "prop" || block === "data") {
          const reg = new RegExp(`(?<![\.\"\'\`])\\b${name}\\b`, "g");
          newStr = newStr.replace(reg, `${name}.value`);

          // Replace shorthand property assignment
          const nmVal = `${name}.value`;
          // Object property assignment
          const clReg = new RegExp(
            `((\\b(${nmVal})(?=:))|((?<=((const|let|var) +))\\b(${nmVal})))`,
            "g"
          );
          newStr = newStr.replace(clReg, `${name}`);
          // Short-hand property assignment
          const shReg = new RegExp(
            `((?<=([\{,][\\n\\r\\s]*))(${nmVal})(?=([\\n\\r\\s]*[\},])))`,
            "g"
          );
          newStr = newStr.replace(shReg, `${name}: ${name}.value`);
          // Argument assignment
          const argReg = new RegExp(
            `((?<=(function\(.*))(${nmVal})(?=(.*\)))|((${nmVal})(?=(.*(\=\>)))))`,
            "g"
          );
          newStr = newStr.replace(argReg, `${name}`);
        }
      }
    }
    return newStr;
  }
  return "";
}

function getContextVars(imports, config) {
  const plugins = [];
  const components = [];
  const stores = [];
  if (Array.isArray(imports)) {
    const aliases = get(config, "aliases");
    const aliasKeys = (aliases && Object.keys(aliases)) || [];
    const pluginsConf = get(config, "plugins");

    imports.forEach((imp) => {
      const { type, category, script, defaultVars, vars, lib, path } = imp;
      if (type === "library") {
        if (category === "@utils") {
          // Plugins
          const conf = pluginsConf.find((pc) => pc.svelte === lib);
          plugins.push({
            name: get(conf, "vue", lib),
            vars: get(conf, "vars", vars),
            category,
            feature: "plugin",
          });
        } else if (category === "@stores") {
          // Stores
          stores.push({
            name: lib,
            vars,
            category,
          });
        }
      } else if (type === "svelteComponent") {
        // Svelte Components - replace with vue
        let vScript = path;
        aliasKeys.forEach((aliasKey) => {
          const alias = aliases[aliasKey];
          vScript = vScript.replace(aliasKey, alias);
        });
        const vScrSplit = typeof vScript === "string" ? vScript.split("/") : [];
        const fileName = get(vScrSplit, `[${vScrSplit.length - 1}]`, "");
        const compName = fileName.replace(/\.svelte/g, "");
        const filePath = vScrSplit.slice(0, -1).join("/");
        vScript = `${filePath}/${compName}/${compName}.vue`;
        components.push({
          defaultVars,
          vars,
          path: vScript,
        });
      }
    });
    return { plugins, components, stores };
  }
  return { plugins, components, stores };
}

function getPropOpts(props) {
  let propOptsStr = "";
  if (Array.isArray(props)) {
    const propOpts = [];
    props.forEach((prop) => {
      const { dataType, defaultValue, name } = prop;
      const typeStr =
        dataType && dataType !== "undefined" ? `type: ${dataType}` : "";
      const defaultStr =
        defaultValue && defaultValue !== "undefined"
          ? `default: ${defaultValue}`
          : "";
      const prList = [];
      if (typeStr) {
        prList.push(typeStr);
      }
      if (defaultStr) {
        prList.push(defaultStr);
      }
      propOpts.push(`${name}: { ${printList(prList)} }`);
    });
    propOptsStr = `props: {\n${printList(propOpts, ",\n")}\n}`;
    return propOptsStr;
  }
  return propOptsStr;
}

function getFunction(blockParams, states) {
  if (blockParams) {
    const { block, hookKey, hookVal, script, name, def } = blockParams;
    if (block === "hook") {
      let str = script.replace(hookKey, hookVal);
      str = replaceStates(str, states);
      return str;
    } else {
      let str = replaceStates(script, states);
      return str;
    }
  }
  return "";
}

function getWatch(blockParams, states) {
  if (blockParams) {
    const { block, expression, name } = blockParams;
    let str = replaceStates(expression, states);
    if (block === "watch") {
      return `watchEffect(${str});`;
    } else if (block === "computed") {
      return `const ${name} = computed(${str});`;
    }
  }
  return "";
}

const returnBlockTypes = ["prop", "data", "method", "computed"];

function getComponentVals(vueComps) {
  let impStr = "";
  let optStr = "";
  if (Array.isArray(vueComps)) {
    const opts = [];
    let defaults;
    vueComps.forEach((i) => {
      defaults = i.defaultVars.join(", ");
      if (defaults) {
        opts.push(defaults);
      }
      const items = defaults ? [defaults] : [];
      if (i.vars && i.vars.length) {
        items.push(`{ ${i.vars.join(", ")} }`);
      }
      impStr += `import ${items.join(", ")} from "${i.path}";\n`;
    });
    optStr = opts.length ? `components: { ${opts.join(", ")} }` : "";
  }
  return {
    imports: impStr,
    options: optStr,
  };
}

function getReturnVals(blocks) {
  if (get(blocks, "length")) {
    const returnVals = blocks
      .filter((bl) => {
        return returnBlockTypes.includes(bl.block);
      })
      .map((bl) => {
        const blTr = bl.name ? bl.name.trim() : "";
        if (blTr.match(/^[\{\[](.|\n|\r)*[\]\}]$/g)) {
          const spread = (blTr.replace(/[\{\[\]\} \n]/g, "") || "")
            .split(",")
            .filter((val) => val && val !== "null" && val !== "undefined")
            .map((val) => val.trim())
            .join(", ");
          return spread;
        }
        return blTr;
      })
      .filter((val) => {
        return val && val !== "null" && val !== "undefined";
      })
      .join(", ");
    return `return { ${returnVals} }`;
  }
  return "return {}";
}

export function printScript(parsed, componentName, config) {
  let scrStr = "";
  if (Array.isArray(parsed)) {
    // Script tags
    scrStr += "\n<script>\n";
    // Import composition API
    const requiredFeatures = ["defineComponent", "ref", "toRefs"];
    parsed.forEach((i) => {
      if (
        (i.block === "computed" || i.block === "watch") &&
        !requiredFeatures.includes(get(VUE_COMP_API, i.block))
      ) {
        const imp = get(VUE_COMP_API, i.block);
        requiredFeatures.push(imp);
      }
    });
    // - Hooks
    parsed.forEach((p) => {
      if (p.hookVal) {
        requiredFeatures.push(p.hookVal);
      } else if (
        p.category === "@utils" &&
        !requiredFeatures.includes("useContext")
      ) {
        requiredFeatures.push("useContext");
      } else if (
        p.category === "@stores" &&
        !requiredFeatures.includes("useStore")
      ) {
        requiredFeatures.push("useStore");
      }
    });
    scrStr += `import { ${requiredFeatures.join(
      ", "
    )} } from '@nuxtjs/composition-api';\n`;

    // Imports
    let imports = [];
    let otherScripts = [];
    let props = [];
    let data = [];

    parsed.forEach((p) => {
      if (p.block === "import") {
        imports.push(p);
      } else if (p.block === "prop") {
        props.push(p);
      } else {
        if (p.block === "data") {
          data.push(p);
        }
        otherScripts.push(p);
      }
    });
    // Imports components
    // Convert imports to Vue format
    const {
      plugins: vuePlugins,
      components: vueComps,
      stores: vueStores,
    } = getContextVars(imports, config);
    const { imports: compImports, options: compOpts } =
      getComponentVals(vueComps);
    scrStr += compImports;

    // Indent
    const sp = "    ";
    // Vue ----- Start
    scrStr += `\nexport default defineComponent({\n`;
    // Name
    scrStr += `${sp}name: "${componentName}",\n`;
    // Components
    scrStr += compOpts ? `${sp}${compOpts},\n` : "";
    // Props
    scrStr += `${sp}${getPropOpts(props)},`;

    // Setup ----- Start
    scrStr += `\n${sp}setup(${props.length ? "props" : ""}) {\n`;

    let bodyScr = "";

    // Context - plugins
    bodyScr += vuePlugins.length
      ? `\nconst { ${vuePlugins
          .map((p) => p.name)
          .join(", ")} } = useContext();\n`
      : "";
    let plScr = "";
    vuePlugins.forEach((pl) => {
      plScr +=
        pl.vars && pl.vars.length
          ? `${sp}const { ${pl.vars.join(", ")} } = ${pl.name};\n`
          : "";
    });
    bodyScr += plScr;

    // Prop - reactive
    bodyScr += props.length
      ? `${sp}const { ${props
          .map((p) => p.name)
          .join(", ")} } = toRefs(props);\n`
      : "";
    if (Array.isArray(otherScripts)) {
      // State changes (refs)
      const states = { props, data };

      for (let i = 0; i < otherScripts.length; i++) {
        const el = otherScripts[i];
        if (el.block === "data") {
          const { name, defaultValue, dataType, ref: dataRef } = el;
          const ref = dataRef ? "ref" : "";
          bodyScr += `${sp}const ${name}${
            ref || defaultValue
              ? ` = ${ref}${ref ? "(" : ""}${
                  dataRef && !(defaultValue || defaultValue === "undefined")
                    ? ""
                    : defaultValue
                }${ref ? ")" : ""}`
              : ""
          };\n`;
        } else if (el.block === "method" || el.block === "hook") {
          bodyScr += `\n${sp}${getFunction(el, states)}\n`;
        } else if (el.block === "computed" || el.block === "watch") {
          bodyScr += `\n${sp}${getWatch(el, states)}\n`;
        }
      }
    }
    bodyScr += `\n${sp}${getReturnVals(parsed)}`;

    scrStr += `${bodyScr}\n  }\n`;
    // Setup ----- End

    scrStr += `});\n`;
    scrStr += "</script>";
  }
  return scrStr;
}
