/**
 * 上传指纹数据集
 */
let express = require('express'),
    router = express.Router();

let addFeatures = router.route('/add/feature/:feature/device/:device/nid/:nid');

addFeatures.get(function(req,res,next){
  let feature = req.params.feature,
      device = req.params.device,
      nid = req.params.nid;
  let sql = 'INSERT INTO feature(nodeid,rssi,device,time) VALUES ('+nid+',"'+feature+'","'+device+'", NOW())';
  req.getConnection(function(err,conn){
    if(err) return next(err);
    conn.query(sql,[],function(err,rows){
      if(err) return next('insert feature error'+err);
      res.send({code:0,msg:"success"});
    });
  });
});

module.exports = router;