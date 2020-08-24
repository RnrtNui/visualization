/**
* 文件名：/component/geology.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：钻孔柱状图示例。
* */
import React, { Component } from 'react';
import echarts from 'echarts';
import chinaData from 'echarts/map/json/china.json';
import 'echarts-gl/dist/echarts-gl.js';
echarts.registerMap('china', chinaData);

class Geo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            point: [],
            data: {},
            myChart: {},
            legend: [],
            series: [],
            xAxisData: []
        }
    };

    componentDidMount = () => {
        // let _this = this;
        // 获取数据
        var myChart1 = echarts.init(document.getElementById('main'));
        // 绘制图表
        // let option = {};
        const x = [505839, 504622, 508499, 508098, 506826, 507085];
        const y = [3613064, 3612114, 3610544, 3612204, 3611363, 3609715];
        const z1 = [3.05, 5.20, 1.25, 3.40, 2.12, 4.78, 3.20, 1.58, 1.68, 1.24, 0.76, 0.79, 0.35, 1.50], //   14   31m
            z2 = [3.68, 0.32, 1.50, 1.63, 8.87, 1.17, 2.43, 4.34, 3.71, 1.88, 0.47],     //11    30m
            z3 = [2.50, 1.82, 4.18, 0.76, 0.97, 3.87, 4.67, 1.88, 2.95, 3.40, 0.60, 0.26, 2.74],    //13   30.6m
            z4 = [0.25, 1.30, 3.95, 1.90, 0.75, 0.75, 7.40, 0.85, 1.83, 2.00, 1.58, 0.74, 1.30, 0.59, 0.88, 1.70, 0.60, 0.99, 2.64],        //19    31m
            z5 = [17.00, 3.90, 2.15, 4.57, 2.48, 3.40],                                       //6    33.5m
            z6 = [8.00, 2.61, 2.11, 1.15, 1.53, 1.60, 1.50, 1.95, 0.79, 4.00, 2.46, 1.92, 1.38];    //13    31m

        var series = [];
        // series.push({
        //     type: 'surface',
        //     wireframe: {
        //         show: true
        //     },
        //     data: [[504622, 3609715, 10.40], [505839, 3609715, 15.88], [507085, 3609715, 9.76], [508098, 3609715, 12.02], [508499, 3609715, 9.55],
        //     [504622, 3613064, 10.40], [505839, 3613064, 15.88], [507085, 3613064, 9.76], [508098, 3613064, 12.02], [508499, 3613064, 9.55]],
        //     symbolSize: 1.5
        // });
        let data1 = [];
        for (let j = 0; j < 6; j++) {
            data1 = [[x[3], y[3], z4[j]], [x[0], y[0], z1[j]], [x[2], y[2], z3[j]], [x[5], y[5], z6[j]], [x[1], y[1], z2[j]], [x[4], y[4], z5[j]]];
            series.push({
                type: 'bar3D',
                barSize: 0.5,
                data: data1,
                label: {
                    distance: 12
                },
                stack: 'stack',
                shading: 'color',
                emphasis: {
                    label: {
                        show: false
                    }
                }
            });
        }
        for (let j = 6; j < 11; j++) {
            data1 = [[x[3], y[3], z4[j]], [x[0], y[0], z1[j]], [x[2], y[2], z3[j]], [x[5], y[5], z6[j]], [x[1], y[1], z2[j]], [x[4], y[4], 0]];
            series.push({
                type: 'bar3D',
                barSize: 0.5,
                data: data1,
                label: {
                    distance: 12
                },
                stack: 'stack',
                shading: 'color',
                emphasis: {
                    label: {
                        show: false
                    }
                }
            });
        }
        for (let j = 11; j < 13; j++) {
            data1 = [[x[3], y[3], z4[j]], [x[0], y[0], z1[j]], [x[2], y[2], z3[j]], [x[5], y[5], z6[j]], [x[1], y[1], 0], [x[4], y[4], 0]];
            series.push({
                type: 'bar3D',
                barSize: 0.5,
                data: data1,
                label: {
                    distance: 12
                },
                stack: 'stack',
                shading: 'color',
                emphasis: {
                    label: {
                        show: false
                    }
                }
            });
        }
        for (let j = 13; j < 14; j++) {
            data1 = [[x[3], y[3], z4[j]], [x[0], y[0], z1[j]], [x[2], y[2], 0], [x[5], y[5], 0], [x[1], y[1], 0], [x[4], y[4], 0]];
            series.push({
                type: 'bar3D',
                barSize: 0.5,
                data: data1,
                label: {
                    distance: 12
                },
                stack: 'stack',
                shading: 'color',
                emphasis: {
                    label: {
                        show: false
                    }
                }
            });
        }
        for (let j = 14; j < 19; j++) {
            data1 = [[x[3], y[3], z4[j]], [x[0], y[0], 0], [x[2], y[2], 0], [x[5], y[5], 0], [x[1], y[1], 0], [x[4], y[4], 0]];
            series.push({
                type: 'bar3D',
                barSize: 0.5,
                data: data1,
                label: {
                    distance: 12
                },
                stack: 'stack',
                shading: 'color',
                emphasis: {
                    label: {
                        show: false
                    }
                }
            });
        }

        myChart1.setOption({
            tooltip: {},
            xAxis3D: {
                type: 'value',
                minInterval: 1,
                min: Math.min(x),
                max: Math.max(x)
            },
            yAxis3D: {
                type: 'value',
                minInterval: 1,
                min: Math.min(y),
                max: Math.max(y)
            },
            zAxis3D: {
                type: 'value'
            },
            grid3D: {
                axisTick:{
                    interval:0
                },
                light: {
                    main: {
                        shadow: true,
                        quality: 'ultra',
                        intensity: 1.5
                    }
                }
            },
            series: series
        });
        this.setState({
            myChart:myChart1
        })

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
        let { xAxisData, myChart, point, legend, series } = this.state;
        let _this = this;
        if (this.props.match.params.fileName && this.props.match.params.type) {
            if (myChart.id) {
                let arr = point;
                arr.sort(function (a, b) {
                    return a - b;
                });
                let option = {};
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
export default Geo;
