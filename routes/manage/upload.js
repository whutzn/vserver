let express = require("express"),
    router = express.Router(),
    multer = require("multer"),
    fs = require("fs"),
    ffmpeg = require("ffmpeg"),
    fluentFFmpeg = require("fluent-ffmpeg"),
    storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, "./public/upload");
        },
        filename: function(req, file, cb) {
            // console.log('name',file.originalname);
            // var tempStr = file.originalname.replace(/\s+/g, '');
            var str = file.originalname.split(".");
            cb(null, Date.now() + "." + str[1]);
        }
    }),
    upload = multer({ storage: storage });

var uploadVideoFile = router.route("/uploadvideofile");

uploadVideoFile.post(upload.array("file"), function(req, res, next) {
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let arr = [];
        for (let i in req.files) {
            // console.log("file", JSON.stringify(req.files));
            let metadata = [
                req.files[i].filename,
                req.files[i].encoding,
                req.files[i].mimetype,
                req.files[i].size,
                req.files[i].path,
                new Date()
            ];
            arr.push(metadata);
        }
        let addSQL =
            "INSERT INTO videofiles(filename, encoding, mimetype, size, filepath, addTime) VALUES ?";
        if (req.files.length == 1 && arr[0][2].indexOf("video") >= 0) {
            //获取50%时间点的图片
            let picName = '';
            fluentFFmpeg("./public/upload/" + arr[0][0])
                .on("filenames", function(filenames) {
                    //   console.log("Will generate " + filenames);
                    picName = filenames;
                })
                .on("end", function() {
                    //   console.log("Screenshots taken");
                    arr.push([picName, "7bit", "image/jpg", 102400, "public/upload/" + picName, new Date()]);
                    conn.query(addSQL, [arr], function(err, rows) {
                        // console.log('video', rows);
                        if (err) {
                            res.send({
                                code: 1,
                                desc: "upload video error :" + err
                            });
                            return next("query error" + err);
                        } else {
                            res.send({
                                code: 0,
                                desc: {
                                    vid: rows.insertId,
                                    pid: rows.insertId + 1
                                }
                            });
                        }
                    });
                })
                .on("error", function(err, stdout, stderr) {
                    console.error("take Screenshots error : " + err.message);
                    res.send({
                        code: 1,
                        desc: "take Screenshots fail"
                    });
                })
                .screenshots({
                    timestamps: ["50%"],
                    filename: "thumbnail-%b.jpg",
                    folder: "./public/upload/"
                });
        } else if (req.files.length == 2) {
            if (arr[1][2].indexOf("video") >= 0) {
                arr.reverse();
            }
            conn.query(addSQL, [arr], function(err, rows) {
                // console.log('video', rows);
                if (err) {
                    res.send({
                        code: 1,
                        desc: "upload video error"
                    });
                    return next("query error" + err);
                } else {
                    res.send({
                        code: 0,
                        desc: {
                            vid: rows.insertId,
                            pid: rows.insertId + 1
                        }
                    });
                }
            });
        }
    });
});

let storage1 = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, "./public/upload");
        },
        filename: function(req, file, cb) {
            // console.log('name',file.originalname);
            // var tempStr = file.originalname.replace(/\s+/g, '');
            var str = file.originalname.split(".");
            cb(null, Date.now() + "." + str[1]);
        }
    }),
    upload1 = multer({ storage: storage1 });

var uploadVideoSplitFile = router.route("/uploadvideosplitfile");

uploadVideoSplitFile.post(upload1.array("file"), function(req, res, next) {
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let arr = [];
        for (let i in req.files) {
            // console.log("file", JSON.stringify(req.files));
            let metadata = [
                req.files[i].filename,
                req.files[i].encoding,
                req.files[i].mimetype,
                req.files[i].size,
                req.files[i].path,
                new Date()
            ];
            arr.push(metadata);
        }
        let addSQL =
            "INSERT INTO videofiles(filename, encoding, mimetype, size, filepath, addTime) VALUES ?";

        conn.query(addSQL, [arr], function(err, rows) {
            // console.log('video', rows);
            if (err) {
                res.send({
                    code: 1,
                    desc: "upload video error"
                });
                return next("query error" + err);
            } else {
                res.send({
                    code: 0,
                    desc: {
                        id: rows.insertId
                    }
                });
            }
        });
    });
});

let removeVideoInfo = router.route("/removevideoinfo");
removeVideoInfo.post(function(req, res, next) {
    let id = req.query.id;
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let querySql =
            "SELECT videofiles.filename FROM videofiles	LEFT JOIN videoinfo ON videofiles.id = videoinfo.pid OR videofiles.id = videoinfo.vid WHERE videoinfo.id = ?";
        conn.query(querySql, [id], function(err, rows1) {
            if (err) return next("query error" + err);
            fs.unlinkSync("./public/upload/" + rows1[0].filename);
            fs.unlink("./public/upload/" + rows1[1].filename, err => {
                if (!err) {
                    let sql =
                        "DELETE videoinfo,videofiles FROM videoinfo LEFT JOIN videofiles ON videoinfo.pid = videofiles.id OR videoinfo.vid = videofiles.id WHERE videoinfo.id = ?";

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

let addVideoInfo = router.route("/addvideoinfo");
addVideoInfo.post(function(req, res, next) {
    let name = req.query.name,
        desc = req.query.desc,
        type = req.query.type,
        level1 = req.query.level1,
        level2 = req.query.level2,
        index = req.query.index,
        vid = req.query.vid,
        pid = req.query.pid;
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let sql =
            "INSERT INTO videoinfo(`name`,`desc`,type,level1,level2,`index`,vid,pid) VALUES (?,?,?,?,?,?,?,?);";

        conn.query(
            sql, [name, desc, type, level1, level2, index, vid, pid],
            function(err, rows) {
                if (err) {
                    res.send({
                        code: 1,
                        desc: "add video info fail"
                    });
                    return next("query error" + err);
                } else {
                    res.send({
                        code: 0,
                        desc: rows.insertId
                    });
                }
            }
        );
    });
});

let setVideoInfo = router.route("/setvideoinfo");
setVideoInfo.post(function(req, res, next) {
    let name = req.query.name,
        desc = req.query.desc,
        type = req.query.type,
        level1 = req.query.level1,
        level2 = req.query.level2,
        index = req.query.index,
        vid = req.query.vid,
        pid = req.query.pid,
        id = req.query.id;
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let sql =
            "UPDATE videoinfo SET `name` = ?,`desc` = ?,type = ?,level1 = ?,level2 = ?,`index` = ?,vid = ?,pid = ? WHERE id = ?;";

        conn.query(
            sql, [name, desc, type, level1, level2, index, vid, pid, id],
            function(err, rows) {
                if (err) {
                    res.send({
                        code: 1,
                        desc: "set video fail"
                    });
                    return next("query error" + err);
                } else {
                    res.send({
                        code: 0,
                        desc: "set video success"
                    });
                }
            }
        );
    });
});

let getVideoList = router.route("/getvideolist");
getVideoList.post(function(req, res, next) {
    // console.log('query', req.query, 'body', req.body);
    let type = req.body.type || req.query.type || 2;
    let level1 = req.body.level1 || req.query.level1 || "";
    let level2 = req.body.level2 || req.query.level2 || "";
    let pageSize = req.body.pageSize || req.query.pageSize || "";
    let pageNum = req.body.pageNum || req.query.pageNum || "";
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let sql =
            "SELECT m.id AS id,m.`name` AS `name`,m.`desc` AS `desc`,m.type AS type,m.level1 AS level1,m.level2 AS level2,n.filename AS vname,o.filename AS pname FROM videoinfo AS m INNER JOIN videofiles AS n ON m.vid = n.id INNER JOIN videofiles AS o ON m.pid = o.id ";
        if (type == 0 || type == 1) {
            sql += "WHERE m.type = " + type + "";
            sql += level1 == "" ? "" : " AND level1 = '" + level1 + "' ";
            sql += level2 == "" ? "" : " AND level2 = '" + level2 + "' ";
        } else {
            if (level1 == "") {
                sql += level2 == "" ? "" : "WHERE level2 = '" + level2 + "' ";
            } else {
                sql += " WHERE level1 = '" + level1 + "' ";
            }
            sql += level2 == "" ? "" : " AND level2 = '" + level2 + "' ";
        }

        sql += " ORDER BY id DESC";

        if (pageNum != "" && pageSize != "") {
            let start = (pageNum - 1) * pageSize;
            sql += " LIMIT " + start + "," + pageSize;
        }

        sql += ";SELECT type, COUNT(*) AS count FROM videoinfo GROUP BY type ORDER BY type";

        // console.log('sql', sql)
        conn.query(sql, [], function(err, rows) {
            if (err) {
                res.send({
                    code: 1,
                    desc: "get video list fail"
                });
                return next("query error" + err);
            } else {
                rows[0].forEach(element => {
                    element.vname = "http://176.113.71.92:3000/upload/" + element.vname;
                    element.pname = "http://176.113.71.92:3000/upload/" + element.pname;
                });
                console.log(rows);
                let count = 0,
                    count1 = 0;
                if (rows[1].length == 1) {
                    if (rows[1][0].type == 1) {
                        count = rows[1][0].count;
                    } else count1 = rows[1][0].count;
                } else if (rows[1].length == 2) {
                    count = rows[1][1].count;
                    count1 = rows[1][0].count;
                }
                res.send({
                    code: 0,
                    desc: { list: rows[0], count: count, count1: count1 }
                });
            }
        });
    });
});

//-------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------

let adstorage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, "./public/ads");
        },
        filename: function(req, file, cb) {
            // console.log('name',file.originalname);
            var str = file.originalname.split(".");
            cb(null, Date.now() + "." + str[1]);
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
                req.files[i].filename,
                req.files[i].encoding,
                req.files[i].mimetype,
                req.files[i].size,
                req.files[i].path,
                new Date()
            ];
            arr.push(metadata);
        }

        let addSQL =
            "INSERT INTO adfiles(filename, encoding, mimetype, size, filepath, addTime) VALUES ?";

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
        let querySql =
            "SELECT adfiles.filename FROM	adinfo	LEFT JOIN adfiles ON adinfo.picid = adfiles.id WHERE adinfo.id = ? ";
        conn.query(querySql, [id], function(err, rows1) {
            if (err) return next("query error" + err);
            fs.unlink("./public/ads/" + rows1[0].filename, err => {
                if (!err) {
                    let sql =
                        "DELETE adinfo.*,adfiles.* FROM	adinfo	LEFT JOIN adfiles ON adinfo.picid = adfiles.id WHERE adinfo.id = ? ";

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
        let sql =
            "INSERT INTO adinfo(`name`,position,link,picid) VALUES (?,?,?,?);";

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

let setAd = router.route("/setadinfo");
setAd.post(function(req, res, next) {
    let name = req.query.name,
        position = req.query.position,
        link = req.query.link,
        picId = req.query.pid,
        id = req.query.id;
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let sql =
            "UPDATE adinfo SET `name` = ?,position = ?,link = ?,picid = ? WHERE id = ?;";

        conn.query(sql, [name, position, link, picId, id], function(err, rows) {
            if (err) {
                res.send({
                    code: 1,
                    desc: "set ad fail"
                });
                return next("query error" + err);
            } else {
                res.send({
                    code: 0,
                    desc: "set ad success"
                });
            }
        });
    });
});

let getAds = router.route("/getadlist");
getAds.get(function(req, res, next) {
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let sql =
            "SELECT adinfo.*,adfiles.filename FROM adinfo	LEFT JOIN adfiles ON adinfo.picid = adfiles.id";

        conn.query(sql, [], function(err, rows) {
            if (err) {
                res.send({
                    code: 1,
                    desc: "add add fail"
                });
                return next("query error" + err);
            } else {
                rows.forEach(element => {
                    element.filename =
                        "http://103.103.68.83:3000/ads/" + element.filename;
                });
                res.send({
                    code: 0,
                    desc: rows
                });
            }
        });
    });
});

//-------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------//

let adstorage1 = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, "./public/ads");
        },
        filename: function(req, file, cb) {
            // console.log('name',file.originalname);
            var str = file.originalname.split(".");
            cb(null, "erweima.jpg");
        }
    }),
    uploadqd = multer({ storage: adstorage1 });

var uploadqdFile = router.route("/uploadqdcodefile");

uploadqdFile.post(function(req, res, next) {
    uploadqd.single("file")(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            console.log('qd code1', err);
        } else if (err) {
            console.log('qd code2', err);
        }
        res.send({
            code: 0,
            desc: "http://103.103.68.83:3000/ads/erweima.jpg"
        });

    });
});

module.exports = router;