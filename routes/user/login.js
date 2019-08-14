let express = require("express"),
 router = express.Router();

let login = router.route("/login");

login.post(function(req, res, next) {
  let phone = req.query.phone,
   password = req.query.password;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "SELECT * FROM user WHERE phone = ? ";

    conn.query(sql, [phone], function(err, rows1) {
      if (err) return next("login error" + err);

      if (rows1.length == 0) {
        res.send(
          JSON.stringify({
            code: 2,
            desc: "no user"
          })
        );
      } else if (rows1[0].password != password) {
        res.send(
          JSON.stringify({
            code: 1,
            desc: "wrong password"
          })
        );
      } else {
        let cursql = "INSERT INTO login(phone,time) VALUES (?, NOW());";
        conn.query(cursql,[phone], function(err,rows2) {
          if(err) return next(err);
          res.send(
            JSON.stringify({
              code: 0,
              desc: {
                id: rows1[0].id
              }
            })
          );
        });
      }
    });
  });
});

module.exports = router;
