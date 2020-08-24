/**
* 文件名：postMshView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：*.post.msh类型数据文件渲染逻辑。
* */
import vtk from 'vtk.js/Sources/vtk';
import Draggable from 'react-draggable';
import React, { Component } from 'react';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import { Slider, InputNumber, Input, Col, Row, Select, Checkbox } from "antd";
import { FieldAssociations } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';
import vtkOpenGLHardwareSelector from 'vtk.js/Sources/Rendering/OpenGL/HardwareSelector';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import colorMode from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps.json';
import { Rendering, Screen, gl, scalarBar, Axis, reassignManipulators, changeManipulators, showBounds, showVector } from "../common/index";

const InputGroup = Input.Group;
const { Option } = Select;

export default class mshView extends Component {
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
        if (data.type === ".post.msh") {
            //创建渲染场景
            Rendering(model, this.container);
            let OpenGlRW = model.fullScreenRenderer.getOpenGLRenderWindow();
            let polydata = {};
            let points = [];
            points = JSON.parse(JSON.stringify(data.data.StrCoord));
            let StrElem = JSON.parse(JSON.stringify(data.data.StrElem));
            let Material = [], checkedList = [];
            let cells = [], actors = {};
            for (var key in StrElem) {　　//遍历对象的所有属性，包括原型链上的所有属性
                if (StrElem.hasOwnProperty(key)) { //判断是否是对象自身的属性，而不包含继承自原型链上的属性
                    Material.push("材料" + key);        //键名
                    checkedList.push(key)
                    cells = cells.concat(StrElem[key]);
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
                            values: StrElem[key],
                        },

                    })
                    const mapper = vtkMapper.newInstance();
                    mapper.setInputData(polydata);
                    const actor = vtkActor.newInstance();
                    actor.setMapper(mapper);
                    actors["材料" + key] = actor;
                }
            }
            let ResData = {}, resultList = [], checkedResList = [], vectorData = [];
            if (data.data.ResData) {
                for (var key1 in data.data.ResData) {　　//遍历对象的所有属性，包括原型链上的所有属性
                    if (data.data.ResData.hasOwnProperty(key1)) { //判断是否是对象自身的属性，而不包含继承自原型链上的属性
                        resultList.push(key1);        //键名
                    }
                }
                for (let i = 0; i < resultList.length; i++) {
                    let resName = data.data.ResData[resultList[i]];

                    for (var keys in resName) {　　//遍历对象的所有属性，包括原型链上的所有属性
                        if (resName.hasOwnProperty(keys)) { //判断是否是对象自身的属性，而不包含继承自原型链上的属性
                            checkedResList.push(resultList[i] + "_" + keys);        //键名
                            ResData[resultList[i] + "_" + keys] = resName[keys]
                        }
                    }
                }
            }
            let vec = [];
            if (data.data.ResData["vector"]) {
                for (var key2 in data.data.ResData["vector"]) {
                    if (data.data.ResData["vector"].hasOwnProperty(key2)) {
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
            this.setState({
                points: points,
                cells: cells,
                pointData: checkedResList[0],
                Material: JSON.parse(JSON.stringify(Material)),
                checkedList: checkedList,
                resultList: resultList,
                checkedResList: checkedResList,
                ResData: ResData,
                vectorData: vectorData,
                min: min,
                max: max,
                unique: unique,
                actors: actors,
                OpenGlRW: OpenGlRW
            })
            polydata = vtk({
                vtkClass: 'vtkPolyData',
                points: {
                    vtkClass: 'vtkPoints',
                    dataType: 'Float32Array',
                    numberOfComponents: 3,
                    values: points,
                },
                polys: {
                    vtkClass: 'vtkCellArray',
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
            model.renderer.addActor(actor);
            // Populate with initial manipulators
            model.interactorStyle.setCenterOfRotation(mapper.getCenter())
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

    render() {
        let {
            boxBgColor, Material, displayBox, vector, ArrowSize, vectorData, ResData, min, max, cancle, model, activeScalar, mode, unique, points, cells, pointData, checkedResList, actors, OpenGlRW
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
        if(OpenGlRW.initialize) gl(OpenGlRW);

        //是否显示结果
        if (Scalar === true) {
            if (model.renderer) {
                for (let key in actors) {
                    if (actors.hasOwnProperty(key)) {
                        model.renderer.removeActor(actors[key]);
                    }
                };
                if (document.querySelector('.textCanvas')) this.container.current.children[0].removeChild(document.querySelector('.textCanvas'))
                model.renderer.removeActor(model.bounds);
                showBounds(bounds, model, this.container, vtk(polydata1)); //边框
                showVector(vector, model, points, vectorData, lut1, min, max, ArrowSize); //矢量
                const mapper1 = vtkMapper.newInstance({
                    interpolateScalarsBeforeMapping: true
                });
                const actor1 = vtkActor.newInstance();
                mapper1.setLookupTable(lut1);
                mapper1.setInputData(vtk(polydata1));
                mapper1.setScalarRange(min, max);
                let scalarBox = document.getElementsByClassName('vtk-container1')[0];
                if (scalarBox) {
                    scalarBox.innerHTML = null;
                }
                if (this.container1.current.childElementCount >= 1) {
                    this.container1.current.innerHTML = null;
                }
                scalarBar(model, unique, modes, this.container1);
                actor1.setMapper(mapper1);
                model.renderer.removeActor(model.actor);
                model.actor = actor1;
                model.renderer.addActor(actor1);
            };
        } else if (Scalar === false) {
            displayBar = 0;
            if (model.renderer) {
                if (document.querySelector(".vtk-container1")) {
                    document.querySelector(".vtk-container1").style.display = 'none';
                }
                model.renderer.removeActor(model.actor)
                for (let key in actors) {
                    if (actors.hasOwnProperty(key)) {
                        if (cancle.indexOf(key) === -1) {
                            model.renderer.addActor(actors[key])
                        } else {
                            model.renderer.removeActor(actors[key])
                        }
                    }
                }
                if (document.querySelector('.textCanvas')) this.container.current.children[0].removeChild(document.querySelector('.textCanvas'))
                model.renderer.removeActor(model.bounds);
                showBounds(bounds, model, this.container, vtk(polydata2)); //边框

                const openGLRenderWindow = model.interactor.getView();
                const hardwareSelector = vtkOpenGLHardwareSelector.newInstance({
                    captureZValues: true,
                });
                hardwareSelector.setFieldAssociation(
                    FieldAssociations.FIELD_ASSOCIATION_POINTS
                );
                hardwareSelector.attach(openGLRenderWindow, model.renderer);
                // ----------------------------------------------------------------------------
                // Create Mouse listener for picking on mouse move
                // ----------------------------------------------------------------------------
                function eventToWindowXY(event) {
                    // We know we are full screen => window.innerXXX
                    // Otherwise we can use pixel device ratio or else...
                    const { clientX, clientY } = event;
                    const [width, height] = openGLRenderWindow.getSize();
                    const x = Math.round((width * clientX) / window.innerWidth);
                    const y = Math.round(height * (1 - clientY / window.innerHeight)); // Need to flip Y
                    return [x, y];
                }
                // ----------------------------------------------------------------------------
                const WHITE = [1, 1, 1];
                const GREEN = [0.1, 0.8, 0.1];
                let needGlyphCleanup = false;
                let lastProcessedActor = null;
                const updateWorldPosition = (worldPosition) => {
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
                document.addEventListener('mousemove', throttleMouseHandler);
            }
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
                                <Row><span>Material</span></Row>
                                <Row>
                                    {
                                        Material.length > 0 ? (<Select
                                            mode="multiple"
                                            style={{ width: 200, marginBottom: "10px" }}
                                            placeholder="Show Material"
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
