/**
* 文件名：csvView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：*.csv类型数据文件渲染逻辑。
*/
import vtk from 'vtk.js/Sources/vtk';
import Draggable from 'react-draggable';
import React, { Component } from 'react';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkMatrixBuilder from 'vtk.js/Sources/Common/Core/MatrixBuilder';
import vtkSphereSource from 'vtk.js/Sources/Filters/Sources/SphereSource';
import vtkPlaneSource from 'vtk.js/Sources/Filters/Sources/PlaneSource';
import vtkAppendPolyData from 'vtk.js/Sources/Filters/General/AppendPolyData';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import { Slider, InputNumber, Input, Col, Row, Select, Checkbox } from "antd";
import { FieldAssociations } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';
import vtkOpenGLHardwareSelector from 'vtk.js/Sources/Rendering/OpenGL/HardwareSelector';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import colorMode from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps.json'
import { Rendering, Screen, gl, scalarBar, Axis, reassignManipulators, changeManipulators, showBounds, showVector } from "../../common/index";

const InputGroup = Input.Group;
const { Option } = Select;
export default class csvView extends Component {
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
            scalarBar: 0,
            mode: "rainbow",
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

    //修改MappingRange
    updateMappingRange = () => {
        const min = Number(document.querySelector('.min').value);
        const max = Number(document.querySelector('.max').value);
        if (!Number.isNaN(min) && !Number.isNaN(max)) {
            this.state.model.lookupTable.setMappingRange(min, max);
            this.state.model.renderWindow.render();
        }
    };
    //修改HueRange
    updateHueRange = () => {
        const min = Number(document.querySelector('.hueRangemin').value);
        const max = Number(document.querySelector('.hueRangemax').value);
        if (!Number.isNaN(min) && !Number.isNaN(max)) {
            this.state.model.lookupTable.setHueRange(min, max);
            this.state.model.renderWindow.render();
        }
    };
    //修改MappingRange
    updateValueRange = () => {
        const min = Number(document.querySelector('.valueRangemin').value);
        const max = Number(document.querySelector('.valueRangemax').value);
        if (!Number.isNaN(min) && !Number.isNaN(max)) {
            this.state.model.lookupTable.setValueRange(min, max);
            this.state.model.renderWindow.render();
        }
    };
    //修改ValueRange
    updateAlphaRange = () => {
        const min = Number(document.querySelector('.alphaRangemin').value);
        const max = Number(document.querySelector('.alphaRangemax').value);
        if (!Number.isNaN(min) && !Number.isNaN(max)) {
            this.state.model.lookupTable.setAlphaRange(min, max);
            this.state.model.renderWindow.render();
        }
    };
    //修改SaturationRange
    updateSaturationRange = () => {
        const min = Number(document.querySelector('.saturationRangemin').value);
        const max = Number(document.querySelector('.saturationRangemax').value);
        if (!Number.isNaN(min) && !Number.isNaN(max)) {
            this.state.model.lookupTable.setSaturationRange(min, max);
            this.state.model.renderWindow.render();
        }
    };
    //修改NanColor
    updateNanColor = () => {
        const color1 = Number(document.querySelector('.nanColor1').value);
        const color2 = Number(document.querySelector('.nanColor2').value);
        const color3 = Number(document.querySelector('.nanColor3').value);
        const color4 = Number(document.querySelector('.nanColor4').value);
        if (!Number.isNaN(color1) && !Number.isNaN(color2) && !Number.isNaN(color3) && !Number.isNaN(color4)) {
            this.state.model.lookupTable.setNanColor(color1, color2, color3, color4);
            this.state.model.renderWindow.render();
        }
    };
    //修改AboveRangeColor
    updateAboveRangeColor = () => {
        const color1 = Number(document.querySelector('.AboveColor1').value);
        const color2 = Number(document.querySelector('.AboveColor2').value);
        const color3 = Number(document.querySelector('.AboveColor3').value);
        const color4 = Number(document.querySelector('.AboveColor4').value);
        if (!Number.isNaN(color1) && !Number.isNaN(color2) && !Number.isNaN(color3) && !Number.isNaN(color4)) {
            this.state.model.lookupTable.setAboveRangeColor(color1, color2, color3, color4);
            this.state.model.renderWindow.render();
        }
    };
    //修改BelowRangeColor
    updateBelowRangeColor = () => {
        const color1 = Number(document.querySelector('.BelowColor1').value);
        const color2 = Number(document.querySelector('.BelowColor2').value);
        const color3 = Number(document.querySelector('.BelowColor3').value);
        const color4 = Number(document.querySelector('.BelowColor4').value);
        if (!Number.isNaN(color1) && !Number.isNaN(color2) && !Number.isNaN(color3) && !Number.isNaN(color4)) {
            this.state.model.lookupTable.setBelowRangeColor(color1, color2, color3, color4);
            this.state.model.renderWindow.render();
        }
    };
    //修改UseAboveRangeColor
    updateUseAboveRangeColor = () => {
        const value = document.querySelector('.useAboveRangeColorvisibility').checked;
        this.state.model.lookupTable.setUseAboveRangeColor(value);
        this.state.model.renderWindow.render();
    };
    //修改UseBelowRangeColor
    updateUseBelowRangeColor = () => {
        const value = document.querySelector('.useBelowRangeColorvisibility').checked;
        this.state.model.lookupTable.setUseBelowRangeColor(value);
        this.state.model.renderWindow.render();
    };

    //渲染方法
    result = () => {
        let { data, fileName } = this.props;
        let name = fileName;
        let file = fileName.split('.')[0];
        let { model } = this.state;
        let vtkBox = document.getElementsByClassName('vtk-container')[0];
        if (vtkBox) {
            vtkBox.innerHTML = null;
        }
        if (data.type === ".csv") {
            // let oldData = data.data;
            // // let reData = [];
            // for (let x = 0; x < oldData.length; x++) {
            //     oldData[x].length = 96;
            // }
            // console.log(oldData)

            let yLength = data.data.length;
            let xLength = data.data[0].length;
            let zLength = yLength;

            let arr = data.data;
            console.log(arr)
            let array = [], xAxis = [], yAxis = [], zAxis = [], arrs = [];
            for (let i = 0; i < arr.length; i++) {
                arrs.push(arr[i][3]);
                zAxis.push(arr[i][0]);
                yAxis.push(arr[i][1]);
                xAxis.push(arr[i][2]);
            }
            // Array.from(new Set(array))
            yLength = Array.from(new Set(yAxis)).length;
            xLength = Array.from(new Set(xAxis)).length;
            zLength = Array.from(new Set(zAxis)).length;
            for (let i = 0; i < zLength; i++) {
                array[i] = []
                for (let j = 0; j < yLength; j++) {
                    array[i][j] = arrs.splice(0, xLength)
                }
            }
            let resData = array;
            zLength = resData.length;
            yLength = resData[0].length;
            xLength = resData[0][0].length;
            Rendering(model, this.container);
            // 定义平面源
            const planeSource1 = vtkPlaneSource.newInstance({
                xResolution: xLength - 1,
                yResolution: yLength - 1,
                origin: [0, 0, 0],
                point1: [xLength, 0, 0],
                point2: [0, yLength, 0],
            });
            const planeSource2 = vtkPlaneSource.newInstance({
                xResolution: xLength - 1,
                yResolution: yLength - 1,
                origin: [0, 0, zLength],
                point1: [xLength, 0, zLength],
                point2: [0, yLength, zLength],
            });
            const planeSource3 = vtkPlaneSource.newInstance({
                xResolution: xLength - 1,
                yResolution: zLength - 1,
                origin: [0, 0, 0],
                point1: [xLength, 0, 0],
                point2: [0, 0, zLength],
            });
            const planeSource4 = vtkPlaneSource.newInstance({
                xResolution: xLength - 1,
                yResolution: zLength - 1,
                origin: [0, yLength, 0],
                point1: [xLength, yLength, 0],
                point2: [0, yLength, zLength],
            });
            const planeSource5 = vtkPlaneSource.newInstance({
                xResolution: yLength - 1,
                yResolution: zLength - 1,
                origin: [0, 0, 0],
                point1: [0, yLength, 0],
                point2: [0, 0, zLength],
            });
            const planeSource6 = vtkPlaneSource.newInstance({
                xResolution: yLength - 1,
                yResolution: zLength - 1,
                origin: [xLength, 0, 0],
                point1: [xLength, yLength, 0],
                point2: [xLength, 0, zLength],
            });
            let pointData = [];
            for (let i = 0; i < zLength; i++) {
                for (let j = 0; j < yLength; j++) {
                    for (let k = 0; k < xLength; k++) {
                        let index = i * yLength * xLength + j * xLength + k;
                        pointData[index] = resData[i][j][k];
                    }
                }
            }
            let pointData1 = [], pointData2 = [], pointData3 = [], pointData4 = [], pointData5 = [], pointData6 = [];
            for (let j = 0; j < yLength; j++) {
                for (let k = 0; k < xLength; k++) {
                    let index = j * xLength + k;
                    pointData1[index] = resData[0][j][k];
                    pointData2[index] = resData[zLength - 1][j][k];
                }
            }
            for (let j = 0; j < zLength; j++) {
                for (let k = 0; k < xLength; k++) {
                    let index = j * xLength + k;
                    pointData3[index] = resData[j][0][k];
                    pointData4[index] = resData[j][yLength - 1][k];
                }
            }
            for (let j = 0; j < zLength; j++) {
                for (let k = 0; k < yLength; k++) {
                    let index = j * yLength + k;
                    pointData5[index] = resData[j][k][0];
                    pointData6[index] = resData[j][k][xLength - 1];
                }
            }
            const polydata1 = planeSource1.getOutputData().getState();
            polydata1.pointData = {
                vtkClass: 'vtkDataSetAttributes',
                activeScalars: 0,
                arrays: [{
                    data: {
                        vtkClass: 'vtkDataArray',
                        name: 'pointScalars',
                        dataType: 'Float32Array',
                        values: pointData1,
                    },
                }],
            }

            const polydata2 = planeSource2.getOutputData().getState();
            polydata2.pointData = {
                vtkClass: 'vtkDataSetAttributes',
                activeScalars: 0,
                arrays: [{
                    data: {
                        vtkClass: 'vtkDataArray',
                        name: 'pointScalars',
                        dataType: 'Float32Array',
                        values: pointData2,
                    },
                }],
            }
            const polydata3 = planeSource3.getOutputData().getState();
            polydata3.pointData = {
                vtkClass: 'vtkDataSetAttributes',
                activeScalars: 0,
                arrays: [{
                    data: {
                        vtkClass: 'vtkDataArray',
                        name: 'pointScalars',
                        dataType: 'Float32Array',
                        values: pointData3,
                    },
                }],
            }
            const polydata4 = planeSource4.getOutputData().getState();
            polydata4.pointData = {
                vtkClass: 'vtkDataSetAttributes',
                activeScalars: 0,
                arrays: [{
                    data: {
                        vtkClass: 'vtkDataArray',
                        name: 'pointScalars',
                        dataType: 'Float32Array',
                        values: pointData4,
                    },
                }],
            }
            const polydata5 = planeSource5.getOutputData().getState();
            polydata5.pointData = {
                vtkClass: 'vtkDataSetAttributes',
                activeScalars: 0,
                arrays: [{
                    data: {
                        vtkClass: 'vtkDataArray',
                        name: 'pointScalars',
                        dataType: 'Float32Array',
                        values: pointData5,
                    },
                }],
            }
            const polydata6 = planeSource6.getOutputData().getState();
            polydata6.pointData = {
                vtkClass: 'vtkDataSetAttributes',
                activeScalars: 0,
                arrays: [{
                    data: {
                        vtkClass: 'vtkDataArray',
                        name: 'pointScalars',
                        dataType: 'Float32Array',
                        values: pointData6,
                    },
                }],
            }
            let pointDatas = JSON.parse(JSON.stringify(pointData))
            pointDatas.sort(function (a, b) {
                return a - b
            });
            let unique = [...new Set(pointDatas)];
            if (unique.indexOf("null") !== -1) {
                unique.splice(unique.indexOf("null"), 1);
            } else if (unique.indexOf("NaN") !== -1) {
                unique.splice(unique.indexOf("NaN"), 1);
            } else if (unique.indexOf("nan") !== -1) {
                unique.splice(unique.indexOf("nan"), 1);
            }
            unique.sort(function (a, b) {
                return a - b;
            });
            if (unique.indexOf(null) !== -1) {
                unique.splice(unique.indexOf(null), 1);
            }
            console.log(unique);
            let min = Number(unique[0]);
            let max = Number(unique[unique.length - 1]);
            this.setState({
                min: min,
                max: max,
                unique: unique,
                // OpenGlRW: OpenGlRW,
            })

            const map = vtkMapper.newInstance({
                useLookupTableScalarRange: true,
            });
            const act = vtkActor.newInstance();
            const sourceData = vtkAppendPolyData.newInstance();
            sourceData.setInputData(vtk(polydata1));
            sourceData.addInputData(vtk(polydata2));
            sourceData.addInputData(vtk(polydata3));
            sourceData.addInputData(vtk(polydata4));
            sourceData.addInputData(vtk(polydata5));
            sourceData.addInputData(vtk(polydata6));
            map.setInputConnection(sourceData.getOutputPort());
            act.setMapper(map);
            model.actor = act;
            model.mapper = map;
            planeSource1.delete();
            planeSource2.delete();
            planeSource3.delete();
            planeSource4.delete();
            planeSource5.delete();
            planeSource6.delete();
            model.data = map.getInputData();
            model.renderer.addActor(act)
            model.interactorStyle.setCenterOfRotation(model.mapper.getCenter())
            reassignManipulators(model);
            model.renderer.resetCamera();
            model.renderWindow.render();
        }
    };

    componentDidMount() {
        this.result()
    };

    componentDidUpdate = (prevProps) => {
        let { screen } = this.props.state
        if (screen !== prevProps.state.screen) {
            if (document.getElementsByTagName("canvas").length > 0) {
                Screen(document.getElementsByTagName("canvas")[0])
            }
        }
    }

    render() {
        let {
            boxBgColor, displayBox, points, cells, vector, ArrowSize, vectorData, model, activeScalar, mode, unique, inputValue, min, max, cellData, cellDataName, OpenGlRW
        } = this.state;
        let { show, state} = this.props;
        let {bounds, light, scalar, moveStyle, modelStyle, screen, result, axis, attribute} = state;
        let modes = mode;
        let scale = [];
        const lut1 = vtkColorTransferFunction.newInstance();
        let num = Math.round(unique.length / 3)
        if (model.fullScreenRenderer) {
            if (document.querySelector('.textCanvas')) this.container.current.children[0].removeChild(document.querySelector('.textCanvas'))

            activeScalar = [unique[unique.length - 1], unique[unique.length - 1 - num], unique[num], unique[0]];
            scale = [(unique.length * 100) / unique.length + "%", ((unique.length - num) * 100) / unique.length + "%", (num * 100) / unique.length + "%", 0 + "%"];
            if (document.querySelector(".scalarMax")) document.querySelector(".scalarMax").innerHTML = max;
            if (document.querySelector(".scalarMin")) document.querySelector(".scalarMin").innerHTML = min;
            if (document.querySelector(".vtk-container1")) {
                document.querySelector(".vtk-container1").style.display = "block";
            }
            //预设色标颜色样式
            const preset = vtkColorMaps.getPresetByName(modes);
            //应用ColorMap
            lut1.applyColorMap(preset);
            lut1.setMappingRange(min, max);
            lut1.updateRange();
            model.renderer.removeActor(model.bounds);
            showBounds(bounds, model, this.container, model.data);
            model.mapper.setLookupTable(lut1);
            model.mapper.setScalarRange(min, max);
            if (this.container1.current.childElementCount < 1) {
                scalarBar(model, unique, modes, this.container1);
            } else {
                this.container1.current.innerHTML = null;
                scalarBar(model, unique, modes, this.container1);
            }
            model.lookupTable = lut1;
            model.actor.getProperty().setOpacity(inputValue);
        }

        let useScreen = state.screen;
        if (useScreen !== screen) {
            this.setState({
                screen: useScreen
            })
            // model.renderWindow.render();
            this.timer = setTimeout(() => {
            }, 1000);
        }
        if (model.renderWindow) {
            // let polydata = JSON.parse(JSON.stringify(model.data.getState()));
            // model.renderer.removeActor(model.actor);
            // let act = vtkActor.newInstance();
            // const fn = () => {
            //     vtkMatrixBuilder
            //         .buildFromDegree()
            //         .rotateY(30)
            //         .apply(vtk(polydata).getPoints().getData());
            //     window.requestAnimationFrame(fn);
            //     console.log(polydata)
            // }
            // window.requestAnimationFrame(fn);
            // model.mapper.setInputData(vtk(polydata))
            // act.setMapper(model.mapper);
            // model.renderer.addActor(act);
            // model.renderWindow.render();
        }
        //改变显示样式
        if (model.renderer) changeManipulators(model, moveStyle, modelStyle, light, axis, unique, modes, this.container1, lut1, inputValue, {}, {}, min, max, result);

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
            </div >
        )
    }
}
