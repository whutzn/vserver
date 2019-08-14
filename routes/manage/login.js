var express = require("express");
var router = express.Router();

// user login
var login = router.route("/login");

login.post(function(req, res, next) {
    var phone = req.query.account;
    var password = req.query.password;

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

var getUserInfo = router.route("/getuserinfo");

getUserInfo.get(function(req, res, next) {

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        var sql = "SELECT	id,	phone,	vtime,	DATE_ADD( vtime, INTERVAL 1 DAY ) AS ctime FROM	`user`;";

        conn.query(sql, [], function(err, rows) {
            if (err) return next("query user info error" + err);
            let result = [];
            rows.forEach(row => {
                let element = {};
                element.id = row.id,
                element.phone = row.phone,
                element.time = row.vtime,
                element.type = 0;
                if(element.time == null) {
                    element.type = 0
                }else {
                    
                    if( new Date(row.ctime) >= new Date()) {
                        element.type = 1;
                    }
                }
                result.push(element);
            });
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: result
                })
            );
        });
    });
});

module.exports = router;