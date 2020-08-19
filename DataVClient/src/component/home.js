//home
import React, { Component } from 'react';
import echarts from 'echarts';
import chinaData from 'echarts/map/json/china.json';
import 'echarts-gl/dist/echarts-gl.js';
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
		return (
			<div style={{"padding":"20px"}}>
                <div>
                    <span>案例一 : </span><a href="http://192.168.2.134:3600/echarts0" >全国疫情状况</a>
                </div>
                <div>
                    <span>案例二 : </span><a href="http://192.168.2.134:3600/echarts1" >Watermark-Echarts Download</a>
                </div>
                <div>
                    <span>案例三 : </span><a href="http://192.168.2.134:3600/echarts2" >极坐标系下的堆叠柱状图</a>
                </div>
                <div>
                    <span>案例四 : </span><a href="http://192.168.2.134:3600/echarts3" >3D Bar with Dataset</a>
                </div>
            </div>
		)

	}
}
export default DateView;
