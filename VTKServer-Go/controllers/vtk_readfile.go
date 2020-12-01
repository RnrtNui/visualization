package controllers

import (
	"VTKServer-Go/tool/execfunc"
	"encoding/json"
	"io/ioutil"
	"strings"

	"github.com/astaxie/beego"
)

//VtkReadFileController 处理文件数据
type VtkReadFileController struct {
	beego.Controller
	//re interface{}
}

//VtkReadFile 接收前端传来的文件信息
type VtkReadFile struct {
	ProjectName string `json:"projectName"` //项目名称
	FileName    string `json:"fileName"`    //文件名称
}

//Post 返回前端文件内容
func (u *VtkReadFileController) Post() {
	//接收前端发送的数据
	fileInfo := VtkReadFile{}
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		beego.Debug("userchange get web info", string(b))
		errr := json.Unmarshal(b, &fileInfo)
		if errr != nil {
			beego.Error("e is :", errr)
		}
		beego.Debug("userchange get data from web :", string(b))
	}

	//配置中读取文件路径
	uploadFilePath := beego.AppConfig.String("UploadFile")
	//打印文件名
	beego.Debug("fileinfo filename", fileInfo.FileName)

	//数据json文件是否存在
	fileType, data, pdata := execfunc.DoesJSONExist(uploadFilePath, fileInfo.FileName)
	if !strings.Contains(fileInfo.FileName, ".obj") {
		if fileType != "" {
			if data != "no" && pdata == "yes" {
				u.Data["json"] = map[string]interface{}{"type": fileType, "filePath": data}
				u.ServeJSON()
				return
			}
			if data != "no" && pdata != "yes" {
				u.Data["json"] = map[string]interface{}{"type": fileType, "filePath": data}
				u.ServeJSON()
			}
		}
	} else {
		if data != "no" {
			data1 := strings.Replace(data, "_POINTS.json", "", -1)
			u.Data["json"] = map[string]interface{}{"type": fileType, "filePath": data1, "jsonFile": "true"}
			u.ServeJSON()
			return
		}
	}
	//调用方法处理文件
	mesInfo := execfunc.CallCommand(uploadFilePath, fileInfo.ProjectName, fileInfo.FileName)
	if !strings.Contains(mesInfo, "成功") {
		u.Data["json"] = map[string]interface{}{"message": mesInfo}
		u.ServeJSON()
		return
	}
	//处理各类文件
	webInfo, dataType, errw := execfunc.ProcessData(uploadFilePath, fileInfo.ProjectName, fileInfo.FileName, data, pdata)
	beego.Debug("dataType", dataType)
	if errw != nil {
		u.Data["json"] = map[string]interface{}{"data": errw, "type": "no type"}
		u.ServeJSON()
		return
	}
	if !strings.Contains(fileInfo.FileName, ".obj") {
		u.Data["json"] = map[string]interface{}{"data": webInfo, "type": dataType}
		u.ServeJSON()
	} else {
		u.Data["json"] = map[string]interface{}{"filePath": webInfo, "type": dataType, "jsonFile": "false"}
		u.ServeJSON()
	}
}
