'use strict';

exports.subscribe = function(req, res, next) {
  let Subscriber = req.app.db.models.Subscriber;
  Subscriber.aggregate([
    { $match:{ "subscribe": true} },
    { $project: {
        year: { $year: '$subscribeTime'},
        month: { $month: '$subscribeTime'},
        day: { $dayOfMonth: '$subscribeTime'},
        openId: 1
      }
    },
    { $group : {
        _id: { year: '$year', month: '$month', day: '$day' },
        total:{
          $sum: 1
        }
      }
    }
  ]).exec((err, result) => {
    if(err) return next(err);
    if(!result || !result.length) {
      return res.send({
        numData: [],
        timestamps: []
      });
    }
    let resultMap = {};
    let dateList = [];
    result.forEach((data) => {
      let date = new Date(`${data._id.year}-${data._id.month}-${data._id.day}`);
      resultMap[date.format('yyyy-MM-dd')] = data.total;
    })
    dateList = Object.keys(resultMap).sort((a, b) => {
      return a.localeCompare(b);
    });
    
    let startDate = new Date(dateList[0]),
        endDate   = new Date(dateList[dateList.length-1]);
    let timestamps = generateDateList(startDate, endDate);

    let total = 0;
    let numMax = 0;
    let numData = [];
    let totalData = [];

    timestamps.forEach((timestamp, index) => {
      numData[index] = resultMap[timestamp] || 0;
      total += (resultMap[timestamp] || 0);
      totalData[index] = total;
      numMax = (numData[index] > numMax) ? numData[index] : numMax;
    });
    res.send({ numData, totalData, timestamps, numMax, total });
  })
};

function generateDateList(startDate, endDate) {
  let arr = [];
  let currentDate = startDate;
  while(currentDate <= endDate) {
    arr.push(currentDate.format('yyyy-MM-dd'));
    currentDate = currentDate.addDays(1);
  }
  return arr;
}