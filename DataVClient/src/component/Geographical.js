/**
 文件名：/component/Geographical.js
 作者：鲁杨飞
 创建时间：2020/8/24
 文件描述：echarts 热力图示例。
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Spin } from "antd";
import echarts from 'echarts';
import 'echarts-gl/dist/echarts-gl.js';
import axios from 'axios';
import {goUrl} from "../url"

class Geographical extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            heatMapData: []
        }
    };

    componentDidMount = () => {
        let _this = this;
        if (this.props.match.params.id) {
            let id = {};
            id["timeID"] = this.props.match.params.id;
            axios.post(goUrl+"/process/heatTwo", id).then((req) => {
                console.log(req.data)
                let heatMapData = JSON.parse(req.data.data.data);
                let url = "/data/" + req.data.mapData;
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
                        _this.setState({
                            data: data,
                            heatMapData: heatMapData
                        });
                        document.body.removeChild(document.getElementById('loading'));
                    }
                };
            }).catch(function (err) {
                console.log(err);
            })
        };
    };

    render() {
        let { data, heatMapData } = this.state;
        if (Object.keys(data).length > 0) {
            var chart = echarts.init(document.getElementById('main'));
            echarts.registerMap('demo', data);
            // 全国省份列表	
            var geoCoordMap = {
                "台湾": [121.509062, 25.044332],
                "河北": [114.502461, 38.045474],
                "山西": [112.549248, 37.857014],
                "内蒙古": [111.670801, 40.818311],
                "辽宁": [123.429096, 41.796767],
                "吉林": [125.3245, 43.886841],
                "黑龙江": [126.642464, 45.756967],
                "江苏": [118.767413, 32.041544],
                "浙江": [120.153576, 30.287459],
                "安徽": [117.283042, 31.86119],
                "福建": [119.306239, 26.075302],
                "江西": [115.892151, 28.676493],
                "山东": [117.000923, 36.675807],
                "河南": [113.665412, 34.757975],
                "湖北": [114.298572, 30.584355],
                "湖南": [112.982279, 28.19409],
                "广东": [113.280637, 23.125178],
                "广西": [108.320004, 22.82402],
                "海南": [110.33119, 20.031971],
                "四川": [104.065735, 30.659462],
                "贵州": [106.713478, 26.578343],
                "云南": [102.712251, 25.040609],
                "西藏": [91.132212, 29.660361],
                "陕西": [108.948024, 34.263161],
                "甘肃": [103.823557, 36.058039],
                "青海": [101.778916, 36.623178],
                "宁夏": [106.278179, 38.46637],
                "新疆": [87.617733, 43.792818],
                "北京": [116.405285, 39.904989],
                "天津": [117.190182, 39.125596],
                "上海": [121.472644, 31.231706],
                "重庆": [106.504962, 29.533155],
                "香港": [114.173355, 22.320048],
                "澳门": [113.54909, 22.198951]
            };
            var markPointData = [{
                "name": "新疆",
                "coord": [
                    87.665966, 43.869561, 90
                ],
                "runConut": '537',
                "num": '234'
            }];
            //数据转换
            // var convertData = function (data) {
            //     var res = [];
            //     for (var i = 0; i < data.length; i++) {
            //         var geoCoord = geoCoordMap[data[i].name];
            //         if (geoCoord) {
            //             res.push(geoCoord.concat(data[i].value));
            //         }
            //     }
            //     return res;
            // };

            chart.setOption({
                "backgroundColor": "#F5FFFA",
                "animation": true,
                "progressiveThreshold": 3,
                "legend": {
                    "left": 'left',
                    "icon": 'circle',
                    "textStyle": {
                        "color": '#000'
                    }
                },
                "tooltip": {
                    "trigger": "item",
                    "showDelay": 0,
                    "transitionDuration": 0.2,
                    "formatter": "{b}",
                    "triggerOn": "mousemove",
                    "backgroundColor": "#eee",
                    "borderColor": "#BDB76B",
                    "borderWidth": "1",
                    "padding": [5, 10],
                    "textStyle": {
                        "color": "#000000",
                        "fontSize": "16",
                        "fontFamily": "Microsoft YaHei",
                        "fontWeight": "bold"
                    }
                },
                "grid": {},
                "geo": {
                    "map": "demo",
                    //"center": [0, 12],
                    "aspectScale": 0.8,
                    "roam": true,
                    "scaleLimit": {
                        "min": 1.2,
                        "max": 15
                    },
                    "zoom": 1.2,
                    itemStyle: {
                        normal: {
                            borderColor: '#BDB76B',
                            borderWidth: 1,
                            areaColor: "#F5DEB3",
                            // shadowColor: '	#FFFFF0',
                            shadowColor: 'rgba(255, 255, 255, 0)',
                            shadowOffsetX: -5,
                            shadowOffsetY: 12,
                            shadowBlur: 10
                        },
                        emphasis: {
                            areaColor: '#D2B48C',
                            borderWidth: 0
                        }
                    }
                },
                "series": [{
                    "name": "热力图",
                    "type": "heatmap",
                    "minAlpha": 1,
                    "coordinateSystem": "geo",
                    "data": heatMapData,
                    // "markPoint": { //标记点
                    //     // "symbol": 'path://M512 39.384615l169.353846 295.384615 342.646154 63.015385-240.246154 248.123077L827.076923 984.615385l-315.076923-145.723077L196.923077 984.615385l43.323077-334.769231L0 401.723077l342.646154-63.015385L512 39.384615',
                    //     //"symbolSize": 14, //图形大小
                    //     "label": {
                    //         "normal": {
                    //             formatter: function (params) {
                    //                 return params.name;
                    //             },
                    //             "show": true,
                    //         },
                    //         "emphasis": {
                    //             show: true,
                    //         }
                    //     },
                    //     "itemStyle": {
                    //         "normal": {
                    //             "color": 'rgba(72,150,128,1)'
                    //         }
                    //     },
                    //     "data": markPointData
                    // }
                }],
                "visualMap": [{
                    "show": true,
                    "left": "10%",
                    "bottom": "5%",
                    "max": 500,
                    "min": 0,
                    "z": 999,
                    "calculable": false,
                    "text": ["高", "低"],
                    "inRange": {
                        "color": ["#0033FF", "#FFFF00", "#FF3333"]
                    },
                    "textStyle": {
                        "color": "#000"
                    },
                    "seriesIndex": 0
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


        return (
            <div id="main">
            </div>
        )

    }
}
export default Geographical;
