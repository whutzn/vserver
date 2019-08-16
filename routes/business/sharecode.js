let express = require("express"),
  router = express.Router();

let getShareCode = router.route("/getsharecode");

getShareCode.post(function(req, res, next) {
  console.log('query',req.query,'body',req.body);
  let id = req.query.id||req.body.id;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let querySql = "SELECT * FROM `sharecode` WHERE uid = ?";

    conn.query(querySql, [id], function(err, rows) {
      if (err) {
        return next(err);
      } else {
        if(rows.length == 0) {
          let addSql = "INSERT INTO sharecode(code,uid,count,valid) VALUES(?,?,0,1)",
          code = generateShareCode();
          conn.query(addSql,[code,id], function(err1,rows1){
            if(err1) return next(err1);
            res.send({
              code: 0,
              desc: {code: code}
            });
          }); 
        }else {
          res.send({
            code: 0,
            desc: rows[0]
          });
        }
      }
    });
  });
});

function generateShareCode() {
  var d = new Date().getTime();
  var uuid = "xxxxxx".replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

let bindShareCode = router.route("/bindsharecode");

bindShareCode.post(function(req, res, next) {
  let phone = req.query.phone||req.body.phone,
  code = req.query.code||req.body.code;

  if(code == '') {
    res.send({code:3,desc: 'no code' });
    return;
  }
  
  req.getConnection(function(err, conn) {
    if (err) return next(err);
    let querySql = "SELECT * FROM `user` WHERE phone = '"+phone +"' ;SELECT * FROM sharecode WHERE code = '"+code+"' ;";
    conn.query(querySql,[],function(err,rows){
      if(err) return next(err);
      if(rows[0].length == 0) {
        if(rows[1][0].valid == 1) {
          let setSql = "UPDATE sharecode SET count = ?, valid = ? WHERE id = ? ;",
          id = rows[1][0].id,
          uid = rows[1][0].uid,
          count = rows[1][0].count,
          valid = rows[1][0].valid;
          count ++;
          if(count == 3) {
            valid = 0;
            setSql += "UPDATE `user` SET vtime = DATE_ADD( vtime, INTERVAL 30 DAY ) WHERE id = "+ uid +" AND DATE_ADD( vtime, INTERVAL 1 DAY ) > NOW() ;UPDATE `user` SET vtime = DATE_ADD( NOW(), INTERVAL 30 DAY ) WHERE id = "+uid+ " AND (vtime < NOW() OR vtime IS NULL);";
          } 
          conn.query(setSql,[count,valid,id],function(err1, rows1){
              if(err1) return next(err1);
              res.send({
                code: 0,
                desc: "bind share code success"
              });
          });
        } else res.send({code:2 , desc: 'not valid code'})
      }else res.send({code:1, desc:'already bind'});
    });

  });
});

module.exports = router;