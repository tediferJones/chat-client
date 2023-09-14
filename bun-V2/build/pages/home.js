import {
__toESM,
require_jsx_dev_runtime,
require_react
} from "../chunk-c8d9d06d6ffbb9b4.js";

// pagesde_modules/scheduler/cj
var import_react = __toESM(require_react(), 1);
var jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
function TestComponent({ message }) {
  const [state, setState] = import_react.useState(0);
  return jsx_dev_runtime.jsxDEV("div", {
    children: [
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

// pagesde_mo
var jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
function Layout(props) {
  return jsx_dev_runtime2.jsxDEV("html", {
    children: [
      jsx_dev_runtime2.jsxDEV("head", {
        children: [
          jsx_dev_runtime2.jsxDEV("meta", {
            charSet: "utf-8"
          }, undefined, false, undefined, this),
          jsx_dev_runtime2.jsxDEV("link", {
            rel: "icon",
            href: "favicon.ico"
          }, undefined, false, undefined, this),
          jsx_dev_runtime2.jsxDEV("meta", {
            name: "viewport",
            content: "width=device-width, initial-scale=1"
          }, undefined, false, undefined, this),
          jsx_dev_runtime2.jsxDEV("meta", {
            name: "theme-color",
            content: "#000000"
          }, undefined, false, undefined, this),
          jsx_dev_runtime2.jsxDEV("meta", {
            name: "description",
            content: "Web site created using create-react-app"
          }, undefined, false, undefined, this),
          jsx_dev_runtime2.jsxDEV("link", {
            rel: "apple-touch-icon",
            href: "/logo192.png"
          }, undefined, false, undefined, this),
          jsx_dev_runtime2.jsxDEV("title", {
            children: props.title
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this),
      jsx_dev_runtime2.jsxDEV("body", {
        children: jsx_dev_runtime2.jsxDEV("div", {
          className: "App",
          role: "main",
          children: jsx_dev_runtime2.jsxDEV("article", {
            className: "App-article",
            children: [
              jsx_dev_runtime2.jsxDEV("div", {
                style: { height: "30px" }
              }, undefined, false, undefined, this),
              jsx_dev_runtime2.jsxDEV("h3", {
                children: props.title
              }, undefined, false, undefined, this),
              jsx_dev_runtime2.jsxDEV("div", {
                style: { height: "30px" }
              }, undefined, false, undefined, this),
              props.children
            ]
          }, undefined, true, undefined, this)
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}

// pagesde_module
var jsx_dev_runtime3 = __toESM(require_jsx_dev_runtime(), 1);
function home_default() {
  return jsx_dev_runtime3.jsxDEV(Layout, {
    title: "HOME PAGE",
    children: jsx_dev_runtime3.jsxDEV("div", {
      children: jsx_dev_runtime3.jsxDEV(TestComponent, {
        message: "from pages/home"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
}
export {
  home_default as default
};
