/**
* 文件名：/common/index.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：模型渲染公共方法。
*/
import React from "react";
import { Spin } from "antd";
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import vtk from 'vtk.js/Sources/vtk';
import html2canvas from 'html2canvas';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkLight from 'vtk.js/Sources/Rendering/Core/Light';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import ArrowSource from 'vtk.js/Sources/Filters/Sources/ArrowSource';
import vtkMatrixBuilder from 'vtk.js/Sources/Common/Core/MatrixBuilder';
import vtkPlaneSource from 'vtk.js/Sources/Filters/Sources/PlaneSource';
import vtkArrowSource from 'vtk.js/Sources/Filters/Sources/ArrowSource';
// import vtkSphereSource from 'vtk.js/Sources/Filters/Sources/SphereSource';
import vtkGlyph3DMapper from 'vtk.js/Sources/Rendering/Core/Glyph3DMapper';
import vtkOutlineFilter from 'vtk.js/Sources/Filters/General/OutlineFilter';
import vtkAppendPolyData from 'vtk.js/Sources/Filters/General/AppendPolyData';
import style from 'vtk.js/Examples/Geometry/SpheresAndLabels/style.module.css';
import { FieldAssociations } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkOpenGLHardwareSelector from 'vtk.js/Sources/Rendering/OpenGL/HardwareSelector';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkPixelSpaceCallbackMapper from 'vtk.js/Sources/Rendering/Core/PixelSpaceCallbackMapper';
import vtkOrientationMarkerWidget from 'vtk.js/Sources/Interaction/Widgets/OrientationMarkerWidget';
import vtkInteractorStyleManipulator from 'vtk.js/Sources/Interaction/Style/InteractorStyleManipulator';
import vtkGestureCameraManipulator from 'vtk.js/Sources/Interaction/Manipulators/GestureCameraManipulator';
// import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';
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
export const changeManipulators = (model, opt, keydown, useLight, useAxis, scalar, mode, container1, lut, inputValue, polydata1, polydata2, min, max, Scalar) => {
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
    if (Scalar === true || Scalar === null) {
        if (container1.current.childElementCount >= 1) {
            container1.current.innerHTML = null;
            scalarBar(model, scalar, mode, container1);

        } else {
            scalarBar(model, scalar, mode, container1);
        }

    } else if (Scalar === false) {
        
    }

    //灯光
    if (useLight) {
        if (model.renderer) {
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
            let container = document.querySelectorAll(".vtk-container")[0];
            const Light = vtkLight.newInstance({
                color: [1, 1, 1],
                focalPoint: [0, 0, 0],
                positional: false,
                exponent: 1,
                coneAngle: 30,
                attenuationValues: [1, 0, 0],
                transformMatrix: null,
                lightType: 'HeadLight',
                shadowAttenuation: 1,
                direction: [0, 0, 0],
            })
            model.renderer.addLight(Light);
            model.Light = Light;
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
                Light.setPosition(worldPosition);
                model.renderWindow.render();
            };
            function processSelections(selections) {
                if (!selections || selections.length === 0) {
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
                // prop.getProperty().setColor(...GREEN);
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
            container.addEventListener('mousemove', throttleMouseHandler);
        }
    } else {
        if (model.renderer) {
            model.renderer.removeLight(model.Light);
            model.renderWindow.render();
            model.Light = null;
        }
    }

    //显示坐标系

    if (useAxis === true) {
        if (model.orientationWidget) {
            model.orientationWidget.setEnabled(true);
            model.renderWindow.render();
        }
    } else {
        if (model.orientationWidget) {
            model.orientationWidget.setEnabled(false);
            model.renderWindow.render();
        }
    };

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
    if (bounds === true) {
        if (document.querySelector('.textCanvas')) {
            container.current.children[0].removeChild(document.querySelector('.textCanvas'))
            model.renderer.removeActor(model.bounds);
        }
        // model.interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
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
        if (document.querySelector('.textCanvas')) {
            container.current.children[0].removeChild(document.querySelector('.textCanvas'))
            model.renderer.removeActor(model.bounds);
        }
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
            document.getElementsByClassName('views')[0].appendChild(dom);
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
            document.getElementsByClassName('views')[0].removeChild(document.getElementById('loading'));
        }
    };
}