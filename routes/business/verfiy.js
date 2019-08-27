let express = require("express"),
  router = express.Router(),
  jwt = require("jsonwebtoken");

let verfiy = router.route("/");

verfiy.post(checkToken);
verfiy.get(checkToken);

function checkToken(req, res, next) {
  var token = req.body.token || req.query.token || req.headers["x-access-token"]; // 从body或query或者header中获取token

  jwt.verify(token, "laoyouquan", function (err, decode) {
      if (err) {  //  时间失效的时候/ 伪造的token          
         res.json({err:err})
      } else {
          req.decode = decode; 
          console.log(decode.msg);   
          next();
      }
  });
}

module.exports = router;
