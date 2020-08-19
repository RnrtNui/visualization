package controllers

import (
	"VTKServer-Go/tool/execfunc"
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/astaxie/beego"
)

//ObjFileSaveController 处理obj文件数组数据
type ObjFileSaveController struct {
	beego.Controller
}

//ObjSaveFile 接收前端传来的文件信息
type ObjSaveFile struct {
	ObjData map[string][][]interface{} `json:"objData"` //obj文件内容数组
	ObjName string                     `json:"objName"` //文件名
}

//Post 返回前端文件内容
func (u *ObjFileSaveController) Post() {
	//接收前端发送的数据
	fileInfo := ObjSaveFile{}
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		//beego.Debug("userchange get web info", string(b))
		errr := json.Unmarshal(b, &fileInfo)
		if errr != nil {
			beego.Error("e is :", errr)
		}
		//	beego.Debug("userchange get data from web :", string(b))
	}
	//配置中读取文件路径
	uploadFilePath := beego.AppConfig.String("UploadFile")
	saveFilePath := filepath.Join(uploadFilePath, "dicom", fileInfo.ObjName+"_POINTS.json")
	_, errf := os.Stat(saveFilePath)
	if errf == nil {
		u.Data["json"] = map[string]interface{}{"type": "obj", "data": "/dicom/" + fileInfo.ObjName}
		u.ServeJSON()
		return
	}
	var objData1 = make(map[string][]interface{})
	for _, str := range fileInfo.ObjData["POINTS"] {
		for _, str1 := range str {
			objData1["POINTS"] = append(objData1["POINTS"], str1)
		}
	}
	errj := execfunc.SaveToJSON(objData1["POINTS"], saveFilePath)
	if errj != nil {
		u.Data["json"] = map[string]interface{}{"message": "json文件保存失败"}
		u.ServeJSON()
		return
	}
	u.Data["json"] = map[string]interface{}{"type": "obj", "data": "/dicom/" + fileInfo.ObjName}
	u.ServeJSON()

}
