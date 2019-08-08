let express = require("express"),
 router = express.Router();

let getNotice = router.route("/getnotice");

getNotice.get(function(req, res, next) {

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "SELECT notice.`desc` FROM notice ;";

    conn.query(sql, [], function(err, rows) {
      if (err) return next("get notice error" + err);
      res.send(
        JSON.stringify({
          code: 0,
          desc: rows[0].desc
        })
      );
    });
  });
});

let setNotice = router.route("/setnotice");

setNotice.post(function(req, res, next) {

  let content = req.query.content;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "UPDATE notice SET notice.`desc` = ? ;";

    conn.query(sql, [content], function(err, rows) {
      if (err) return next("set notice error" + err);
      res.send(
        JSON.stringify({
          code: 0,
          desc: 'set notice success'
        })
      );
    });
  });
});

let getAgency = router.route("/getagency");

getAgency.get(function(req, res, next) {

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "SELECT agency.`desc` FROM agency ;";

    conn.query(sql, [], function(err, rows) {
      if (err) return next("get agency error" + err);
      res.send(
        JSON.stringify({
          code: 0,
          desc: rows[0].desc
        })
      );
    });
  });
});

let setAgency = router.route("/setagency");

setAgency.post(function(req, res, next) {

  let content = req.query.content;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "UPDATE agency SET agency.`desc` = ? ;";

    conn.query(sql, [content], function(err, rows) {
      if (err) return next("set agency error" + err);
      res.send(
        JSON.stringify({
          code: 0,
          desc: 'set agency success'
        })
      );
    });
  });
});

let getMemberInfo = router.route("/getmemberinfo");

getMemberInfo.get(function(req, res, next) {

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "SELECT member_info.`desc` FROM member_info ;";

    conn.query(sql, [], function(err, rows) {
      if (err) return next("get member info error" + err);
      res.send(
        JSON.stringify({
          code: 0,
          desc: rows[0].desc
        })
      );
    });
  });
});

let setMemberInfo = router.route("/setmemberinfo");

setMemberInfo.post(function(req, res, next) {

  let content = req.query.content;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "UPDATE member_info SET member_info.`desc` = ? ;";

    conn.query(sql, [content], function(err, rows) {
      if (err) return next("set member info error" + err);
      res.send(
        JSON.stringify({
          code: 0,
          desc: 'set member info success'
        })
      );
    });
  });
});

module.exports = router;
