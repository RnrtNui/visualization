import vtk from 'vtk.js/Sources/vtk';
import Draggable from 'react-draggable';
import React, { Component } from 'react';
import { Slider, Input, Col, Row, Select, InputNumber, Checkbox } from "antd";
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import colorMode from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps.json';
import { Rendering, Screen, gl, scalarBar, Axis, reassignManipulators, changeManipulators, showBounds, showVector } from "../common/index";

const InputGroup = Input.Group;
const { Option } = Select;

export default class vtkView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], activeScalar: [], model: {}, canvas: {},
            useScalar: false, boxBgColor: "#ccc", value: 0,
            displayBox: "none", points: [], cells: [], pointData: [0, 1], min: null, max: null,
            scalarBar: "0", mode: "rainbow", scale: [], unique: [], inputValue: 1,
            cellDataName: [], vector: false, ArrowSize: 1, vectorData: [],
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
        console.log(data);
        //判断数据格式
        if (data.type === ".vtk") {
            Rendering(model, this.container);
            let points = JSON.parse(JSON.stringify(data.data.POINTS));
            let cells = JSON.parse(JSON.stringify(data.data.CELLS));
            let cellData = JSON.parse(JSON.stringify(data.data.CELLDATA));
            let vectors = []
            if (Object.getOwnPropertyNames(data.data.VECTORS).length > 0) {
                vectors = JSON.parse(JSON.stringify(data.data.VECTORS));
            }
            let cellDataName = [];
            let arr = JSON.parse(JSON.stringify(data.data.CELLS));
            arr.sort(function (a, b) {
                return a - b;
            });
            for (let key in cellData) {
                if (cellData.hasOwnProperty(key)) {
                    cellDataName.push(key)
                }
            }
            if (data.data.CELLDATA === null || Object.keys(data.data.CELLDATA).length === 0) {
                cellData = JSON.parse(JSON.stringify(data.data.POINTDATA));
                cellDataName = [];
                for (let key in cellData) {
                    if (cellData.hasOwnProperty(key)) {
                        cellDataName.push(key)
                    }
                }
            }
            //矢量数据
            let vectordataName = [];
            let vectorData = [];
            if (Object.getOwnPropertyNames(vectors).length > 0) {
                for (let key in vectors) {
                    if (vectors.hasOwnProperty(key)) {
                        vectordataName.push(key)
                    }
                }
                vectorData = vectors[vectordataName[0]];
            }
            let pointData = JSON.parse(JSON.stringify(cellData[cellDataName[0]]));
            let unique = [...new Set(pointData)];
            if (unique[0] === "null") unique.splice(0, 1);
            unique.sort(function (a, b) {
                return a - b;
            });
            let min = Number(unique[0]);
            let max = Number(unique[unique.length - 1]);
            this.setState({
                points: points,
                cells: cells,
                pointData: cellDataName[0],
                min: min,
                max: max,
                unique: unique,
                cellData: cellData,
                cellDataName: cellDataName,
                vectorData: vectorData
            })
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
        this.result();
        Axis(this.state.model);
    };
    // 属性栏
    onShow = () => {
        this.setState({
            displayBox: "block",
            displayBut: "none"
        })
    };
    //更新组件
    componentDidUpdate = (prevProps) => {
        let { useScreen } = this.props
        if (useScreen !== prevProps.useScreen) {
            if (document.getElementsByTagName("canvas").length > 0) {
                Screen(document.getElementsByTagName("canvas")[0])
            }
        }
    };

    //选择色标样式
    onChange = (value) => {
        let name = value.split("--");
        let OpenGlRW = this.state.model.fullScreenRenderer.getOpenGLRenderWindow();
        gl(OpenGlRW);
        this.setState({
            mode: name[0],
        })
    };

    //选择色标样式时触发
    onSearch(val) {
        console.log('search:', val);
    };

    //选择显示矢量
    onCheckArrow = (e) => {
        let { model } = this.state;
        if (model.vectorActor) {
            model.renderer.removeActor(model.vectorActor);
            model.renderWindow.render();
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
            model.renderWindow.render();
        }
        this.setState({
            ArrowSize: value
        })
    }

    //改变模型透明度
    onChangeAlpha = value => {
        if (isNaN(value)) {
            return;
        }
        this.setState({
            inputValue: value,
        });
        this.state.model.renderWindow.render()
        let OpenGlRW = this.state.model.fullScreenRenderer.getOpenGLRenderWindow();
        gl(OpenGlRW);
    };

    //选择显示结果name
    onChangeResValname = (value) => {
        let { model, cellData } = this.state;

        if (model.vectorActor) {
            model.renderer.removeActor(model.vectorActor);
            model.renderWindow.render();
        }
        let pointDatas = [];
        if (cellData[value]) pointDatas = JSON.parse(JSON.stringify(cellData[value]))
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
        this.setState({
            pointData: value,
            unique: unique,
            min: min,
            max: max

        })
    }

    //修改MapperRange
    InputMapperRangeMin = e => {
        this.setState({
            min: Number(e.target.value)
        });
    };

    InputMapperRangeMax = e => {
        this.setState({
            max: Number(e.target.value)
        });
    };

    render() {
        let {
            boxBgColor, displayBox, points, cells, vector, ArrowSize,
            vectorData, model, activeScalar, mode, scale, unique, inputValue, min, max, cellData, cellDataName
        } = this.state;
        let { data, display, displayBar, keydown, useAxis, opt, Scalar, useScreen, useLight, bounds, show } = this.props;
        let polydata1 = {};
        //是否显示结果
        if (document.querySelector('.textCanvas')) this.container.current.children[0].removeChild(document.querySelector('.textCanvas'))

        if (Scalar === true) {
            let modes = mode;
            let num = Math.round(unique.length / 3)
            activeScalar = [unique[unique.length - 1], unique[unique.length - 1 - num], unique[num], unique[0]];
            scale = [(unique.length * 100) / unique.length + "%", ((unique.length - num) * 100) / unique.length + "%", (num * 100) / unique.length + "%", 0 + "%"];
            if (document.querySelector(".scalarMax")) document.querySelector(".scalarMax").innerHTML = max;
            if (document.querySelector(".scalarMin")) document.querySelector(".scalarMin").innerHTML = min;
            if (document.querySelector(".vtk-container1")) {
                document.querySelector(".vtk-container1").style.display = "block";
            }
            if (model.fullScreenRenderer) {
                model.renderer.removeActor(model.bounds);

                let OpenGlRW = this.state.model.fullScreenRenderer.getOpenGLRenderWindow();
                gl(OpenGlRW);
                if (data.data.CELLDATA === null || Object.keys(data.data.CELLDATA).length === 0) {
                    polydata1 = vtk({
                        vtkClass: 'vtkPolyData',
                        points: {
                            vtkClass: 'vtkPoints',
                            dataType: 'Float32Array',
                            numberOfComponents: 3,
                            values: points,
                        },
                        polys: {
                            vtkClass: 'vtkCellArray',
                            dataType: "Float32Array",
                            values: cells,
                        },
                        pointData: {
                            vtkClass: 'vtkDataSetAttributes',
                            activeScalars: 0,
                            arrays: [{
                                data: {
                                    vtkClass: 'vtkDataArray',
                                    name: 'pointScalars',
                                    dataType: 'Float32Array',
                                    values: cellData[cellDataName[0]],
                                },
                            }],
                        }
                    });
                } else {
                    polydata1 = vtk({
                        vtkClass: 'vtkPolyData',
                        points: {
                            vtkClass: 'vtkPoints',
                            dataType: 'Float32Array',
                            numberOfComponents: 3,
                            values: points,
                        },
                        polys: {
                            vtkClass: 'vtkCellArray',
                            dataType: "Float32Array",
                            values: cells,
                        },
                        cellData: {
                            vtkClass: 'vtkDataSetAttributes',
                            activeScalars: 0,
                            arrays: [{
                                data: {
                                    vtkClass: 'vtkDataArray',
                                    name: 'pointScalars',
                                    dataType: 'Float32Array',
                                    values: cellData[cellDataName[0]],
                                },
                            }],
                        }
                    });
                }
                model.renderer.removeActor(model.bounds);
                showBounds(bounds, model, this.container, polydata1);
                const lut1 = vtkColorTransferFunction.newInstance();
                //预设色标颜色样式
                const preset = vtkColorMaps.getPresetByName(modes);   
                //应用ColorMap
                lut1.applyColorMap(preset);  
                lut1.updateRange();
                const mapper1 = vtkMapper.newInstance({
                    interpolateScalarsBeforeMapping: true
                });
                const actor1 = vtkActor.newInstance();
                //矢量
                showVector(vector, model, points, vectorData, lut1, min, max, ArrowSize); 
                mapper1.setLookupTable(lut1);
                mapper1.setInputData(polydata1);
                mapper1.setScalarRange(min, max);
                //更新色标卡
                if (this.container1.current.childElementCount < 1){
                    scalarBar(model, unique, modes, this.container1);
                }else{
                    this.container1.current.innerHTML=null;
                    scalarBar(model, unique, modes, this.container1);
                }
                model.lookupTable = lut1;
                actor1.getProperty().setOpacity(inputValue);
                actor1.setMapper(mapper1);
                model.renderer.removeActor(model.actor);
                model.actor = actor1
                model.mapper = mapper1;
                model.renderer.addActor(actor1);
            }
        } else if (Scalar === false) {
            if (model.renderer) {
                model.renderer.removeActor(model.bounds);
                if (document.querySelector(".vtk-container1")) {
                    document.querySelector(".vtk-container1").style.display = 'none';
                }
                polydata1 = vtk({
                    vtkClass: 'vtkPolyData',
                    points: {
                        vtkClass: 'vtkPoints',
                        dataType: 'Float32Array',
                        numberOfComponents: 3,
                        values: data.data.POINTS,
                    },
                    polys: {
                        vtkClass: 'vtkCellArray',
                        dataType: "Float32Array",
                        values: data.data.CELLS,
                    },
                });
                const mapper2 = vtkMapper.newInstance({
                    interpolateScalarsBeforeMapping: true
                });
                mapper2.setInputData(polydata1);
                const actor2 = vtkActor.newInstance();
                actor2.setMapper(mapper2);
                actor2.getProperty().setOpacity(inputValue);
                showBounds(bounds, model, this.container, polydata1);
                model.renderer.removeActor(model.actor);
                model.actor = actor2;
                model.mapper = mapper2;
                model.renderer.addActor(actor2);
            }
        }

        displayBox = display;

        //改变显示样式
        changeManipulators(model, opt, keydown, useLight, useAxis);

        //截屏
        if (useScreen !== null) {
            if (document.getElementsByTagName("canvas").length > 0) {
            }
        }
        return (
            <div>
                <Draggable handle=".handle"
                    defaultPosition={{ x: 0, y: 0 }}
                    position={null}
                    grid={[1, 1]}
                    scale={1}>
                    <div style={{ display: displayBox, position: "absolute", zIndex: "90", top: "20px", left: "20px" }}>
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
                                            filterOption={(input, option) =>
                                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }>
                                            {
                                                colorMode.map((item, index) => {
                                                    let modeKeys = item.Name + "--" + index;
                                                    if (item.ColorSpace !== undefined) {
                                                        return (
                                                            <Option key={index} value={modeKeys} >{item.Name}</Option>
                                                        )
                                                    } else {
                                                        return null;
                                                    }
                                                })
                                            }
                                        </Select>
                                    </Col>
                                </Row>
                                <hr />
                                <Row style={{}}>
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
                                        placeholder={cellDataName[0]}
                                        optionFilterProp="children"
                                        onChange={this.onChangeResValname}
                                        onSearch={this.onSearch}
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }>
                                        {
                                            cellDataName.map((item, index) => {
                                                return (
                                                    <Option key={index} value={item} >{item}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                </Row>
                                <hr />
                                {
                                    Object.getOwnPropertyNames(data.data.VECTORS).length > 0 ? (<Row>
                                        <Checkbox onChange={this.onCheckArrow} >Display Vector </Checkbox>
                                        <br />
                                        <div>Scale Rate : <InputNumber min={1} defaultValue={1} onChange={this.onChangeArrowSize} /></div>
                                    </Row>
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
                <div className="vtk-container" ref={this.container} style={{ "minHeight": "100px", "minWidth": "100px", "width": "100%", "height": show }} onMouseDown={(e) => this.onMouseMove}></div>
                <div style={{ width: "8%", minWidth: "90px", height: "18%", position: "absolute", right: "80px", bottom: "50px", opacity: displayBar }}>
                    <div ref={this.container1} className="vtk-container1" style={{ width: "20px", minWidth: "20px", height: "calc(100% - 19px)", position: "relative", opacity: displayBar, overflow: "hidden", margin: "10px 0 10px", float: "left", borderRight: "1px solid #FFF" }}></div>
                    <div style={{ width: "8%", minWidth: "50px", height: "calc(100% - 20px)", marginTop: "10px", float: "left" }}>
                        <div style={{ height: "100%", position: "relative", listStyle: "none" }}>
                            {scale.map((item, index) =>
                                <div key={index} style={{ height: "20px", position: "absolute", bottom: "calc(" + item + " - 10px)", width: "120px", marginTop: "10px" }}>
                                    <span style={{ display: "inline-block", width: "10px", color: "white", borderTop: "1px solid #fff", verticalAlign: "top", margin: "10px 10px 0 -5px" }}></span>
                                    <span style={{ color: "white", lineHeight: "20px" }}>{activeScalar[index]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
