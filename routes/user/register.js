let express = require("express"),
  router = express.Router(),
  axios = require("axios");

// user register
let register = router.route("/register");

register.post(function(req, res, next) {
  let phone = req.query.phone||req.body.phone,
    password = req.query.password||req.body.password,
    mode = req.query.mode||req.body.mode,
    code = req.query.code||req.body.code||'';

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "INSERT INTO user(phone,password,time) VALUES (?,?,NOW())",
      result = { code: 1, desc: "register fail" };

    axios
      .post("http://localhost:3000/admin/bindsharecode", {
        phone: phone,
        code: code
      })
      .then(function(response) {
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
            res.send(
              JSON.stringify({
                code: 0,
                desc: {
                  msg1: "register success",
                  msg2: response.data.desc
                }
              })
            );
          }
        });
      })
      .catch(function(error) {
        res.send(
          JSON.stringify({
            code: 5,
            desc: "bind share code error: " + error
          })
        );
      });
  });
});

module.exports = router;
