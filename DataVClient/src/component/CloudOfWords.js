/**
* 文件名：/component/CloudOfWords.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：词云图及形状变换。
*/
import React, { Component } from 'react';
import echarts from 'echarts';
import 'echarts-wordcloud';
import axios from "axios";
import {goUrl} from "../url"

class CloudOfWords extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileName: '',
            data: {},
            myChart: {}
        }
    };

    componentDidMount = () => {
        let _this = this
        if (this.props.match.params.id) {
            let time = {};
            time["timeID"] = this.props.match.params.id.toString();
            let myChart1 = echarts.init(document.getElementById('main1'));
            // 绘制图表
            axios.post(goUrl+"/process/cloudTwo", time).then(req => {
                let data = req.data.data;
                console.log(data);
                if (data["shape"].length > 1) {
                    myChart1.setOption({
                        series: [{
                            type: 'wordCloud',
                            // The shape of the "cloud" to draw. Can be any polar equation represented as a
                            // callback function, or a keyword present. Available presents are circle (default),
                            // cardioid (apple or heart shape curve, the most known polar equation), diamond (
                            // alias of square), triangle-forward, triangle, (alias of triangle-upright, pentagon, and star.
                            shape: data.shape,
                            left: 'center',
                            top: 'center',
                            width: '70%',
                            height: '80%',
                            right: null,
                            bottom: null,
                            sizeRange: [12, 60],
                            // Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45
                            rotationRange: [-90, 90],
                            rotationStep: 45,
                            // size of the grid in pixels for marking the availability of the canvas
                            // the larger the grid size, the bigger the gap between words.
                            gridSize: 8,
                            // set to true to allow word being draw partly outside of the canvas.
                            // Allow word bigger than the size of the canvas to be drawn
                            drawOutOfBound: false,
                            // Global text style
                            textStyle: {
                                normal: {
                                    fontFamily: 'sans-serif',
                                    fontWeight: 'bold',
                                    // Color can be a callback function or a color string
                                    color: function () {
                                        // Random color
                                        return 'rgb(' + [
                                            Math.round(Math.random() * 160),
                                            Math.round(Math.random() * 160),
                                            Math.round(Math.random() * 160)
                                        ].join(',') + ')';
                                    }
                                },
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowColor: '#333'
                                }
                            },
                            // Data is an array. Each array item must have name and value property.
                            data: data.data
                        }]
                    });
                } else {
                    let maskImage = new Image();
                    maskImage.src = data.maskImage;
                    console.log(maskImage.src)
                    myChart1.setOption({
                        series: [{
                            type: 'wordCloud',
                            // A silhouette image which the white area will be excluded from drawing texts.
                            // The shape option will continue to apply as the shape of the cloud to grow.
                            maskImage: maskImage,
                            // Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
                            // Default to be put in the center and has 75% x 80% size.
                            left: 'center',
                            top: 'center',
                            width: '70%',
                            height: '80%',
                            right: null,
                            bottom: null,
                            // Text size range which the value in data will be mapped to.
                            // Default to have minimum 12px and maximum 60px size.
                            // sizeRange: [12, 60],
                            // Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45
                            rotationRange: [-90, 90],
                            rotationStep: 45,
                            // size of the grid in pixels for marking the availability of the canvas
                            // the larger the grid size, the bigger the gap between words.
                            gridSize: 8,
                            // set to true to allow word being draw partly outside of the canvas.
                            // Allow word bigger than the size of the canvas to be drawn
                            drawOutOfBound: false,

                            // Global text style
                            textStyle: {
                                normal: {
                                    fontFamily: 'sans-serif',
                                    fontWeight: 'bold',
                                    // Color can be a callback function or a color string
                                    color: function () {
                                        // Random color
                                        return 'rgb(' + [
                                            Math.round(Math.random() * 160),
                                            Math.round(Math.random() * 160),
                                            Math.round(Math.random() * 160)
                                        ].join(',') + ')';
                                    }
                                },
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowColor: '#333'
                                }
                            },

                            // Data is an array. Each array item must have name and value property.
                            data: data.data
                        }]
                    });
                }

                _this.setState({
                    myChart: myChart1
                })
                if (window.attachEvent) {//判断是不是IE
                    window.onresize = function () {
                        _this.state.myChart.resize();
                    }
                    // window.attachEvent("onresize",_this.iegbck() );
                } else if (window.addEventListener) {//如果非IE执行以下方法
                    window.addEventListener("resize", () => {
                        _this.state.myChart.resize();
                    });
                }
            }).catch(function (error) {
                console.log(error);
            });
        }else{
            return;
        }
        // axios.post("http://localhost:8003/test/world","test").then((req,res)=>{
        // 	console.log(req.data)
        // })
    };

    render() {
        let { myChart } = this.state;
        let scale = 1;
        //内容按比例缩放
        if (myChart.clear) {
            let main1 = document.querySelector("#main1").clientHeight;
            let container = document.getElementsByClassName("container")[0].clientHeight;
            scale=container/main1;
        }
        return (
            <div className="container">
                <div id="main1" style={{ transform: "scale(" + scale + "," + scale + ")" }}>
                </div>
            </div>
        )
    }
}
export default CloudOfWords;
