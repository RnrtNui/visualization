/**
* 文件名：/component/TestView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：和模型结合显示三维模型点集。
* */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Spin } from "antd";
import echarts from 'echarts';
import chinaData from 'echarts/map/json/china.json';
import 'echarts-gl/dist/echarts-gl.js';
echarts.registerMap('china', chinaData);

class TestView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			point: [],
			data: {},
			myChart: {}
		}
	};

	componentDidMount = () => {
		let _this = this;
		// 获取数据
		var myChart1 = echarts.init(document.getElementById('main'));
		// 绘制图表
		// let option = {};
		if (this.props.match.params.fileName) {
			let fileName = this.props.match.params.fileName;
			
			let xhr = new XMLHttpRequest();
			xhr.addEventListener("progress", _this.uploadProgress, false);
			xhr.open('GET', `/data/dicom/${fileName.slice(0,fileName.lastIndexOf('.'))}_POINTS.json`, true);
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
					let point = [];
					for (let i = 0; i < data.length; i = i + 3) {
						point.push([data[i], data[i + 1], data[i + 2]]);
					}
					_this.setState({
						data: xhr.response,
						myChart: myChart1,
						point: point
					});
					document.body.removeChild(document.getElementById('loading'));
				}
			};
		}
		
	};
	uploadProgress = (evt) => {
		console.log(evt)
		if (evt.lengthComputable) {
			var percentComplete = Math.round(evt.loaded * 100 / evt.total);
			console.log(percentComplete.toString());
		}
		else {
			console.log('unable to compute');
		}
	}

	render() {
		let { data, myChart, point } = this.state;
		if (this.props.match.params.fileName) {
			if (myChart.id) {
				let arr = [], arrx = [], arry = [];
				for (let i = 2; i < data.length; i += 3) {
					if (data[i] !== 'null') arr.push(data[i]);
				}
				for (let i = 0; i < data.length; i += 3) {
					if (data[i] !== 'null') arrx.push(data[i]);
				}
				for (let i = 1; i < data.length; i += 3) {
					if (data[i] !== 'null') arry.push(data[i]);
				}
				arr.sort(function (a, b) {
					return a - b;
				});
				arrx.sort(function (a, b) {
					return a - b;
				});
				arry.sort(function (a, b) {
					return a - b;
				});
				let xlen = Number(arrx[arrx.length - 1]) - Number(arrx[0]);
				let ylen = Number(arry[arry.length - 1]) - Number(arry[0]);
				let zlen = Number(arr[arr.length - 1]) - Number(arr[0]);
				console.log(xlen,ylen,zlen)

				let xcen = (Number(arrx[arrx.length - 1]) + Number(arrx[0])) / 2;
				let ycen = (Number(arry[arry.length - 1]) + Number(arry[0])) / 2;
				let zcen = (Number(arr[arr.length - 1]) + Number(arr[0])) / 2;
				let option={};
				if(this.props.match.params.fileName.split('.')[1]!=='csv'){
					option = {
						backgroundColor: '#000',
						tooltip: {},
						visualMap: {
							show: false,
							dimension: 2,
							min: -1,
							max: 1,
							inRange: {
								color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
							}
						},
						xAxis3D: {
							type: 'value',
							scale: true,
							max: xlen >= zlen && xlen >= ylen ? Number(arrx[arrx.length - 1]) : ylen >= xlen && ylen >= zlen ? xcen + ylen / 2 : xcen + zlen / 2,
							min: xlen >= zlen && xlen >= ylen ? Number(arrx[0]) : ylen >= xlen && ylen >= zlen ? xcen - ylen / 2 : xcen - zlen / 2,
							nameTextStyle: {
								color: "#fff"
							},
							axisLabel: {
								textStyle: {
									color: "#FFF"
								}
							}
						},
						yAxis3D: {
							type: 'value',
							scale: true,
							max: xlen >= zlen && xlen >= ylen ? ycen + xlen / 2 : ylen >= xlen && ylen >= zlen ? Number(arry[arry.length - 1]) : ycen + zlen / 2,
							min: xlen >= zlen && xlen >= ylen ? ycen - xlen / 2 : ylen >= xlen && ylen >= zlen ? Number(arry[0]) : ycen - zlen / 2,
							nameTextStyle: {
								color: "#fff"
							},
							axisLabel: {
								textStyle: {
									color: "#FFF"
								}
							}
						},
						zAxis3D: {
							type: 'value',
							scale: true,
							max: xlen >= zlen && xlen >= ylen ? zcen + xlen / 2 : ylen >= xlen && ylen >= zlen ? zcen + ylen / 2 : Number(arr[arr.length - 1]),
							min: xlen >= zlen && xlen >= ylen ? zcen - xlen / 2 : ylen >= xlen && ylen >= zlen ? zcen - ylen / 2 : Number(arr[0]),
							nameTextStyle: {
								color: "#fff"
							},
							axisLabel: {
								textStyle: {
									color: "#FFF"
								}
							}
						},
						grid3D: {
						},
						series: [{
							type: 'scatter3D',
							data: point,
							symbolSize: 1.5
						}]
					};
				}else{
					option = {
						backgroundColor: '#000',
						tooltip: {},
						visualMap: {
							show: false,
							dimension: 2,
							min: -1,
							max: 1,
							inRange: {
								color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
							}
						},
						xAxis3D: {
							type: 'value',
							scale: true,
							max: 'dataMax',
							min: 'dataMin',
							nameTextStyle: {
								color: "#fff"
							},
							axisLabel: {
								textStyle: {
									color: "#FFF"
								}
							}
						},
						yAxis3D: {
							type: 'value',
							scale: true,
							max: 'dataMax',
							min: 'dataMin',
							nameTextStyle: {
								color: "#fff"
							},
							axisLabel: {
								textStyle: {
									color: "#FFF"
								}
							}
						},
						zAxis3D: {
							type: 'value',
							scale: true,
							max: Number(arr[arr.length - 1])+zlen*5,
							min: Number(arr[0])-zlen*5,
							nameTextStyle: {
								color: "#fff"
							},
							axisLabel: {
								textStyle: {
									color: "#FFF"
								}
							}
						},
						grid3D: {
						},
						series: [{
							type: 'surface',
							data: point,
							symbolSize: 1.5
						}]
					};
				}
				

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
export default TestView;
