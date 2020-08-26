/**
 文件名：/component/DateView3.js
 作者：鲁杨飞
 创建时间：2020/8/24
 文件描述：3D Bar with Dataset示例。
 */
import React, { Component } from 'react';
import Data from './life-expectancy-table.json'
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
				myChart1.setOption({
					grid3D: {},
					tooltip: {},
					xAxis3D: {
						type: 'category'
					},
					yAxis3D: {
						type: 'category'
					},
					zAxis3D: {},
					visualMap: {
						max: 1e8,
						dimension: 'Population'
					},
					dataset: {
						dimensions: [
							'Income',
							'Life Expectancy',
							'Population',
							'Country',
							{name: 'Year', type: 'ordinal'}
						],
						source: Data
					},
					series: [
						{
							name:"bar3D",
							type: 'bar3D',
							// symbolSize: symbolSize,
							shading: 'lambert',
							encode: {
								x: 'Year',
								y: 'Country',
								z: 'Life Expectancy',
								tooltip: [0, 1, 2, 3, 4]
							}
						}
					]
				});
				this.setState({
					myChart: myChart1
				})
		// }
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
			<div id="main" style={{ width: "100%", height: "100vh", position: "absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)"}}></div>
		)

	}
}
export default DateView;
