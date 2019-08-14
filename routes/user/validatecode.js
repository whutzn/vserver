let express = require("express"),
  router = express.Router(),
  util = require("./config/index");

let validate = router.route("/validate/phone/:phone/mode/:mode");

validate.get(function(req, res, next) {
  console.log(req.body);
  const to = req.params.phone; //需要发送的号码
  const mode = req.params.mode; //需要发送的号码

  let result = { code: 1, desc: "" };

  if (to == "") {
    result.desc = "手机号不能为空";
    res.send(result);
    return;
  }

  req.getConnection(function(err, conn) {
    if (err) return next(err);

    let sql = "SELECT COUNT(phone) AS count FROM `user` WHERE phone = ?",
      result = { code: 1, desc: "send failed" };

    conn.query(sql, [to], function(err, rows) {
      let param = createCode(4);
      if (err) {
        result.desc = err;
        res.send(result);
      } else {
        result.desc = rows;
        if (rows[0].count == 1) {
          if (mode == 1) {
            result.code = 2;
            result.desc = "already register";
            res.send(result);
          } else if (mode == 2) {
            util.getResult(param, to).then(
              function(response) {
                console.log(response.data);
                console.log(response.data.resp.respCode);
                if (response.data.resp.respCode == "000000") {
                  result.code = 0;
                  result.desc = param;
                } else {
                  result.code = 3;
                  result.desc = response.data.resp;
                }
                res.send(result);
              },
              function(err) {
                console.log(err);
              }
            );
          }
        } else if (rows[0].count == 0) {
          if (mode == 1) {
            util.getResult(param, to).then(
              function(response) {
                console.log(response.data);
                console.log(response.data.resp.respCode);
                if (response.data.resp.respCode == "000000") {
                  // res.render("success", {
                  //   message: "发送成功",
                  //   code: response.data.resp
                  // });
                  result.code = 0;
                  result.desc = param;
                } else {
                  result.code = 3;
                  result.desc = response.data.resp;
                }
                res.send(result);
              },
              function(err) {
                console.log(err);
              }
            );
          }
        } else if (mode == 2) {
          result.code = 4;
          result.desc = "not register";
          res.send(result);
        }
      }
    });
  });
});

//生成验证码的方法
function createCode(length) {
  let code = "";
  let codeLength = parseInt(length); //验证码的长度
  ////所有候选组成验证码的字符，当然也可以用中文的
  let codeChars = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
  //循环组成验证码的字符串
  for (var i = 0; i < codeLength; i++) {
    //获取随机验证码下标
    var charNum = Math.floor(Math.random() * 10);
    //组合成指定字符验证码
    code += codeChars[charNum];
  }

  return code;
}

module.exports = router;
