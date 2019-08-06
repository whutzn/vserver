const log4js = require("./../logUtil");
const logger = log4js.getLogger();

module.exports = function(app) {
  app.use(function(req, res, next) {
    logger.trace(req.method, req.url);
    next();
  });

  app.use("/data", require("./feature"));
  app.use("/get", require("./data"));
  app.use("/user", require("./user/validatecode"));
  app.use("/user", require("./user/register"));
  app.use("/user",require("./user/login"));

  app.use("/business",require("./business/invitecode"));
};
