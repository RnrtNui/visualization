/**
* 文件名：flaviaMshView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：*.flavia.msh类型数据文件渲染逻辑。
*/
import vtk from 'vtk.js/Sources/vtk';
import Draggable from 'react-draggable';
import React, { Component } from 'react';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import { Slider, InputNumber, Input, Col, Row, Select, Checkbox } from "antd";
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import colorMode from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps.json';
import { Rendering, Screen, gl, scalarBar, Axis, reassignManipulators, changeManipulators, showBounds, showVector } from "../../common/index";

const InputGroup = Input.Group;
const { Option } = Select;
export default class flaviaView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            activeScalar: [],
            model: {},
            canvas: {},
            vectorData: [],
            boxBgColor: "#ccc",
            value: 0,
            vector: false,
            ArrowSize: 1,
            min: null,
            max: null,
            ResData: {},
            scalarBar: 0,
            mode: "Cool to Warm",
            unique: [],
            points: [],
            cells: [],
            pointData: 0,
            inputValue: 1,
            resultList: [],
            checkedResList: [],
            resClass: 0,
            resId: 0,
            OpenGlRW: {}
        }
        this.container = React.createRef();
        this.container1 = React.createRef();
    };

    // 渲染
    result = () => {
        let { data } = this.props;
        let { model } = this.state;
        let vtkBox = document.getElementsByClassName('vtk-container')[0];
        if (vtkBox) {
            vtkBox.innerHTML = null;
        }
        if (data.data.Type === "flavia") {
            Rendering(model, this.container);  //准备
            let OpenGlRW = model.fullScreenRenderer.getOpenGLRenderWindow();
            let points = JSON.parse(JSON.stringify(data.data.Data[0]));
            let cells = JSON.parse(JSON.stringify(data.data.Data[1]));
            let ResData = {}, resultList = [], checkedResList = [], vectorData = [];

            if (data.data.Data[2]) {
                for (var key1 in data.data.Data[2]) {　　//遍历对象的所有属性，包括原型链上的所有属性
                    if (data.data.Data[2].hasOwnProperty(key1)) { //判断是否是对象自身的属性，而不包含继承自原型链上的属性
                        resultList.push(key1);        //键名
                    }
                }
                for (let i = 0; i < resultList.length; i++) {
                    let resName = data.data.Data[2][resultList[i]];
                    for (var keys in resName) {
                        if (resName.hasOwnProperty(keys)) {
                            checkedResList.push(resultList[i] + "_" + keys);
                            ResData[resultList[i] + "_" + keys] = resName[keys]
                        }
                    }
                }
            }
            let vec = [];
            if (data.data.Data[2]["vector"]) {
                for (var key2 in data.data.Data[2]["vector"]) {
                    if (data.data.Data[2]["vector"].hasOwnProperty(key2)) {
                        vec.push("vector_" + key2);
                    }
                }
                for (let i = 0; i < ResData[checkedResList[0]].length; i++) {
                    vectorData.push(ResData[vec[0]][i], ResData[vec[1]][i], ResData[vec[2]][i])
                }
            }
            let pointDatas = [];
            if (ResData[checkedResList[0]]) pointDatas = JSON.parse(JSON.stringify(ResData[checkedResList[0]]))
            pointDatas.sort(function (a, b) {
                return a - b;
            });
            let unique = [...new Set(pointDatas)];
            if (unique[0] === "null") unique.splice(0, 1);
            unique.sort(function (a, b) {
                return a - b;
            });
            let min = Number(unique[0]);
            let max = Number(unique[unique.length - 1]);
            //更新数据
            this.setState({
                points: points,
                cells: cells,
                pointData: checkedResList[0],
                resultList: resultList,
                vectorData: vectorData,
                checkedResList: checkedResList,
                ResData: ResData,
                min: min,
                max: max,
                unique: unique,
                OpenGlRW, OpenGlRW
            })
            //创建默认显示数据
            let polydata = vtk({
                vtkClass: 'vtkPolyData',
                points: {
                    vtkClass: 'vtkPoints',
                    dataType: 'Float32Array',
                    numberOfComponents: 3,
                    values: points,
                },
                polys: {
                    vtkClass: 'vtkCellArray',
                    dataType: 'Float32Array',
                    values: cells,
                },
            });

            const mapper = vtkMapper.newInstance({
                interpolateScalarsBeforeMapping: true
            });
            mapper.setInputData(polydata);
            const actor = vtkActor.newInstance();
            model.actor = actor;
            actor.setMapper(mapper);
            // actor.getProperty().setColor(1.0, 1.0, 1.0);
            model.renderer.addActor(actor);
            model.interactorStyle.setCenterOfRotation(mapper.getCenter());
            reassignManipulators(model);
        }
        model.renderer.resetCamera();
    };

    componentDidMount() {
        //渲染
        this.result();
        //创建坐标轴
        Axis(this.state.model);
    };

    componentDidUpdate = (prevProps) => {
        let { screen } = this.props.state
        if (screen !== prevProps.state.screen) {
            if (document.getElementsByTagName("canvas").length > 0) {
                Screen(document.getElementsByTagName("canvas")[0])
            }
        }
    };

    //选择色标样式
    onChange = (value) => {
        let name = value.split("--")
        this.setState({
            mode: name[0],
        })
    };

    //选择色标样式时触发
    onSearch(val) {
        console.log('search:', val);
    };

    //改变模型透明度
    onChangeAlpha = value => {
        if (isNaN(value)) {
            return;
        }
        this.setState({
            inputValue: value,
        });
    };

    //选择显示结果类型
    onChangeResClassname = (value) => {
        let { data } = this.props;
        let { model, resultList } = this.state;
        let resName = data.data[2][resultList[value]];
        let checkedResList = [];
        for (var keys in resName) {　　//遍历对象的所有属性，包括原型链上的所有属性
            if (resName.hasOwnProperty(keys)) { //判断是否是对象自身的属性，而不包含继承自原型链上的属性
                checkedResList.push(keys);        //键名
            }
        }
        let OpenGlRW = this.state.model.fullScreenRenderer.getOpenGLRenderWindow();
        gl(OpenGlRW);
        if (model.vectorActor) {
            model.renderer.removeActor(model.vectorActor);
        }
        this.setState({
            resClass: value,
            checkedResList: checkedResList,
            resId: 0,
            pointData: JSON.parse(JSON.stringify(data.data[2][resultList[value]][checkedResList[0]]))
        })
    }

    //选择显示结果name
    onChangeResValname = (value) => {
        let { model, ResData } = this.state;
        let name = value
        if (model.vectorActor) {
            model.renderer.removeActor(model.vectorActor);
            model.renderWindow.render();
        }
        let pointDatas = [];
        if (ResData[name]) pointDatas = JSON.parse(JSON.stringify(ResData[name]))
        pointDatas.sort(function (a, b) {
            return a - b;
        });
        let unique = [...new Set(pointDatas)];
        if (unique[0] === "null") unique.splice(0, 1);
        unique.sort(function (a, b) {
            return a - b;
        });
        //显示结果的最大最小值
        let min = Number(unique[0]);
        let max = Number(unique[unique.length - 1]);
        this.setState({
            pointData: name,
            unique: unique,
            min: min,
            max: max

        })
    }

    //选择显示矢量
    onCheckArrow = (e) => {
        let { model } = this.state;
        if (model.vectorActor) {
            model.renderer.removeActor(model.vectorActor);
        }
        this.setState({
            vector: e.target.checked
        })
    }

    //改变矢量大小
    onChangeArrowSize = value => {
        let { model } = this.state;
        if (model.vectorActor) {
            model.renderer.removeActor(model.vectorActor);
        }
        this.setState({
            ArrowSize: value
        })
    };

    //修改MapperRange最小值
    InputMapperRangeMin = e => {
        this.setState({
            min: Number(e.target.value)
        });
    };

    //修改MapperRange最大值
    InputMapperRangeMax = e => {
        this.setState({
            max: Number(e.target.value)
        });
    };

    render() {
        let {
            boxBgColor, displayBox, vector, ArrowSize, vectorData, ResData, model, activeScalar, mode, unique, min, max, inputValue, points, cells, pointData, checkedResList, OpenGlRW
        } = this.state;
        let { show, state } = this.props;
        let { scalar, attribute, axis, moveStyle, result, bounds, light, screen, modelStyle } = state;
        let scale = [];
        let modes = mode;
        let num = Math.round(unique.length / 3)
        activeScalar = [unique[unique.length - 1], unique[unique.length - 1 - num], unique[num], unique[0]];
        scale = [(unique.length * 100) / unique.length + "%", ((unique.length - num) * 100) / unique.length + "%", (num * 100) / unique.length + "%", 0 + "%"]
        if (document.querySelector(".scalarMax")) document.querySelector(".scalarMax").innerHTML = max
        if (document.querySelector(".scalarMin")) document.querySelector(".scalarMin").innerHTML = min
        if (document.querySelector(".vtk-container1")) {
            document.querySelector(".vtk-container1").style.display = "block"
        }
        const lut1 = vtkColorTransferFunction.newInstance();
        const preset = vtkColorMaps.getPresetByName(modes);   //预设色标颜色样式
        lut1.applyColorMap(preset);  //应用ColorMap
        lut1.updateRange();
        //创建polydat
        let polydata1 = {
            vtkClass: 'vtkPolyData',
            "points": {
                vtkClass: 'vtkPoints',
                dataType: 'Float32Array',
                numberOfComponents: 3,
                values: points,
            },
            "polys": {
                vtkClass: 'vtkCellArray',
                dataType: 'Float32Array',
                values: cells,
            },
            "pointData": {
                vtkClass: 'vtkDataSetAttributes',
                activeScalars: 0,
                arrays: [{
                    data: {
                        vtkClass: 'vtkDataArray',
                        name: 'pointScalars',
                        dataType: 'Float32Array',
                        values: ResData[pointData],
                    },
                }],
            }
        };
        let polydata2 = {
            vtkClass: 'vtkPolyData',
            "points": {
                vtkClass: 'vtkPoints',
                dataType: 'Float32Array',
                numberOfComponents: 3,
                values: points,
            },
            "polys": {
                vtkClass: 'vtkCellArray',
                dataType: 'Float32Array',
                values: cells,
            },
        };
        if (OpenGlRW.initialize) gl(OpenGlRW);
        if (document.querySelector('.textCanvas')) this.container.current.children[0].removeChild(document.querySelector('.textCanvas'))
        if (model.renderer) {
            model.renderer.removeActor(model.bounds);
            //清除textCanvas
            if (document.querySelector('.textCanvas')) this.container.current.children[0].removeChild(document.querySelector('.textCanvas'))
            //移除所有对象
            model.renderer.removeActor(model.bounds);
            showVector(vector, model, points, vectorData, lut1, min, max, ArrowSize); //矢量
            const mapper1 = vtkMapper.newInstance();
            const actor1 = vtkActor.newInstance();
            //显示边界
            showBounds(bounds, model, this.container, vtk(polydata1));
            //更新色标卡
            if (this.container1.current.childElementCount >= 1) {
                this.container1.current.innerHTML = null;
            }
            scalarBar(model, unique, modes, this.container1);
            model.lookupTable = lut1;
            //设置透明度
            actor1.getProperty().setOpacity(inputValue);
            actor1.setMapper(mapper1);
            mapper1.setLookupTable(lut1);
            mapper1.setScalarRange(min, max);
            mapper1.setInputData(vtk(polydata1));
            model.renderer.removeActor(model.actor);
            model.mapper = mapper1;
            model.actor = actor1;
            model.renderer.addActor(actor1);
        }
        if (result === false) {
            scalar = 0;
            if (model.renderWindow) model.mapper.setScalarModeToUseCellData();
        } else {
            if (model.renderWindow) model.mapper.setScalarModeToUsePointData();
        }
        //改变显示样式
        if (model.renderer) changeManipulators(model, moveStyle, modelStyle, light, axis, unique, modes, this.container1, lut1, inputValue, polydata1, polydata2, min, max, result);

        //截屏
        let useScreen = screen;
        if (useScreen !== screen) {
            this.setState({
                screen: useScreen
            })
            // model.renderWindow.render();
            this.timer = setTimeout(() => {
            }, 1000);
        }
        return (
            <div>
                <Draggable handle=".handle"
                    defaultPosition={{ x: 0, y: 0 }}
                    position={null}
                    grid={[1, 1]}
                    scale={1}>
                    <div style={{ display: attribute, position: "absolute", zIndex: "90", top: "20px", left: "20px" }}>
                        <div style={{ width: "250px", background: boxBgColor, padding: "20px", lineHeight: "20px", display: "block" }}>
                            <span className="handle" style={{ display: "inline-block", width: "100%", textAlign: "center" }}>属性栏</span>
                            <InputGroup>
                                <Row >
                                    <Col >ColorMaps</Col >
                                </Row >
                                <Row >
                                    <Col >
                                        <Select
                                            showSearch
                                            style={{ width: 200 }}
                                            placeholder={mode}
                                            optionFilterProp="children"
                                            onChange={this.onChange}
                                            onSearch={this.onSearch}
                                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                            {
                                                colorMode.map((item, index) => {
                                                    let modeKeys = item.Name + "--" + index;
                                                    if (item.ColorSpace !== undefined) {
                                                        return (<Option key={index} value={modeKeys} >{item.Name}</Option>);
                                                    } else {
                                                        return null;
                                                    }
                                                })
                                            }
                                        </Select>
                                    </Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col >Transparency</Col >
                                    <Col>
                                        <Slider
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            // tooltipVisible={true}
                                            style={{ width: 180, marginBottom: "10px" }}
                                            onChange={this.onChangeAlpha}
                                            defaultValue={typeof inputValue === 'number' ? inputValue : 0}
                                        />
                                    </Col>
                                </Row>
                                <hr />
                                <Row><span>Result</span></Row>
                                <Row>
                                    <Select
                                        showSearch
                                        style={{ width: 200, marginBottom: "10px" }}
                                        placeholder={checkedResList[0]}
                                        optionFilterProp="children"
                                        onChange={this.onChangeResValname}
                                        onSearch={this.onSearch}
                                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                        {
                                            checkedResList.map((item, index) => {
                                                return (<Option key={index} value={item} >{item}</Option>)
                                            })
                                        }
                                    </Select>
                                </Row>
                                <hr />
                                {
                                    vectorData.length > 0 ? (
                                        <div>
                                            <Row>
                                                <Checkbox onChange={this.onCheckArrow}>Display Vector</Checkbox>
                                            </Row>
                                            <br />
                                            <Row>
                                                <span style={{ lineHeight: "32px" }}> Scalar Rate : &nbsp;&nbsp;</span><InputNumber min={1} defaultValue={1} onChange={this.onChangeArrowSize} />
                                            </Row>
                                        </div>
                                    ) : (null)
                                }
                                <Row>
                                    <span>Value Range</span>
                                </Row>
                                <Row>
                                    <Input.Group compact>
                                        <Input style={{ width: 85, textAlign: 'center' }} placeholder={JSON.stringify(Number(min))} onChange={this.InputMapperRangeMin} />
                                        <Input
                                            className="site-input-split"
                                            style={{
                                                width: 30,
                                                borderLeft: 0,
                                                borderRight: 0,
                                                pointerEvents: 'none',
                                            }}
                                            placeholder="-"
                                            disabled
                                        />
                                        <Input
                                            className="site-input-right"
                                            style={{
                                                width: 85,
                                                textAlign: 'center',
                                            }}
                                            onChange={this.InputMapperRangeMax}
                                            placeholder={JSON.stringify(Number(max))}
                                        />
                                    </Input.Group>
                                </Row>
                            </InputGroup>
                        </div>
                    </div>
                </Draggable>
                <div className="vtk-container" ref={this.container} style={{ "minHeight": "100px", "minWidth": "100px", "width": "100%", "height": show }}></div>
                <div style={{ width: "160px", minWidth: "90px", height: "18%", position: "absolute", right: "50px", bottom: "50px", opacity: scalar }}>
                    <div ref={this.container1} className="vtk-container1" style={{ width: "20px", minWidth: "20px", height: "calc(100% - 19px)", position: "relative", opacity: scalar, overflow: "hidden", margin: "10px 0 10px", float: "left", borderRight: "1px solid #fff" }}></div>
                    <div style={{ width: "140px", minWidth: "50px", height: "calc(100% - 20px)", marginTop: "10px", float: "left" }}>
                        <div style={{ height: "100%", position: "relative", listStyle: "none" }}>
                            {scale.map((item, index) =>
                                <div key={index} style={{ height: "20px", position: "absolute", bottom: "calc(" + item + " - 10px)", width: "100%", marginTop: "10px" }}>
                                    <span style={{ display: "inline-block", width: "10px", color: "#fff", borderTop: "1px solid #fff", verticalAlign: "top", margin: "10px 10px 0 -5px" }}></span>
                                    <span style={{ color: "#fff", lineHeight: "20px", display: "inline-block", width: "80%" }}>{activeScalar[index]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
