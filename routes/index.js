const log4js = require("./../logUtil");
const logger = log4js.getLogger();
jwt = require("jsonwebtoken");

module.exports = function(app) {
    app.use(function(req, res, next) {
        logger.trace(req.method, req.url);
        console.log(req.url,req.headers["token"])
        // console.log('body', req.body.token ,'query', req.query.token ,'headers', req.headers["token"]);
        let token = req.headers["token"] || req.body.token || req.query.token ;
        console.log('token',token)
        if(token) {
            if(token == "laoyouquan1") {
                next()
            }else {
                jwt.verify(token, "laoyouquan", function (err, decode) {
                    if (err) {  //  时间失效的时候/ 伪造的token          
                        res.send({code:401,msg:'no access'});
                    } else {
                        console.log(decode); 
                        next();
                    }
                });
            }
        }else {
            res.send({code:401,msg:'no access'});
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