const { default: render } = require("./dist/render.js");
const { default: expressViewEngine } = require("./dist/expressViewEngine.js");

module.exports = {
  render,
  expressViewEngine
};
