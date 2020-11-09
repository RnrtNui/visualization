/**
* 文件名：postMshView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：*.post.msh类型数据文件渲染逻辑。
*/
import vtk from 'vtk.js/Sources/vtk';
import Draggable from 'react-draggable';
import React, { Component } from 'react';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkMatrixBuilder from 'vtk.js/Sources/Common/Core/MatrixBuilder';
import vtkSphereSource from 'vtk.js/Sources/Filters/Sources/SphereSource';
import vtkAppendPolyData from 'vtk.js/Sources/Filters/General/AppendPolyData';
import { Slider, InputNumber, Input, Col, Row, Select, Checkbox } from "antd";
import { FieldAssociations } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';
import vtkOpenGLHardwareSelector from 'vtk.js/Sources/Rendering/OpenGL/HardwareSelector';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import colorMode from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps.json';

import { Rendering, Screen, gl, scalarBar, Axis, reassignManipulators, changeManipulators, showBounds, showVector } from "../common/index";

const InputGroup = Input.Group;
const { Option } = Select;

export default class GmshView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            activeScalar: [],
            model: {},
            canvas: {},
            ResData: [],
            boxBgColor: "#ccc",
            value: 0,
            resultName: null,
            ArrowSize: 1,
            min: null,
            max: null,
            cancle: [],
            displayBox: "none",
            scalarBar: 0,
            mode: "Cool to Warm",
            unique: [],
            inputValue: 1,
            points: [],
            cells: [],
            pointData: 0,
            actors: [],
            Material: [],
            checkedList: [],
            indeterminate: true,
            checkAll: false,
            resultList: [],
            checkedResList: [],
            resClass: 0,
            resId: 0,
            vector: false,
            vectorData: [],
            OpenGlRW: {},
            inputX: 0,
            inputY: 0,
            inputZ: 0,
            arrs: {}
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
        if (data.type === ".gmsh") {
            //创建渲染场景
            Rendering(model, this.container);
            let OpenGlRW = model.fullScreenRenderer.getOpenGLRenderWindow();
            let polydata = {};
            let points = [];
            console.log(data);
            points = JSON.parse(JSON.stringify(data.data.Nodes));
            let StrElem = JSON.parse(JSON.stringify(data.data.Elements));
            let Material = [], checkedList = [];
            let cells = [];

            let ResData = {}, resultList = [], checkedResList = [], vectorData = [];
            if (data.data.ElementData) {
                for (var key1 in data.data.ElementData) {　　//遍历对象的所有属性，包括原型链上的所有属性
                    if (data.data.ElementData.hasOwnProperty(key1)) { //判断是否是对象自身的属性，而不包含继承自原型链上的属性
                        resultList.push(key1);        //键名
                    }
                }
                for (let i = 0; i < resultList.length; i++) {
                    let resName = data.data.ElementData[resultList[i]];
                    ResData[resultList[i]] = resName;
                }
            }
            let pointDatas = Object.assign(ResData[resultList[0]], {});
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
            cells = StrElem;
            polydata = vtk({
                vtkClass: 'vtkPolyData',
                "points": {
                    vtkClass: 'vtkPoints',
                    dataType: 'Float32Array',
                    numberOfComponents: 3,
                    values: points,
                },
                "polys": {
                    vtkClass: 'vtkCellArray',
                    values: cells,
                },
                "pointData": {
                    vtkClass: 'vtkDataSetAttributes',
                    activeScalars: 0,
                    activeVectors: 1,
                    arrays: [{
                        data: {
                            vtkClass: 'vtkDataArray',
                            name: 'pointScalars',
                            dataType: 'Float32Array',
                            values: ResData[resultList[0]],
                        },
                    }],
                }
            });
            const mapper = vtkMapper.newInstance();
            mapper.setInputData(polydata);
            const actor = vtkActor.newInstance();
            actor.setMapper(mapper);
            model.renderer.addActor(actor)
            this.setState({
                points: points,
                cells: cells,
                pointData: resultList[0],
                Material: JSON.parse(JSON.stringify(Material)),
                checkedList: checkedList,
                resultList: resultList,
                ResData: ResData,
                vectorData: vectorData,
                min: min,
                max: max,
                unique: unique,
                OpenGlRW: OpenGlRW,
            })
            model.actor = model.renderer.getActors();
            model.interactorStyle.setCenterOfRotation(mapper.getCenter())
            reassignManipulators(model);
        }
        model.renderer.resetCamera();
        model.renderWindow.render();
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
        let OpenGlRW = this.state.model.fullScreenRenderer.getOpenGLRenderWindow();
        gl(OpenGlRW);
        this.setState({
            inputValue: value,
        });
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

    //单个材料模型显示、隐藏
    onChangeRes = (value) => {
        let { data } = this.props;
        let StrElem = JSON.parse(JSON.stringify(data.data.StrElem));
        let newCells = [];
        for (let i = 0; i < value.length; i++) {
            let len = value[i].substring(2)
            newCells = newCells.concat(StrElem[len])
        }
        let OpenGlRW = this.state.model.fullScreenRenderer.getOpenGLRenderWindow();
        gl(OpenGlRW);
        this.setState({
            cells: newCells,
        });
    };

    //全部显示或全不显示所有材料
    onCheckDesChange = (val) => {
        let cancal = JSON.parse(JSON.stringify(this.state.cancle));
        cancal.push(val);
        this.setState({
            cancle: cancal
        })
    };
    onCheckChange = (val) => {
        let cancal = JSON.parse(JSON.stringify(this.state.cancle));
        cancal.splice(cancal.indexOf(val), 1);
        this.setState({
            cancle: cancal
        })
    };

    //选择显示结果类型
    onChangeResClassname = (value) => {
        let { data } = this.props;
        let { model, resultList } = this.state;
        let resName = data.data.ResData[resultList[value]];
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
            model.renderWindow.render();
        }
        this.setState({
            resClass: value,
            checkedResList: checkedResList,
            resId: 0,
            pointData: JSON.parse(JSON.stringify(data.data.ResData[resultList[value]][checkedResList[0]]))
        })
    }

    //选择显示结果name
    onChangeResValname = (value) => {
        let { model, ResData } = this.state;

        if (model.vectorActor) {
            model.renderer.removeActor(model.vectorActor);
            model.renderWindow.render();
        }
        let pointDatas = [];
        if (ResData[value]) pointDatas = JSON.parse(JSON.stringify(ResData[value]));
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

    //修改MapperRangeMin
    InputMapperRangeMin = e => {
        this.setState({
            min: Number(e.target.value)
        });
    };
    //修改MapperRangeMax
    InputMapperRangeMax = e => {
        this.setState({
            max: Number(e.target.value)
        });
    };
    //改变材料位移
    onChangeTransform = (val) => {
        this.setState({
            inputZ: val
        })
    }

    render() {
        let {
            boxBgColor, Material, displayBox, vector, ArrowSize, vectorData, ResData, min, max, cancle, model, activeScalar, mode, unique, points, cells, pointData, checkedResList, actors, OpenGlRW, inputX, inputY, inputZ, arrs
        } = this.state;
        let {
            display, displayBar, keydown, useAxis, opt, Scalar, useScreen, useLight, bounds, show
        } = this.props;
        let inputValue = this.state.inputValue;
        let scale = [];
        let modes = mode;
        let num = Math.round(unique.length / 3);
        activeScalar = [unique[unique.length - 1], unique[unique.length - 1 - num], unique[num], unique[0]];
        scale = [(unique.length * 100) / unique.length + "%", ((unique.length - num) * 100) / unique.length + "%", (num * 100) / unique.length + "%", 0 + "%"];
        if (document.querySelector(".scalarMax")) document.querySelector(".scalarMax").innerHTML = max;
        if (document.querySelector(".scalarMin")) document.querySelector(".scalarMin").innerHTML = min;
        if (document.querySelector(".vtk-container1")) {
            document.querySelector(".vtk-container1").style.display = "block";
        }
        const lut1 = vtkColorTransferFunction.newInstance();
        const preset = vtkColorMaps.getPresetByName(modes);   //预设色标颜色样式
        lut1.applyColorMap(preset);  //应用ColorMap
        lut1.updateRange();
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
                activeVectors: 1,
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
        };
        if (OpenGlRW.initialize) gl(OpenGlRW);

        //是否显示结果
        if (Scalar === true) {
            if (model.renderer) {
                showVector(vector, model, points, vectorData, lut1, min, max, ArrowSize); //矢量
                let all = model.renderer.getActors();
                all.forEach((anActor) => {
                    const mapper = anActor.getMapper();
                    mapper.setScalarModeToUsePointData();
                    anActor.getMapper().setLookupTable(lut1);
                    anActor.getMapper().setScalarRange(min, max);
                    anActor.getProperty().setOpacity(inputValue);
                });
                let scalarBox = document.getElementsByClassName('vtk-container1')[0];
                if (scalarBox) {
                    scalarBox.innerHTML = null;
                }
                if (this.container1.current.childElementCount >= 1) {
                    this.container1.current.innerHTML = null;
                }
                scalarBar(model, unique, modes, this.container1);
            };
        } else if (Scalar === false) {
            displayBar = 0;
            if (model.renderer) {
                if (document.querySelector(".vtk-container1")) {
                    document.querySelector(".vtk-container1").style.display = 'none';
                }
                let all = model.renderer.getActors();
                all.forEach((anActor) => {
                    const mapper = anActor.getMapper();
                    mapper.setScalarModeToUseCellData();
                    anActor.getProperty().setColor(1, 1, 1);
                    anActor.getProperty().setOpacity(inputValue);
                    model.renderWindow.render();
                });
                const openGLRenderWindow = model.interactor.getView();
                const hardwareSelector = vtkOpenGLHardwareSelector.newInstance({
                    captureZValues: true,
                });
                hardwareSelector.setFieldAssociation(
                    FieldAssociations.FIELD_ASSOCIATION_POINTS
                );
                hardwareSelector.attach(openGLRenderWindow, model.renderer);
                // ----------------------------------------------------------------------------
                // Create Picking pointer
                // ----------------------------------------------------------------------------
                const pointerSource = vtkSphereSource.newInstance({
                    phiResolution: 15,
                    thetaResolution: 15,
                    radius: 0.0001,
                });
                const pointerMapper = vtkMapper.newInstance();
                const pointerActor = vtkActor.newInstance();
                pointerActor.setMapper(pointerMapper);
                pointerMapper.setInputConnection(pointerSource.getOutputPort());
                model.renderer.addActor(pointerActor);
                let container = document.querySelectorAll(".vtk-container")[0];
                // ----------------------------------------------------------------------------
                // Create Mouse listener for picking on mouse move
                // ----------------------------------------------------------------------------
                function eventToWindowXY(event) {
                    // We know we are full screen => window.innerXXX
                    // Otherwise we can use pixel device ratio or else...
                    const { clientX, clientY } = event;
                    let rec = container.getBoundingClientRect();
                    const [width, height] = openGLRenderWindow.getSize();
                    const x = Math.round((width * clientX) / container.clientWidth - rec.left);
                    const y = Math.round(height * (1 - clientY / container.clientHeight) + rec.top);
                    // Need to flip Y
                    return [x, y];
                }
                // ----------------------------------------------------------------------------
                const WHITE = [1, 1, 1];
                const GREEN = [0.1, 0.8, 0.1];
                let needGlyphCleanup = false;
                let lastProcessedActor = null;
                const updateWorldPosition = (worldPosition) => {
                    if (lastProcessedActor) {
                        pointerActor.setVisibility(true);
                        pointerActor.setPosition(worldPosition);
                    } else {
                        pointerActor.setVisibility(false);
                    }
                    model.renderWindow.render();
                };
                function processSelections(selections) {
                    if (!selections || selections.length === 0) {
                        model.renderer.getActors().forEach((a) => a.getProperty().setColor(...WHITE));
                        model.renderWindow.render();
                        lastProcessedActor = null;
                        return;
                    }
                    const { worldPosition, prop } = selections[0].getProperties();
                    if (lastProcessedActor === prop) {
                        // Skip render call when nothing change
                        updateWorldPosition(worldPosition);
                        return;
                    }
                    lastProcessedActor = prop;
                    // Make the picked actor green
                    model.renderer.getActors().forEach((a) => a.getProperty().setColor(...WHITE));
                    prop.getProperty().setColor(...GREEN);
                    // We hit the glyph, let's scale the picked glyph
                    if (needGlyphCleanup) {
                        needGlyphCleanup = false;
                    }
                    // Update picture for the user so we can see the green one
                    updateWorldPosition(worldPosition);
                }
                // ----------------------------------------------------------------------------
                function pickOnMouseEvent(event) {
                    if (model.interactor.isAnimating()) {
                        // We should not do picking when interacting with the scene
                        return;
                    }
                    const [x, y] = eventToWindowXY(event);
                    hardwareSelector.setArea(x, y, x, y);
                    hardwareSelector.releasePixBuffers();

                    if (hardwareSelector.captureBuffers()) {
                        processSelections(hardwareSelector.generateSelection(x, y, x, y));
                    } else {
                        processSelections(null);
                    }
                }
                function throttle(callback, delay) {
                    let isThrottled = false;
                    let argsToUse = null;
                    function next() {
                        isThrottled = false;
                        if (argsToUse !== null) {
                            wrapper(...argsToUse); // eslint-disable-line
                            argsToUse = null;
                        }
                    }
                    function wrapper(...args) {
                        if (isThrottled) {
                            argsToUse = args;
                            return;
                        }
                        isThrottled = true;
                        callback(...args);
                        setTimeout(next, delay);
                    }
                    return wrapper;
                }
                const throttleMouseHandler = throttle(pickOnMouseEvent, 100);
                container.addEventListener('mousemove', throttleMouseHandler);
            }
        }
        if (model.renderer) {
            if (document.querySelector('.textCanvas')) this.container.current.children[0].removeChild(document.querySelector('.textCanvas'))
            model.renderer.removeActor(model.bounds);
            showBounds(bounds, model, this.container, model.renderer.getActors()[0].getMapper().getInputData()); //边框
            let all = model.actor;
        }

        displayBox = display;

        //改变显示样式
        if (model.renderer) changeManipulators(model, opt, keydown, useLight, useAxis, unique, modes, this.container1, lut1, inputValue, polydata1, polydata2, min, max, Scalar);

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
                                <Row >
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
                                <Row><span>Material</span></Row>
                                <Row>
                                    {
                                        Material.length > 0 ? (<Select
                                            mode="multiple"
                                            style={{ width: 200, marginBottom: "10px" }}
                                            placeholder="Show Material"
                                            maxTagCount={1}
                                            showArrow={true}
                                            defaultValue={Material}
                                            onChange={this.onChangeRes}
                                            onDeselect={this.onCheckDesChange}
                                            onSelect={this.onCheckChange}>
                                            {
                                                Material.map((item, index) => {
                                                    return (
                                                        <Option key={index} value={item} label={item} >
                                                            <span>{item}</span>
                                                        </Option>
                                                    )
                                                })
                                            }
                                        </Select>) : (null)
                                    }
                                    <Slider
                                        min={0}
                                        max={10}
                                        step={0.1}
                                        // tooltipVisible={true}
                                        style={{ width: 180, marginBottom: "10px" }}
                                        onChange={this.onChangeTransform}
                                        defaultValue={0}
                                    />
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
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }>
                                        {
                                            checkedResList.map((item, index) => {
                                                return (
                                                    <Option key={index} value={item} >{item}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                </Row>
                                <hr />
                                {
                                    vectorData.length > 0 ? (<Row>
                                        <Checkbox onChange={this.onCheckArrow}>Display Vector</Checkbox>
                                        <br />
                                        <div>Scalar Rate : <InputNumber min={1} defaultValue={1} onChange={this.onChangeArrowSize} /></div>
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
                <div style={{ width: "160px", minWidth: "90px", height: "18%", position: "absolute", right: "50px", bottom: "50px", opacity: displayBar }}>
                    <div className="vtk-container1" ref={this.container1} style={{ width: "20px", minWidth: "20px", height: "calc(100% - 19px)", position: "relative", opacity: displayBar, overflow: "hidden", margin: "10px 0 10px", float: "left", borderRight: "1px solid #FFF" }}></div>
                    <div style={{ width: "140px", minWidth: "50px", height: "calc(100% - 20px)", marginTop: "10px", float: "left" }}>
                        <div style={{ height: "100%", position: "relative", listStyle: "none" }}>
                            {scale.map((item, index) =>
                                <div key={index} style={{ height: "20px", position: "absolute", bottom: "calc(" + item + " - 10px)", width: "100%", marginTop: "10px" }}>
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
