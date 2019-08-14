let express = require("express"),
    router = express.Router();

let getLevel1 = router.route("/getlevel1");

getLevel1.get(function(req, res, next) {

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        let sql = "SELECT * FROM `level1`;";

        conn.query(sql, [], function(err, rows) {
            if (err) return next("get level1 error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: rows
                })
            );
        });
    });
});

let addLevel1 = router.route("/addlevel1");

addLevel1.post(function(req, res, next) {

    let className = req.query.name;

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        let sql = "INSERT INTO level1 ( className, level ) VALUES	( ? , 1 );";

        conn.query(sql, [className], function(err, rows) {
            if (err) return next("add level1 error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: rows.insertId
                })
            );
        });
    });
});

let setLevel1 = router.route("/setlevel1");

setLevel1.post(function(req, res, next) {
    let className = req.query.name,
        id = req.query.id;

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        let sql = "UPDATE level1 SET level1.className = ? WHERE id = ?;";

        conn.query(sql, [className, id], function(err, rows) {
            if (err) return next("set level1 error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: 'set level1 success'
                })
            );
        });
    });
});

let removeLevel1 = router.route("/removelevel1");

removeLevel1.post(function(req, res, next) {
    let id = req.query.id;

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        let sql = "DELETE level2,level1 FROM	level2	LEFT JOIN level1 ON level2.parent = level1.id WHERE	level1.id = ?;";

        conn.query(sql, [id], function(err, rows) {
            if (err) return next("remove level1 error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: 'remove level1 success'
                })
            );
        });
    });
});

let getLevel2 = router.route("/getlevel2");

getLevel2.post(function(req, res, next) {

    let id = req.query.id;

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        let sql = "SELECT * FROM `level2` where parent = ?;";

        conn.query(sql, [id], function(err, rows) {
            if (err) return next("get level2 error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: rows
                })
            );
        });
    });
});

let addLevel2 = router.route("/addlevel2");

addLevel2.post(function(req, res, next) {

    let className = req.query.name,
        parent = req.query.parent;

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        let sql = "INSERT INTO level2 ( className, level, parent ) VALUES	( ? , 2 , ?);";

        conn.query(sql, [className, parent], function(err, rows) {
            if (err) return next("add level2 error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: rows.insertId
                })
            );
        });
    });
});

let setLevel2 = router.route("/setlevel2");

setLevel2.post(function(req, res, next) {
    let className = req.query.name,
        id = req.query.id;

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        let sql = "UPDATE level2 SET level2.className = ? WHERE id = ?;";

        conn.query(sql, [className, id], function(err, rows) {
            if (err) return next("set level2 error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: 'set level2 success'
                })
            );
        });
    });
});

let removeLevel2 = router.route("/removelevel2");

removeLevel2.post(function(req, res, next) {
    let id = req.query.id;

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        let sql = "DELETE FROM level2 WHERE id = ?;";

        conn.query(sql, [id], function(err, rows) {
            if (err) return next("remove level2 error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: 'remove level2 success'
                })
            );
        });
    });
});

module.exports = router;