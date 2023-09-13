import {
__toESM,
require_jsx_dev_runtime
} from "../chunk-1bb3b012c11955dc.js";

// pagesde_modules/scheduler/cj
var jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
function TestComponent({ message }) {
  return jsx_dev_runtime.jsxDEV("h1", {
    children: [
      "Hello ",
      message
    ]
  }, undefined, true, undefined, this);
}

// pagesde_module
var jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
function home_default() {
  return jsx_dev_runtime2.jsxDEV("div", {
    children: jsx_dev_runtime2.jsxDEV(TestComponent, {
      message: "from pages/home"
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
}
export {
  home_default as default
};
