'use strict';

const Cache = require('../../service/Cache')

exports.preventDuplicate = function(req, res, next) {
  const signature = req.query.signature;
  const timestamp = req.query.timestamp;
  const nonce = req.query.nonce;
  Cache.setNxEx(signature + timestamp + nonce, 1, 10).then((result) => {
    if(result == 'OK') return next();
    console.log('Skiped');
    res.send('');
  }).catch((err) => {
    console.error(err, err.stack);
  })
}