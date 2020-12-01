/**
* 文件名：/vtkView/index.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：主体文件，负责数据文件渲染和菜单栏之间参数传递，在侧边栏选择要显示的数据文件。
*/
import React from "react";
import axios from "./axios";
import MenuBar from './MenuBar/MenuContainer';
import cookie from 'react-cookies';
import { Col, Layout } from "antd";
import Sider from './SiderBar/index';
import MshView from "./vtkView/viewType/mshView/index";
import GmshView from "./vtkView/viewType/gmshView/index";
import VtkView from "./vtkView/viewType/vtkView/index";
import OffView from "./vtkView/viewType/offView/index";
import ObjView from "./vtkView/viewType/objView/index";
import InpView from "./vtkView/viewType/inpView/index";
import ImageView from "./vtkView/viewType/imageView/index";
import JsonView from "./vtkView/viewType/jsonView/index";
import FlaviaView from "./vtkView/viewType/flaviaMshView/index";
import PostMshView from "./vtkView/viewType/postMshView/index";
import { readJson } from "./vtkView/common/index";
import { CsvViewContainer, CsvViewXyContainer, CsvViewXyzNoContainer, CsvViewXyzContainer } from './vtkView/viewType/csvView/index';

const { Content } = Layout;
export default class Vtk extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileName: "",
            data: {
                "data": [],
                type: ''
            },
        };
    };
    componentDidMount() {
        let _this = this;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', __dirname + 'serverconfig.json', true);
        xhr.responseType = 'json';
        xhr.send();
        xhr.onreadystatechange = (e) => {
            if (xhr.readyState === 4) {
                global.baseUrl = xhr.response.baseUrl;
                if (this.props.match.params.fileName !== "null" && this.props.match.params.projectName) {
                    if (this.props.match.params.fileName.split('.')[1] === 'vti' ||
                        this.props.match.params.fileName.split('.')[1] === 'tiff') {
                        _this.setState({
                            fileName: this.props.match.params.fileName,
                            data: { type: '.vti' }
                        });
                    } else {
                        axios.post(global.baseUrl + '/vtkReadFile', _this.props.match.params).then(function (response) {
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
                    if (this.props.match.params.id.split('.')[1] === "json") {
                        readJson("/dicom/" + this.props.match.params.id, _this, this.props.match.params.id, '.json');
                    }
                    let id = { "fileName": this.props.match.params.id };
                    // axios.post("http://192.168.2.134:8002" + '/mod', id).then(function (response) {
                    axios.post(global.baseUrl + '/process/proUpTwo', id).then(function (response) {
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
                    }).catch(function (err) {
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
                            axios.post(global.baseUrl + '/vtkReadFile', filename).then(function (response) {
                                if (response.data.data) {
                                    _this.setState({
                                        fileName: filenames,
                                        data: response.data,
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
            }
        };

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
        let { data, fileName } = this.state;
        let newData = data.data;
        if (this.props.match.params.projectName) {
            let show = "100vh"
            return (<div className="vtk-view views" style={{ width: "100%", height: "100vh" }}>{
                this.state.data.type === ".csv" ? (newData.length * 5 < newData[0].length ? (< CsvViewXyzNoContainer data={data} fileName={fileName} show={show} />) : newData[0].length === 3 ? (<CsvViewXyContainer data={data} fileName={fileName} show={show} />) : newData[0].length === 4 ? (<CsvViewXyzContainer data={data} fileName={fileName} show={show} />) : (<CsvViewContainer data={data} fileName={fileName} show={show} />)) :
                    data.type === ".vtk" ? (< VtkView data={data} show={show} />) :
                        data.type === ".post.msh" ? (< PostMshView data={data} show={show} />) :
                            data.type === ".flavia.msh" ? (< FlaviaView data={data} show={show} />) :
                                data.type === ".msh" ? (< MshView data={data} show={show} />) :
                                    data.type === ".gmsh" ? (< GmshView data={data} show={show} />) :
                                        data.type === ".off" ? (< OffView data={data} show={show} />) :
                                            data.type === ".obj" ? (< ObjView data={data} filename={fileName} show={show} />) :
                                                data.type === ".inp" ? (< InpView data={data} show={show} />) :
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
                                data.type === ".csv" ? (newData.length * 5 < newData[0].length ? (< CsvViewXyzNoContainer data={data} fileName={fileName} show={show} />) : newData[0].length === 3 ? (<CsvViewXyContainer data={data} fileName={fileName} show={show} />) : newData[0].length === 4 ? (<CsvViewXyzContainer data={data} fileName={fileName} show={show} />) : (<CsvViewContainer data={data} fileName={fileName} show={show} />)) :
                                    data.type === ".json" ? (< JsonView data={data} show={show} />) :
                                        data.type === ".vtk" ? (< VtkView data={data} show={show} />) :
                                            data.type === ".msh" ? (< MshView data={data} show={show} />) :
                                                data.type === ".gmsh" ? (< GmshView data={data} show={show} />) :
                                                    data.type === ".flavia.msh" ? (< FlaviaView data={data} show={show} />) :
                                                        data.type === ".post.msh" ? (< PostMshView data={data} show={show} />) :
                                                            data.type === '.vti' ? (<ImageView filename={fileName} />) :
                                                                data.type === ".off" ? (< OffView data={data} show={show} />) :
                                                                    data.type === ".obj" ? (< ObjView data={data} filename={fileName} show={show} />) :
                                                                        data.type === ".inp" ? (< InpView data={data} filename={fileName} show={show} />) : null
                            } </Col>
                    </Content>
                </Layout>
            </Layout>)
        } else {
            let show = "calc(100vh - 64px)";
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
                                        data.type === ".csv" ? (newData.length * 5 < newData[0].length ? (< CsvViewXyzNoContainer data={data} fileName={fileName} show={show} />) : newData[0].length === 3 ? (<CsvViewXyContainer data={data} fileName={fileName} show={show} />) : newData[0].length === 4 ? (<CsvViewXyzContainer data={data} fileName={fileName} show={show} />) : (<CsvViewContainer data={data} fileName={fileName} show={show} />)) :
                                            data.type === ".vtk" ? (< VtkView data={data} show={show} />) :
                                                data.type === ".msh" ? (< MshView data={data} show={show} />) :
                                                    data.type === ".gmsh" ? (< GmshView data={data} show={show} />) :
                                                        data.type === ".flavia.msh" ? (< FlaviaView data={data} show={show} />) :
                                                            data.type === ".post.msh" ? (< PostMshView data={data} show={show} />) :
                                                                data.type === '.vti' ? (<ImageView filename={fileName} />) :
                                                                    data.type === ".off" ? (< OffView data={data} show={show} />) :
                                                                        data.type === ".obj" ? (< ObjView data={data} filename={fileName} show={show} />) :
                                                                            data.type === ".inp" ? (< InpView data={data} filename={fileName} show={show} />) : null
                                    } </Col>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            );
        }

    };
};