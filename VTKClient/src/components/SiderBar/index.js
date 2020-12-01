/**
* 文件名：/SiderBar/index.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：侧边栏树状结构。
*/
import React from 'react';
import { Tree, Spin } from 'antd';
import { CarryOutOutlined } from '@ant-design/icons';
import axios from "../axios";
import ReactDOM from 'react-dom';

export default class Sider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  };

  // 侧边栏选中
  Select = (keys, event) => {
    let { getData } = this.props;
    if (event.node.title.split('.')[1] !== "vti" && event.node.title.split('.')[1] !== "tiff") {
      axios.post(global.baseUrl+'/vtkReadFile', { fileName: event.node.title, projectName: "3" })
        .then(function (response) {
          if (response.data.data) {
            getData({ "fileName": event.node.title, "data": response.data });
          } else if (response.data.type !== ".obj"&&response.data.filePath) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', '/data' + response.data.filePath, true);
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
                getData({
                  "fileName": event.node.title,
                  "data": {
                    "data": xhr.response,
                    "type": response.data.type
                  }
                });
                document.getElementsByClassName('vtk-view')[0].removeChild(document.getElementById('loading'));
              }
            };
          } else if (response.data.type === ".obj"){
            getData({ "fileName": event.node.title, "data": response.data });
          }

        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      getData({ "fileName": event.node.title, "data": { "type": '.vti' } });
    }

  };

  render() {
    //侧边栏数据
    const treeData = [
      {
        title: 'data',
        key: '0-0',
        icon: <CarryOutOutlined />,
        children: [
          {
            title: '.vtk',
            key: '0-0-0',
            selectable:false,
            icon: <CarryOutOutlined />,
            children: [
              { title: 'Fmesh.vtk', key: '0-0-0-0', icon: <CarryOutOutlined /> },
              { title: 'Fmesh1.vtk', key: '0-0-0-1', icon: <CarryOutOutlined /> },
              { title: 'ball.vtk', key: '0-0-0-2', icon: <CarryOutOutlined /> },
              { title: 'results_top_sph.flavia.vtk', key: '0-0-0-3', icon: <CarryOutOutlined /> },
              { title: '1_0.vtk', key: '0-0-0-4', icon: <CarryOutOutlined /> },
              { title: '1_1.vtk', key: '0-0-0-14', icon: <CarryOutOutlined /> },
              { title: '1_2.vtk', key: '0-0-0-5', icon: <CarryOutOutlined /> },
              { title: '1_3.vtk', key: '0-0-0-6', icon: <CarryOutOutlined /> },
              { title: '1_4.vtk', key: '0-0-0-7', icon: <CarryOutOutlined /> },
              { title: '1_5.vtk', key: '0-0-0-8', icon: <CarryOutOutlined /> },
              { title: '1_6.vtk', key: '0-0-0-9', icon: <CarryOutOutlined /> },
              { title: '1_7.vtk', key: '0-0-0-10', icon: <CarryOutOutlined /> },
              { title: '1_8.vtk', key: '0-0-0-11', icon: <CarryOutOutlined /> },
              { title: '1_9.vtk', key: '0-0-0-12', icon: <CarryOutOutlined /> },
              { title: '1_10.vtk', key: '0-0-0-13', icon: <CarryOutOutlined /> },
            ],
          },
          {
            title: '.inp',
            key: '0-0-1',
            selectable:false,
            icon: <CarryOutOutlined />,
            children: [{ title: 'AVS_fullmesh.inp', key: '0-0-1-0', icon: <CarryOutOutlined /> }],
          },
          {
            title: '.csv',
            key: '0-0-2',
            selectable:false,
            icon: <CarryOutOutlined />,
            children: [
              { title: 'dem.csv', key: '0-0-2-0', icon: <CarryOutOutlined /> },
              { title: 'sgy2d.csv', key: '0-0-2-1', icon: <CarryOutOutlined /> },
              { title: 'anhui.csv', key: '0-0-2-2', icon: <CarryOutOutlined /> },
              { title: 'anhui1.csv', key: '0-0-2-3', icon: <CarryOutOutlined /> },

            ],
          },
          {
            title: '.msh',
            key: '0-0-3',
            selectable:false,
            icon: <CarryOutOutlined />,
            children: [
              { title: 'P90.msh', key: '0-0-3-0', icon: <CarryOutOutlined /> },
              { title: 'AMG_F1_W10.msh', key: '0-0-3-1', icon: <CarryOutOutlined /> },
            ],
          },
          {
            title: '.flavia.msh',
            key: '0-0-4',
            selectable:false,
            icon: <CarryOutOutlined />,
            children: [
              { title: 'mesh.flavia.msh', key: '0-0-4-0', icon: <CarryOutOutlined /> },
              { title: 'mesh1.flavia.msh', key: '0-0-4-1', icon: <CarryOutOutlined /> },
              { title: 'greenland.flavia.msh', key: '0-0-4-2', icon: <CarryOutOutlined /> },
              { title: 'results.flavia.msh', key: '0-0-4-3', icon: <CarryOutOutlined /> },
              { title: 'greenland5km3d.flavia.msh', key: '0-0-4-4', icon: <CarryOutOutlined /> },
            ],
          },
          {
            title: '.post.msh',
            key: '0-0-5',
            selectable:false,
            icon: <CarryOutOutlined />,
            children: [
              { title: 'w42vtk.post.msh', key: '0-0-5-0', icon: <CarryOutOutlined /> },
              { title: 'gufeng.post.msh', key: '0-0-5-1', icon: <CarryOutOutlined /> },
              { title: 'damage.post.msh', key: '0-0-5-2', icon: <CarryOutOutlined /> },
              { title: 'damage1.post.msh', key: '0-0-5-3', icon: <CarryOutOutlined /> },
              { title: 'les.post.msh', key: '0-0-5-4', icon: <CarryOutOutlined /> },
              { title: 'les1.post.msh', key: '0-0-5-5', icon: <CarryOutOutlined /> },
              { title: 'les2.post.msh', key: '0-0-5-6', icon: <CarryOutOutlined /> },
              { title: 'dylkw.post.msh', key: '0-0-5-7', icon: <CarryOutOutlined /> },
            ],
          },
          {
            title: '.off',
            key: '0-0-6',
            selectable:false,
            icon: <CarryOutOutlined />,
            children: [
              { title: 'bathtub.off', key: '0-0-6-0', icon: <CarryOutOutlined /> },
              { title: 'bed.off', key: '0-0-6-1', icon: <CarryOutOutlined /> },
              { title: 'chair.off', key: '0-0-6-2', icon: <CarryOutOutlined /> },
              { title: 'desk.off', key: '0-0-6-3', icon: <CarryOutOutlined /> },
              { title: 'dresser.off', key: '0-0-6-4', icon: <CarryOutOutlined /> },
              { title: 'monitor.off', key: '0-0-6-5', icon: <CarryOutOutlined /> },
              { title: 'night_stand.off', key: '0-0-6-6', icon: <CarryOutOutlined /> },
              { title: 'sofa.off', key: '0-0-6-7', icon: <CarryOutOutlined /> },
              { title: 'city.off', key: '0-0-6-8', icon: <CarryOutOutlined /> },
              { title: 'bookshelf.off', key: '0-0-6-9', icon: <CarryOutOutlined /> },
              // { title: 'airplane.off', key: '0-0-6-10', icon: <CarryOutOutlined /> },
              { title: 'piano.off', key: '0-0-6-11', icon: <CarryOutOutlined /> },
              { title: 'plant.off', key: '0-0-6-12', icon: <CarryOutOutlined /> },
              { title: 'tent.off', key: '0-0-6-13', icon: <CarryOutOutlined /> },
            ],
          },
          {
            title: '.stl',
            key: '0-0-7',
            selectable:false,
            icon: <CarryOutOutlined />,
            children: [
              { title: 'model.stl', key: '0-0-7-0', icon: <CarryOutOutlined /> },
              { title: 'C_5.stl', key: '0-0-7-1', icon: <CarryOutOutlined /> },
              { title: 'Earth_Model.stl', key: '0-0-7-2', icon: <CarryOutOutlined /> },
              { title: 'panzerkampfwagen.stl', key: '0-0-7-3', icon: <CarryOutOutlined /> },
              { title: 'STATELLITE.stl', key: '0-0-7-4', icon: <CarryOutOutlined /> },
              { title: 'CityFinal.stl', key: '0-0-7-6', icon: <CarryOutOutlined /> },
              { title: 'pasteurizer.STL', key: '0-0-7-7', icon: <CarryOutOutlined /> },
              { title: 'Boeing 757S.STL', key: '0-0-7-8', icon: <CarryOutOutlined /> }
            ],
          },
          {
            title: '.vti',
            key: '0-0-8',
            selectable:false,
            icon: <CarryOutOutlined />,
            children: [
              { title: 'headsq.vti', key: '0-0-8-0', icon: <CarryOutOutlined /> },
              { title: 'LIDC2.vti', key: '0-0-8-1', icon: <CarryOutOutlined /> },
            ],
          },
          {
            title: '.tiff',
            key: '0-0-9',
            selectable:false,
            icon: <CarryOutOutlined />,
            children: [
              { title: 'images.tiff', key: '0-0-9-0', icon: <CarryOutOutlined /> },
              { title: 'manifest.tiff', key: '0-0-9-1', icon: <CarryOutOutlined /> },
            ],
          },
          {
            title: '.obj',
            key: '0-0-10',
            selectable:false,
            icon: <CarryOutOutlined />,
            children: [
              { title: 'Ensk_station.obj', key: '0-0-10-0', icon: <CarryOutOutlined /> },
              { title: 'Cesare.obj', key: '0-0-10-1', icon: <CarryOutOutlined /> },
            ],
          },
        ],
      },
    ];
    return (
      <Tree showLine defaultExpandedKeys={['0-0']} style={{ height: "100%" }} onSelect={this.Select} treeData={treeData} />
    );
  };
};