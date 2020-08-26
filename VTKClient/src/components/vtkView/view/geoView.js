/**
 文件名：geoView.js
 作者：鲁杨飞
 创建时间：2020/8/24
 文件描述：钻孔数据渲染逻辑。
 */
import axios from 'axios'
import { goUrl } from '../../../url';
import { Input, Button } from "antd";
import vtk from 'vtk.js/Sources/vtk';
import Draggable from 'react-draggable';
import React, { Component } from 'react';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkOutlineFilter from 'vtk.js/Sources/Filters/General/OutlineFilter';
import vtkCylinderSource from 'vtk.js/Sources/Filters/Sources/CylinderSource';
import vtkDataSet from 'vtk.js/Sources/Common/DataModel/DataSet';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import { randomPoint } from '@turf/random';
import { point } from '@turf/helpers';
import tin from '@turf/tin';
import vtkWindowedSincPolyDataFilter from 'vtk.js/Sources/Filters/General/WindowedSincPolyDataFilter';
const InputGroup = Input.Group;
const { FieldDataTypes } = vtkDataSet;
export default class Geo extends Component {
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
            type: "",
            value: 0,
            typeList: ["BoundingBox", "vtkCylinder",],
            mode: "rainbow",
        }
        this.container = React.createRef();
    };

    //渲染方法
    result = () => {
        let { model } = this.state;
        let vtkBox = document.getElementsByClassName('vtk-container')[0];
        if (vtkBox) {
            vtkBox.innerHTML = null;
        }
        const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
            background: [0, 0, 0],
            rootContainer: this.container.current,
            containerStyle: { "border": null, "width": "100%", "height": "100%", "minHeight": "100px", "minWidth": "100px" },
        });
        const renderer = fullScreenRenderer.getRenderer();
        const renderWindow = fullScreenRenderer.getRenderWindow();
        model.renderer = renderer;
        model.renderWindow = renderWindow;
        model.fullScreenRenderer = fullScreenRenderer;
        //钻孔数据
        const x = [505839, 504622, 508499, 508098, 506826, 507085];
        const y = [3613064, 3612114, 3610544, 3612204, 3611363, 3609715];
        const z1 = [3.05, 5.20, 1.25, 3.40, 2.12, 4.78, 3.20, 1.58, 1.68, 1.24, .76, .79, .35, 1.50], //   14   31m
            z2 = [3.68, .32, 1.50, 1.63, 8.87, 1.17, 2.43, 4.34, 3.71, 1.88, .47],     //11    30m
            z3 = [2.50, 1.82, 4.18, .76, .97, 3.87, 4.67, 1.88, 2.95, 3.40, .60, .26, 2.74],    //13   30.6m
            z4 = [.25, 1.30, 3.95, 1.90, .75, .75, 7.40, .85, 1.83, 2.00, 1.58, .74, 1.30, .59, .88, 1.70, .60, .99, 2.64],        //19    31m
            z5 = [17.00, 3.90, 2.15, 4.57, 2.48, 3.40],                                       //6    33.5m
            z6 = [8.00, 2.61, 2.11, 1.15, 1.53, 1.60, 1.50, 1.95, .79, 4.00, 2.46, 1.92, 1.38];    //13    31m
        //创建场景
        let bounds = [Math.min(...x), Math.min(...y), 0, Math.max(...x), Math.max(...y), 350];
        var pt = randomPoint(5000, { bbox: [Math.min(...x), Math.min(...y), Math.max(...x), Math.max(...y)] });
        console.log(pt)
        //场景数据
        let polydata = vtk({
            vtkClass: 'vtkPolyData',
            points: {
                vtkClass: 'vtkPoints',
                dataType: 'Float32Array',
                numberOfComponents: 3,
                values: [bounds[0], bounds[1], bounds[2], bounds[0], bounds[1], bounds[5], bounds[0], bounds[4], bounds[2], bounds[0], bounds[4], bounds[5], bounds[3], bounds[1], bounds[2], bounds[3], bounds[4], bounds[2], bounds[3], bounds[4], bounds[5], bounds[3], bounds[1], bounds[5]],
            },
            polys: {
                vtkClass: 'vtkCellArray',
                dataType: "Float32Array",
                values: [4, 0, 1, 2, 3, 4, 4, 5, 6, 7, 4, 0, 4, 5, 1, 4, 1, 5, 6, 2, 4, 2, 6, 7, 3, 4, 3, 7, 4, 0],
            },
        })
        const outline = vtkOutlineFilter.newInstance();
        outline.setInputData(polydata);
        const mapper = vtkMapper.newInstance();
        mapper.setInputConnection(outline.getOutputPort());

        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);
        actor.getProperty().set({ lineWidth: 1 });
        model.bounds = actor;
        model.renderer.addActor(actor);

        //创建钻井模型
        let H = 0;
        //zk1
        for (let i = 0; i < z1.length; i++) {
            if (i === 0) H = 0;
            let opt = {
                "center": [x[0], y[0], H + z1[i] * 5],
                "height": z1[i] * 10,
                "radius": 5,
                "direction": [0, 0, 1],
                "color": z1[i]
            }
            let opt1 = {
                "center": [x[0], y[0], H + z1[i] * 10],
                "height": 2,
                "radius": 25,
                "direction": [0, 0, 1],
                "color": z1[i]
            }
            H += z1[i] * 10;
            createCylinderPipeline(model, opt);
            createCylinderPipeline(model, opt1);
        };
        //zk2
        for (let i = 0; i < z2.length; i++) {
            if (i === 0) H = 0;
            let opt = {
                "center": [x[1], y[1], H + z2[i] * 5],
                "height": z2[i] * 10,
                "radius": 5,
                "direction": [0, 0, 1],
                "color": z2[i]
            }
            let opt1 = {
                "center": [x[1], y[1], H + z2[i] * 10],
                "height": 2,
                "radius": 25,
                "direction": [0, 0, 1],
                "color": z2[i]
            }
            H += z2[i] * 10;
            createCylinderPipeline(model, opt);
            createCylinderPipeline(model, opt1);
        }
        //zk3
        for (let i = 0; i < z3.length; i++) {
            if (i === 0) H = 0;
            let opt = {
                "center": [x[2], y[2], H + z3[i] * 5],
                "height": z3[i] * 10,
                "radius": 5,
                "direction": [0, 0, 1],
                "color": z3[i]
            }
            let opt1 = {
                "center": [x[2], y[2], H + z3[i] * 10],
                "height": 2,
                "radius": 25,
                "direction": [0, 0, 1],
                "color": z3[i]
            }
            H += z3[i] * 10;
            createCylinderPipeline(model, opt);
            createCylinderPipeline(model, opt1);
        }
        //zk4
        for (let i = 0; i < z4.length; i++) {
            if (i === 0) H = 0;
            let opt = {
                "center": [x[3], y[3], H + z4[i] * 5],
                "height": z4[i] * 10,
                "radius": 5,
                "direction": [0, 0, 1],
                "color": z4[i]
            }
            let opt1 = {
                "center": [x[3], y[3], H + z4[i] * 10],
                "height": 2,
                "radius": 25,
                "direction": [0, 0, 1],
                "color": z4[i]
            }
            H += z4[i] * 10;
            createCylinderPipeline(model, opt);
            createCylinderPipeline(model, opt1);
        }
        //zk5
        for (let i = 0; i < z5.length; i++) {
            if (i === 0) H = 0;
            let opt = {
                "center": [x[4], y[4], H + z5[i] * 5],
                "height": z5[i] * 10,
                "radius": 5,
                "direction": [0, 0, 1],
                "color": z5[i]
            }
            let opt1 = {
                "center": [x[4], y[4], H + z5[i] * 10],
                "height": 2,
                "radius": 25,
                "direction": [0, 0, 1],
                "color": z5[i]
            }
            H += z5[i] * 10;
            createCylinderPipeline(model, opt);
            createCylinderPipeline(model, opt1);
        }
        //zk6
        for (let i = 0; i < z6.length; i++) {
            if (i === 0) H = 0;
            let opt = {
                "center": [x[5], y[5], H + z6[i] * 5],
                "height": z6[i] * 10,
                "radius": 5,
                "direction": [0, 0, 1],
                "color": z6[i]
            }
            let opt1 = {
                "center": [x[5], y[5], H + z6[i] * 10],
                "height": 2,
                "radius": 25,
                "direction": [0, 0, 1],
                "color": z6[i]
            }
            H += z6[i] * 10;
            createCylinderPipeline(model, opt);
            createCylinderPipeline(model, opt1);
        }

        //创建圆柱方法;
        function createCylinderPipeline(model, opt) {
            const cylinderSource = vtkCylinderSource.newInstance(opt);
            const actor = vtkActor.newInstance();
            const mapper = vtkMapper.newInstance();
            const mapper1 = vtkMapper.newInstance();
            cylinderSource.setResolution(60);
            mapper.setInputConnection(cylinderSource.getOutputPort());
            let cellData = [];
            for (let i = 0; i < mapper.getInputData().getNumberOfCells(); i++) {
                cellData[i] = opt.color;
            }
            let polydata = mapper.getInputData().getState();
            polydata["cellData"] = {
                vtkClass: 'vtkDataSetAttributes',
                activeScalars: 0,
                arrays: [{
                    data: {
                        vtkClass: 'vtkDataArray',
                        name: 'pointScalars',
                        dataType: 'Float32Array',
                        values: cellData,
                    },
                }],
            }
            mapper1.setInputData(vtk(polydata));
            mapper1.setScalarRange(0, 20);
            const lut = vtkColorTransferFunction.newInstance();
            const preset = vtkColorMaps.getPresetByName("rainbow");   //预设色标颜色样式
            lut.applyColorMap(preset);  //应用ColorMap
            lut.updateRange();
            mapper1.setLookupTable(lut)
            actor.setMapper(mapper1);
            model.renderer.addActor(actor);
            return { cylinderSource, mapper, actor };
        }
        let points = [[504622, 3612114, 104.0], [508499, 3610544, 95.5], [505839, 3613064, 158.8], [508098, 3612204, 120.2], [507085, 3609715, 97.0], [506826, 3611363, 97.6]];
        let cell = [[3, 1, 4], [5, 3, 4], [2, 3, 5], [0, 2, 5]];

        for (var i = 0; i < pt.features.length; i++) {
            pt.features[i].geometry.coordinates.push(100);
            pt.features[i].properties.index = i;
        }
        var tins = tin(pt);
        let triangle = tins.features;
        let tp = [], tc = [], td = [];
        for (let i = 0; i < triangle.length; i++) {
            tp = tp.concat(triangle[i].geometry.coordinates[0][0], triangle[i].geometry.coordinates[0][1], triangle[i].geometry.coordinates[0][2]);
            tc.push(3, i * 3, i * 3 + 1, i * 3 + 2);
            td.push(triangle[i].geometry.coordinates[0][0][2], triangle[i].geometry.coordinates[0][1][2], triangle[i].geometry.coordinates[0][2][2])
        }
        // console.log(tp)
        const polys = vtk({
            vtkClass: 'vtkPolyData',
            points: {
                vtkClass: 'vtkPoints',
                dataType: 'Float32Array',
                numberOfComponents: 3,
                values: tp,
            },
            polys: {
                vtkClass: 'vtkCellArray',
                dataType: "Float32Array",
                values: tc,
            }, 
            // pointData: {
            //     vtkClass: 'vtkDataSetAttributes',
            //     activeScalars: 0,
            //     arrays: [{
            //         data: {
            //             vtkClass: 'vtkDataArray',
            //             name: 'pointScalars',
            //             dataType: 'Float32Array',
            //             values: td,
            //         },
            //     }],
            // }
        });

        // const polydata1 = vtk({
        //     vtkClass: 'vtkPolyData',
        //     points: {
        //         vtkClass: 'vtkPoints',
        //         dataType: 'Float32Array',
        //         numberOfComponents: 3,
        //         values: [...points[0],...points[1],...points[2],...points[3],...points[4],...points[5],],
        //     },
        //     polys: {
        //         vtkClass: 'vtkCellArray',
        //         dataType: "Float32Array",
        //         values: [3, 3, 1, 4, 3, 5, 3, 4, 3, 2, 3, 5, 3, 0, 2, 5],
        //     },
        // });
        let cen = [(points[3][0] + points[4][0]) / 2, (points[3][1] + points[4][1]) / 2, (points[3][2] + points[4][2]) / 2];
        let cen1 = [(points[3][0] + cen[0]) / 2, (points[3][1] + cen[1]) / 2, (points[3][2] + cen[2]) / 2];
        let cen2 = [(cen[0] + points[4][0]) / 2, (cen[1] + points[4][1]) / 2, (cen[2] + points[4][2]) / 2];
        let cens = [(points[0][0] + points[3][0]) / 2, (points[0][1] + points[3][1]) / 2, (points[0][2] + points[3][2]) / 2];
        let cen3 = [(points[0][0] + cens[0]) / 2, (points[0][1] + cens[1]) / 2, (points[0][2] + cens[2]) / 2];
        let cen4 = [(cens[0] + points[3][0]) / 2, (cens[1] + points[3][1]) / 2, (cens[2] + points[3][2]) / 2];
        function bezier(p0, p1, p2, t) {
            return [((1 - t) ** 2) * p0[0] + 2 * t * (1 - t) * p1[0] + (t ** 2) * p2[0], ((1 - t) ** 2) * p0[1] + 2 * t * (1 - t) * p1[1] + (t ** 2) * p2[1], ((1 - t) ** 2) * p0[2] + 2 * t * (1 - t) * p1[2] + (t ** 2) * p2[2]]
        }
        let p = [], p1 = [];
        for (let i = 1; i < 10; i++) {
            p.push(bezier(points[1], cen2, points[5], i / 10));
            p.push(bezier(points[1], cen1, points[5], i / 10))
            p1.push(bezier(points[2], cen3, points[5], i / 10));
            p1.push(bezier(points[2], cen4, points[5], i / 10));
        }
        let arr = [], arr1 = [], arrP = [], arrP1 = [];
        arr = arr.concat(arr, p, points);
        arr1 = arr1.concat(arr1, p1, points);

        for (let i = 0; i < arr.length; i++) {
            arrP.push(...arr[i]);
            arrP1.push(...arr1[i])

        }
        const polydata2 = vtk({
            vtkClass: 'vtkPolyData',
            points: {
                vtkClass: 'vtkPoints',
                dataType: 'Float32Array',
                numberOfComponents: 3,
                values: arrP1,
            },
            polys: {
                vtkClass: 'vtkCellArray',
                dataType: "Float32Array",
                values: [3, 0, 1, 3, 3, 0, 3, 2, 3, 2, 3, 5, 3, 2, 5, 4, 3, 4, 5, 7, 3, 4, 7, 6, 3, 6, 7, 9, 3, 6, 9, 8, 3, 8, 9, 11, 3, 8, 11, 10, 3, 10, 11, 13, 3, 10, 13, 12, 3, 12, 13, 15, 3, 12, 15, 14, 3, 14, 15, 17,
                    3, 14, 17, 16, 3, 16, 17, 23, 3, 20, 1, 0, 3, 0, 20, 18, 3, 0, 2, 18, 3, 2, 4, 18, 3, 4, 6, 18, 3, 6, 8, 18, 3, 8, 10, 18, 3, 10, 12, 18, 3, 12, 14, 18, 3, 14, 16, 18, 3, 16, 23, 18,
                    3, 1, 20, 21, 3, 1, 3, 21, 3, 3, 5, 21, 3, 5, 7, 21, 3, 7, 9, 21, 3, 9, 11, 21, 3, 11, 13, 21, 3, 13, 15, 21, 3, 15, 17, 21, 3, 17, 23, 21],
            },
            pointData: {
                vtkClass: 'vtkDataSetAttributes',
                activeScalars: 0,
                arrays: [{
                    data: {
                        vtkClass: 'vtkDataArray',
                        name: 'pointScalars',
                        dataType: 'Float32Array',
                        values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    },
                }],
            }
        });
        console.log(polydata2);
        const polydata1 = vtk({
            vtkClass: 'vtkPolyData',
            points: {
                vtkClass: 'vtkPoints',
                dataType: 'Float32Array',
                numberOfComponents: 3,
                values: arrP,
            },
            polys: {
                vtkClass: 'vtkCellArray',
                dataType: "Float32Array",
                values: [4, 0, 1, 3, 2, 4, 2, 3, 5, 4, 4, 4, 5, 7, 6, 4, 6, 7, 9, 8, 4, 8, 9, 11, 10, 4, 10, 11, 13, 12, 4, 12, 13, 15, 14, 4, 14, 15, 17, 16, 3, 16, 17, 23, 3, 19, 1, 0,
                    3, 0, 19, 22, 3, 0, 2, 22, 3, 2, 4, 22, 3, 4, 6, 22, 3, 6, 8, 22, 3, 8, 10, 22, 3, 10, 12, 22, 3, 12, 14, 22, 3, 14, 16, 22, 3, 16, 23, 22,
                    3, 1, 19, 21, 3, 1, 3, 21, 3, 3, 5, 21, 3, 5, 7, 21, 3, 7, 9, 21, 3, 9, 11, 21, 3, 11, 13, 21, 3, 13, 15, 21, 3, 15, 17, 21, 3, 17, 23, 21],
            }, pointData: {
                vtkClass: 'vtkDataSetAttributes',
                activeScalars: 0,
                arrays: [{
                    data: {
                        vtkClass: 'vtkDataArray',
                        name: 'pointScalars',
                        dataType: 'Float32Array',
                        values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    },
                }],
            }
        });
        const mapper1 = vtkMapper.newInstance();
        mapper1.setInputData(polydata1);
        const actor1 = vtkActor.newInstance();
        actor1.setMapper(mapper1);
        // renderer.addActor(actor1);
        const mapper2 = vtkMapper.newInstance();
        mapper2.setInputData(polydata2);
        const actor2 = vtkActor.newInstance();
        actor2.setMapper(mapper2);
        // renderer.addActor(actor2);
        const smoothFilter = vtkWindowedSincPolyDataFilter.newInstance({
            nonManifoldSmoothing: 0,
            numberOfIterations: 10,
        });
        
        smoothFilter.setInputData(polys);
        model.smoothFilter = smoothFilter;
        const mapper3 = vtkMapper.newInstance();
        mapper3.setInputData(polys);
        const actor3 = vtkActor.newInstance();
        actor3.setMapper(mapper3);
        renderer.addActor(actor3);
        //渲染
        model.renderer.resetCamera();
        model.renderWindow.render();
    };
    //创建场景对象方法
    createActor = () => {
    }
    //保存场景对象
    saveData = () => {
        let { model } = this.state;
        let actors = model.renderer.getActors();
        let data = [];
        for (let i = 0; i < actors.length; i++) {
            data.push(actors[i].getMapper().getInputData().getState());
        }
        console.log(data);
        axios.post(goUrl + "/geoSave", {
            geoData: data,
            geoName: "geo1"
        }).then((res) => {
            console.log(res);
        })
    }
    //加载数据
    loadData = () => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', "/data/dicom/geology/geo1.json");
        xhr.responseType = 'json';
        xhr.send();
        xhr.onreadystatechange = (e) => {

            if (xhr.readyState === 4) {
                console.log(xhr.response);
            }
        };
    }
    componentDidMount() {
        let {model} = this.state;
        // [
        //     'numberOfIterations',
        //     'passBand',
        //     'featureAngle',
        //     'edgeAngle',
        //     'nonManifoldSmoothing',
        //     'featureEdgeSmoothing',
        //     'boundarySmoothing',
        // ].forEach((propertyName) => {
        //     document.querySelector(`.${propertyName}`).addEventListener('input', (e) => {
        //         let value;
        //         if (Number.isNaN(e.target.valueAsNumber)) {
        //             value = e.target.checked ? 1 : 0;
        //         } else {
        //             value = e.target.valueAsNumber;
        //         }
        //         if (propertyName === 'passBand') {
        //             // This formula maps:
        //             // 0.0  -> 1.0   (almost no smoothing)
        //             // 0.25 -> 0.1   (average smoothing)
        //             // 0.5  -> 0.01  (more smoothing)
        //             // 1.0  -> 0.001 (very strong smoothing)
        //             value = 10.0 ** (-4.0 * value);
        //         }
        //         model.smoothFilter.set({ [propertyName]: value });
        //         model.renderWindow.render();
        //         console.log({ [propertyName]: value });
        //     });
        // });
        this.result();
    };
    render() {
        return (
            <div>
                {/* <div style={{position: "absolute", left: "25px", top: "25px", backgroundColor: "white", borderRadius: "5px", listStyle: "none", padding: "5px 10px", margin: "0px", display: "block", border: "1px solid black", maxWidth:" calc(100vw - 70px)", maxHeight: "calc(100vh - 60px)", overflow: "auto"}}><table>
                    <tbody><tr>
                        <td>Iterations</td>
                        <td>
                            <input className="numberOfIterations" type="range" min="0" max="100" step="1" defaultValue="20" />
                        </td>
                    </tr>
                        <tr>
                            <td>Pass band</td>
                            <td>
                                <input className="passBand" type="range" min="0" max="2" step="0.001" defaultValue="0.25" />
                            </td>
                        </tr>
                        <tr>
                            <td>Feature Angle</td>
                            <td>
                                <input className="featureAngle" type="range" min="1" max="180" step="1" defaultValue="45" />
                            </td>
                        </tr>
                        <tr>
                            <td>Edge Angle</td>
                            <td>
                                <input className="edgeAngle" type="range" min="1" max="180" step="1" defaultValue="15" />
                            </td>
                        </tr>
                        <tr>
                            <td>Feature Edge Smoothing</td>
                            <td>
                                <input className="featureEdgeSmoothing" type="checkbox" />
                            </td>
                        </tr>
                        <tr>
                            <td>Boundary Smoothing</td>
                            <td>
                                <input className="boundarySmoothing" type="checkbox" />
                            </td>
                        </tr>
                        <tr>
                            <td>Non Manifold Smoothing</td>
                            <td>
                                <input className="nonManifoldSmoothing" type="checkbox" />
                            </td>
                        </tr>
                    </tbody></table>
                </div> */}
                {/* <Draggable handle=".handle"
                    defaultPosition={{ x: 0, y: 0 }}
                    position={null}
                    grid={[1, 1]}
                    scale={1}>
                    <div style={{ display: "block", position: "absolute", zIndex: "999", padding: "20px" }}>
                        <div style={{ width: "250px", position: "absolute", background: "#ccc", padding: "20px", lineHeight: "20px", display: "block" }}>
                            <span className="handle" style={{ display: "inline-block", width: "100%", textAlign: "center" }}>属性</span>
                            <InputGroup>
                                {/* <Row >
                                    <Col >Type:</Col >
                                </Row>
                                <Row >
                                    <Col >
                                        <Select
                                            className='type'
                                            showSearch
                                            style={{ width: 200, marginBottom: "10px" }}
                                            optionFilterProp="children"
                                            onChange={this.onChangeResValname}
                                            onSearch={this.onSearch}
                                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                            {
                                                typeList.map((item, index) => {
                                                    return (<Option key={index} value={item} >{item}</Option>)
                                                })
                                            }
                                        </Select>
                                    </Col >
                                </Row>
                                {
                                    type === "vtkCylinder" ? (
                                        <div>
                                            <Row >
                                                <Col >Center:</Col >
                                            </Row>
                                            <Row >
                                                <Col >
                                                    <Input className="positionx" type="text" style={{ width: "33.3%" }} defaultValue="0" />
                                                    <Input className="positiony" type="text" style={{ width: "33.3%" }} defaultValue="0" />
                                                    <Input className="positionz" type="text" style={{ width: "33.3%" }} defaultValue="0" />
                                                </Col >
                                            </Row>
                                            <Row >
                                                <Col >Direction:</Col >
                                            </Row>
                                            <Row >
                                                <Col >
                                                    <Input className="axisx" type="text" style={{ width: "33.3%" }} defaultValue="0" />
                                                    <Input className="axisy" type="text" style={{ width: "33.3%" }} defaultValue="0" />
                                                    <Input className="axisz" type="text" style={{ width: "33.3%" }} defaultValue="1" />
                                                </Col >
                                            </Row>
                                            <Row >
                                                <Col >Height:</Col >
                                            </Row>
                                            <Row >
                                                <Col >
                                                    <Input className="height" type="text" style={{ width: "50%" }} defaultValue="1" />
                                                </Col >
                                            </Row>
                                            <Row >
                                                <Col >Radius:</Col >
                                            </Row>
                                            <Row >
                                                <Col >
                                                    <Input className="radius" type="text" style={{ width: "50%" }} defaultValue="1" />
                                                </Col >
                                            </Row>
                                            <Row >
                                                <Col >Color:</Col >
                                            </Row>
                                            <Row >
                                                <Col >
                                                    <Input className="color" type="text" style={{ width: "50%" }} defaultValue="1" />
                                                </Col >
                                            </Row><br /></div>) : (
                                            <div>
                                                <Row >
                                                    <Col >minBounds:</Col >
                                                </Row>
                                                <Row >
                                                    <Col >
                                                        <Input className="minx" type="text" style={{ width: "33.3%" }} defaultValue="0" />
                                                        <Input className="miny" type="text" style={{ width: "33.3%" }} defaultValue="0" />
                                                        <Input className="minz" type="text" style={{ width: "33.3%" }} defaultValue="0" />
                                                    </Col >
                                                </Row>
                                                <Row >
                                                    <Col >maxBounds:</Col >
                                                </Row>
                                                <Row >
                                                    <Col >
                                                        <Input className="maxx" type="text" style={{ width: "33.3%" }} defaultValue="0" />
                                                        <Input className="maxy" type="text" style={{ width: "33.3%" }} defaultValue="0" />
                                                        <Input className="maxz" type="text" style={{ width: "33.3%" }} defaultValue="0" />
                                                    </Col >
                                                </Row><br />
                                            </div>
                                        )
                                } */}
                {/* <Button type="primary" onClick={() => this.createActor()}>create</Button>
                                <Button type="primary" onClick={() => this.saveData()}>save</Button>
                                <Button type="primary" onClick={() => this.loadData()}>load</Button>

                            </InputGroup>
                        </div>
                    </div>
                </Draggable> */}
                <div className="vtk-container" style={{ "height": "100vh", "minHeight": "100px", "minWidth": "100px" }} ref={this.container}></div>
            </div>
        )
    }
}
