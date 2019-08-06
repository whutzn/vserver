var express = require("express");
var router = express.Router();

// user login
var login = router.route("/login/phone/:phone/password/:password/mode/:mode");

login.get(function(req, res, next) {
  var phone = req.params.phone;
  var password = req.params.password;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    var sql = "SELECT password FROM user WHERE phone = ? ";

    conn.query(sql, [phone], function(err, rows) {
      if (err) return next("login error" + err);

      if (rows.length == 0) {
        res.send(
          JSON.stringify({
            code: 2,
            desc: "no user"
          })
        );
      } else if (rows[0].password != password) {
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
