let express = require("express"),
    router = express.Router(),
    multer = require("multer"),
    fs = require("fs"),
    storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, "./public/upload");
        },
        filename: function(req, file, cb) {
            // console.log('name',file.originalname);
            // var str = file.originalname.split('.');
            cb(null, file.originalname);
        }
    }),
    upload = multer({ storage: storage });

var uploadfile = router.route("/uploadfile");

uploadfile.post(upload.array("file", 20), function(req, res, next) {
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let arr = [];
        for (let i in req.files) {
            console.log("file", JSON.stringify(req.files));
            let metadata = [
                req.files[i].fieldname,
                req.files[i].originalname,
                req.files[i].encoding,
                req.files[i].mimetype,
                req.files[i].size,
                req.files[i].path,
                new Date()
            ];
            arr.push(metadata);
        }

        let addSQL =
            "INSERT INTO uploadfiles(fieldname, filename, encoding, mimetype, size, filepath, addTime) VALUES ?";

        conn.query(addSQL, [arr], function(err, rows) {
            if (err) {
                res.send({
                    code: 1,
                    desc: "上传数据库异常"
                });
                return next("query error" + err);
            } else {
                // console.log('rows',rows);
                // rows.insertId,rows.affectedRows,
                res.send({
                    code: 0,
                    desc: "上传成功"
                });
            }
        });
    });
});

let removefile = router.route("/removefile/filename/:filename");
removefile.get(function(req, res, next) {
    let fileName = req.params.filename;
    req.getConnection(function(err, conn) {
        if (err) return next(err);

        fs.unlink("./public/upload/" + fileName, err => {
            if (!err) {
                let sql = "delete from uploadfiles where filename= ?";

                conn.query(sql, [fileName], function(err, rows) {
                    if (err) {
                        res.send({
                            code: 1,
                            desc: "查询数据库异常"
                        });
                        return next("query error" + err);
                    } else {
                        res.send({
                            code: 0,
                            desc: "删除成功"
                        });
                    }
                });
            } else return next("delete error" + err);
        });
    });
});

let adstorage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, "./public/ads");
        },
        filename: function(req, file, cb) {
            // console.log('name',file.originalname);
            // var str = file.originalname.split('.');
            cb(null, file.originalname);
        }
    }),
    adupload = multer({ storage: adstorage });

var uploadAdFile = router.route("/uploadadfile");

uploadAdFile.post(adupload.array("file", 20), function(req, res, next) {
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let arr = [];
        for (let i in req.files) {
            // console.log("file", JSON.stringify(req.files));
            let metadata = [
                req.files[i].originalname,
                req.files[i].encoding,
                req.files[i].mimetype,
                req.files[i].size,
                req.files[i].path,
                new Date()
            ];
            arr.push(metadata);
        }

        let addSQL = "INSERT INTO adfiles(filename, encoding, mimetype, size, filepath, addTime) VALUES ?";

        conn.query(addSQL, [arr], function(err, rows) {
            if (err) {
                res.send({
                    code: 1,
                    desc: "上传数据库异常"
                });
                return next("query error" + err);
            } else {
                res.send({
                    code: 0,
                    desc: rows.insertId
                });
            }
        });
    });
});

let removeAdFile = router.route("/removead");
removeAdFile.post(function(req, res, next) {
    let id = req.query.id;
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let querySql = "SELECT adfiles.filename FROM	adinfo	LEFT JOIN adfiles ON adinfo.picid = adfiles.id WHERE adinfo.id = ? ";
        conn.query(querySql, [id], function(err, rows1) {
            if (err) return next("query error" + err);
            fs.unlink("./public/ads/" + rows1[0].filename, err => {
                if (!err) {
                    let sql = "DELETE adinfo.*,adfiles.* FROM	adinfo	LEFT JOIN adfiles ON adinfo.picid = adfiles.id WHERE adinfo.id = ? ";

                    conn.query(sql, [id], function(err, rows) {
                        if (err) {
                            res.send({
                                code: 1,
                                desc: "query error"
                            });
                            return next("query error" + err);
                        } else {
                            res.send({
                                code: 0,
                                desc: "remove success"
                            });
                        }
                    });
                } else return next("delete error" + err);
            });
        });
    });
});

let addAd = router.route("/addadinfo");
addAd.post(function(req, res, next) {
    let name = req.query.name,
        position = req.query.position,
        link = req.query.link,
        picId = req.query.pid;
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let sql = "INSERT INTO adinfo(`name`,position,link,picid) VALUES (?,?,?,?);";

        conn.query(sql, [name, position, link, picId], function(err, rows) {
            if (err) {
                res.send({
                    code: 1,
                    desc: "add add fail"
                });
                return next("query error" + err);
            } else {
                res.send({
                    code: 0,
                    desc: rows.insertId
                });
            }
        });
    });
});

let getAds = router.route("/getadlist");
getAds.get(function(req, res, next) {
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let sql = "SELECT adinfo.*,adfiles.filename FROM	adinfo	LEFT JOIN adfiles ON adinfo.picid = adfiles.id";

        conn.query(sql, [], function(err, rows) {
            if (err) {
                res.send({
                    code: 1,
                    desc: "add add fail"
                });
                return next("query error" + err);
            } else {
                res.send({
                    code: 0,
                    desc: rows
                });
            }
        });
    });
});


module.exports = router;