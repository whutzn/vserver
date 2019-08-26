var express = require("express");
var router = express.Router();

// 
var download = router.route("/download");

download.get(function(req, res) {
    res.download("./public/apk/laoyouquan.apk");
});

var download1 = router.route("/download1");

download1.get(function(req, res) {
    res.download("./public/apk/laoyouquan.ipa");
});
module.exports = router;