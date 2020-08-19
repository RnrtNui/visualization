//极坐标系下的堆叠柱状图
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

	show = () => {
		/*
		line:折线图，
		bar:柱状条形图，
		scatter:散点（气泡）图,
		effectScatter:带有涟漪特效动画的散点（气泡）图,

		*/
		// 获取数据
		var myChart1 = echarts.init(document.getElementById('main'));
		// 绘制图表
		let option = {};

		option = {
			angleAxis: {
			},
			radiusAxis: {
				type: 'category',
				data: ['周一', '周二', '周三', '周四'],
				z: 10
			},
			polar: {
			},
			series: [{
				type: 'bar',
				data: [1, 2, 3, 4],
				coordinateSystem: 'polar',
				name: 'A',
				stack: 'a'
			}, {
				type: 'bar',
				data: [2, 4, 6, 8],
				coordinateSystem: 'polar',
				name: 'B',
				stack: 'a'
			}, {
				type: 'bar',
				data: [1, 2, 3, 4],
				coordinateSystem: 'polar',
				name: 'C',
				stack: 'a'
			}],
			legend: {
				show: true,
				data: ['A', 'B', 'C']
			}
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
