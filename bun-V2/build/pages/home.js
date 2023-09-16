import {
Layout
} from "../chunk-3e08d8a63ce6c144.js";
import {
__toESM,
require_jsx_dev_runtime,
require_react
} from "../chunk-63abc4cc02303101.js";

// pagesmodules/scheduler/cjs/sched
var import_react = __toESM(require_react(), 1);
var jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
function TestComponent({ message }) {
  const [state, setState] = import_react.useState(0);
  return jsx_dev_runtime.jsxDEV("div", {
    children: [
      jsx_dev_runtime.jsxDEV("h1", {
        className: "bg-green-900 p-4 flex justify-center",
        children: "TEST CLASS NAMES"
      }, undefined, false, undefined, this),
      jsx_dev_runtime.jsxDEV("h1", {
        children: [
          "Hello ",
          message
        ]
      }, undefined, true, undefined, this),
      jsx_dev_runtime.jsxDEV("h1", {
        children: [
          "Counter: ",
          state
        ]
      }, undefined, true, undefined, this),
      jsx_dev_runtime.jsxDEV("button", {
        onClick: () => setState(state + 1),
        children: "INCREMENT"
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}

// pagesmodules/sched
var jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
function Example() {
  return jsx_dev_runtime2.jsxDEV(Layout, {
    title: "Example Page",
    children: jsx_dev_runtime2.jsxDEV("div", {
      children: jsx_dev_runtime2.jsxDEV(TestComponent, {
        message: "from example page"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
}
export {
  Example as default
};
