/**
 文件名：/component/Excel.js
 作者：鲁杨飞
 创建时间：2020/8/24
 文件描述：获取excel数据显示echarts 图表示例。
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Spin } from "antd";
import echarts from 'echarts';
import chinaData from 'echarts/map/json/china.json';
import 'echarts-gl/dist/echarts-gl.js';
echarts.registerMap('china', chinaData);

class Excel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			point: [],
			data: {},
			myChart: {},
			legend:[],
			series:[],
			xAxisData:[]
		}
	};

	componentDidMount = () => {
		let _this = this;
		// 获取数据
		var myChart1 = echarts.init(document.getElementById('main'));
		// 绘制图表
        // let option = {};
		if (this.props.match.params.fileName&&this.props.match.params.type) {
			let fileName = this.props.match.params.fileName;
			let type = this.props.match.params.type;

			let xhr = new XMLHttpRequest();
			xhr.addEventListener("progress", _this.uploadProgress, false);
			xhr.open('GET', `/data/dicom/excel/${fileName.split('.')[0]}.json`, true);
			xhr.responseType = 'json';
			xhr.send();
			xhr.onreadystatechange = (e) => {
				if (xhr.readyState === 2) {
					var dom = document.createElement('div');
					dom.setAttribute('id', 'loading');
					document.body.appendChild(dom);
					ReactDOM.render(<Spin tip="加载中..." size="large" />, dom);
				}
				if (xhr.readyState === 4) {
					let data = xhr.response;
					let point = [],legend =[],series=[],xAxisData=[];
					xAxisData=data[0].slice(1);
					for (let i = 1; i < data.length; i++) {
						for (let j = 1; j < data[i].length; j++) {
							point.push(data[i][j]);
						}
						let leg = data[i].shift();
						legend.push(leg);
						series.push(
							{
								name: leg,
								type: type,
								data: data[i],
								animationDelay: function (idx) {
									return idx * 10;
								}
						})
					}
					_this.setState({
						data: xhr.response,
						myChart: myChart1,
						point: point,
						legend: legend,
						series:series,
						xAxisData:xAxisData
					});
					document.body.removeChild(document.getElementById('loading'));
				}
			};
		}
		
	};
	uploadProgress = (evt) => {
		if (evt.lengthComputable) {
			var percentComplete = Math.round(evt.loaded * 100 / evt.total);
			console.log(percentComplete.toString());
		}
		else {
			console.log('unable to compute');
		}
	}

	render() {
		let { xAxisData, myChart,point ,legend,series} = this.state;
		if (this.props.match.params.fileName&&this.props.match.params.type) {
			if (myChart.id) {
				let arr = point;
				arr.sort(function (a, b) {
					return a - b;
				});
				let option={};
				option = {
					title: {
					},
					legend: {
						data: legend
					},
					toolbox: {
						
					},
					tooltip: {},
					xAxis: {
						data: xAxisData,
						splitLine: {
							show: false
						}
					},
					yAxis: {
					},
					series: series,
					animationEasing: 'elasticOut',
					animationDelayUpdate: function (idx) {
						return idx * 5;
					}
				};
				

				myChart.setOption(option);
			}
		}
		if (window.attachEvent) {//判断是不是IE
			window.onresize = function () {
				_this.state.myChart.resize();
			}
		} else if (window.addEventListener) {//如果非IE执行以下方法
			window.addEventListener("resize", () => {
				_this.state.myChart.resize();
			});
		}
		return (
			<div id="main" style={{ width: "100%", height: "100vh", position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}></div>
		)

	}
}
export default Excel;
