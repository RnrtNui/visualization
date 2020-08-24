/**
* 文件名：/component/Ligature.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：canvas自定义背景并在图上绘制图元。
* */
import React, { Component } from 'react';

class Ligature extends Component {
	constructor(props) {
		super(props);
		this.state = {
			point: [],
			data: {},
			myChart: {}
		}
	};

	componentDidMount = () => {
		var mycanvas = document.getElementById('canvas');
		var ctx = mycanvas.getContext('2d');
		console.log(ctx);
		let width = document.getElementsByTagName('body')[0].clientWidth;
		let height = document.getElementsByTagName('body')[0].clientHeight;
		// 内存中先加载，然后当内存加载完毕时，再把内存中的数据填充到我们的 dom元素中，这样能够快速的去
		// 反应，比如网易的图片
		var img = new Image();
		img.onload = function () {
			// 将图片画到canvas上面上去！
			ctx.drawImage(img, 0, 0, width, height);
			ctx.beginPath();
			//设置笔触的颜色
			ctx.strokeStyle = "#0000ff";
			//设置开始坐标
			ctx.moveTo(500, 300);
			//设置结束坐标
			ctx.lineTo(1200, 500);
			//绘制线条
			ctx.stroke();
			ctx.beginPath();
			//设置笔触的颜色
			ctx.strokeStyle = "#0000ff";
			//设置开始坐标
			ctx.moveTo(500, 300);
			//设置结束坐标
			ctx.lineTo(1200, 30);
			//绘制线条
			ctx.stroke();
			//重新开始一条路径使颜色不互相影响
			ctx.beginPath();
			//设置笔触的颜色
			ctx.strokeStyle = "#0000ff";
			//设置开始坐标
			ctx.moveTo(1200, 500);
			//设置结束坐标
			ctx.lineTo(1200, 30);
			//context.lineCap="butt|round|square"; 向两端线条添加 默认/圆形/方形的边缘
			ctx.lineCap = "round";
			//context.lineJoin="bevel|round|miter"; //两条线终点相交时的拐角 默认(斜角)/圆角/尖角
			ctx.lineJoin = "miter";
			//设置线条宽度
			// ctx.lineWidth = 10;
			//绘制线条
			ctx.stroke();
		}
		img.src = "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1596539000765&di=71ba66a39e50c46aed5392dd7162e972&imgtype=0&src=http%3A%2F%2Ft8.baidu.com%2Fit%2Fu%3D1484500186%2C1503043093%26fm%3D79%26app%3D86%26f%3DJPEG%3Fw%3D1280%26h%3D853";
	}
	render() {
		let width = document.getElementsByTagName('body')[0].clientWidth;
		let height = document.getElementsByTagName('body')[0].clientHeight;
		return (
				<div id="main" style={{ width: {width}, height: {height}}}>
					<canvas id="canvas" width={width} height={height}></canvas>
				</div>
		)

	}
}
export default Ligature;
