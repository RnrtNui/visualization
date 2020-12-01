/**
* 文件名：csvView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：*.csv类型数据文件渲染逻辑。
*/
import vtk from 'vtk.js/Sources/vtk';
import Draggable from 'react-draggable';
import React, { Component } from 'react';
import { goUrl } from "../../../url";
import vtkMatrixBuilder from 'vtk.js/Sources/Common/Core/MatrixBuilder';
import axios from 'axios';
import vtkAppendPolyData from 'vtk.js/Sources/Filters/General/AppendPolyData';
import vtkElevationReader from 'vtk.js/Sources/IO/Misc/ElevationReader';
import { Input, Checkbox, Col, Row } from "antd";
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkLookupTable from 'vtk.js/Sources/Common/Core/LookupTable';
import vtkCalculator from 'vtk.js/Sources/Filters/General/Calculator';
import vtkPlaneSource from 'vtk.js/Sources/Filters/Sources/PlaneSource';
import vtkSphereSource from 'vtk.js/Sources/Filters/Sources/SphereSource';
import vtkCubeSource from 'vtk.js/Sources/Filters/Sources/CubeSource';
import { FieldDataTypes } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';
import { AttributeTypes } from 'vtk.js/Sources/Common/DataModel/DataSetAttributes/Constants';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
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
                y: 0,
                z: 0
            },
            xLength: 0,
            yLength: 0,
            zLength: 0,
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

            Rendering(model, this.container);
            let arr = data.data;
            arr.splice(0, 3);
            console.log(arr)
            let array = [], real = [], imag = [];
            for (let i = 0; i < arr.length; i++) {
                const sphereSource = vtkSphereSource.newInstance();
                const actor = vtkActor.newInstance();
                const mapper = vtkMapper.newInstance();
                mapper.setInputConnection(sphereSource.getOutputPort());
                actor.setMapper(mapper);
                actor.setPosition(arr[i][0], arr[i][2], arr[i][4]);

                renderer.addActor(actor);
                // imag.push([arr[i][1],arr[i][3],arr[i][5]]);
            }
           
            model.renderer.resetCamera();
            model.renderWindow.render();

            // theCanvas.
            // const reader = vtkElevationReader.newInstance({
            //     xSpacing: 0.01568,
            //     ySpacing: 0.01568,
            //     zScaling: 0.06666,
            // });
            // reader.setUrl(`/data/dicom/${file}.csv`).then(() => {
            //     let mapData = reader.getOutputData().getState().points.values;
            //     axios.post(goUrl + "/csvData", {
            //         dataType: ".csv",
            //         POINTS: mapData,
            //         fileName: name
            //     })
            // });

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
        let { screen } = this.props.state
        if (screen !== prevProps.state.screen) {
            if (document.getElementsByTagName("canvas").length > 0) {
                Screen(document.getElementsByTagName("canvas")[0])
            }
        }
    }

    render() {
        let { boxBgColor, displayBox, model, xLength, yLength, zLength } = this.state;
        let { show, state} = this.props;
        let {bounds, light, scalar, moveStyle, modelStyle, screen, result, axis, attribute} = state;
        //model自动旋转///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // if (model.fullScreenRenderer) {
        //     const camera = model.renderer.getActiveCamera();
        //     console.log(camera.getClippingRange())
        //     camera.setClippingRange(0.1,600);
        //     const fn = () => {
        //         let cameraPosition = camera.getPosition();

        //         // let cameraFocalPoint = camera.getFocalPoint();
        //         console.log(camera);
        //         // let polydata = JSON.parse(JSON.stringify(model.actor.getMapper().getInputData().getState()));
        //         // let data = vtk(polydata);
        //         vtkMatrixBuilder
        //             .buildFromDegree()
        //             .rotateY(1)
        //             .apply(cameraPosition);
        //         // console.log(cameraPosition);
        //         camera.setPosition(...cameraPosition);
        //         model.renderWindow.render();
        //         window.requestAnimationFrame(fn);
        //         // model.mapper.setInputData(data);
        //         // model.renderer.removeActor(model.actor);
        //         // model.actor.setMapper(model.mapper)
        //         // model.renderer.addActor(model.actor);
        //     }
        //     window.requestAnimationFrame(fn);
        // }
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        let useScreen = state.screen;
        if (useScreen !== screen) {
            this.setState({
                screen: useScreen
            })
            // model.renderWindow.render();
            this.timer = setTimeout(() => {
            }, 1000);
        }


        //改变鼠标事件
        changeManipulators(model, moveStyle);

        return (
            <div>
                <Draggable handle=".handle"
                    defaultPosition={{ x: 0, y: 0 }}
                    position={null}
                    grid={[1, 1]}
                    scale={1}>
                    <div style={{ display: attribute, position: "absolute", zIndex: "999", padding: "20px" }}>
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
                                        <Input className="hueRangemin" type="text" style={{ width: "50%" }} defaultValue="-1.0" />
                                        <Input className="hueRangemax" type="text" style={{ width: "50%" }} defaultValue="1.0" />
                                    </Col >
                                </Row>
                                <Row >
                                    <Col >SaturationRange</Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Input className="saturationRangemin" type="text" style={{ width: "50%" }} defaultValue="1.0" />
                                        <Input className="saturationRangemax" type="text" style={{ width: "50%" }} defaultValue="1.0" />
                                    </Col >
                                </Row>
                                <Row >
                                    <Col >ValueRange</Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Input className="valueRangemin" type="text" style={{ width: "50%" }} defaultValue="-0.4" />
                                        <Input className="valueRangemax" type="text" style={{ width: "50%" }} defaultValue="30" />
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
            </div >
        )
    }
}
