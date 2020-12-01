/**
* 文件名：、/router/index.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：项目路由文件。
*/
import React from 'react';
import { Switch, Router, Route } from "react-router-dom";
import Home from '../component/home';
import Excel from '../component/Excel';
import TestView from '../component/TestView';
import Ligature from '../component/Ligature';
import DateView from '../component/DateView';
import Tree from '../component/Tree';
import Geo from '../component/geology';
import DateView1 from '../component/DateView1';
import DateView2 from '../component/DateView2';
import DateView3 from '../component/DateView3';
import CloudOfWords from '../component/CloudOfWords';
import Geographical from '../component/Geographical';
import BaiDuMap from '../component/BaiDuMap';
import GoogleMap from '../component/GoogleMap';
import Vector from '../component/vector'
import { createBrowserHistory } from 'history';
const browserHistory = createBrowserHistory();
export default class VtkRouter extends React.Component {
    render() {
        return (
            <Router history={browserHistory}>
                <Switch>
                    <Route exact path="/" component={Home} />                               {/* home */}
                    <Route exact path="/Geo" component={Geo} />                             {/* 柱状 */}
                    <Route exact path="/excel/:fileName/:type" component={Excel} />         {/* echarts图表 */}
                    <Route exact path="/cloudofwords/:id" component={CloudOfWords} />       {/* 词云图 */}
                    <Route exact path="/geographical/:id" component={Geographical} />       {/* echarts 热力图 */}
                    <Route exact path="/baidumap/:type/:id" component={BaiDuMap} />         {/* 百度地图 */}
                    <Route exact path="/googlemap" component={GoogleMap} />                 {/* google地图 */}
                    <Route exact path="/echarts/:fileName" component={TestView} />          {/* 三维模型点集 */}
                    <Route exact path="/tree/:pos" component={Tree} />                      {/* 树图 */}
                    <Route exact path="/ligature" component={Ligature} />                   {/* 背景画线 */}
                    <Route exact path="/echarts0" component={DateView} />                   {/* 全国疫情状况 */}
                    <Route exact path="/echarts1" component={DateView1} />                  {/* Watermark-Echarts  */}
                    <Route exact path="/echarts2" component={DateView2} />                  {/* 极坐标系下的堆叠柱状图 */}
                    <Route exact path="/echarts3" component={DateView3} />                  {/* 3D Bar with Dataset */}
                    <Route exact path="/vector" component={Vector} />                  {/* 3D 矢量图 */}
                </Switch>
            </Router>
        );
    };
};
