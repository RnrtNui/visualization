/**
* 文件名：/router/index.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：项目路由文件。
*/
import React from 'react';
import Vtk from '../components/index';
import { createBrowserHistory } from 'history';
import Geo from '../components/vtkView/viewType/geoView/index';
import { Switch, Router, Route } from "react-router-dom";
import TestView from '../components/vtkView/trash/testView';
import NotFound from '../components/error/404'
let browserHistory = createBrowserHistory();
export default class VtkRouter extends React.Component {

    render() {
        return (
            <Router history={browserHistory}>
                <Switch>
                    <Route exact path="/" component={Vtk} />                             {/* 默认显示页面，通过侧边栏选择文件*/}
                    <Route exact path="/Geo" component={Geo} />                             {/* 钻孔模型*/}
                    <Route exact path="/test" component={TestView} />                       {/* 测试页面 */}
                    <Route exact path="/vtk/:projectName/:fileName" component={Vtk} />      {/* 通过地址栏传递文件参数，全屏显示模型*/}
                    <Route exact path="/visualization/:id" component={Vtk} />               {/* 通过地址栏传递文件参数，全屏显示模型*/}
                    <Route component={NotFound} />
                </Switch>
            </Router>
        );
    };
};
