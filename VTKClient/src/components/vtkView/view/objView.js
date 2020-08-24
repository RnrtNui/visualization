/**
* 文件名：objView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：*.obj贴图类型数据文件渲染逻辑。
* */
import vtk from 'vtk.js/Sources/vtk';
import React, { Component } from 'react';
import { goUrl } from "../../../url";
import axios from "axios";
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkMTLReader from 'vtk.js/Sources/IO/Misc/MTLReader';
import vtkOBJReader from 'vtk.js/Sources/IO/Misc/OBJReader';
import { Rendering, Screen, gl, Axis, reassignManipulators, changeManipulators } from "../common/index";

export default class objView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            model: {},
            polyData: [],
        }
        this.container = React.createRef();
    };

    // 渲染
    result = () => {
        let { model } = this.state;
        let { data, filename, } = this.props;
        // ----------------------------------------------------------------------------
        // Example code
        // ----------------------------------------------------------------------------
        const reader = vtkOBJReader.newInstance({ splitMode: 'usemtl' });
        const materialsReader = vtkMTLReader.newInstance();
        let mtl = filename.split(".")[0];
        //读取数据
        materialsReader
            .setUrl(`/data${data.filePath}/${mtl}.mtl`)
            .then(() => {
                reader.setUrl(`/data${data.filePath}/${filename}`)
                    .then(() => {
                        const size = reader.getNumberOfOutputPorts();
                        let polyData = [], arr = [];
                        let scene = [];

                        for (let i = 0; i < size; i++) {
                            let polydata = reader.getOutputData(i).getState();
                            polyData[i] = JSON.parse(JSON.stringify(polydata));
                            arr.push(polydata.points.values);
                        }
                        //更新数据
                        this.setState({
                            polyData: polyData
                        })
                        for (let i = 0; i < polyData.length; i++) {
                            polyData[i] = vtk(polyData[i]);
                            let polydata = polyData[i];
                            const name = polyData[i].get('name').name;
                            const mapper = vtkMapper.newInstance();
                            const actor = vtkActor.newInstance();
                            actor.setMapper(mapper);
                            mapper.setInputData(polyData[i]);
                            model.materialsReader.applyMaterialToActor(name, actor);
                            model.renderer.addActor(actor);
                            scene.push({ name, polydata, mapper, actor });
                            // Populate with initial manipulators
                            model.interactorStyle.setCenterOfRotation(mapper.getCenter())
                            model.camera = model.renderer.getActiveCamera()
                            reassignManipulators(model);
                        }

                        //控制菜单栏
                        const htmlBuffer = [
                            '<style>.visible { font-weight: bold; } .click { cursor: pointer; min-width: 150px;}</style>',
                        ];
                        scene.forEach((item, idx) => {
                            htmlBuffer.push(
                                `<div class="click visible" data-index="${idx}">${item.name}</div>`
                            );
                        });
                        htmlBuffer.splice(1, 0, '<div class="cmenu" style="max-height:500px;overflow:auto;">');
                        htmlBuffer.splice(htmlBuffer.length, 0, '</div>');
                        model.fullScreenRenderer.addController(`${htmlBuffer.join('\n')}`);
                        model.fullScreenRenderer.setControllerVisibility(0);
                        const nodes = document.querySelectorAll('.click');
                        for (let i = 0; i < nodes.length; i++) {
                            const el = nodes[i];
                            el.onclick = onClick;
                        }
                        function onClick(event) {
                            const el = event.target;
                            const index = Number(el.dataset.index);
                            const actor = scene[index].actor;
                            const visibility = actor.getVisibility();

                            actor.setVisibility(!visibility);
                            if (visibility) {
                                el.classList.remove('visible');
                            } else {
                                el.classList.add('visible');
                            }
                            model.renderWindow.render();
                        }
                        model.renderer.resetCamera();
                        model.renderWindow.render();
                        if (data.jsonFile !== 'true') {
                            axios.post(goUrl + "/objData", { "objName": mtl, "objData": { POINTS: arr } }).then((res) => {
                                console.log(res)
                            })
                        }
                    });
            });
        model.materialsReader = materialsReader;
    };

    componentDidMount() {
        //准备
        Rendering(this.state.model, this.container);
        //渲染
        this.result();
        //坐标
        Axis(this.state.model);
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

    render() {
        let { model } = this.state;
        let { display, keydown, useAxis, show, opt, useScreen, useLight } = this.props;

        if (model.renderer) {
            model.renderer.removeAllActors();
            let OpenGlRW = this.state.model.fullScreenRenderer.getOpenGLRenderWindow();
            gl(OpenGlRW);

            if (display === "block") {
                model.fullScreenRenderer.setControllerVisibility(1);
            } else {
                model.fullScreenRenderer.setControllerVisibility(0);
            }
            model.renderer.resetCamera();
            model.renderWindow.render();
        }


        //改变显示样式
        changeManipulators(model, opt, keydown, useLight, useAxis);

        //截屏
        if (useScreen !== null) {
            if (document.getElementsByTagName("canvas").length > 0) {
            }
        }
        return (
            <div>
                <div className="vtk-container" ref={this.container} style={{ "minHeight": "100px", "minWidth": "100px", "width": "100%", "height": show }} ></div>
            </div>
        )
    }
}
