let express = require("express"),
  router = express.Router(),
  jwt = require("jsonwebtoken"),
  axios = require("axios");

let login = router.route("/login");

login.post(function(req, res, next) {
  let phone = req.query.phone || req.body.phone,
    password = req.query.password || req.body.password;

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql =
      "SELECT id,password,vtime,DATE_ADD( vtime, INTERVAL 1 DAY ) AS ctime FROM user WHERE phone = ? ";
    
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
        conn.query(cursql, [phone], function(err, rows2) {
          if (err) return next(err);
          let type = 0;
          if (new Date(rows1[0].ctime) >= new Date()) type = 1;
          axios
            .post("http://localhost:3000/admin/getsharecode", {
              id: rows1[0].id,
              token: "laoyouquan1"
            })
            .then(function(response) {
              let content = { msg: phone , time: Date.now() }, // 要生成token的主题信息
              secretOrPrivateKey = "laoyouquan", // 这是加密的key（密钥）
              token = jwt.sign(content, secretOrPrivateKey, {
                expiresIn: 60 * 60 * 24 // 24小时过期
              });
              res.send(
                JSON.stringify({
                  code: 0,
                  desc: {
                    id: rows1[0].id,
                    type: type,
                    code: response.data.desc.code,
                    time: rows1[0].vtime,
                    token: token
                  }
                })
              );
              // console.log("code", response.data);
            })
            .catch(function(error) {
              res.send(
                JSON.stringify({
                  code: 3,
                  desc: "query share code error: " + error
                })
              );
            });
        });
      }
    });
  });
});

module.exports = router;
