let express = require("express"),
  router = express.Router();

let generatecode = router.route("/generatecode");

generatecode.post(function(req, res, next) {
  console.log(req.body);
  const num = req.query.num;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "INSERT INTO invitecode(code,addtime) VALUES ?";
    let arr = [];
    for(let i = 0; i < num; i++ ) {
      arr.push([generateUUID(), new Date()]);
    }

    conn.query(sql, [arr], function(err, rows) {
      if (err) {
        if (err.hasOwnProperty("errno") && err.errno === 1062) {
          res.send({ code: 2, desc: "already generate code" });
        } else return next("generatecode error" + err);
      } else res.send({ code: 0, desc: 'create code success!' });
    });
  });
});

function generateUUID() {
  var d = new Date().getTime();
  var uuid = "xxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

let getCode = router.route("/getinvitecode");

getCode.get(function(req, res, next) {

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "SELECT * FROM invitecode ;";

    conn.query(sql, [], function(err, rows) {
      if (err) return next("get invite code error" + err);
      res.send(
        JSON.stringify({
          code: 0,
          desc: rows
        })
      );
    });
  });
});

let bindCode = router.route("/bindinvitecode");

bindCode.post(function(req, res, next) {
  let uid = req.query.uid,
  code = req.query.code;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "UPDATE invitecode SET uid = ?, usetime = NOW() WHERE `code` = ? AND usetime IS NULL; SELECT * FROM invitecode WHERE code = '"+code+"' ;";

    conn.query(sql, [uid,code], function(err, rows) {
      if (err) return next("bind invite code error" + err);
      if(rows[0].affectedRows == 1) {
        let vipsql = "UPDATE `user` SET vtime = DATE_ADD( vtime, INTERVAL 30 DAY ) WHERE id = "+ uid +" AND DATE_ADD( vtime, INTERVAL 1 DAY ) > NOW() ;UPDATE `user` SET vtime = DATE_ADD( NOW(), INTERVAL 30 DAY ) WHERE id = "+uid+ " AND (vtime < NOW() OR vtime IS NULL);";
        conn.query(vipsql,[], function(err, rows1){
          // console.log(rows1);
          if (err) return next("set code error" + err);
          res.send(
            JSON.stringify({
              code: 0,
              desc: 'bind code success'
            })
          );
        });
      }else if(rows[0].affectedRows == 0) {
        if(rows[1].length == 0) {
          res.send(
            JSON.stringify({
              code: 1,
              desc: 'err code'
            })
          );
        }else {
          res.send(
            JSON.stringify({
              code: 2,
              desc: 'already bind'
            })
          );
        }
      }
    });
  });
});

var removeCode = router.route("/removeinvitecode");

removeCode.post(function(req, res, next) {

    let id = req.query.id;

    req.getConnection(function(err, conn) {
        if (err) return next(err);

        var sql = "DELETE FROM invitecode WHERE id = ?";

        conn.query(sql, [id], function(err, rows) {
            if (err) return next("remove code error" + err);
            res.send(
                JSON.stringify({
                    code: 0,
                    desc: 'remove code success'
                })
            );
        });
    });
});

module.exports = router;
