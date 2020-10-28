/**
* 文件名：offView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：*.off类型数据文件渲染逻辑。
*/
// import Draggable from 'react-draggable';
import React, { Component } from 'react';
import { Modal, Button } from 'antd';

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
                <Button type="primary" onClick={this.showModal}>
                    Open Modal
              </Button>
                <Modal
                    title="Basic Modal"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <iframe src="http://192.168.2.134:8004/ssh/host/12.2.5.7/hzhang/hzhang@CASJC0424A7" frameBorder="0"></iframe>
                </Modal>
            </>
        );
    }
}
