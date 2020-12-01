/**
* 文件名：offView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：*.off类型数据文件渲染逻辑。
*/
// import Draggable from 'react-draggable';
import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import cookie from 'react-cookies';
import axios from '../../axios'
export default class offView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
        this.container = React.createRef();
        this.container1 = React.createRef();
    };

    componentDidMount() {
        cookie.save('userId', "123");
        let data = { FileName: "mod3.msh" };
        axios.post('http://192.168.2.134:8002/mod', data).then(req => {
            console.log(req);
        });
    };
    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = e => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    handleCancel = e => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    render() {
        return (
            <>

            </>
        );
    }
}
