import get from "lodash.get";
import camelCase from "lodash.camelcase";
import { printSvEl, parseScript } from "./utils.js";

export function writeToVue(name, schema) {
  if (get(schema, "type") === "root") {
    const children = get(schema, "children");

    // Scripts
    let scriptStr = "";
    const scripts = children.find(child => {
      return (
        get(child, "type") === "svelteScript" &&
        get(child, "tagName") === "script"
      );
    });
    const parsedScripts = parseScript(scripts);

    const elements = children.filter(child => {
      return !(
        get(child, "type") === "svelteScript" ||
        get(child, "tagName") === "script"
      );
    });

    let templateStr = "";
    if (elements.length) {
      let str = "<template>\n";
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        str += printSvEl(el);
      }
      str += "\n<template>";
      templateStr = str;
    }

    let fileStr = `${templateStr}\n${scriptStr}`;
    return fileStr;
  }
  return "";
}
