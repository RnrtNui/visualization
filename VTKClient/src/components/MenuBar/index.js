/**
* 文件名：/MenuBar/index.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：顶部菜单栏部分。
* */
import React from 'react';
import { Layout, Tooltip } from "antd";
import '../../assets/IconFont/iconfont.css';
import '../../index.css';

// import html2canvas from 'html2canvas';
const { Header } = Layout;

export default class MenuBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      useAxis: false,
      display: "none",
      scalar: true,
      Screen: false,
      displayBar: 0,
      usePointPicker: false,
      useCellPicker: false,
      Light:false,
      bounds:false,
    };
  };

  keyDownR = (e) => {
    let { onButton } = this.props;
    e.preventDefault();
    onButton("R");
  };

  keyDownS = (e) => {
    let { onButton } = this.props;
    e.preventDefault();
    onButton("S");

  };

  keyDownW = (e) => {
    let { onButton } = this.props;
    e.preventDefault();
    onButton("W");

  };

  keyDownV = (e) => {
    let { onButton } = this.props;
    e.preventDefault();
    onButton("V");
  };

  changeAxis = () => {
    let { useAxis } = this.state;
    let { useAxi } = this.props;
    if (useAxis) {
      this.setState({
        useAxis: false
      });
      useAxi(false);
    } else {
      this.setState({
        useAxis: true
      });
      useAxi(true);
    }
  };
  usePointPicker = () => {
    let { usePointPicker } = this.state;
    let { usePointPic } = this.props;
    if (usePointPicker) {
      this.setState({
        usePointPicker: false
      });
      usePointPic(false);
    } else {
      this.setState({
        usePointPicker: true
      });
      usePointPic(true);
    }
  };

  useCellPicker = () => {
    let { useCellPicker } = this.state;
    let { useCellPic } = this.props;
    if (useCellPicker) {
      this.setState({
        useCellPicker: false
      });
      useCellPic(false);
    } else {
      this.setState({
        useCellPicker: true
      });
      useCellPic(true);
    }
  };

  setting = () => {
    let { display } = this.state;
    let { onShow } = this.props;
    if (display === "none") {
      this.setState({
        display: "block"
      });
      onShow("block");
    } else {
      this.setState({
        display: "none"
      });
      onShow("none");
    };
  };

  settingBar = () => {
    let { displayBar } = this.state;
    let { onShowBar } = this.props;
    if (displayBar === 0) {
      this.setState({
        displayBar: 1
      });
      onShowBar(1);
    } else {
      this.setState({
        displayBar: 0
      });
      onShowBar(0);
    }
  };

  onButtonRotate = () => {
    let { getOperation } = this.props;
    getOperation("Rotate");
  };

  onButtonRoll = () => {
    let { getOperation } = this.props;
    getOperation("Roll");
  };

  onButtonPan = () => {
    let { getOperation } = this.props;
    getOperation("Pan");
  };

  onButtonZoom = () => { //缩放
    let { getOperation } = this.props;
    getOperation("Zoom");
  };

  settingScalsr = () => {
    let { getScalar } = this.props;

    getScalar(!this.state.scalar);
    this.setState({
      scalar: !this.state.scalar
    })
  };

  settingLight = () => {
    let { useLight } = this.props;
    useLight(!this.state.Light);
    this.setState({
      Light: !this.state.Light
    })
  };
  
  Screen = () => {
    let { useScreen } = this.props;
    useScreen(!this.state.Screen);
    this.setState({
      Screen: !this.state.Screen
    })
  };

  setBounds = () => {
    let { showBounds } = this.props;
    showBounds(!this.state.bounds);
    this.setState({
      bounds: !this.state.bounds
    })
  }

  render() {
    return (
      <Header className="header" role="navigation" style={this.props.style}>
        <div className='command'>
          <Tooltip title='复位' placement="bottom" onClick={this.keyDownR}>
            <i className="iconfont iconfuwei" type="iconfuwei" />
          </Tooltip>
        </div>
        <div className='commands'></div>
        <div className='command'>
          <Tooltip title='3D旋转' placement="bottom" onClick={this.onButtonRotate}>
            <i className="iconfont iconDxuanzhuan" type="iconDxuanzhuan" />
          </Tooltip>
        </div>
        <div className='command'>
          <Tooltip title='轴旋转' placement="bottom" onClick={this.onButtonRoll}>
            <i className="iconfont iconweiraogoujianxuanzhuan" type="iconweiraogoujianxuanzhuan" />
          </Tooltip>
        </div>
        <div className='command'>
          <Tooltip title='拖动' placement="bottom" onClick={this.onButtonPan}>
            <i className="iconfont iconmove" type="iconmove" />
          </Tooltip>
        </div>
        {/* <div className='commands'></div>
        <div className='command'>
          <Tooltip title='缩放' placement="bottom" onClick={this.onButtonZoom}>
            <i className="iconfont " type="iconiconset0442" />
          </Tooltip>
        </div> */}

        <div className='commands'></div>
        <div className='command'>
          <Tooltip title='显示为实体单元' placement="bottom" onClick={this.keyDownS}>
            <i className="iconfont iconcubelifangti" type="iconcubelifangti" />
          </Tooltip>
        </div>
        <div className='command'>
          <Tooltip title='显示为网格' placement="bottom" onClick={this.keyDownW}>
            <i className="iconfont iconplus-gridview" type="iconplus-gridview" />
          </Tooltip>
        </div>
        <div className='command'>
          <Tooltip title='显示所有点' placement="bottom" onClick={this.keyDownV}>
            <i className="iconfont icondianxian" type="icondianxian" />
          </Tooltip>
        </div>
        <div className='commands'></div>
        <div className='command'>
          <Tooltip title='坐标定位' placement="bottom" onClick={this.changeAxis}>
            <i className="iconfont iconsanweizuobiao" type="iconsanweizuobiao" />
          </Tooltip>
        </div>
        <div className='command'>
          <Tooltip title='显示边框' placement="bottom" onClick={this.setBounds}>
            <i className="iconfont iconicon-lifangti" type="iconicon-lifangti" />
          </Tooltip>
        </div>
        {/* <div className='commands'></div>
        <div className='command'>
          <Tooltip title='点拾取（鼠标右击）' placement="bottom" onClick={this.usePointPicker}>
            <i className="iconfont " type="icondian" />
          </Tooltip>
        </div>
        <div className='command'>
          <Tooltip title='单元拾取（鼠标右击）' placement="bottom" onClick={this.useCellPicker}>
            <i className="iconfont " type="iconcell" />
          </Tooltip>
        </div> */}
        <div className='commands'></div>
        <div className='command'>
          <Tooltip title='色标卡' placement="bottom" onClick={this.settingBar}>
            <i className="iconfont iconyanse" type="iconyanse" />
          </Tooltip>
        </div>
        <div className='command'>
          <Tooltip title='数据结果显示' placement="bottom" onClick={this.settingScalsr}>
            <i className="iconfont iconshujujieguotongji" type="iconshujujieguotongji" />
          </Tooltip>
        </div>
        <div className='command'>
          <Tooltip title='灯光' placement="bottom" onClick={this.settingLight}>
            <i className="iconfont iconlightbulb-on" type="iconlightbulb-on" />
          </Tooltip>
        </div>
        <div className='commands'></div>
        <div className='command'>
          <Tooltip title='截屏' placement="bottom" onClick={this.Screen}>
            <i className="iconfont iconjieping" type="iconjieping" />
          </Tooltip>
        </div>
        <div className='command'>
          <Tooltip title='设置属性' placement="bottom" onClick={this.setting}>
            <i className="iconfont iconset" type="iconset" />
          </Tooltip>
        </div>
      </Header>
    );
  };
};