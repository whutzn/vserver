let express = require("express"),
  router = express.Router();

// user register
let register = router.route(
  "/register/phone/:phone/password/:password/mode/:mode"
);

register.get(function(req, res, next) {
  let phone = req.params.phone,
    password = req.params.password,
    mode = req.params.mode;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "INSERT INTO user(phone,password,time) VALUES (?,?,NOW())",
      result = { code: 1, desc: "register fail" };

    conn.query(sql, [phone, password], function(err, rows) {
      if (err) {
        if (err.hasOwnProperty("errno") && err.errno === 1062) {
          if (mode == 1) {
            result.code = 2;
            result.desc = "already register";
            res.send(result);
          } else if (mode == 2) {
            let altersql = "UPDATE user SET PASSWORD = ? WHERE phone = ? ";
            conn.query(altersql, [password, phone], function(err, rows) {
              if (err) {
                result.code = 4;
                result.desc = "fix pwd failed";
                return next("fix pwd error" + err);
              } else {
                result.code = 3;
                result.desc = "fix success";
                res.send(result);
              }
            });
          }
        }
      } else {
        result.code = 0;
        result.desc = "register success";
        res.send(result);
      }
    });
  });
});

module.exports = router;
