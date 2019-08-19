let express = require("express"),
    router = express.Router(),
    multer = require("multer"),
    fs = require("fs"),
    ffmpeg = require("ffmpeg"),
    storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, "./public/upload");
        },
        filename: function(req, file, cb) {
            // console.log('name',file.originalname);
            var tempStr = file.originalname.replace(/\s+/g, '');
            var str = tempStr.split('.');
            cb(null, str[0] + '-' + Date.now() + '.' + str[1]);
        }
    }),
    upload = multer({ storage: storage });

var uploadVideoFile = router.route("/uploadvideofile");

uploadVideoFile.post(upload.array("file"), function(req, res, next) {
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let arr = [];
        for (let i in req.files) {
            console.log("file", JSON.stringify(req.files));
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
            //获取第一帧图片
            let process = new ffmpeg("./public/upload/" + req.files[0].filename),
                picName = arr[0][0].split(".")[0];
            process.then(
                function(video) {
                    video.fnExtractFrameToJPG("./public/upload/", {
                            frame_rate: 1,
                            number: 1,
                            file_name: picName
                        },
                        function(error, files) {
                            if (!error) {
                                // console.log('Frames: ' + files);
                                arr.push([picName + "_1.jpg", "7bit", "image/jpg", 102400, "public/upload/" + picName + "_1.jpg", new Date()]);
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
                            } else console.log('create pic error!', error);
                        }
                    );
                },
                function(err) {
                    console.log("Error: " + err);
                }
            );
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
getVideoList.get(function(req, res, next) {
    req.getConnection(function(err, conn) {
        if (err) return next(err);
        let sql =
            "SELECT m.id AS id,m.`name` AS `name`,m.`desc` AS `desc`,m.type AS type,m.level1 AS level1,m.level2 AS level2,n.filename AS vname,o.filename AS pname FROM videoinfo AS m INNER JOIN videofiles AS n ON m.vid = n.id	INNER JOIN videofiles AS o ON m.pid = o.id;";

        conn.query(sql, [], function(err, rows) {
            if (err) {
                res.send({
                    code: 1,
                    desc: "get add fail"
                });
                return next("query error" + err);
            } else {
                rows.forEach(element => {
                    element.vname = "hhttp://103.103.68.83:3000/file/video/" + element.vname;
                    element.pname = "http://103.103.68.83:3000/upload/" + element.pname;
                });
                res.send({
                    code: 0,
                    desc: rows
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
                    element.filename = "http://103.103.68.83:3000/ads/" + element.filename;
                });
                res.send({
                    code: 0,
                    desc: rows
                });
            }
        });
    });
});

module.exports = router;