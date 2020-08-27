/**
 文件名：/component/home.js
 作者：鲁杨飞
 创建时间：2020/8/24
 文件描述：默认显示组件，可跳转到四个示例。
 */
import React, { Component } from 'react';
import echarts from 'echarts';
import chinaData from 'echarts/map/json/china.json';
import 'echarts-gl/dist/echarts-gl.js';
import {baseUrl} from '../url'
// import axios from "axios";

echarts.registerMap('china', chinaData);

class DateView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fileName: '',
			data: {},
			myChart:{}
		}
	};

	componentDidMount = () => {
	};

	render() {
		let url1 = baseUrl+"/echarts0";
		url1 = url1.toString()
		let url2 = baseUrl+"/echarts1";
		url2 = url2.toString()
		let url3 = baseUrl+"/echarts2";
		url3 = url3.toString()
		let url4 = baseUrl+"/echarts3";
		url4 = url4.toString()
		return (
			<div style={{"padding":"20px"}}>
                <div>
                    <span>案例一 : </span><a href={url1} >全国疫情状况</a>
                </div>
                <div>
                    <span>案例二 : </span><a href={url2} >Watermark-Echarts Download</a>
                </div>
                <div>
                    <span>案例三 : </span><a href={url3} >极坐标系下的堆叠柱状图</a>
                </div>
                <div>
                    <span>案例四 : </span><a href={url4} >3D Bar with Dataset</a>
                </div>
            </div>
		)

	}
}
export default DateView;
