/**
 文件名：offView.js
 作者：鲁杨飞
 创建时间：2020/8/24
 文件描述：*.off类型数据文件渲染逻辑。
 */
import vtk from 'vtk.js/Sources/vtk';
import Draggable from 'react-draggable';
import React, { Component } from 'react';
import { Slider, Input, Col, Row } from "antd";
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import { Rendering, Screen, gl, Axis, reassignManipulators, changeManipulators, showBounds } from "../common/index";

const InputGroup = Input.Group;

export default class offView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], activeScalar: [], model: {}, canvas: {},
            useScalar: false, boxBgColor: "#ccc", value: 0,
            displayBox: "none", points: [], cells: [], pointData: [0, 1], min: null, max: null,
            scalarBar: "0", mode: "rainbow", scale: [], unique: [], inputValue: 1,
            cellDataName: [], vector: false, ArrowSize: 1, vectorData: [], OpenGlRW: {}
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
        if (data.type === ".off") {
            //创建场景
            Rendering(model, this.container);
            let OpenGlRW = model.fullScreenRenderer.getOpenGLRenderWindow();
            let points = JSON.parse(JSON.stringify(data.data.POINTS)); //点
            let cells = JSON.parse(JSON.stringify(data.data.CELLS));   //单元
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
                    dataType: "Float32Array",
                    values: cells,
                },
            });
            const mapper = vtkMapper.newInstance({
                interpolateScalarsBeforeMapping: true
            });
            mapper.setInputData(polydata);
            const actor = vtkActor.newInstance();
            model.mapper = mapper;
            model.actor = actor;
            actor.setMapper(mapper);
            model.renderer.addActor(actor);
            model.interactorStyle.setCenterOfRotation(mapper.getCenter())
            model.camera = model.renderer.getActiveCamera()
            reassignManipulators(model);
            this.setState({
                OpenGlRW: OpenGlRW
            })
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
    //更新组件
    componentDidUpdate = (prevProps) => {
        let { useScreen } = this.props
        if (useScreen !== prevProps.useScreen) {
            if (document.getElementsByTagName("canvas").length > 0) {
                Screen(document.getElementsByTagName("canvas")[0])
            }
        }
    };

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

    render() {
        let {
            boxBgColor, displayBox,
            model, inputValue, OpenGlRW
        } = this.state;
        let { data, display, keydown, useAxis, opt, useScreen, useLight, bounds, show } = this.props;
        if (OpenGlRW.initialize) gl(OpenGlRW);
        //是否显示结果
        if (model.renderer) {
            let polydata2 = vtk({
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
            mapper2.setInputData(polydata2);
            const actor2 = vtkActor.newInstance();
            actor2.setMapper(mapper2);
            actor2.getProperty().setOpacity(inputValue);
            model.renderer.removeActor(model.actor);
            model.actor = actor2;
            model.mapper = mapper2;
            model.renderer.addActor(actor2);
            showBounds(bounds, model, this.container, polydata2); //边框
            changeManipulators(model, opt, keydown, useLight, useAxis);
        }
        displayBox = display;
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
                                    <Col >Transparency</Col >
                                    <Col>
                                        <Slider
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            style={{ width: 180, marginBottom: "10px" }}
                                            onChange={this.onChangeAlpha}
                                            defaultValue={typeof inputValue === 'number' ? inputValue : 0}
                                        />
                                    </Col>
                                </Row>
                            </InputGroup>
                        </div>
                    </div>
                </Draggable>

                <div className="vtk-container" ref={this.container} style={{ "minHeight": "100px", "minWidth": "100px", "width": "100%", "height": show }} ></div>
            </div>
        )
    }
}
