import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import React, { Component } from 'react';
import vtkPolyData from 'vtk.js/Sources/Common/DataModel/PolyData';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
export default class mshView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: '',
            data1: ''
        }
        this.container = React.createRef();
    };

    // 渲染
    result = () => {
        // const reader = vtkSTLReader.newInstance();


        // ----------------------------------------------------------------------------
        let _this = this;

        // ----------------------------------------------------------------------------
        // Use a file reader to load a local file
        // ----------------------------------------------------------------------------

        const myContainer = document.querySelector('.vtk-container');
        const fileContainer = document.createElement('div');
        fileContainer.innerHTML = '<input type="file" class="file"/>';
        myContainer.appendChild(fileContainer);

        const fileInput = fileContainer.querySelector('input');

        function handleFile(event) {
            event.preventDefault();
            const dataTransfer = event.dataTransfer;
            const files = event.target.files || dataTransfer.files;
            if (files.length === 1) {
                myContainer.removeChild(fileContainer);
                const fileReader = new FileReader();
                fileReader.onload = function onLoad(e) {
                    const parseAsArrayBuffer = (content) => {
                        if (!content) {
                            return;
                        }
                        // Binary parsing
                        function arrayBufferToString(arrayBuffer) {
                            if ('TextDecoder' in window) {
                                const decoder = new TextDecoder('latin1');
                                return decoder.decode(arrayBuffer);
                            }
                            // fallback on platforms w/o TextDecoder
                            const byteArray = new Uint8Array(arrayBuffer);
                            const strArr = [];
                            for (let i = 0; i < byteArray.length; ++i) {
                                strArr[i] = String.fromCharCode(byteArray[i]);
                            }
                            return strArr.join('');
                        }
                        function parseHeader(headerString) {
                            const headerSubStr = headerString.split(' ');
                            const fieldValues = headerSubStr.filter((e) => e.indexOf('=') > -1);

                            const header = {};
                            for (let i = 0; i < fieldValues.length; ++i) {
                                const fieldValueStr = fieldValues[i];
                                const fieldValueSubStr = fieldValueStr.split('=');
                                if (fieldValueSubStr.length === 2) {
                                    header[fieldValueSubStr[0]] = fieldValueSubStr[1];
                                }
                            }
                            return header;
                        }
                        //对字符串扩展
                        function ResetBlank(str) {
                            var regEx = /\s+/g;
                            return str.replace(regEx, ' ');
                        };
                        // Header
                        const headerData = content.slice(0, 100);
                        const headerStr = arrayBufferToString(headerData);
                        // let str = headerStr.slice(headerStr.indexOf("POINTS"), headerStr.indexOf("float") + 5)
                        // console.log(ResetBlank(str).split(" ")[1]);
                        const header = parseHeader(headerStr);

                        // Check if ascii format
                        const solidIndex = headerStr.indexOf('solid ');
                        if (solidIndex !== -1 && solidIndex < 10) {
                            const parseAsText = (content) => {
                                if (!content) {
                                    return;
                                }
                                const lines = content.split('\n');
                                let offset = 1;
                                const points = [];
                                const cellArray = [];
                                const cellNormals = [];

                                while (offset !== -1) {
                                    offset = readTriangle(lines, offset, points, cellArray, cellNormals);
                                }

                                const polydata = vtkPolyData.newInstance();
                                polydata.getPoints().setData(Float32Array.from(points), 3);
                                polydata.getPolys().setData(Uint32Array.from(cellArray));
                                polydata.getCellData().setNormals(
                                    vtkDataArray.newInstance({
                                        name: 'Normals',
                                        values: Float32Array.from(cellNormals),
                                        numberOfComponents: 3,
                                    })
                                );

                                // Add new output
                                // model.output[0] = polydata;
                            };
                            parseAsText(arrayBufferToString(content));
                            return;
                        }

                        // Data
                        const dataView = new DataView(content, 84);
                        console.log(dataView);

                        global.dataview = dataView;
                        const nbFaces = (content.byteLength - 84) / 50;
                        console.log(nbFaces);

                        const pointValues = new Float32Array(nbFaces * 9);
                        const normalValues = new Float32Array(nbFaces * 3);
                        const cellValues = new Uint32Array(nbFaces * 4);
                        const cellDataValues = new Uint16Array(nbFaces);
                        let cellOffset = 0;

                        for (let faceIdx = 0; faceIdx < nbFaces; faceIdx++) {
                            const offset = faceIdx * 50;
                            normalValues[faceIdx * 3 + 0] = dataView.getFloat32(offset + 0, true);
                            normalValues[faceIdx * 3 + 1] = dataView.getFloat32(offset + 4, true);
                            normalValues[faceIdx * 3 + 2] = dataView.getFloat32(offset + 8, true);

                            pointValues[faceIdx * 9 + 0] = dataView.getFloat32(offset + 12, true);
                            pointValues[faceIdx * 9 + 1] = dataView.getFloat32(offset + 16, true);
                            pointValues[faceIdx * 9 + 2] = dataView.getFloat32(offset + 20, true);
                            pointValues[faceIdx * 9 + 3] = dataView.getFloat32(offset + 24, true);
                            pointValues[faceIdx * 9 + 4] = dataView.getFloat32(offset + 28, true);
                            pointValues[faceIdx * 9 + 5] = dataView.getFloat32(offset + 32, true);
                            pointValues[faceIdx * 9 + 6] = dataView.getFloat32(offset + 36, true);
                            pointValues[faceIdx * 9 + 7] = dataView.getFloat32(offset + 40, true);
                            pointValues[faceIdx * 9 + 8] = dataView.getFloat32(offset + 44, true);

                            cellValues[cellOffset++] = 3;
                            cellValues[cellOffset++] = faceIdx * 3 + 0;
                            cellValues[cellOffset++] = faceIdx * 3 + 1;
                            cellValues[cellOffset++] = faceIdx * 3 + 2;

                            cellDataValues[faceIdx] = dataView.getUint16(offset + 48, true);
                        }

                        // Rotate points
                        const orientationField = 'SPACE';
                        if (orientationField in header && header[orientationField] !== 'LPS') {
                            const XYZ = header[orientationField];
                            const mat4 = new Float32Array(16);
                            mat4[15] = 1;
                            switch (XYZ[0]) {
                                case 'L':
                                    mat4[0] = 1;
                                    break;
                                case 'R':
                                    mat4[0] = -1;
                                    break;
                                default:
                                    vtkErrorMacro(
                                        `Can not convert STL file from ${XYZ} to LPS space: ` +
                                        `permutations not supported. Use itk.js STL reader instead.`
                                    );
                                    return;
                            }
                            switch (XYZ[1]) {
                                case 'P':
                                    mat4[5] = 1;
                                    break;
                                case 'A':
                                    mat4[5] = -1;
                                    break;
                                default:
                                    vtkErrorMacro(
                                        `Can not convert STL file from ${XYZ} to LPS space: ` +
                                        `permutations not supported. Use itk.js STL reader instead.`
                                    );
                                    return;
                            }
                            switch (XYZ[2]) {
                                case 'S':
                                    mat4[10] = 1;
                                    break;
                                case 'I':
                                    mat4[10] = -1;
                                    break;
                                default:
                                    vtkErrorMacro(
                                        `Can not convert STL file from ${XYZ} to LPS space: ` +
                                        `permutations not supported. Use itk.js STL reader instead.`
                                    );
                                    return;
                            }
                            vtkMatrixBuilder
                                .buildFromDegree()
                                .setMatrix(mat4)
                                .apply(pointValues)
                                .apply(normalValues);
                        }

                        const polydata = vtkPolyData.newInstance();
                        polydata.getPoints().setData(pointValues, 3);
                        polydata.getPolys().setData(cellValues);
                        polydata
                            .getCellData()
                            .setScalars(
                                vtkDataArray.newInstance({ name: 'Attribute', values: cellDataValues })
                            );
                        polydata.getCellData().setNormals(
                            vtkDataArray.newInstance({
                                name: 'Normals',
                                values: normalValues,
                                numberOfComponents: 3,
                            })
                        );

                        // Add new output
                        const mapper = vtkMapper.newInstance({ scalarVisibility: false });
                        const actor = vtkActor.newInstance();

                        actor.setMapper(mapper);
                        mapper.setInputData(polydata);
                        const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
                            background: [0, 0, 0],
                            rootContainer: _this.container.current,
                            containerStyle: { "border": null, "width": "100%", "height": "100%", "minHeight": "100px", "minWidth": "100px" },
                        });
                        const renderer = fullScreenRenderer.getRenderer();
                        const renderWindow = fullScreenRenderer.getRenderWindow();

                        const resetCamera = renderer.resetCamera;
                        const render = renderWindow.render;
                        console.log(polydata.getState())
                        renderer.addActor(actor);
                        resetCamera();
                        render();
                    };
                    parseAsArrayBuffer(fileReader.result);
                };
                fileReader.readAsArrayBuffer(files[0]);
            }
        }

        fileInput.addEventListener('change', handleFile);
    };

    componentDidMount() {
        this.result();
    };

    componentDidUpdate = (prevProps) => {
        let { useScreen } = this.props
        if (useScreen !== prevProps.useScreen) {
            if (document.getElementsByTagName("canvas").length > 0) {
                this.Screen(document.getElementsByTagName("canvas")[0])
            }
        }
    };

    //解决webgl上下文丢失问题
    gl = () => {
        let OpenGlRW = this.state.model.fullScreenRenderer.getOpenGLRenderWindow();
        OpenGlRW.initialize();
        let gl = OpenGlRW.getShaderCache().getContext();
        gl.flush();
    }

    render() {


        return (
            <div>
                {/* <Draggable handle=".pointPicker"
                    defaultPosition={{ x: 0, y: 0 }}
                    position={null}
                    grid={[1, 1]}
                    scale={1}>
                    <div style={{ display: displayBox2, position: "absolute", zIndex: "90", top: "20px", right: "20px" }}>
                        <div style={{ width: "350px", background: boxBgColor, padding: "20px", lineHeight: "20px", display: "block" }}>
                            <span className="pointPicker" style={{ display: "inline-block", width: "100%", textAlign: "center" }}>pointPicker</span>
                            <InputGroup>
                                <Row >
                                    <Col >Pick at:</Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Input className="picke1-1" type="text" style={{ width: "33%" }} value={p1[0]} />
                                        <Input className="picke1-2" type="text" style={{ width: "33%" }} value={p1[1]} />
                                        <Input className="picke1-3" type="text" style={{ width: "33%" }} value={p1[2]} />

                                    </Col >
                                </Row>
                                <Row style={{ display: pickerT }}>
                                    <Col >Picked point:</Col >
                                </Row>
                                <Row style={{ display: pickerT }}>
                                    <Col >
                                        <Input className="picke2" type="text" style={{ width: "30%" }} value={p2} />
                                    </Col >
                                </Row>
                                <Row style={{ display: pickerT }}>
                                    <Col >Picked:</Col >
                                </Row>
                                <Row style={{ display: pickerT }}>
                                    <Col >
                                        <Input className="picke3-1" type="text" style={{ width: "33%" }} value={p3[0]} />
                                        <Input className="picke3-2" type="text" style={{ width: "33%" }} value={p3[1]} />
                                        <Input className="picke3-3" type="text" style={{ width: "33%" }} value={p3[2]} />
                                    </Col >
                                </Row>
                                <Row style={{ display: pickerF }}>
                                    <Col >No point picked, default:</Col >
                                </Row>
                                <Row style={{ display: pickerF }}>
                                    <Col >
                                        <Input className="picke2-1" type="text" style={{ width: "33%" }} value={p4[0]} />
                                        <Input className="picke2-2" type="text" style={{ width: "33%" }} value={p4[1]} />
                                        <Input className="picke2-3" type="text" style={{ width: "33%" }} value={p4[2]} />
                                    </Col >
                                </Row>
                            </InputGroup>

                        </div>
                    </div>
                </Draggable>
                <Draggable handle=".cellPicker" */}
                {/* defaultPosition={{ x: 0, y: 0 }}
                    position={null}
                    grid={[1, 1]}
                    scale={1}>
                    <div style={{ display: displayBox3, position: "absolute", zIndex: "90", top: "250px", right: "20px" }}>
                        <div style={{ width: "350px", background: boxBgColor, padding: "20px", lineHeight: "20px", display: "block" }}>
                            <span className="cellPicker" style={{ display: "inline-block", width: "100%", textAlign: "center" }}>cellPicker</span>
                            <InputGroup>
                                <Row >
                                    <Col >Pick at:</Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Input className="picke21-1" type="text" style={{ width: "33%" }} value={c1[0]} />
                                        <Input className="picke21-2" type="text" style={{ width: "33%" }} value={c1[1]} />
                                        <Input className="picke21-3" type="text" style={{ width: "33%" }} value={c1[2]} />

                                    </Col >
                                </Row>
                                <Row style={{ display: picker2T }}>
                                    <Col >Picked cell:</Col >
                                </Row>
                                <Row style={{ display: picker2T }}>
                                    <Col >
                                        <Input className="picke22" type="text" style={{ width: "30%" }} value={c2} />
                                    </Col >
                                </Row>
                                <Row style={{ display: picker2T }}>
                                    <Col >Picked:</Col >
                                </Row>
                                <Row style={{ display: picker2T }}>
                                    <Col >
                                        <Input className="picke23-1" type="text" style={{ width: "33%" }} value={c3[0]} />
                                        <Input className="picke23-2" type="text" style={{ width: "33%" }} value={c3[1]} />
                                        <Input className="picke23-3" type="text" style={{ width: "33%" }} value={c3[2]} />
                                    </Col >
                                </Row>
                                <Row style={{ display: picker2F }}>
                                    <Col >No cell picked, default:</Col >
                                </Row>
                                <Row style={{ display: picker2F }}>
                                    <Col >
                                        <Input className="picke2-1" type="text" style={{ width: "33%" }} value={c4[0]} />
                                        <Input className="picke2-2" type="text" style={{ width: "33%" }} value={c4[1]} />
                                        <Input className="picke2-3" type="text" style={{ width: "33%" }} value={c4[2]} />
                                    </Col >
                                </Row>
                            </InputGroup>

                        </div>
                    </div>
                </Draggable> */}
                <div className="vtk-container" ref={this.container} style={{ "minHeight": "100px", "minWidth": "100px", "width": "100%", "height": "100vh" }} ></div>
            </div>
        )
    }
}
