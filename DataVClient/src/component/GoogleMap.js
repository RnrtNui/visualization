/**
* 文件名：/component/GoogleMap.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：谷歌地图示例。
* */
import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
export class MapContainer extends Component {
    constructor(props){
        super(props);
        this.state={
            
        }
    }

    render() {
        return (
            <Map google={this.props.google} zoom={14}>

                <Marker onClick={this.onMarkerClick}
                    name={'Current location'} />

                <InfoWindow onClose={this.onInfoWindowClose}>
                    <div>
                        <h1>{this.state.selectedPlace.name}</h1>
                    </div>
                </InfoWindow>
            </Map>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: "AIzaSyDFVN8rf5KlGwOtXns5VN5Gis14iWrsjiU"
})(MapContainer)