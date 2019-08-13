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

module.exports = router;