/**
* 文件名：/component/DateView1.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：Watermark-Echarts示例。
*/
import React, { Component } from 'react';
import echarts from 'echarts';
import chinaData from 'echarts/map/json/china.json'
import 'echarts-gl/dist/echarts-gl.js'

echarts.registerMap('china', chinaData);

class DateView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fileName: '',
			data: {}
		}
	};
	//显示
	show = () => {
		// if (this.props.match.params.file) {
		var myChart1 = echarts.init(document.getElementById('main'));
		// 绘制图表
		var builderJson = {
			"all": 10887,
			"charts": {
			  "map": 3237,
			  "lines": 2164,
			  "bar": 7561,
			  "line": 7778,
			  "pie": 7355,
			  "scatter": 2405,
			  "candlestick": 1842,
			  "radar": 2090,
			  "heatmap": 1762,
			  "treemap": 1593,
			  "graph": 2060,
			  "boxplot": 1537,
			  "parallel": 1908,
			  "gauge": 2107,
			  "funnel": 1692,
			  "sankey": 1568
			},
			"components": {
			  "geo": 2788,
			  "title": 9575,
			  "legend": 9400,
			  "tooltip": 9466,
			  "grid": 9266,
			  "markPoint": 3419,
			  "markLine": 2984,
			  "timeline": 2739,
			  "dataZoom": 2744,
			  "visualMap": 2466,
			  "toolbox": 3034,
			  "polar": 1945
			},
			"ie": 9743
		  };
		  
		  var downloadJson = {
			"echarts.min.js": 17365,
			"echarts.simple.min.js": 4079,
			"echarts.common.min.js": 6929,
			"echarts.js": 14890
		  };
		  
		  var themeJson = {
			"dark.js": 1594,
			"infographic.js": 925,
			"shine.js": 1608,
			"roma.js": 721,
			"macarons.js": 2179,
			"vintage.js": 1982
		  };
		  
		//   var waterMarkText = 'ECHARTS';
		  
		  var canvas = document.createElement('canvas');
		  var ctx = canvas.getContext('2d');
		  canvas.width = canvas.height = 100;
		  ctx.textAlign = 'center';
		  ctx.textBaseline = 'middle';
		  ctx.globalAlpha = 0.08;
		  ctx.font = '20px Microsoft Yahei';
		  ctx.translate(50, 50);
		  ctx.rotate(-Math.PI / 4);
		//   ctx.fillText(waterMarkText, 0, 0);
		  
		  let option = {
			  backgroundColor: {
				  type: 'pattern',
				  image: canvas,
				  repeat: 'repeat'
			  },
			  tooltip: {},
			  title: [{
				  text: '在线构建',
				  subtext: '总计 ' + builderJson.all,
				  left: '25%',
				  textAlign: 'center'
			  }, {
				  text: '各版本下载',
				  subtext: '总计 ' + Object.keys(downloadJson).reduce(function (all, key) {
					  return all + downloadJson[key];
				  }, 0),
				  left: '75%',
				  textAlign: 'center'
			  }, {
				  text: '主题下载',
				  subtext: '总计 ' + Object.keys(themeJson).reduce(function (all, key) {
					  return all + themeJson[key];
				  }, 0),
				  left: '75%',
				  top: '50%',
				  textAlign: 'center'
			  }],
			  grid: [{
				  top: 50,
				  width: '50%',
				  bottom: '45%',
				  left: 10,
				  containLabel: true
			  }, {
				  top: '55%',
				  width: '50%',
				  bottom: 0,
				  left: 10,
				  containLabel: true
			  }],
			  xAxis: [{
				  type: 'value',
				  max: builderJson.all,
				  splitLine: {
					  show: false
				  }
			  }, {
				  type: 'value',
				  max: builderJson.all,
				  gridIndex: 1,
				  splitLine: {
					  show: false
				  }
			  }],
			  yAxis: [{
				  type: 'category',
				  data: Object.keys(builderJson.charts),
				  axisLabel: {
					  interval: 0,
					  rotate: 30
				  },
				  splitLine: {
					  show: false
				  }
			  }, {
				  gridIndex: 1,
				  type: 'category',
				  data: Object.keys(builderJson.components),
				  axisLabel: {
					  interval: 0,
					  rotate: 30
				  },
				  splitLine: {
					  show: false
				  }
			  }],
			  series: [{
				  type: 'bar',
				  stack: 'chart',
				  z: 3,
				  label: {
					  normal: {
						  position: 'right',
						  show: true
					  }
				  },
				  data: Object.keys(builderJson.charts).map(function (key) {
					  return builderJson.charts[key];
				  })
			  }, {
				  type: 'bar',
				  stack: 'chart',
				  silent: true,
				  itemStyle: {
					  normal: {
						  color: '#eee'
					  }
				  },
				  data: Object.keys(builderJson.charts).map(function (key) {
					  return builderJson.all - builderJson.charts[key];
				  })
			  }, {
				  type: 'bar',
				  stack: 'component',
				  xAxisIndex: 1,
				  yAxisIndex: 1,
				  z: 3,
				  label: {
					  normal: {
						  position: 'right',
						  show: true
					  }
				  },
				  data: Object.keys(builderJson.components).map(function (key) {
					  return builderJson.components[key];
				  })
			  }, {
				  type: 'bar',
				  stack: 'component',
				  silent: true,
				  xAxisIndex: 1,
				  yAxisIndex: 1,
				  itemStyle: {
					  normal: {
						  color: '#eee'
					  }
				  },
				  data: Object.keys(builderJson.components).map(function (key) {
					  return builderJson.all - builderJson.components[key];
				  })
			  }, {
				  type: 'pie',
				  radius: [0, '30%'],
				  center: ['75%', '25%'],
				  data: Object.keys(downloadJson).map(function (key) {
					  return {
						  name: key.replace('.js', ''),
						  value: downloadJson[key]
					  }
				  })
			  }, {
				  type: 'pie',
				  radius: [0, '30%'],
				  center: ['75%', '75%'],
				  data: Object.keys(themeJson).map(function (key) {
					  return {
						  name: key.replace('.js', ''),
						  value: themeJson[key]
					  };
				  })
			  }]
		  };
		  myChart1.setOption(option);
		  this.setState({
			myChart: myChart1
		})
	};

	componentDidMount = () => {
		let _this = this
		_this.show();
		if (window.attachEvent) {//判断是不是IE
			window.onresize = function () {
				_this.state.myChart.resize();
			}
			// window.attachEvent("onresize",_this.iegbck() );
		} else if (window.addEventListener) {//如果非IE执行以下方法
			window.addEventListener("resize", () => {
				console.log('正在改变chrome')
				_this.state.myChart.resize();
			});
		}
	};
	
	render() {
		return (
			<div id="main" style={{ width: "100%", height: "100vh", position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}></div>
		)

	}
}
export default DateView;
