let express = require("express"),
    router = express.Router(),
    path = require("path"),
    fs = require("fs");

let sendVideo = router.route("/video/:video");

sendVideo.get(function(req, res, next) {
    let id = req.params.video;

    req.getConnection(function(err,conn){
      if (err) return next(err);
      let sql = "SELECT * FROM videofiles WHERE id = ? ;"

        conn.query(sql, [id], function(err, rows) {
            if (err) {
                res.send({
                    code: 1,
                    desc: "get video fail"
                });
                return next("query error" + err);
            } else {
              let path = "./public/upload/" + rows[0].filename;
              let stat = fs.statSync(path);
              // console.log('video stat', stat);
              let fileSize = stat.size,
               range = req.headers.range,
               mineType = rows[0].mimetype;
               if (range) {
                //有range头才使用206状态码
                let parts = range.replace(/bytes=/, "").split("-");
                let start = parseInt(parts[0], 10);
                let end = parts[1] ? parseInt(parts[1], 10) : start + 999999;
        
                // end 在最后取值为 fileSize - 1
                end = end > fileSize - 1 ? fileSize - 1 : end;
                let chunksize = end - start + 1;
                let file = fs.createReadStream(path, { start, end });
                let head = {
                    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunksize,
                    "Content-Type": mineType
                };
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                let head = {
                    "Content-Length": fileSize,
                    "Content-Type": mineType
                };
                res.writeHead(200, head);
                fs.createReadStream(path).pipe(res);
            }
            }
        });

    });
});

module.exports = router;