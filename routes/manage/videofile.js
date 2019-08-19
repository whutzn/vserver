let express = require("express"),
    router = express.Router(),
    path = require("path"),
    fs = require("fs");

let sendVideo = router.route("/video/:video");

sendVideo.get(function(req, res, next) {
    let name = req.params.video,
        path = "./public/upload/" + name;
    let stat = fs.statSync(path);
    let fileSize = stat.size;
    let range = req.headers.range;

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
            "Content-Type": "video/mp4"
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        let head = {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4"
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
    }
});

module.exports = router;