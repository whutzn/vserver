var express = require("express");
var router = express.Router();

// user login
var getinfobytime = router.route("/getinfobytime/start/:start/end/:end");

getinfobytime.get(function(req, res, next) {
    var start = req.params.start;
    var end = req.params.end;

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        var sql = "SELECT DATE_FORMAT(time,'%Y-%m-%d') AS date,COUNT(phone) AS count FROM login WHERE time BETWEEN ?  AND ? GROUP BY DATE_FORMAT(time,'%Y-%m-%d');";

        conn.query(sql, [start, end], function(err, rows) {
            if (err) return next("query error" + err);

            res.send(
                JSON.stringify({
                    code: 0,
                    desc: rows
                })
            );
        });
    });
});

var getVisitInfo = router.route("/getvisitinfo");

getVisitInfo.get(function(req, res, next) {
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        var sql = "SELECT COUNT( phone ) AS count FROM login WHERE TO_DAYS( time ) = TO_DAYS( NOW( ) );"+
        "SELECT COUNT( phone ) AS count FROM login WHERE DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= time;"+
        "SELECT COUNT( phone ) AS count FROM login WHERE DATE_FORMAT( time, '%Y%m' ) = DATE_FORMAT( CURDATE( ) , '%Y%m' );"+
        "SELECT COUNT( phone ) AS count FROM login WHERE DATE_FORMAT( time, '%Y' ) = DATE_FORMAT( CURDATE( ) , '%Y' );";

        conn.query(sql,[], function(err, rows) {
            if (err) return next("query error" + err);

            res.send(
                JSON.stringify({
                    code: 0,
                    desc: rows
                })
            );
        });
    });
});

var getRegisterInfo = router.route("/getregisterinfo");

getRegisterInfo.get(function(req, res, next) {
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        var sql = "SELECT COUNT( phone ) AS count FROM `user` WHERE TO_DAYS( time ) = TO_DAYS( NOW( ) );"+
        "SELECT COUNT( phone ) AS count FROM `user` WHERE TO_DAYS( NOW( ) ) - TO_DAYS( time ) <= 1;"+
        "SELECT COUNT( phone ) AS count FROM `user` WHERE DATE_FORMAT( time, '%Y%m' ) = DATE_FORMAT( CURDATE( ) , '%Y%m' );"+
        "SELECT COUNT(phone) AS count FROM `user`;";

        conn.query(sql,[], function(err, rows) {
            if (err) return next("query error" + err);

            res.send(
                JSON.stringify({
                    code: 0,
                    desc: rows
                })
            );
        });
    });
});


module.exports = router;