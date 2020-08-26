/**
 文件名：/component/BaiDuMap.js
 作者：鲁杨飞
 创建时间：2020/8/24
 文件描述：百度地图实现热力图，地图标注和多边形。
 */
import React, { Component } from 'react';
import BMap from 'BMap';
import BMapLib from 'BMapLib';
import axios from 'axios';
import {goUrl} from "../url"

class BaiDuMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            map: {}
        }
    };

    componentDidMount = () => {
        // 百度地图API功能
        let map = new BMap.Map("main");
        map.centerAndZoom(new BMap.Point(116.331398, 39.897445), 15);
        map.enableScrollWheelZoom(true);
        map.addControl(new BMap.MapTypeControl()); //添加地图类型控件
        // 添加比例尺控件
        map.addControl(new BMap.ScaleControl());
        this.setState({
            map: map
        })
    };

    render() {
        let { map } = this.state;
        let _this = this;
        if (map.clearOverlays && this.props.match.params.id) {
            let id = this.props.match.params.id;
            let time = {};
            time["timeID"] = id.toString();
            axios.post(goUrl+"/process/transTwo", time).then(req => {
                let data = JSON.parse(JSON.stringify(req.data.data));
                let pointData = [];
                for (let i = 0; i < data.length; i++) {
                    let position = [data[i].lng, data[i].lat];
                    pointData.push(new BMap.Point(position[0], position[1]));
                }
                //坐标转换完之后的回调函数
                const translateCallback = function (point) {
                    if (point.status === 0) {
                        if (_this.props.match.params.type === "polygon") {
                            let polygon = new BMap.Polygon(point.points, { strokeColor: "blue", strokeWeight: 2, strokeOpacity: 0.5 })
                            map.addOverlay(polygon);           //增加多边形
                            // let pos = [data[0].pointX, data[0].pointY];
                            // let newPoint = new BMap.Point(pos[0], pos[1]);
                            map.panTo(point.points[0]);
                        } else if (_this.props.match.params.type === "heatmap") {
                            var points = [
                                { "lng": 116.418261, "lat": 39.921984, "count": 50 },
                                { "lng": 116.423332, "lat": 39.916532, "count": 51 },
                                { "lng": 116.419787, "lat": 39.930658, "count": 15 },
                                { "lng": 116.418455, "lat": 39.920921, "count": 40 },
                                { "lng": 116.418843, "lat": 39.915516, "count": 100 },
                                { "lng": 116.42546, "lat": 39.918503, "count": 6 },
                                { "lng": 116.423289, "lat": 39.919989, "count": 18 },
                                { "lng": 116.418162, "lat": 39.915051, "count": 80 },
                                { "lng": 116.422039, "lat": 39.91782, "count": 11 },
                                { "lng": 116.41387, "lat": 39.917253, "count": 7 },
                                { "lng": 116.421597, "lat": 39.91948, "count": 32 },
                                { "lng": 116.423895, "lat": 39.920787, "count": 26 },
                                { "lng": 116.423563, "lat": 39.921197, "count": 17 },
                                { "lng": 116.417982, "lat": 39.922547, "count": 17 },
                                { "lng": 116.426126, "lat": 39.921938, "count": 25 },
                                { "lng": 116.42326, "lat": 39.915782, "count": 100 },
                                { "lng": 116.419239, "lat": 39.916759, "count": 39 },
                                { "lng": 116.421191, "lat": 39.926572, "count": 1 },
                                { "lng": 116.419612, "lat": 39.917119, "count": 9 },
                                { "lng": 116.418237, "lat": 39.921337, "count": 54 },
                                { "lng": 116.423776, "lat": 39.921919, "count": 26 },
                                { "lng": 116.417694, "lat": 39.92536, "count": 17 },
                                { "lng": 116.415377, "lat": 39.914137, "count": 19 },
                                { "lng": 116.417434, "lat": 39.914394, "count": 43 },
                                { "lng": 116.42588, "lat": 39.922622, "count": 27 },
                                { "lng": 116.418345, "lat": 39.919467, "count": 8 },
                                { "lng": 116.426883, "lat": 39.917171, "count": 3 },
                                { "lng": 116.423877, "lat": 39.916659, "count": 34 },
                                { "lng": 116.415712, "lat": 39.915613, "count": 14 },
                                { "lng": 116.419869, "lat": 39.931416, "count": 12 },
                                { "lng": 116.416956, "lat": 39.925377, "count": 11 },
                                { "lng": 116.42066, "lat": 39.925017, "count": 38 },
                                { "lng": 116.416244, "lat": 39.920215, "count": 91 },
                                { "lng": 116.41929, "lat": 39.915908, "count": 54 },
                                { "lng": 116.422116, "lat": 39.919658, "count": 21 },
                                { "lng": 116.4183, "lat": 39.925015, "count": 15 },
                                { "lng": 116.421969, "lat": 39.913527, "count": 3 },
                                { "lng": 116.422936, "lat": 39.921854, "count": 24 },
                                { "lng": 116.41905, "lat": 39.929217, "count": 12 },
                                { "lng": 116.424579, "lat": 39.914987, "count": 57 },
                                { "lng": 116.42076, "lat": 39.915251, "count": 70 },
                                { "lng": 116.425867, "lat": 39.918989, "count": 8 }];

                            if (!isSupportCanvas()) {
                                alert('热力图目前只支持有canvas支持的浏览器,您所使用的浏览器不能使用热力图功能~')
                            }
                            //详细的参数,可以查看heatmap.js的文档 https://github.com/pa7/heatmap.js/blob/master/README.md
                            //参数说明如下:
                            /* visible 热力图是否显示,默认为true
                             * opacity 热力的透明度,1-100
                             * radius 势力图的每个点的半径大小   
                             * gradient  {JSON} 热力图的渐变区间 . gradient如下所示
                             *	{
                                    .2:'rgb(0, 255, 255)',
                                    .5:'rgb(0, 110, 255)',
                                    .8:'rgb(100, 0, 255)'
                                }
                                其中 key 表示插值的位置, 0~1. 
                                    value 为颜色值. 
                             */
                            let heatmapOverlay = new BMapLib.HeatmapOverlay({ "radius": 20 });
                            map.addOverlay(heatmapOverlay);
                            heatmapOverlay.setDataSet({ data: points, max: 100 });
                            //是否显示热力图
                            function openHeatmap() {
                                heatmapOverlay.show();
                            }
                            function closeHeatmap() {
                                heatmapOverlay.hide();
                            }
                            openHeatmap();
                            function setGradient() {
                                /*格式如下所示:
                               {
                                     0:'rgb(102, 255, 0)',
                                     .5:'rgb(255, 170, 0)',
                                     1:'rgb(255, 0, 0)'
                               }*/
                                var gradient = {};
                                var colors = document.querySelectorAll("input[type='color']");
                                colors = [].slice.call(colors, 0);
                                colors.forEach(function (ele) {
                                    gradient[ele.getAttribute("data-key")] = ele.value;
                                });
                                heatmapOverlay.setOptions({ "gradient": gradient });
                            }
                            //判断浏览区是否支持canvas
                            function isSupportCanvas() {
                                var elem = document.createElement('canvas');
                                return !!(elem.getContext && elem.getContext('2d'));
                            }
                            map.panTo(new BMap.Point(points[0].lng, points[0].lat));
                            
                        } else {
                            for (let i = 0; i < point.points.length; i++) {
                                let marker = new BMap.Marker(point.points[i]);  // 创建标注
                                let opts = {
                                    width: 250,
                                    height: 100,
                                    title: data[i].title
                                }
                                let infoWindow = new BMap.InfoWindow(data[i]["类型描述"], opts);  // 创建信息窗口对象
                                map.addOverlay(marker);              // 将标注添加到地图中
                                marker.onclick = function (e) {
                                    infoWindow.set
                                    map.openInfoWindow(infoWindow, e.point);        // 打开信息窗口
                                }
                            }
                            map.panTo(point.points[0]);
                        }
                    }else{
                        return;
                    }
                }
                //转为百度坐标
                let convertor = new BMap.Convertor();
                convertor.translate(pointData, 3, 5, translateCallback);
                let tileLayer = new BMap.TileLayer({ isTransparentPng: true });
                tileLayer.getTilesUrl = function (tileCoord, zoom) {
                    let x = tileCoord.x;
                    let y = tileCoord.y;
                    return "/border.png";
                }
                map.addTileLayer(tileLayer);
                function delete_control() {
                    map.removeTileLayer(tileLayer);
                }
            })
        }
        return (
            <div id="main">
            </div>
        )

    }
}
export default BaiDuMap;
