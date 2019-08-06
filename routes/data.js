/**
 * 下载指纹数据集
 */
let express = require('express'),
    router = express.Router();

let getData = router.route('/data/bid/:bid');

getData.get(function(req,res,next){
  let bid = req.params.bid;
  let sql = 'SELECT samples.id,feature.rssi,samples.lng,samples.lat,samples.floor FROM feature LEFT JOIN samples ON feature.nodeid = samples.id; SELECT * FROM building_info WHERE id = '+bid+';';
  req.getConnection(function(err,conn){
    if(err) return next(err);
    conn.query(sql,[],function(err,rows){
      if(err) return next('select feature error'+err);
      res.send({code:0,data:rows});
    });
  });
});

module.exports = router;