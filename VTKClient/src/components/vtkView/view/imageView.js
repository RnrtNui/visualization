/**
* 文件名：imageView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：医学图像数据文件渲染逻辑。
*/
import 'vtk.js/Sources/favicon';
import { Screen,gl } from "../common/index";
import React, { Component } from 'react';
import vtkHttpDataSetReader from '../HttpDataSet';
import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
// pvpython -dr node_modules/vtk.js/Utilities/DataGenerator/vtk-data-converter.py  --input public/data/manifest.tiff  --output public/data/HttpDataSet

export default class imageView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            model: {}
        }
        this.container = React.createRef();
    };

    // 渲染场景
    componentDidMount() {
        let { model } = this.state;
        const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
            background: [0, 0, 0],
            rootContainer: this.container.current,
            containerStyle: { "border": null, "width": "100%", "height": "100%", "minHeight": "100px", "minWidth": "100px" },
        });
        const renderer = fullScreenRenderer.getRenderer();
        const renderWindow = fullScreenRenderer.getRenderWindow();
        const actor = vtkVolume.newInstance();
        model.actor = actor;
        model.renderer = renderer;
        model.renderWindow = renderWindow;
        model.fullScreenRenderer = fullScreenRenderer;
    };
    //组件更新
    componentDidUpdate = (prevProps) => {
        let { useScreen } = this.props
        if (useScreen !== prevProps.useScreen) {
            if (document.getElementsByTagName("canvas").length > 0) {
                setTimeout(Screen(document.getElementsByTagName("canvas")[0]),
                1000)
                
            }
        }
    };

    render() {
        if (this.state.model.fullScreenRenderer) gl();
        let { filename, useScreen } = this.props;
        // 設定影像載入器
        let { model } = this.state;
        const reader = vtkHttpDataSetReader.newInstances({
            fetchGzip: true // 讀取 Gzip 壓縮的影像
        });
        const mapper = vtkVolumeMapper.newInstance({
            maximumSamplesPerRay: 5000,
        });
        mapper.setSampleDistance(1)
        mapper.setImageSampleDistance(2)
        // console.log(mapper.getImageSampleDistance())
        mapper.setInputConnection(reader.getOutputPort());

        // 建立色彩與透明度函數
        const ctfun = vtkColorTransferFunction.newInstance();
        // ctfun.addRGBPoint(0, 0, 0, 0);
        // ctfun.addRGBPoint(0, 85 / 255.0, 0, 0);
        // ctfun.addRGBPoint(95, 1.0, 1.0, 1.0);
        ctfun.addRGBPoint(25, 0, 1, 1);
        // ctfun.addRGBPoint(355, 0, 0, 0);
        ctfun.addRGBPoint(600, 1.0, 1.0, 1.0);

        const ofun = vtkPiecewiseFunction.newInstance();
        // ofun.addPoint(50.0, 0.0);
        // ofun.addPoint(200, 0.7);
        ofun.addPoint(25.0, 0.0);
        // ofun.addPoint(300.0, 0.1);
        ofun.addPoint(300.0, 1);

        reader.setUrl(`/data/dicom/${filename}`)
            .then(() => {

                reader.loadData().then(() => {
                    model.actor.setMapper(mapper);
                    // 設定色彩與透明度函數
                    model.actor.getProperty().setRGBTransferFunction(0, ctfun);
                    model.actor.getProperty().setScalarOpacity(0, ofun);
                    model.renderer.addVolume(model.actor);
                    const interactor = model.renderWindow.getInteractor();

                    // 設定旋轉、縮放等動作時，畫面更新頻率
                    interactor.setDesiredUpdateRate(1);
                    model.renderer.resetCamera();

                    // 設定 Camera 初始角度
                    model.renderer.getActiveCamera().zoom(1.3);
                    model.renderer.getActiveCamera().elevation(70);

                    model.renderWindow.render();
                    //截屏
                    if (useScreen !== null) {
                        if (document.getElementsByTagName("canvas").length > 0) {
                            setTimeout(()=>{
                                console.log(document.getElementsByTagName("canvas"));
                            },100);
                        }
                    }
                });
            });
        return (
            <div>
                <div className="vtk-container" ref={this.container} style={{ "minHeight": "100px", "minWidth": "100px", "width": "100%", "height": "100vh" }} ></div>
            </div>
        )
    }
}
