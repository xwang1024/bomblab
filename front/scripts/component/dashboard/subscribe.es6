'use strict';

(function(window, document, $, module, exports, require, swal, echarts){
  let chart, chartOption, scalesm, page, startDate, endDate;
  chart = echarts.init(document.getElementById('user-chart'));
  chartOption = {
    tooltip : {
      trigger: 'axis',
      axisPointer: {
        animation: false
      }
    },
    legend: { data: [] },
    grid: {
      left: '3%',
      right: '4%',
      bottom: 40,
      containLabel: true
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        }
      }
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: true,
        data: []
      }
    ],
    yAxis: [
      {
        type: 'value',
        scale: true,
        name: '单日关注',
        min: 0,
        boundaryGap: [0.2, 0.2]
      },
      {
        type: 'value',
        scale: true,
        name: '总关注',
        min: 0,
        boundaryGap: [0.2, 0.2]
      }
    ],
    series: [
      {
        name: '单日关注',
        type: 'bar',
        yAxisIndex: 1,
        data: [],
        itemStyle: {
          normal: {
            color: '#64bf96'
          }
        }
      },
      {
        name: '总关注',
        type: 'line',
        data: [],
        itemStyle: {
          normal: {
            color: '#426ab3'
          }
        }
      }
    ],
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 0,
        end: 100
      }
    ]
  };
  let timeout = undefined;
    chart.on('datazoom', function (params) {
    if(timeout) clearTimeout(timeout);
    timeout = setTimeout(function() {
      var length = chartOption.xAxis[0].data.length;
      var startIndex = Math.round(length*params.start/100);
      var endIndex = Math.round(length*params.end/100)-1; // 调试后时间对应-1
      startDate = new Date(chartOption.xAxis[0].data[startIndex] + ' 00:00:00');
      endDate = new Date(chartOption.xAxis[0].data[endIndex] + ' 23:59:59');
    }, 500);
  });

  function updateCharts() {
    chart.showLoading({text: "正在加载..."});
    var type = $('.btn-lg.btn-primary').data('type');
    var subType = $('[name=subTypeSelector]').val();
    var url = '/api/admin/dashboard/subscribe';
    // 目前仅有scale支持subType
    if(type === 'scale' && subType) {
      url += '&scaleId=' + subType;
    }
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        if(data.error) {
          if(typeof data.error.message === 'object') {
            data.error.message = data.error.message.join('\n');
          }
          return swal('错误', data.error.message, 'error');
        } else {
          console.log('[Chart data]', data);
          chartOption.xAxis[0].data  = data.timestamps;
          chartOption.series[0].data = data.numData;
          chartOption.yAxis[1].max = parseInt(data.total*1.5);
          chartOption.series[1].data = data.totalData;
          chartOption.yAxis[0].max = parseInt(data.total*1.5);
          chart.setOption(chartOption);
          chart.hideLoading();
        }
      }
    });
  }
  updateCharts();
})(window, document, window['jQuery'], module, exports, require, window['swal'], window['echarts']);