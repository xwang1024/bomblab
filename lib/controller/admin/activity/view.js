'use strict';

const RenderUtil = require('../../renderUtil');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  let Activity = req.app.db.models.Activity;
  let page = parseInt(req.query.page || 1);
  let pageSize = parseInt(req.query.pageSize || 10);
  let start = (page - 1) * pageSize;
  let end = page * pageSize;

  let countQuery = Activity.count();
  let query = Activity.find().skip(start).limit(end - start).populate('asset');
  
  countQuery.exec(function (err, total) {
    if(err) return next(err);
    query.exec(function (err, docs) {
      if(err) return next(err);
      renderUtil.render({
        path: 'admin/activity/list',
        subTitle: '扫码返图',
        data: {
          totalCount: total, 
          page: page, 
          pageSize: pageSize, 
          pageCount: Math.ceil(total/pageSize), 
          result: docs
        }
      });
    });
  });
};