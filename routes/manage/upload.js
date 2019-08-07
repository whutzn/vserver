let express = require("express"),
 router = express.Router(),
 multer = require("multer"),
 storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload')
  },
  filename: function (req, file, cb) {
    // console.log('name',file.originalname);
    // var str = file.originalname.split('.');
    cb(null, file.originalname);
  }
}),
upload = multer({storage: storage});

var uploadfile = router.route("/upload_file");

uploadfile.post(upload.array("file",20),function(req, res, next) {
  req.getConnection(function(err, conn) {
    if (err) return next(err);
    let arr = [];
	for(let i in req.files){
    let metadata = [req.files[i].fieldname,req.files[i].originalname,req.files[i].encoding,req.files[i].mimetype,req.files[i].size,req.files[i].path, new Date()];
		arr.push(metadata);
  }
  
  let addSQL = "INSERT INTO uploadfiles(fieldname, filename, encoding, mimetype, size, filepath, addTime) VALUES ?";

    conn.query(addSQL, [arr], function(err, rows) {
        if (err) {
          res.send({
            code: 1,
            desc: '上传数据库异常'
          })
          return next("query error" + err);
        }else {
          // console.log('rows',rows);
          // rows.insertId,rows.affectedRows,
          res.send({
            code: 0,
            desc: '上传成功'
          });
        }
    });
});
  
});

module.exports = router;