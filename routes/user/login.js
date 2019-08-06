let express = require("express"),
 router = express.Router();

// user login
let login = router.route("/login");

login.post(function(req, res, next) {
  let phone = req.query.phone,
   password = req.query.password;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "SELECT password FROM user WHERE phone = ? ";

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
