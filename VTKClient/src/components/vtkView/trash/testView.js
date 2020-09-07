/**
* 文件名：offView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：*.off类型数据文件渲染逻辑。
*/
import vtk from 'vtk.js/Sources/vtk';
import Draggable from 'react-draggable';
import React, { Component } from 'react';
import { Slider, Input, Col, Row } from "antd";
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import { FieldAssociations } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';
import vtkOpenGLHardwareSelector from 'vtk.js/Sources/Rendering/OpenGL/HardwareSelector';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import { Rendering, Screen, gl, Axis, reassignManipulators, changeManipulators, showBounds } from "../common/index";
import vtkSphereSource from 'vtk.js/Sources/Filters/Sources/SphereSource';
import vtkMatrixBuilder from 'vtk.js/Sources/Common/Core/MatrixBuilder';
import vtkAppendPolyData from 'vtk.js/Sources/Filters/General/AppendPolyData';

const InputGroup = Input.Group;

export default class offView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], activeScalar: [], model: {}, canvas: {},
            inputX: 0, inputY: 0, inputZ: 0, OpenGlRW: {}
        }
        this.container = React.createRef();
        this.container1 = React.createRef();
    };

    // 渲染
    result = () => {
        let { data } = this.props;
        let { model, inputX, inputY, inputZ } = this.state;
        let vtkBox = document.getElementsByClassName('vtk-container')[0];
        if (vtkBox) {
            vtkBox.innerHTML = null;
        }
        //创建场景
        Rendering(model, this.container);
        let OpenGlRW = model.fullScreenRenderer.getOpenGLRenderWindow();
        //点

        // console.log(actor.getMapper().getInputData().getPoints().getData());

        //**************************************************************** */
        let point2 = [
            14.723465037636, 23.7934552794615, 10.5422245823181,
            14.9697636026552, 24.2206541182234, 10.525117504234,
            14.5458268239756, 24.4729670333677, 10.5335010371854,
            14.6664472449538, 23.7560044727683, 8.78608940264171,
            14.9129785485126, 24.1836396842409, 8.76802965717117,
            14.4883501569979, 24.4357889645989, 8.77736585750745,
            14.6094055660541, 23.7185122360935, 7.02995587977835,
            14.8562011665793, 24.1466066813291, 7.01185437024587,
            14.4308461583432, 24.3985705187531, 7.0212323346446,
            14.5523395260867, 23.6809777457606, 5.2738240484295,
            14.7994324928042, 24.1095554066427, 5.25663452960089,
            14.3733142757018, 24.3613108782988, 5.26510050329689,
        ];   //单元
        let polydata2 = vtk({
            vtkClass: 'vtkPolyData',
            points: {
                vtkClass: 'vtkPoints',
                dataType: 'Float32Array',
                numberOfComponents: 3,
                values: point2,
            },
            polys: {
                vtkClass: 'vtkCellArray',
                dataType: "Float32Array",
                values: [
                    3, 0, 1, 2,
                    3, 3, 4, 5,
                    3, 6, 7, 8,
                    3, 9, 10, 11,
                ],
            },
        });
        const mapper1 = vtkMapper.newInstance({
            interpolateScalarsBeforeMapping: true
        });
        mapper1.setInputData(polydata2);
        const actor1 = vtkActor.newInstance();
        actor1.setMapper(mapper1);
        model.renderer.addActor(actor1);
        reassignManipulators(model);
        this.setState({
            OpenGlRW: OpenGlRW
        })
        model.renderer.resetCamera();
        model.renderWindow.render();
    };

    componentDidMount() {
        this.result();
        Axis(this.state.model);
    };
    InputMapperRangeX = (e) => {
        this.setState({
            inputX: e.target.value
        })
    }
    InputMapperRangeY = (e) => {
        this.setState({
            inputY: e.target.value
        })
    }
    InputMapperRangeZ = (e) => {
        this.setState({
            inputZ: e.target.value
        })
    }
    render() {
        let {
            OpenGlRW, model, inputX, inputY, inputZ
        } = this.state;
        if (OpenGlRW.initialize) gl(OpenGlRW);
        if (model.renderer) {
            if(model.actor) model.renderer.removeActor(model.actor);
            let point1 = [
                13.2321585512394, 24.4431845869678, 5.27382404843011,
                13.479771209699, 24.8714622036826, 5.2566345296015,
                13.9108569522462, 24.6283107384847, 5.2651005032975,
                13.2361313508423, 24.5113724286897, 7.02995475357321,
                13.4834742155562, 24.9391509112416, 7.01185324522814,
                13.9143588038453, 24.6967645867095, 7.02123120843858,
                13.240079738303, 24.5795180463945, 8.78608715030275,
                13.4871570435526, 25.0068380244801, 8.76802740597414,
                13.9178389218925, 24.7651736894471, 8.77736360516905,
                13.2440041894551, 24.6476222630404, 10.5422212039666,
                13.4908199542874, 25.0745224975197, 10.5251141258302,
                13.9212977382339, 24.8335389337785, 10.533497658834,
            ];
            let polydata1 = vtk({
                vtkClass: 'vtkPolyData',
                points: {
                    vtkClass: 'vtkPoints',
                    dataType: 'Float32Array',
                    numberOfComponents: 3,
                    values: point1,
                },
                polys: {
                    vtkClass: 'vtkCellArray',
                    dataType: "Float32Array",
                    values: [
                        3, 0, 1, 2,
                        3, 3, 4, 5,
                        3, 6, 7, 8,
                        3, 9, 10, 11,
                    ],
                },
            });
            vtkMatrixBuilder
                .buildFromDegree()
                .translate(inputX, inputY, inputZ)
                .apply(polydata1.getPoints().getData());
            const source = vtkAppendPolyData.newInstance();
            source.setInputData(polydata1);
            const mapper = vtkMapper.newInstance({
                interpolateScalarsBeforeMapping: true
            });
            mapper.setInputConnection(source.getOutputPort());
            const actor = vtkActor.newInstance();
            model.actor=actor;
            actor.setMapper(mapper);
            model.renderer.addActor(actor);
            model.renderWindow.render();

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
                radius: 0.01,
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
                pointerActor.setVisibility(true);
                pointerActor.setPosition(worldPosition);
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
            const throttleMouseHandler = throttle(pickOnMouseEvent, 10);
            container.addEventListener('mousemove', throttleMouseHandler);
        }
        return (
            <div>
                <div className="vtk-container" ref={this.container} style={{ "minHeight": "100px", "minWidth": "100px", "width": "100%", "height": "100vh" }} ></div>
                <Input.Group compact style={{ position: "absolute", left: "0", top: "0" }}>
                    <Input style={{ width: 45, textAlign: 'center' }} placeholder={inputX} onChange={this.InputMapperRangeX} />
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
                            width: 45,
                            textAlign: 'center',
                        }}
                        onChange={this.InputMapperRangeY}
                        placeholder={inputY}
                    />
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
                            width: 45,
                            textAlign: 'center',
                        }}
                        onChange={this.InputMapperRangeZ}
                        placeholder={inputZ}
                    />
                </Input.Group>
            </div >
        )
    }
}
