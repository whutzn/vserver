const log4js = require("./../logUtil");
const logger = log4js.getLogger();

module.exports = function(app) {
    app.use(function(req, res, next) {
        logger.trace(req.method, req.url);
        next();
    });

    app.use("/user", require("./user/validatecode"));
    app.use("/user", require("./user/register"));
    app.use("/user", require("./user/login"));

    app.use("/admin", require("./business/invitecode"));
    app.use("/admin", require("./business/sharecode"));

    app.use("/admin", require("./manage/login"));
    app.use("/admin", require("./manage/maininfo"));
    app.use("/admin", require("./manage/upload"));
    app.use("/admin", require("./manage/videolevel"));
    app.use("/admin/city", require("./manage/city"));
    app.use("/admin/info", require("./manage/admininfo"));

    app.use("/file", require("./manage/videofile"));
};