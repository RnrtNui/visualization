/**
 文件名：/vtkView/index.js
 作者：鲁杨飞
 创建时间：2020/8/24
 文件描述：主体文件，负责数据文件渲染和菜单栏之间参数传递，在侧边栏选择要显示的数据文件。
 */
import React from "react";
import axios from "./axios";
import { goUrl } from "../url";
import MenuBar from './MenuBar';
import cookie from 'react-cookies';
import { Col, Layout } from "antd";
import Sider from './SiderBar/index';
import CsvView from "./vtkView/view/csvView";
import MshView from "./vtkView/view/mshView";
import VtkView from "./vtkView/view/vtkView";
import OffView from "./vtkView/view/offView";
import ObjView from "./vtkView/view/objView";
import InpView from "./vtkView/view/inpView";
import ImageView from "./vtkView/view/imageView";
import FlaviaView from "./vtkView/view/flaviaMshView";
import PostMshView from "./vtkView/view/postMshView";
import { readJson } from "./vtkView/common/index"

const { Content } = Layout;

export default class Vtk extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileName: "",
            fileList: [],
            data: {
                "data": [],
                type: ''
            },
            vtkRender: false,
            tree: {},
            display: "none",
            displayBar: 0,
            usePointPicker: null,
            useCellPicker: null,
            useAxis: false,
            Scalar: true,
            Screen: null,
            keydown: "",
            opt: "Rotate",
            size: "",
            light: false,
            bounds: false,
        };
    };

    componentDidMount() {
        document.addEventListener("keydown", this.onKeyDown);
        let _this = this;
        if (this.props.match.params.fileName !== "null" && this.props.match.params.projectName) {
            if (this.props.match.params.fileName.split('.')[1] === 'vti' ||
                this.props.match.params.fileName.split('.')[1] === 'tiff') {
                _this.setState({
                    fileName: this.props.match.params.fileName,
                    data: { type: '.vti' }
                });
            } else {
                axios.post(goUrl + '/vtkReadFile', _this.props.match.params).then(function (response) {
                    if (response.data.data) {
                        cookie.save('filename', _this.props.match.params.fileName);
                        _this.setState({
                            fileName: _this.props.match.params.fileName,
                            data: response.data
                        });
                    } else {
                        readJson(response.data.filePath, _this, _this.props.match.params.fileName, response.data.type);
                    }
                }).catch(function (error) {
                    console.log(error);
                });
            }
        } else if (this.props.match.params.id) {
            let id = { "fileName": this.props.match.params.id };
            axios.post(goUrl + '/process/proUpTwo', id).then(function (response) {
                console.log(response);
                if (response.data.data) {
                    _this.setState({
                        fileName: id["fileName"],
                        data: response.data
                    });
                } else if (response.data.type !== ".obj" && response.data.filePath) {
                    readJson(response.data.filePath, _this, id["fileName"], response.data.type);
                } else if (response.data.type === ".obj") {
                    let Suffix = response.data.filePath;
                    if (Suffix.indexOf('.json') !== -1) {
                        readJson(response.data.filePath, _this, id["fileName"], response.data.type);
                    } else {
                        _this.setState({
                            fileName: id["fileName"],
                            data: response.data
                        });
                    }
                }
            })
                .catch(function (err) {
                    console.log(err)
                })
        } else {
            if (cookie.load("filename")) {
                let filenames = cookie.load("filename");
                if (filenames.split('.')[1] === 'vti' || filenames.split('.')[1] === 'tiff') {
                    _this.setState({
                        fileName: filenames,
                        data: { type: '.vti' }
                    });
                } else {
                    let filename = {
                        fileName: filenames,
                        projectName: "3"
                    };
                    axios.post(goUrl + '/vtkReadFile', filename).then(function (response) {
                        if (response.data.data) {
                            _this.setState({
                                fileName: filenames,
                                data: response.data
                            });
                        } else if (response.data.type !== ".obj" && response.data.filePath) {
                            readJson(response.data.filePath, _this, filenames, response.data.type);
                        } else if (response.data.type === ".obj") {
                            let Suffix = response.data.filePath;
                            if (Suffix.indexOf('.json') !== -1) {
                                readJson(response.data.filePath, _this, filenames, response.data.type);
                            } else {
                                _this.setState({
                                    fileName: filenames,
                                    data: response.data
                                });
                            }

                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            }
        }
    };

    UNSAFE_componentWillMount() {
        document.removeEventListener("keydown", this.onKeyDown);
    };

    // 获取标量结果
    getScalar = (val) => {
        this.setState({
            Scalar: val
        })
    };

    // 鼠标拖拽方法
    onButton = (key) => {
        this.setState({
            keydown: key,
            Scalar: null
        });
    };

    // 属性框
    onShow = (val) => {
        this.setState({
            display: val
        });
    };

    // 色标卡显示、隐藏
    onShowBar = (val) => {
        this.setState({
            displayBar: val
        });
    };

    //显示边框
    showBounds = (val) => {
        this.setState({
            bounds: val
        });
    }

    //灯光开关
    useLight = (val) => {
        this.setState({
            light: val
        });
    }

    //鼠标事件
    getOperation = (val) => {
        this.setState({
            opt: val
        });
    };

    // 点拾取
    usePointPic = (val) => {
        this.setState({
            usePointPicker: val,
        });
    };

    // 单元拾取
    useCellPic = (val) => {
        this.setState({
            useCellPicker: val,
        });
    };

    // 坐标
    useAxi = (val) => {
        this.setState({
            useAxis: val,
            keydown: "",
        });
    };

    // 截屏
    useScreen = (val) => {
        this.setState({
            Screen: val
        });
    };

    getData = (val) => {
        this.setState({
            fileName: null,
            data: { type: '' }
        });
        cookie.save('filename', val.fileName);
        this.setState({
            fileName: val.fileName,
            data: val.data
        });
    }
    render() {
        let { data, fileName, display, displayBar, useAxis, keydown, usePointPicker, useCellPicker, light, opt, Scalar, Screen, bounds } = this.state;
        if (this.props.match.params.projectName) {
            let show = "100vh"
            return (<div className="vtk-view views" style={{ width: "100%", height: "100vh" }}>{
                this.state.data.type === ".csv" ? (< CsvView data={data} display={display} useScreen={Screen} useAxis={useAxis} fileName={fileName} opt={opt} show={show} keydown={keydown} />) :
                    data.type === ".vtk" ? (< VtkView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                        data.type === ".post.msh" ? (< PostMshView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                            data.type === ".flavia.msh" ? (< FlaviaView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                data.type === ".msh" ? (< MshView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                    data.type === ".off" ? (< OffView data={data} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                        data.type === ".obj" ? (< ObjView data={data} filename={fileName} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                            data.type === ".inp" ? (< InpView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                                data.type === '.vti' ? (<ImageView filename={fileName} />) : null
            }</div>)
        } else if (this.props.match.params.id) {
            let show = "calc(100vh - 64px)"
            return (<Layout>
                <Layout className="site-layout" onMouseEnter={this.SiderOut} >
                    <MenuBar style={{ paddingLeft: "100px", backgroundColor: "#E8E8E8", zIndex: "999", overflow: "hidden", border: "1px solid #ccc" }}
                        onButton={this.onButton}
                        useLight={this.useLight}
                        useScreen={this.useScreen}
                        getScalar={this.getScalar}
                        onShow={this.onShow}
                        onShowBar={this.onShowBar}
                        getOperation={this.getOperation}
                        usePointPic={this.usePointPic}
                        useCellPic={this.useCellPic}
                        useAxi={this.useAxi}
                        showBounds={this.showBounds}
                    />
                    <Content className="site-layout-background"
                        style={{ height: "calc(100vh - 64px)", display: "flex", width: "100%", backgroundColor: "#FFF" }} >
                        <Col className="visual-view views">
                            {
                                data.type === ".csv" ? (< CsvView data={data} display={display} useScreen={Screen} useAxis={useAxis} opt={opt} fileName={fileName} show={show} keydown={keydown} />) :
                                    data.type === ".vtk" ? (< VtkView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                        data.type === ".msh" ? (< MshView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                            data.type === ".flavia.msh" ? (< FlaviaView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                                data.type === ".post.msh" ? (< PostMshView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                                    data.type === '.vti' ? (<ImageView filename={fileName} useScreen={Screen} display={display} />) :
                                                        data.type === ".off" ? (< OffView data={data} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                                            data.type === ".obj" ? (< ObjView data={data} filename={fileName} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                                                data.type === ".inp" ? (< InpView data={data} filename={fileName} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} Scalar={Scalar} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) : null
                            } </Col>
                    </Content>
                </Layout>
            </Layout>)
        } else {
            let show = "calc(100vh - 64px)"
            return (
                <div>
                    <Layout>
                        <Layout className="site-layout" onMouseEnter={this.SiderOut} >
                            <MenuBar style={{ paddingLeft: "100px", backgroundColor: "#E8E8E8", zIndex: "999", overflow: "hidden", border: "1px solid #ccc" }}
                                onButton={this.onButton}
                                useLight={this.useLight}
                                useScreen={this.useScreen}
                                getScalar={this.getScalar}
                                onShow={this.onShow}
                                onShowBar={this.onShowBar}
                                getOperation={this.getOperation}
                                usePointPic={this.usePointPic}
                                useCellPic={this.useCellPic}
                                useAxi={this.useAxi}
                                showBounds={this.showBounds}
                            />
                            <Content className="site-layout-background"
                                style={{ height: "calc(100vh - 64px)", display: "flex", width: "100%", backgroundColor: "#FFF" }} >
                                <Col className="vtk-panel">
                                    <Sider getData={this.getData} />
                                </Col >
                                <Col className="vtk-view views">
                                    {
                                        data.type === ".csv" ? (< CsvView data={data} display={display} useScreen={Screen} useAxis={useAxis} opt={opt} fileName={fileName} show={show} keydown={keydown} />) :
                                            data.type === ".vtk" ? (< VtkView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                                data.type === ".msh" ? (< MshView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                                    data.type === ".flavia.msh" ? (< FlaviaView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                                        data.type === ".post.msh" ? (< PostMshView data={data} Scalar={Scalar} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                                            data.type === '.vti' ? (<ImageView filename={fileName} useScreen={Screen} display={display} />) :
                                                                data.type === ".off" ? (< OffView data={data} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                                                    data.type === ".obj" ? (< ObjView data={data} filename={fileName} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) :
                                                                        data.type === ".inp" ? (< InpView data={data} filename={fileName} useLight={light} useScreen={Screen} displayBar={displayBar} display={display} useAxis={useAxis} Scalar={Scalar} opt={opt} show={show} bounds={bounds} keydown={keydown} usePointPicker={usePointPicker} useCellPicker={useCellPicker} />) : null
                                    } </Col>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            );
        }

    };
};