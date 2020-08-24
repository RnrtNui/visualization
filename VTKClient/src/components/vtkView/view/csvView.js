/**
* 文件名：csvView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：*.csv类型数据文件渲染逻辑。
* */
import vtk from 'vtk.js/Sources/vtk';
import Draggable from 'react-draggable';
import React, { Component } from 'react';
import { goUrl } from "../../../url";
import axios from 'axios';
import vtkElevationReader from 'vtk.js/Sources/IO/Misc/ElevationReader';
import { Input, Checkbox, Col, Row } from "antd";
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkLookupTable from 'vtk.js/Sources/Common/Core/LookupTable';
import vtkCalculator from 'vtk.js/Sources/Filters/General/Calculator';
import vtkPlaneSource from 'vtk.js/Sources/Filters/Sources/PlaneSource';
import { FieldDataTypes } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';
import { AttributeTypes } from 'vtk.js/Sources/Common/DataModel/DataSetAttributes/Constants';
import { Rendering, Screen, reassignManipulators, changeManipulators } from "../common/index"
const InputGroup = Input.Group;

export default class csvView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            model: {},
            canvas: {},
            boxBgColor: "#ccc",
            position: {
                x: 0,
                y: 0
            },
            cells: [],
            value: 0,
            displayBox: "none",
            mode: "rainbow",
        }
        this.container = React.createRef();
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
            let yLength = data.data.length;
            let xLength = data.data[0].length;
            let SCALARS = [];
            Rendering(model, this.container);
            for (let i = 0; i < yLength; i++) {
                for (let j = 0; j < xLength; j++) {
                    SCALARS.push(data.data[i][j]);
                }
            }
            const lookupTable = vtkLookupTable.newInstance({
                hueRange: [0, 0.6],
                saturationRange: [0, 0],
                valueRange: [0, 1],
                alphaRange: [1, 1],

                nanColor: [0.5, 0.0, 0.0, 1.0],
                belowRangeColor: [0.0, 0.0, 0.0, 1.0],
                aboveRangeColor: [1.0, 1.0, 1.0, 1.0],
                useAboveRangeColor: false,
                useBelowRangeColor: false,
            });
            document.querySelector('.hueRangemin').value = 0;
            document.querySelector('.hueRangemax').value = 0.6;
            document.querySelector('.saturationRangemin').value = 0;
            document.querySelector('.saturationRangemax').value = 0;
            document.querySelector('.valueRangemin').value = 0;
            document.querySelector('.valueRangemax').value = 1;
            // 定义查找表
            model.lookupTable = lookupTable;
            function VTKPrepare(model) {

                // 定义映射器
                const mapper = vtkMapper.newInstance({
                    useLookupTableScalarRange: true,
                    lookupTable,
                });
                // 定义平面源
                const planeSource = vtkPlaneSource.newInstance({
                    XResolution: xLength - 1,
                    YResolution: yLength - 1,

                });
                const simpleFilter = vtkCalculator.newInstance();
                model.simpleFilter = simpleFilter;

                // 生成的“z”数组将成为默认标量，因此平面映射器将按“z”着色：
                simpleFilter.setInputConnection(planeSource.getOutputPort());
                mapper.setInputConnection(simpleFilter.getOutputPort());

                // 更新VTK场景
                model.renderer.resetCamera();
                model.renderer.resetCameraClippingRange();

                model.simpleFilter.setFormula({
                    getArrays: (inputDataSets) => ({
                        input: [
                            { location: FieldDataTypes.COORDINATE }], // 需要点坐标作为输入
                        output: [
                            {
                                location: FieldDataTypes.POINT,   // 这个数组将是点数据。。。
                                name: 'z',                // ... 有了名字。。。
                                dataType: 'Float64Array',         // ... 这种类型的。。。
                                attribute: AttributeTypes.SCALARS // ... 将被标记为默认标量。
                            },
                        ]
                    }),
                    evaluate: (arraysIn, arraysOut) => {
                        const [z] = arraysOut.map(d => d.getData());
                        for (let i = 0; i < yLength; i++) {
                            for (let j = 0; j < xLength; j++) {
                                let index = i * xLength + j;
                                z[index] = data.data[i][j];
                            }
                        }
                        arraysOut.forEach(x => x.modified());
                    }
                });
                // 设置模型的属性
                const [min, max] = model.simpleFilter
                    .getOutputData()
                    .getPointData()
                    .getScalars()
                    .getRange();
                document.querySelector('.min').value = min;
                document.querySelector('.max').value = max;
                model.lookupTable.setMappingRange(min, max);
                planeSource.set({ "xResolution": xLength - 1 });
                planeSource.set({ "yResolution": yLength - 1 });
                planeSource.set({ "Origin": [0, 0, 0] });
                planeSource.set({ "Point1": [xLength, 0, 0] });
                planeSource.set({ "Point2": [0, -yLength, 0] });
                // 定义actor
                const actor = vtkActor.newInstance();
                // 将定义的映射器设置为定义的参与者
                actor.setMapper(mapper);
                let polydata = actor.getMapper().getInputData().getState();
                const mapper2 = vtkMapper.newInstance({
                    useLookupTableScalarRange: true,
                    lookupTable,
                });
                mapper2.setInputData(vtk(polydata));
                const actor2 = vtkActor.newInstance();
                actor2.setMapper(mapper2);
                // 将actor添加到渲染器
                model.renderer.addActor(actor2);
                // Populate with initial manipulators
                model.interactorStyle.setCenterOfRotation(mapper.getCenter());
                reassignManipulators(model);
            }
            VTKPrepare(model);

            model.renderer.resetCamera();
            model.renderWindow.render();
            // theCanvas.
            const reader = vtkElevationReader.newInstance({
                xSpacing: 0.01568,
                ySpacing: 0.01568,
                zScaling: 0.06666,
            });
            reader.setUrl(`/data/dicom/${file}.csv`).then(() => {
                let mapData = reader.getOutputData().getState().points.values;
                axios.post(goUrl + "/csvData", {
                    dataType: ".csv",
                    POINTS: mapData,
                    fileName: name
                })
            });

        }
    };

    componentDidMount() {
        //绑定方法
        ['min', 'max'].forEach((selector) => {
            document.querySelector(`.${selector}`)
                .addEventListener('input', this.updateMappingRange);
        });
        ['hueRangemin', 'hueRangemax'].forEach((selector) => {
            document.querySelector(`.${selector}`)
                .addEventListener('input', this.updateHueRange);
        });
        ['saturationRangemin', 'saturationRangemax'].forEach((selector) => {
            document.querySelector(`.${selector}`)
                .addEventListener('input', this.updateSaturationRange);
        });
        ['valueRangemin', 'valueRangemax'].forEach((selector) => {
            document.querySelector(`.${selector}`)
                .addEventListener('input', this.updateValueRange);
        });
        ['alphaRangemin', 'alphaRangemax'].forEach((selector) => {
            document.querySelector(`.${selector}`)
                .addEventListener('input', this.updateAlphaRange);
        });
        ['useAboveRangeColorvisibility'].forEach((selector) => {
            document.querySelector(`.${selector}`)
                .addEventListener('change', this.updateUseAboveRangeColor);
        });
        ['useBelowRangeColorvisibility'].forEach((selector) => {
            document.querySelector(`.${selector}`)
                .addEventListener('change', this.updateUseBelowRangeColor);
        });

        ['nanColor1', 'nanColor2', 'nanColor3', 'nanColor4'].forEach((selector) => {
            document.querySelector(`.${selector}`)
                .addEventListener('input', this.updateNanColor);
        });
        ['AboveColor1', 'AboveColor2', 'AboveColor3', 'AboveColor4'].forEach((selector) => {
            document.querySelector(`.${selector}`)
                .addEventListener('input', this.updateAboveRangeColor);
        });
        ['BelowColor1', 'BelowColor2', 'BelowColor3', 'BelowColor4'].forEach((selector) => {
            document.querySelector(`.${selector}`)
                .addEventListener('input', this.updateBelowRangeColor);
        });
        this.result()
    };

    componentDidUpdate = (prevProps) => {
        let { useScreen } = this.props
        if (useScreen !== prevProps.useScreen) {
            if (document.getElementsByTagName("canvas").length > 0) {
                Screen(document.getElementsByTagName("canvas")[0])
            }
        }

    }

    render() {
        let { boxBgColor, displayBox, model } = this.state;
        let { display, keydown, useScreen, show, opt } = this.props;
        displayBox = display
        if (keydown === "R") {//回到中心
            if (model.renderer) {
                model.renderer.resetCamera()
                model.renderWindow.render();
            }
        } else {
        };

        displayBox = display;
        if (useScreen !== null) {
            model.renderWindow.render();
            this.timer = setTimeout(() => {
            }, 1000);
        }

        //改变鼠标事件
        changeManipulators(model, opt);

        return (
            <div>
                <Draggable handle=".handle"
                    defaultPosition={{ x: 0, y: 0 }}
                    position={null}
                    grid={[1, 1]}
                    scale={1}>
                    <div style={{ display: displayBox, position: "absolute", zIndex: "999", padding: "20px" }}>
                        <div style={{ width: "250px", position: "absolute", background: boxBgColor, padding: "20px", lineHeight: "20px", display: "block" }}>
                            <span className="handle" style={{ display: "inline-block", width: "100%", textAlign: "center" }}>属性</span>
                            <InputGroup>
                                <Row >
                                    <Col >MapperRange</Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Input className="min" type="text" style={{ width: "50%" }} defaultValue="0.0" />
                                        <Input className="max" type="text" style={{ width: "50%" }} defaultValue="1.0" />
                                    </Col >
                                </Row>
                                <Row >
                                    <Col >HueRange</Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Input className="hueRangemin" type="text" style={{ width: "50%" }} defaultValue="0" />
                                        <Input className="hueRangemax" type="text" style={{ width: "50%" }} defaultValue="0.6" />
                                    </Col >
                                </Row>
                                <Row >
                                    <Col >SaturationRange</Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Input className="saturationRangemin" type="text" style={{ width: "50%" }} defaultValue="0" />
                                        <Input className="saturationRangemax" type="text" style={{ width: "50%" }} defaultValue="0" />
                                    </Col >
                                </Row>
                                <Row >
                                    <Col >ValueRange</Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Input className="valueRangemin" type="text" style={{ width: "50%" }} defaultValue="0" />
                                        <Input className="valueRangemax" type="text" style={{ width: "50%" }} defaultValue="1" />
                                    </Col >
                                </Row>
                                <Row >
                                    <Col >AlphaRange</Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Input className="alphaRangemin" type="text" style={{ width: "50%" }} defaultValue="1" />
                                        <Input className="alphaRangemax" type="text" style={{ width: "50%" }} defaultValue="1" />
                                    </Col >
                                </Row>
                                <Row >
                                    <label >UseAboveRangeColor
                                <Checkbox className="useAboveRangeColorvisibility" type="checkbox" defaultChecked={false} />
                                    </label >
                                </Row>
                                <Row >
                                    <label>UseBelowRangeColor
                                <Checkbox className="useBelowRangeColorvisibility" type="checkbox" defaultChecked={false} />
                                    </label>
                                </Row>
                                <Row >
                                    <Col >NaNColor </Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Input className="nanColor1" type="text" style={{ width: "25%" }} defaultValue="0.5" />
                                        <Input className="nanColor2" type="text" style={{ width: "25%" }} defaultValue="0.0" />
                                        <Input className="nanColor3" type="text" style={{ width: "25%" }} defaultValue="0.0" />
                                        <Input className="nanColor4" type="text" style={{ width: "25%" }} defaultValue="1.0" />
                                    </Col >
                                </Row>
                                <Row >
                                    <Col >AboveRangeColor </Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Input className="AboveColor1" type="text" style={{ width: "25%" }} defaultValue="0.0" />
                                        <Input className="AboveColor2" type="text" style={{ width: "25%" }} defaultValue="0.0" />
                                        <Input className="AboveColor3" type="text" style={{ width: "25%" }} defaultValue="0.0" />
                                        <Input className="AboveColor4" type="text" style={{ width: "25%" }} defaultValue="1.0" />
                                    </Col >
                                </Row>
                                <Row >
                                    <Col >BelowRangeColor </Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Input className="BelowColor1" type="text" style={{ width: "25%" }} defaultValue="1.0" />
                                        <Input className="BelowColor2" type="text" style={{ width: "25%" }} defaultValue="1.0" />
                                        <Input className="BelowColor3" type="text" style={{ width: "25%" }} defaultValue="1.0" />
                                        <Input className="BelowColor4" type="text" style={{ width: "25%" }} defaultValue="1.0" />
                                    </Col >
                                </Row>
                            </InputGroup>
                        </div>
                    </div>
                </Draggable>
                <div className="vtk-container" style={{ "height": show, "minHeight": "100px", "minWidth": "100px" }} ref={this.container}></div>
            </div>
        )
    }
}
