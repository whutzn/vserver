var express = require("express");
var router = express.Router();

var getCityList = router.route("/getcitylist");

getCityList.get(function(req, res, next) {

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        var sql = "SELECT * FROM city";

        conn.query(sql, [], function(err, rows) {
            if (err) return next("get city list error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: rows
                })
            );
        });
    });
});

var addCity = router.route("/addcity");

addCity.post(function(req, res, next) {
    let name = req.query.name,
        info = req.query.info;
    req.getConnection(function(err, conn) {
        if (err) return next(err);

        var sql = "INSERT INTO city(name,info) VALUES (?,?);";

        conn.query(sql, [name, info], function(err, rows) {
            if (err) return next("add city error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: rows.insertId
                })
            );
        });
    });
});

var removeCity = router.route("/removecity");

removeCity.post(function(req, res, next) {

    let id = req.query.id;

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        var sql = "DELETE FROM city WHERE id = ?";

        conn.query(sql, [id], function(err, rows) {
            if (err) return next("remove city error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: 'remove success'
                })
            );
        });
    });
});

var updateCity = router.route("/setcity");

updateCity.post(function(req, res, next) {

    let id = req.query.id,
        name = req.query.name,
        info = req.query.info;


    req.getConnection(function(err, conn) {
        if (err) return next(err);

        var sql = "UPDATE city SET name = ? , info = ? WHERE id = ?";

        conn.query(sql, [name, info, id], function(err, rows) {
            if (err) return next("set city error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: 'set city success'
                })
            );
        });
    });
});

module.exports = router;