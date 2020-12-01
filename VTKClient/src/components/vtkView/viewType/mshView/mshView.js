/**
* 文件名：mshView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：*.msh类型数据文件渲染逻辑。
*/
import vtk from 'vtk.js/Sources/vtk';
import Draggable from 'react-draggable';
import React, { Component } from 'react';
import { Slider, Input, Col, Row, Select } from "antd";
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkOutlineFilter from 'vtk.js/Sources/Filters/General/OutlineFilter';
import vtkImageCropFilter from 'vtk.js/Sources/Filters/General/ImageCropFilter';
import colorMode from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps.json';
import { Rendering, Screen, gl, Axis, reassignManipulators, changeManipulators, showBounds } from "../../common/index"

const InputGroup = Input.Group;
const { Option } = Select;

export default class mshView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], activeScalar: [], model: {}, canvas: {},
            boxBgColor: "#ccc", value: 0,
            displayBox: "none", inputValue: 1,
            points: [], cells: [], pointData: [0, 1], modeBounds: [],
            Material: [], checkedList: [], indeterminate: true, checkAll: false,
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
        if (data.type === ".msh") {
            Rendering(model, this.container);
            console.log(data)
            let points = JSON.parse(JSON.stringify(data.data[0]));
            let cells = JSON.parse(JSON.stringify(data.data[1]));
            //创建polydata数据
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
                    values: cells,
                },
            });
            const outline = vtkOutlineFilter.newInstance();
            outline.setInputData(polydata);
            const mapper = vtkMapper.newInstance({
                interpolateScalarsBeforeMapping: true
            });
            this.setState({
                points: points,
                cells: cells,
                modeBounds: outline.getOutputData().getBounds()
            })
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
        //渲染
        this.result();
        //绘制坐标
        Axis(this.state.model);
    };

    //更该模型边界x
    onChangeBoundsX = (val) => {
        let { model } = this.state;
        let { data } = this.props;
        let newP = JSON.parse(JSON.stringify(data.data[0]))
        for (let i = 0; i < newP.length; i = i + 3) {
            if (Number(newP[i]) >= val[0] && Number(newP[i]) <= val[1]) {

            } else {
                newP[i] = "null";
                newP[i + 1] = "null";
                newP[i + 2] = "null";
            }
        }
        this.setState({
            points: newP
        })
        model.renderer.resetCameraClippingRange();
        model.renderWindow.render();
    }
    //更改模型边界Y
    onChangeBoundsY = (val) => {
        let { model } = this.state
        let { data } = this.props;
        let newP = JSON.parse(JSON.stringify(data.data[0]))
        for (let i = 1; i < newP.length; i = i + 3) {
            if (Number(newP[i]) >= val[0] && Number(newP[i]) <= val[1]) {

            } else {
                newP[i - 1] = "null";
                newP[i] = "null";
                newP[i + 1] = "null";
            }
        }
        this.setState({
            points: newP
        })
        model.renderer.resetCameraClippingRange();
        model.renderWindow.render();
    }
    //更该模型边界z
    onChangeBoundsZ = (val) => {
        let { model } = this.state
        let { data } = this.props;
        let newP = JSON.parse(JSON.stringify(data.data[0]))
        for (let i = 2; i < newP.length; i = i + 3) {
            if (Number(newP[i]) >= val[0] && Number(newP[i]) <= val[1]) {

            } else {
                newP[i] = "null";
                newP[i - 1] = "null";
                newP[i - 2] = "null";
            }
        }
        this.setState({
            points: newP
        })
        model.renderWindow.render();
    }

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
        let { screen } = this.props.state
        if (screen !== prevProps.state.screen) {
            if (document.getElementsByTagName("canvas").length > 0) {
                Screen(document.getElementsByTagName("canvas")[0])
            }
        }
    };

    render() {
        let {
            boxBgColor, model, mode, points, cells, modeBounds,
        } = this.state;
        let { show, state } = this.props;
        let { attribute, axis, moveStyle, bounds, light, screen, modelStyle } = state;
        let inputValue = this.state.inputValue;
        if (model.renderer) {
            const cropFilter = vtkImageCropFilter.newInstance();
            let OpenGlRW = this.state.model.fullScreenRenderer.getOpenGLRenderWindow();
            gl(OpenGlRW);
            let polydata1 = vtk({
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
            cropFilter.setInputData(polydata1);
            model.cropFilter = cropFilter;
            //清除textCanvas
            if (document.querySelector('.textCanvas')) this.container.current.children[0].removeChild(document.querySelector('.textCanvas'))
            model.renderer.removeActor(model.bounds);
            const outline = vtkOutlineFilter.newInstance();
            outline.setInputData(polydata1);
            const mapper = vtkMapper.newInstance();
            mapper.setInputConnection(outline.getOutputPort());
            const actor = vtkActor.newInstance();
            actor.setMapper(mapper);
            actor.getProperty().set({ lineWidth: 1 });
            showBounds(bounds, model, this.container, polydata1); //边框
            const mapper1 = vtkMapper.newInstance({
                interpolateScalarsBeforeMapping: true
            });
            const actor1 = vtkActor.newInstance();

            // mapper1.setLookupTable(lut1);
            mapper1.setInputData(polydata1);

            actor1.getProperty().setOpacity(inputValue);
            actor1.setMapper(mapper1);
            model.renderer.removeActor(model.actor);
            model.actor = actor1
            model.renderer.addActor(actor1);
            
        };

        //改变显示样式
        changeManipulators(model, moveStyle, modelStyle, light, axis);

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
                                {
                                    modeBounds.length > 0 ? (<Row >
                                        <Col span={24}>ModeBounds</Col >
                                        <Col span={8} style={{ lineHeight: "36px" }}>xBounds:</Col >
                                        <Col span={16}>
                                            <Slider
                                                range={true}
                                                step={0.1}
                                                disabled={!bounds}
                                                defaultValue={[modeBounds[0], modeBounds[1]]}
                                                min={modeBounds[0]}
                                                max={modeBounds[1]}
                                                onChange={this.onChangeBoundsX}
                                            />
                                        </Col>
                                        <Col span={8} style={{ lineHeight: "36px" }}>yBounds:</Col >
                                        <Col span={16}>
                                            <Slider
                                                range
                                                step={0.1}
                                                min={modeBounds[2]}
                                                max={modeBounds[3]}
                                                disabled={!bounds}
                                                defaultValue={[Number(modeBounds[2]), Number(modeBounds[3])]}
                                                onChange={this.onChangeBoundsY}
                                            />
                                        </Col>
                                        <Col span={8} style={{ lineHeight: "36px" }}>zBounds:</Col >
                                        <Col span={16}>
                                            <Slider
                                                range
                                                step={0.1}
                                                min={modeBounds[4]}
                                                max={modeBounds[5]}
                                                disabled={!bounds}
                                                defaultValue={[Number(modeBounds[4]), Number(modeBounds[5])]}
                                                onChange={this.onChangeBoundsZ}
                                            />
                                        </Col>
                                    </Row >) : (null)
                                }

                            </InputGroup>

                        </div>
                    </div>
                </Draggable>
                <div className="vtk-container" ref={this.container} style={{ "minHeight": "100px", "minWidth": "100px", "width": "100%", "height": show }} onMouseDown={(e) => this.onMouseMove}></div>
            </div>
        )
    }
}
