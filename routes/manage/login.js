var express = require("express");
var router = express.Router();

// user login
var login = router.route("/login");

login.post(function(req, res, next) {
  var phone = req.query.account;
  var password = req.query.password;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    var sql = "SELECT pwd FROM usr WHERE user = ? ";

    conn.query(sql, [phone], function(err, rows) {
      if (err) return next("login error" + err);

      if (rows.length == 0) {
        res.send(
          JSON.stringify({
            code: 2,
            desc: "no user"
          })
        );
      } else if (rows[0].pwd != password) {
        res.send(
          JSON.stringify({
            code: 1,
            desc: "wrong password"
          })
        );
      } else {
        res.send(
          JSON.stringify({
            code: 0,
            desc: "login success"
          })
        );
      }
    });
  });
});

module.exports = router;
