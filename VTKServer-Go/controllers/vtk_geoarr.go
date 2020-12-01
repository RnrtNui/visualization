package controllers

import (
	"VTKServer-Go/tool/execfunc"
	"encoding/json"
	"io/ioutil"
	"path/filepath"
	"strings"

	"github.com/astaxie/beego"
)

//GeoDataSaveController 处理地质数据数组数据
type GeoDataSaveController struct {
	beego.Controller
}

//GeoSaveData 接收前端传来的文件信息
type GeoSaveData struct {
	GeoData interface{} `json:"geoData"` //geo数据内容数组
	GeoName string      `json:"geoName"` //文件名
}

//Post 返回前端文件内容
func (u *GeoDataSaveController) Post() {
	//接收前端发送的数据
	geoInfo := GeoSaveData{}
	//解析请求数据
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		errr := json.Unmarshal(b, &geoInfo)
		if errr != nil {
			beego.Error("e is :", errr)
		}
	}
	//配置中读取文件路径
	uploadFilePath := beego.AppConfig.String("UploadFile")
	//静态文件路径
	saveGeoPath := filepath.Join(uploadFilePath, "dicom", "geology", geoInfo.GeoName+".json")
	//判断json文件是否存在
	if execfunc.IsExists(saveGeoPath) {
		u.Data["json"] = map[string]interface{}{"message": geoInfo.GeoName + ".json文件已存在"}
		u.ServeJSON()
		return
	}
	//如果不存在,将数据保存为json
	errj := execfunc.SaveToJSON(geoInfo.GeoData, saveGeoPath)
	if errj != nil {
		u.Data["json"] = map[string]interface{}{"message": geoInfo.GeoName + ".json文件保存失败"}
		u.ServeJSON()
		return
	}
	u.Data["json"] = map[string]interface{}{"message": geoInfo.GeoName + ".json文件保存成功"}
	u.ServeJSON()
}
