import get from "lodash.get";
import camelCase from "lodash.camelcase";
import {
  checkBrackets,
  parseImport,
  parseFunction,
  getDataType,
  parseProp,
  parseData,
} from "./utils.js";

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
    let mounted = null;

    const cs = children
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c);
    console.log(cs);
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
      contLine(c);

      // Imports
      if (mLType === "import" || c.match(/^import/)) {
        // Multi-line
        // - Set multi-line
        if (!c.match(/;$/)) {
          startLine("import", c);
        } else {
          // - End line
          endLine();
        }

        // Complete line
        if (isLineEnd) {
          const line = multiline || c;
          if (line.includes(".svelte")) {
            svelteCmpts.push(line);
          } else if (line) {
            let params = parseImport(line);
            importVars.push(params);
          }
          resetLine();
        }
        continue;
      }

      // Props
      if (mLType === "prop" || c.match(/export let/)) {
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

      // Watch methods
      if (mLType === "watch" || c.match(/^\$: \{/)) {
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
        (!c.match(/^\$: /) && (c.match(/=>/) || c.match(/function/)))
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
      if (mLType === "data" || c.match(/let /) || c.match(/\$: (.+) =/)) {
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
      mounted,
    };
    return opts;
  }
}

function writeElement(el, initialString) {
  const { type, tagName, properties, selfClosing, children } = el;
  if (type === "svelteElement") {
    initialString += `<${tagName}${selfClosing ? " " : ">"}`;
  }
}

export function writeToVue(name, schema) {
  if (get(schema, "type") === "root") {
    const children = get(schema, "children");
    const scripts = children.find((child) => {
      return (
        get(child, "type") === "svelteScript" &&
        get(child, "tagName") === "script"
      );
    });
    const parsedScripts = parseScript(scripts);

    const elements = children.filter((child) => {
      return get(child, "type") === "svelteElement";
    });

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
    }
  }
}
