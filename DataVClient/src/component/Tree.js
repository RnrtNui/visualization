//echarts 树图
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Spin } from "antd";
import echarts from 'echarts';
import 'echarts-gl/dist/echarts-gl.js';
class Tree extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {}
		}
	};

	componentDidMount = () => {
		let _this = this;
		let url = '/data/dicom/flare.json';
		let xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
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
				console.log(data)
				_this.setState({
					data: data,
				});
				document.body.removeChild(document.getElementById('loading'));
			}
		};
	};

	render() {
		let { data } = this.state;
		if (Object.keys(data).length > 0) {
			if (this.props.match.params.pos) {
				console.log(this.props.match.params.pos);
				var chart = echarts.init(document.getElementById('main'));
				echarts.util.each(data.children, function (datum, index) {
					index % 2 === 0 && (datum.collapsed = true);
				});

				chart.setOption({
					tooltip: {
						trigger: 'item',
						triggerOn: 'mousemove'
					},
					series: [{
						type: 'tree',

						data: [data],

						top: '1%',
						left: '7%',
						bottom: '1%',
						right: '20%',

						symbolSize: 7,
						orient: this.props.match.params.pos,
						label: {
							position: 'left',
							verticalAlign: 'middle',
							align: 'right',
							fontSize: 9
						},

						leaves: {
							label: {
								position: 'right',
								verticalAlign: 'middle',
								align: 'left'
							}
						},

						expandAndCollapse: true,
						animationDuration: 550,
						animationDurationUpdate: 750
					}]
				});
				if (window.attachEvent) {//判断是不是IE
					window.onresize = function () {
						chart.resize();
					}
					// window.attachEvent("onresize",_this.iegbck() );
				} else if (window.addEventListener) {//如果非IE执行以下方法
					window.addEventListener("resize", () => {
						console.log('正在改变chrome')
						chart.resize();
					});
				}
			}
		}

		return (
			<div id="main" style={{ width: "100%", height: "100vh", position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
			</div>
		)

	}
}
export default Tree;
