const log4js = require("./../logUtil");
const logger = log4js.getLogger();

module.exports = function(app) {
    app.use(function(req, res, next) {
        logger.trace(req.method, req.url);
        console.log(req.url,req.headers["token"])
        console.log('body', req.body.token ,'query', req.query.token ,'headers', req.headers["token"]);
        if(req.headers["token"] == "eyJhbGciOiJIUzInR5cCI6IkpXVCJ9.eyJtc2ciOiIxMzI2NDcwMTIyNyIsImlhdCI6MTU2Njg4Mzk5MywiZXhwIjoxNTY2OTcwMzkzfQ.1F_OZzVGJrn67H8rDqBXhdiNmBI6ld_QoHWhsfIA") {
            next();
        }else {
            res.status(401);
            res.end();
        }
    });

    // app.use("/user",require("./business/verfiy"));
    // app.use("/admin",require("./business/verfiy"));

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
    app.use("/file", require("./business/download"));
};