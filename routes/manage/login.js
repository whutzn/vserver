var express = require("express");
var router = express.Router();

// user login
var login = router.route("/login");

login.post(function(req, res, next) {
    var phone = req.query.account || req.body.account;
    var password = req.query.password || req.body.password;

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        var sql = "SELECT pwd FROM usr WHERE user = ? ";

        conn.query(sql, [phone], function(err, rows) {
            if (err) return next("login error" + err);

            if (rows.length == 0) {
                res.send(
                    JSON.stringify({
                        code: 2,
                        desc: "no user"
                    })
                );
            } else if (rows[0].pwd != password) {
                res.send(
                    JSON.stringify({
                        code: 1,
                        desc: "wrong password"
                    })
                );
            } else {
                res.send(
                    JSON.stringify({
                        code: 0,
                        desc: "login success"
                    })
                );
            }
        });
    });
});

// usr set pwd
var setUsr = router.route("/setusr");

setUsr.post(function(req, res, next) {
    var password = req.query.password || req.body.password;

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        var sql = "UPDATE usr SET pwd = ? WHERE user = 'admin' ";

        conn.query(sql, [password], function(err, rows) {
            if (err) {
                res.send(
                    JSON.stringify({
                        code: 1,
                        desc: "set pwd error"
                    })
                );
                return next("login error" + err);
            } else res.send(
                JSON.stringify({
                    code: 0,
                    desc: "set pwd success"
                })
            );
        });
    });
});

var getUserInfo = router.route("/getuserinfo");

getUserInfo.post(function(req, res, next) {
    let key = req.body.key || req.query.key || '';
    let pageSize = req.body.pageSize || req.query.pageSize || "";
    let pageNum = req.body.pageNum || req.query.pageNum || "";

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        var sql = "SELECT	id,	phone,	vtime,	DATE_ADD( vtime, INTERVAL 1 DAY ) AS ctime FROM	`user` ";

        if (key != '') {
            sql += "WHERE INSTR(phone,'" + key + "') > 0 ";
        }

        if (pageNum != "" && pageSize != "") {
            let start = (pageNum - 1) * pageSize;
            sql += " LIMIT " + start + "," + pageSize;
        }

        sql += ";SELECT COUNT(*) AS count FROM user ";

        if (key != '') {
            sql += "WHERE INSTR(phone,'" + key + "') > 0 ";
        }

        conn.query(sql, [], function(err, rows) {
            if (err) return next("query user info error" + err);
            let result = [];
            rows[0].forEach(row => {
                let element = {};
                element.id = row.id,
                    element.phone = row.phone,
                    element.time = row.vtime,
                    element.type = 0;
                if (element.time == null) {
                    element.type = 0
                } else {

                    if (new Date(row.ctime) >= new Date()) {
                        element.type = 1;
                    }
                }
                result.push(element);
            });
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: result,
                    count: rows[1][0].count || 0
                })
            );
        });
    });
});

module.exports = router;