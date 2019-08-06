/**
 * 日志模块
 */
const log4js = require("log4js");

log4js.configure({
  appenders: { logs: { type: "file", filename: "app.log" } },
  categories: { default: { appenders: ["logs"], level: "trace" } }
});

function getLogger() {
  return log4js.getLogger("default");
}

module.exports = {
  getLogger
};
