/**
* 文件名：vtkView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：*.vtk类型数据文件渲染逻辑。
*/
import vtk from 'vtk.js/Sources/vtk';
import Draggable from 'react-draggable';
import React, { Component } from 'react';
import { Slider, Input, Col, Row, Select, InputNumber, Checkbox } from "antd";
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import colorMode from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps.json';
import vtkSphereSource from 'vtk.js/Sources/Filters/Sources/SphereSource';
import { Rendering, Screen, gl, scalarBar, Axis, reassignManipulators, changeManipulators, showBounds, showVector } from "../../common/index";

const InputGroup = Input.Group;
const { Option } = Select;

export default class vtkView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            activeScalar: [],
            model: {},
            canvas: {},
            pointsAct: [],
            useScalar: false,
            boxBgColor: "#ccc",
            value: 0,
            points: [],
            cells: [],
            pointData: [0, 1],
            min: null,
            max: null,
            scalarBar: "0",
            mode: "rainbow",
            unique: [],
            inputValue: 1,
            cellData: [],
            cellDataName: [],
            vector: false,
            ArrowSize: 1,
            vectorData: [],
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
        console.log(data);
        if (vtkBox) {
            vtkBox.innerHTML = null;
        }
        //判断数据格式
        if (data.type === ".vtk") {
            Rendering(model, this.container);
            let OpenGlRW = model.fullScreenRenderer.getOpenGLRenderWindow();
            let points = JSON.parse(JSON.stringify(data.data.POINTS));
            let cells = JSON.parse(JSON.stringify(data.data.CELLS));
            // let cellsCopy = [];
            // for (let i = 0; i < cells.length; i++) {
            //     if (cells[i] === "1") cellsCopy.push([cells[i], cells[i + 1]]);
            //     if (cells[i] === "2") cellsCopy.push([cells[i], cells[i + 1], cells[i + 2]]);
            //     if (cells[i] === "4") cellsCopy.push([cells[i], cells[i + 1], cells[i + 2], cells[i + 3], cells[i + 4]]);
            //     i = i + Number(cells[i]);
            // }
            let cellData = {};
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
            } else {
                cellData = JSON.parse(JSON.stringify(data.data.CELLDATA));
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
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // let cellsCopys = [], cellDataCopy = [], pointsAct = [], linesAct = [];
            // for (let i = 0; i < cellsCopy.length; i++) {
            //     if (cellsCopy[i][0] === '4') {
            //         let arr1 = cellsCopy[i];
            //         cellsCopys.push(3, arr1[1], arr1[2], arr1[3], 3, arr1[4], arr1[2], arr1[3], 3, arr1[1], arr1[2], arr1[4], 3, arr1[1], arr1[4], arr1[3]);
            //         cellDataCopy.push(cellData[cellDataName[0]][i], cellData[cellDataName[0]][i], cellData[cellDataName[0]][i], cellData[cellDataName[0]][i]);
            //     } else if (cellsCopy[i][0] === '1') {
            //         pointsAct.push([points[Number(cellsCopy[i][1]) * 3], points[Number(cellsCopy[i][1]) * 3 + 1], points[Number(cellsCopy[i][1]) * 3 + 2]]);
            //     } else {

            //     }
            // }
            // cellData[cellDataName[0]] = cellDataCopy;
            // cells = cellsCopys;
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            let pointData = "", unique = [], min = 0, max = 1;
            if (Object.keys(cellData).length !== 0) {
                pointData = JSON.parse(JSON.stringify(cellData[cellDataName[0]]));
                unique = [...new Set(pointData)];
                if (unique[0] === "null") unique.splice(0, 1);
                unique.sort(function (a, b) {
                    return a - b;
                });
                min = Number(unique[0]);
                max = Number(unique[unique.length - 1]);
            }
            this.setState({
                points: points,
                cells: cells,
                // pointsAct, pointsAct,
                pointData: cellDataName[0],
                min: min,
                max: max,
                unique: unique.slice(),
                cellData: cellData,
                cellDataName: cellDataName,
                vectorData: vectorData,
                OpenGlRW: OpenGlRW
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

    //更新组件
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
            boxBgColor, displayBox, points, cells, vector, ArrowSize, vectorData, model, activeScalar, mode, unique, inputValue, min, max, cellData, cellDataName, OpenGlRW, pointsAct
        } = this.state;
        let { data, show, state } = this.props;
        let { scalar, attribute, axis, moveStyle, result, bounds, light, screen, modelStyle } = state;
        let scale = [];
        let polydata1 = {};
        let polydata2 = {
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
        };
        //是否显示结果
        if (document.querySelector('.textCanvas')) this.container.current.children[0].removeChild(document.querySelector('.textCanvas'))
        let modes = mode;
        let num = Math.round(unique.length / 3)
        activeScalar = [unique[unique.length - 1], unique[unique.length - 1 - num], unique[num], unique[0]];
        scale = [(unique.length * 100) / unique.length + "%", ((unique.length - num) * 100) / unique.length + "%", (num * 100) / unique.length + "%", 0 + "%"];
        if (document.querySelector(".scalarMax")) document.querySelector(".scalarMax").innerHTML = max;
        if (document.querySelector(".scalarMin")) document.querySelector(".scalarMin").innerHTML = min;
        if (document.querySelector(".vtk-container1")) {
            document.querySelector(".vtk-container1").style.display = "block";
        }
        const lut1 = vtkColorTransferFunction.newInstance();
        //预设色标颜色样式
        const preset = vtkColorMaps.getPresetByName(modes);
        //应用ColorMap
        lut1.applyColorMap(preset);
        lut1.updateRange();

        if (OpenGlRW.initialize) gl(OpenGlRW);
        if (model.fullScreenRenderer) {
            console.log(cells.length);
            if (Object.keys(data.data.CELLDATA).length === 0) Scalar = false;
            model.renderer.removeActor(model.bounds);
            if (data.data.CELLDATA === null || Object.keys(data.data.CELLDATA).length === 0) {
                if (Object.keys(cellData).length > 0) {
                    polydata1 = {
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
                    };
                } else {
                    polydata1 = {
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
                        }
                    };
                }
            } else {
                if (cellData[cellDataName[0]].length === points.length / 3) {
                    polydata1 = {
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
                    };
                } else {
                    polydata1 = {
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
                            values: cells,//.slice(2960976)
                        },
                        cellData: {
                            vtkClass: 'vtkDataSetAttributes',
                            activeScalars: 0,
                            arrays: [{
                                data: {
                                    vtkClass: 'vtkDataArray',
                                    name: 'pointScalars',
                                    dataType: 'Float32Array',
                                    values: cellData[cellDataName[0]],//.slice(2960976/4)
                                },
                            }],
                        }
                    };
                }
            }

            model.renderer.removeActor(model.bounds);
            showBounds(bounds, model, this.container, vtk(polydata1));
            const mapper1 = vtkMapper.newInstance({
                interpolateScalarsBeforeMapping: true
            });
            const actor1 = vtkActor.newInstance();
            //矢量
            showVector(vector, model, points, vectorData, lut1, min, max, ArrowSize);
            mapper1.setLookupTable(lut1);
            mapper1.setInputData(vtk(polydata1));
            mapper1.setScalarRange(min, max);
            //更新色标卡
            if (Object.keys(cellData).length > 0) {
                if (this.container1.current.childElementCount < 1) {
                    scalarBar(model, unique, modes, this.container1);
                } else {
                    this.container1.current.innerHTML = null;
                    scalarBar(model, unique, modes, this.container1);
                }
            }
            model.lookupTable = lut1;
            actor1.getProperty().setOpacity(inputValue);
            actor1.setMapper(mapper1);
            model.renderer.removeActor(model.actor);
            model.actor = actor1;
            model.mapper = mapper1;
            if (Object.keys(data.data.CELLDATA).length !== 0) {
                if (result === false) {
                    if (model.renderWindow) model.mapper.setScalarModeToUsePointData();
                } else {
                    if (model.renderWindow) model.mapper.setScalarModeToUseCellData();
                }
            } else {
                if (result === false) {
                    if (model.renderWindow) model.mapper.setScalarModeToUsePointData();
                } else {
                    if (model.renderWindow) model.mapper.setScalarModeToUseCellData();
                }
            }
            // for (let i = 0; i < pointsAct.length; i++) {
            //     const sphereSource = vtkSphereSource.newInstance({
            //         phiResolution: 20,
            //         thetaResolution: 20,
            //         radius: 10
            //     });
            //     const mapp = vtkMapper.newInstance();
            //     const acto = vtkActor.newInstance();
            //     acto.setPosition(pointsAct[i]);

            //     mapp.setInputConnection(sphereSource.getOutputPort());
            //     acto.setMapper(mapp);
            //     model.renderer.addActor(acto);
            // }
            model.renderer.addActor(actor1);
        }
        //改变显示样式
        if (model.renderer || Object.keys(cellData).length > 0) changeManipulators(model, moveStyle, modelStyle, light, axis, unique, modes, this.container1, lut1, inputValue, polydata1, polydata2, min, max, result);

        //截屏
        let useScreen = screen;
        if (useScreen !== screen) {
            this.setState({
                screen: useScreen
            })
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
                <div style={{ width: "8%", minWidth: "90px", height: "18%", position: "absolute", right: "80px", bottom: "50px", opacity: scalar }}>
                    <div ref={this.container1} className="vtk-container1" style={{ width: "20px", minWidth: "20px", height: "calc(100% - 19px)", position: "relative", opacity: scalar, overflow: "hidden", margin: "10px 0 10px", float: "left", borderRight: "1px solid #FFF" }}></div>
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
