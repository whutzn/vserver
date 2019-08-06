var express = require("express");
var router = express.Router();

// user login
var generatecode = router.route("/generatecode");

generatecode.post(function(req, res, next) {
  console.log(req.body);
  const phone = req.query.phone;
  const mode = req.query.mode;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "INSERT INTO invitecode(phone,code,addtime) VALUES (?,?,NOW())";

    let ucode = generateUUID();

    conn.query(sql, [phone, ucode], function(err, rows) {
      if (err) {
        if (err.hasOwnProperty("errno") && err.errno === 1062) {
          res.send({code:2,desc:'already generate code'});
        }else return next("generatecode error" + err);
      }else res.send({code:0,desc:ucode});
    });
  });
});

function generateUUID() {
  var d = new Date().getTime();
  var uuid = "xxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

module.exports = router;
