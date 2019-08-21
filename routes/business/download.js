var express = require("express");
var router = express.Router();

// user login
var download = router.route("/download");

download.get(function(req, res) {
    res.download("./public/apk/laoyouquan.apk");
});

module.exports = router;