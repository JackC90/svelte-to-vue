import get from "lodash.get";

export const replaceExpVars = (expression, config) => {
  let newStr = expression;
  if (config) {
    const plugins = get(config, "plugins");
    if (Array.isArray(plugins)) {
      plugins.forEach((plugin) => {
        const vars = get(plugin, "vars");
        if (vars) {
          const entries = Object.entries(vars);
          entries.forEach(([svelteVar, vueVar]) => {
            const svelteVarEsc = svelteVar.replace(
              /([\$])/g,
              (a, b) => `\\${b}`
            );
            const reg = new RegExp(`${svelteVarEsc}`, "g");
            newStr = newStr.replace(reg, `${vueVar}`);
          });
        }
      });
    }
  }
  return newStr;
};
