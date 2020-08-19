import vtk from 'vtk.js/Sources/vtk';
import React from "react";
import { Spin } from "antd";
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import html2canvas from 'html2canvas';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkLight from 'vtk.js/Sources/Rendering/Core/Light';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import ArrowSource from 'vtk.js/Sources/Filters/Sources/ArrowSource';
import vtkMatrixBuilder from 'vtk.js/Sources/Common/Core/MatrixBuilder';
import vtkPlaneSource from 'vtk.js/Sources/Filters/Sources/PlaneSource';
import vtkArrowSource from 'vtk.js/Sources/Filters/Sources/ArrowSource';
import vtkGlyph3DMapper from 'vtk.js/Sources/Rendering/Core/Glyph3DMapper';
import vtkOutlineFilter from 'vtk.js/Sources/Filters/General/OutlineFilter';
import vtkAppendPolyData from 'vtk.js/Sources/Filters/General/AppendPolyData';
import style from 'vtk.js/Examples/Geometry/SpheresAndLabels/style.module.css';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkPixelSpaceCallbackMapper from 'vtk.js/Sources/Rendering/Core/PixelSpaceCallbackMapper';
import vtkOrientationMarkerWidget from 'vtk.js/Sources/Interaction/Widgets/OrientationMarkerWidget';
import vtkInteractorStyleManipulator from 'vtk.js/Sources/Interaction/Style/InteractorStyleManipulator';
import vtkGestureCameraManipulator from 'vtk.js/Sources/Interaction/Manipulators/GestureCameraManipulator';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';
import vtkMouseCameraTrackballPanManipulator from 'vtk.js/Sources/Interaction/Manipulators/MouseCameraTrackballPanManipulator';
import vtkMouseCameraTrackballRollManipulator from 'vtk.js/Sources/Interaction/Manipulators/MouseCameraTrackballRollManipulator';
import vtkMouseCameraTrackballZoomManipulator from 'vtk.js/Sources/Interaction/Manipulators/MouseCameraTrackballZoomManipulator';
import vtkMouseCameraTrackballRotateManipulator from 'vtk.js/Sources/Interaction/Manipulators/MouseCameraTrackballRotateManipulator';
import vtkMouseCameraTrackballZoomToMouseManipulator from 'vtk.js/Sources/Interaction/Manipulators/MouseCameraTrackballZoomToMouseManipulator';
import vtkMouseCameraTrackballMultiRotateManipulator from 'vtk.js/Sources/Interaction/Manipulators/MouseCameraTrackballMultiRotateManipulator';

// 渲染准备
export const Rendering = (model, container) => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        background: [0, 0, 0],
        rootContainer: container.current,
        containerStyle: { "border": null, "width": "100%", "height": "100%", "minHeight": "100px", "minWidth": "100px" },
    });
    let renderer = fullScreenRenderer.getRenderer();
    //关闭双面照明
    renderer.setTwoSidedLighting(false);
    renderer.setLightFollowCamera(true);
    let renderWindow = fullScreenRenderer.getRenderWindow();
    const interactorStyle = vtkInteractorStyleManipulator.newInstance();
    model.interactorStyle = interactorStyle;
    model.interactor = fullScreenRenderer.getInteractor()
    model.interactor.setInteractorStyle(interactorStyle);

    // -----------------------------------------------------------
    // UI control handling
    // -----------------------------------------------------------

    const uiComponents = {};
    const selectMap = {
        leftButton: { button: 1 },
        // middleButton: { button: 2 },
        // rightButton: { button: 3 },
        scrollMiddleButton: { scrollEnabled: true, dragEnabled: false },
    };

    const manipulatorFactory = {
        None: null,
        Pan: vtkMouseCameraTrackballPanManipulator,
        Zoom: vtkMouseCameraTrackballZoomManipulator,
        Roll: vtkMouseCameraTrackballRollManipulator,
        Rotate: vtkMouseCameraTrackballRotateManipulator,
        MultiRotate: vtkMouseCameraTrackballMultiRotateManipulator,
        ZoomToMouse: vtkMouseCameraTrackballZoomToMouseManipulator,
    };

    uiComponents["leftButton"] = { manipName: "Rotate" }
    uiComponents["scrollMiddleButton"] = { manipName: "Zoom" }

    model.uiComponents = uiComponents;
    model.selectMap = selectMap;
    model.manipulatorFactory = manipulatorFactory;
    model.fullScreenRenderer = fullScreenRenderer;
    model.renderer = renderer;
    model.renderWindow = renderWindow;
};

//截图功能
export function Screen(element) {
    const newCanvas = document.createElement("canvas");
    const dom_width = parseInt(window.getComputedStyle(element).width);
    const dom_height = parseInt(window.getComputedStyle(element).height);
    //将canvas画布放大若干倍，然后盛放在较小的容器内，就显得不模糊了
    newCanvas.width = dom_width;
    newCanvas.height = dom_height;
    newCanvas.style.width = dom_width + "px";
    newCanvas.style.height = dom_height + "px";
    html2canvas(element, {
        canvas: newCanvas,
        useCORS: true,
        imageTimeout: 1000,
    }).then((canvas) => {
        const imgUri = canvas.toDataURL("image/png") // 获取生成的图片的url
        const base64ToBlob = (code) => {
            let parts = code.split(';base64,');
            let contentType = parts[0].split(':')[1];
            let raw = window.atob(parts[1]);
            let uInt8Array = new Uint8Array(raw.length);

            for (let i = 0; i < raw.length; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            return new Blob([uInt8Array], { type: contentType });
        };
        const blob = base64ToBlob(imgUri);
        // window.location.href = imgUri; // 下载图片
        // 利用createObjectURL，模拟文件下载
        var today = new Date();
        const pngName = today.getDate() + '-' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds() + '.png';
        if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, pngName);
        } else {
            const blobURL = window.URL.createObjectURL(blob)
            const vlink = document.createElement('a');
            vlink.style.display = 'none';
            vlink.href = blobURL;
            vlink.setAttribute('download', pngName);

            if (typeof vlink.download === 'undefined') {
                vlink.setAttribute('target', '_blank');
            }

            document.body.appendChild(vlink);

            var evt = document.createEvent("MouseEvents");
            evt.initEvent("click", false, false);
            vlink.dispatchEvent(evt);

            document.body.removeChild(vlink);
            window.URL.revokeObjectURL(blobURL);
        }
    });
}

//gl上下文
export const gl = (OpenGlRW) => {
    OpenGlRW.initialize();
    let gl = OpenGlRW.getShaderCache().getContext();
    gl.flush();
}

// ScalsrBar
export const scalarBar = (model, scalar, mode, container1) => {
    const fullScreenRenderer1 = vtkFullScreenRenderWindow.newInstance({
        background: [0, 0, 0],
        rootContainer: container1.current,
        containerStyle: { "border": null, "width": "50px", "height": "146%", "position": "absolute", "top": "-23%" },
    });
    let renderer1 = fullScreenRenderer1.getRenderer();
    let renderWindow1 = fullScreenRenderer1.getRenderWindow();

    const planeSource = vtkPlaneSource.newInstance();
    const mapper1 = vtkMapper.newInstance();
    const scalarBars = vtkActor.newInstance();
    mapper1.setInputConnection(planeSource.getOutputPort());
    scalarBars.setMapper(mapper1);
    planeSource.set({ "xResolution": 1 });
    planeSource.set({ "yResolution": scalar.length - 1 });
    let polydata = mapper1.getInputData().getState()
    let pointScalar = [];
    for (let i = 0; i < scalar.length; i++) {
        pointScalar.push(scalar[i], scalar[i]);
    }
    polydata.pointData = {
        vtkClass: 'vtkDataSetAttributes',
        activeScalars: 0,
        arrays: [{
            data: {
                vtkClass: 'vtkDataArray',
                name: 'pointScalars',
                dataType: 'Float32Array',
                values: pointScalar,
            },
        }],
    }
    mapper1.setInputData(vtk(polydata));
    mapper1.setScalarRange(scalar[0], scalar[scalar.length - 1])
    const lut = vtkColorTransferFunction.newInstance();
    const preset = vtkColorMaps.getPresetByName(mode);   //预设色标颜色样式
    lut.applyColorMap(preset);  //应用ColorMap
    lut.updateRange();
    mapper1.setLookupTable(lut)
    model.lookupTable1 = lut;
    renderer1.addActor(scalarBars);
    model.renderWindow1 = renderWindow1;
    const interactorStyle1 = vtkInteractorStyleManipulator.newInstance();
    fullScreenRenderer1.getInteractor().setInteractorStyle(interactorStyle1);
    renderer1.resetCamera();
    renderWindow1.render();
}

// 坐标
export const Axis = (model) => {

    function addColor(ds, r, g, b) {
        const size = ds.getPoints().getData().length;
        const rgbArray = new Uint8Array(size);
        let offset = 0;

        while (offset < size) {
            rgbArray[offset++] = r;
            rgbArray[offset++] = g;
            rgbArray[offset++] = b;
        }

        ds.getPointData().setScalars(
            vtkDataArray.newInstance({
                name: 'color',
                numberOfComponents: 3,
                values: rgbArray,
            })
        );
    }
    const axisX = ArrowSource.newInstance(
        {
            direction: [1.0, 0.0, 0.0],
            tipResolution: 50,
            tipRadius: 0.1,
            tipLength: 0.2,
            shaftResolution: 60,
            shaftRadius: 0.03,
            invert: false,
        }).getOutputData();;
    const Xbounds = axisX.getPoints().getBounds();
    const Xcenter = [
        -Xbounds[0],
        -(Xbounds[2] + Xbounds[3]) * 0.5,
        -(Xbounds[4] + Xbounds[5]) * 0.5,
    ];
    vtkMatrixBuilder
        .buildFromDegree()
        .translate(...Xcenter)
        .apply(axisX.getPoints().getData());
    addColor(axisX, 255, 0, 0);
    const axisY = ArrowSource.newInstance(
        {
            direction: [0.0, 1.0, 0.0],
            tipResolution: 50,
            tipRadius: 0.1,
            tipLength: 0.2,
            shaftResolution: 60,
            shaftRadius: 0.03,
            invert: false,
        }).getOutputData();;
    const Ybounds = axisY.getPoints().getBounds();
    const Ycenter = [
        -(Ybounds[0] + Ybounds[1]) * 0.5,
        -Ybounds[2],
        -(Ybounds[4] + Ybounds[5]) * 0.5,
    ];
    vtkMatrixBuilder
        .buildFromDegree()
        .translate(...Ycenter)
        .apply(axisY.getPoints().getData());
    addColor(axisY, 255, 255, 0);
    const axisZ = ArrowSource.newInstance({
        direction: [0.0, 0.0, 1.0],
        tipResolution: 50,
        tipRadius: 0.1,
        tipLength: 0.2,
        shaftResolution: 60,
        shaftRadius: 0.03,
        invert: false,
    }).getOutputData();;
    const Zbounds = axisZ.getPoints().getBounds();
    const Zcenter = [
        -(Zbounds[0] + Zbounds[1]) * 0.5,
        -(Zbounds[2] + Zbounds[3]) * 0.5,
        -Zbounds[4],
    ];
    vtkMatrixBuilder
        .buildFromDegree()
        .translate(...Zcenter)
        .apply(axisZ.getPoints().getData());
    addColor(axisZ, 0, 128, 0);
    const source = vtkAppendPolyData.newInstance();
    source.setInputData(axisX);
    source.addInputData(axisY);
    source.addInputData(axisZ);
    const mapper = vtkMapper.newInstance();
    mapper.setInputConnection(source.getOutputPort());
    const axis = vtkActor.newInstance();
    axis.setMapper(mapper);
    const orientationWidget = vtkOrientationMarkerWidget.newInstance({
        actor: axis,
        interactor: model.renderWindow.getInteractor(),
    });
    model.orientationWidget = orientationWidget;
    orientationWidget.setViewportCorner(
        vtkOrientationMarkerWidget.Corners.BOTTOM_LEFT
    );
    orientationWidget.setViewportSize(0.15);
    orientationWidget.setMinPixelSize(100);
    orientationWidget.setMaxPixelSize(300);
};

// 修改鼠标默认事件
export const reassignManipulators = (model) => {
    if (model.interactorStyle) {
        model.interactorStyle.removeAllMouseManipulators();
        Object.keys(model.uiComponents).forEach((keyName) => {
            const klass = model.manipulatorFactory[model.uiComponents[keyName].manipName];
            if (klass) {
                const manipulator = klass.newInstance();
                manipulator.setButton(model.selectMap[keyName].button);
                if (model.selectMap[keyName].scrollEnabled !== undefined) {
                    manipulator.setScrollEnabled(model.selectMap[keyName].scrollEnabled);
                }
                if (model.selectMap[keyName].dragEnabled !== undefined) {
                    manipulator.setDragEnabled(model.selectMap[keyName].dragEnabled);
                }
                model.interactorStyle.addMouseManipulator(manipulator);
            }
        });
        // Always add gesture
        model.interactorStyle.addGestureManipulator(
            vtkGestureCameraManipulator.newInstance()
        );
    }

};

//改变显示模式
export const changeManipulators = (model, opt, keydown, useLight, useAxis) => {

    //显示实体单元、网格或点
    if (keydown === "R") {
        if (model.renderer) {
            model.renderer.resetCamera();
            model.renderWindow.render();
        }
    } else if (keydown === "W") {
        if (model.renderer) {
            let ac = model.renderer.getActors();
            ac.forEach((anActor) => {
                anActor.getProperty().setRepresentationToWireframe();
            });
            model.renderWindow.render();
        }
    } else if (keydown === "S") {
        if (model.renderer) {
            let ac = model.renderer.getActors();
            ac.forEach((anActor) => {
                anActor.getProperty().setRepresentationToSurface();
            });
            model.renderWindow.render();
        }
    } else if (keydown === "V") {
        if (model.renderer) {
            let ac = model.renderer.getActors();
            ac.forEach((anActor) => {
                anActor.getProperty().setRepresentationToPoints();
            });
            model.renderWindow.render();
        }
    };

    //光照
    if (useLight) {
        if (model.renderer) {
            let Light = vtkLight.newInstance();
            Light.setLightTypeToHeadLight();
            Light.setTransformMatrix(vtkMatrixBuilder
                .buildFromDegree()
                .translate(...model.renderer.getActors()[0].getCenter()))
            Light.setPositional(true);
            model.renderer.addLight(Light);
            console.log(model.renderer);
            Light.setTransformMatrix(vtkMatrixBuilder.buildFromDegree());
            model.renderWindow.getInteractor().onMouseMove((callData) => {
                let a1 = model.renderWindow.getViews()[0].displayToWorld(callData.position.x, callData.position.y, 10, model.renderer)
                let pos = model.renderer.worldToView(a1[0], a1[1], a1[2]);
                pos[2] = model.renderer.getActiveCamera().getPosition()[2];
                Light.setPosition(pos);
                Light.setColor([0, 0, 1]);
                Light.setConeAngle(10);
                Light.setFocalPoint([0, 0, 0]);
                Light.setShadowAttenuation(1);
                model.renderWindow.render();
            });
            model.Light = Light;
        }
    } else {
        if (model.renderer) {
            model.renderer.removeLight(model.Light);
            model.renderWindow.render();
            model.Light = null;
        }
    }

    //显示坐标系
    if (model.fullScreenRenderer) {
        if (useAxis) {
            model.orientationWidget.setEnabled(true);
            model.renderWindow.render();
        } else {
            model.orientationWidget.setEnabled(false);
            model.renderWindow.render();
        };
    }

    //改变鼠标事件
    if (opt === "Rotate") {
        if (model.uiComponents) {
            model.uiComponents["leftButton"] = { manipName: "Rotate" };
            model.uiComponents["scrollMiddleButton"] = { manipName: "Zoom" };
        }
    } else if (opt === "Roll") {
        if (model.uiComponents) {
            model.uiComponents["leftButton"] = { manipName: "Roll" };
            model.uiComponents["scrollMiddleButton"] = { manipName: "Zoom" };
        }
    } else if (opt === "Pan") {
        if (model.uiComponents) {
            model.uiComponents["leftButton"] = { manipName: "Pan" };
            model.uiComponents["scrollMiddleButton"] = { manipName: "Zoom" };
        }
    } else if (opt === "Zoom") {
        if (model.uiComponents) {
            model.uiComponents["scrollMiddleButton"] = { manipName: "Zoom" };
        }
    } else {
        if (model.uiComponents) {
            model.uiComponents["leftButton"] = { manipName: "Rotate" };
            model.uiComponents["scrollMiddleButton"] = { manipName: "Zoom" };
        }
    };
    reassignManipulators(model);
}

//显示边框
export const showBounds = (bounds, model, container, polydata) => {
    if (bounds) {
        model.interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
        const textCanvas = document.createElement('canvas');
        textCanvas.style.position = "absuloat";
        textCanvas.classList.add(style.container, 'textCanvas');
        container.current.children[0].appendChild(textCanvas);
        let dims = document.querySelector(".vtk-container").getBoundingClientRect();
        textCanvas.setAttribute('width', dims.width);
        textCanvas.setAttribute('height', dims.height);
        let textCtx = textCanvas.getContext('2d');
        const outline = vtkOutlineFilter.newInstance();
        outline.setInputData(polydata);
        const mapper = vtkMapper.newInstance();
        mapper.setInputConnection(outline.getOutputPort());

        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);
        actor.getProperty().set({ lineWidth: 1 });
        model.bounds = actor;
        const psMapper = vtkPixelSpaceCallbackMapper.newInstance();
        psMapper.setInputConnection(outline.getOutputPort());
        psMapper.setCallback((coordsList) => {
            textCtx.clearRect(0, 0, dims.width, dims.height);
            coordsList.forEach((xy, idx) => {
                textCtx.font = '12px serif';
                textCtx.fillStyle = "#fff"
                textCtx.textAlign = 'center';
                textCtx.textBaseline = 'middle';
                textCtx.fillText(`(${xy})`, xy[0], dims.height - xy[1]);
            });
        });

        const textActor = vtkActor.newInstance();
        textActor.setMapper(psMapper);
        model.renderer.addActor(textActor);
        model.renderer.addActor(actor);
    } else {
        if (document.querySelector('.textCanvas')) container.current.children[0].removeChild(document.querySelector('.textCanvas'))
        model.renderer.removeActor(model.bounds);
    }
}
//显示矢量
export const showVector = (vector, model, points, vectorData, lut1, min, max, ArrowSize) => {
    if (vector === true) {
        let vector = vtk({
            vtkClass: 'vtkPolyData',
            points: {
                vtkClass: 'vtkPoints',
                dataType: 'Float32Array',
                numberOfComponents: 3,
                values: points,
            },
            pointData: {
                vtkClass: 'vtkDataSetAttributes',
                activeScalars: 0,
                arrays: [{
                    data: {
                        vtkClass: 'vtkDataArray',
                        name: 'pointVectors',
                        dataType: 'Float32Array',
                        numberOfComponents: 3,
                        values: vectorData,
                    },
                }],
            }
        });
        const vecMapper1 = vtkGlyph3DMapper.newInstance();
        vecMapper1.setLookupTable(lut1);
        vecMapper1.setInputData(vector, 0);
        const arrowSource = vtkArrowSource.newInstance();
        vecMapper1.setInputConnection(arrowSource.getOutputPort(), 1);
        vecMapper1.setOrientationArray('pointVectors');
        vecMapper1.setScalarRange(min, max);
        vecMapper1.setScaleFactor(ArrowSize)
        const vecActor1 = vtkActor.newInstance();
        vecActor1.setMapper(vecMapper1);
        model.renderer.addActor(vecActor1);
        model.vectorActor = vecActor1;
    } else {
        if (model.vectorActor) {
            model.renderer.removeActor(model.vectorActor);
        }
    }
}
//读取json
export const readJson = (filePath, _this, fileName, type) => {
    let xhr = new XMLHttpRequest()
    xhr.open('GET', '/data' + filePath, true);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onreadystatechange = (e) => {
        if (xhr.readyState === 2) {
            var dom = document.createElement('div');
            dom.setAttribute('id', 'loading');
            document.getElementsByClassName('vtk-view')[0].appendChild(dom);
            ReactDOM.render(<Spin tip="加载中..." size="large" />, dom);
        }
        if (xhr.readyState === 4) {
            cookie.save('filename', fileName);
            _this.setState({
                fileName: fileName,
                data: {
                    data: xhr.response,
                    type: type
                }
            });
            document.getElementsByClassName('vtk-view')[0].removeChild(document.getElementById('loading'));
        }
    };
}