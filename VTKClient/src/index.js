/**
* 文件名：/src/index.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：项目入口文件，通过路由显示页面。
* */
import React from 'react';
import "./index.css"
import ReactDOM from 'react-dom';
import Router from './router/index.js';

ReactDOM.render(<Router />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
