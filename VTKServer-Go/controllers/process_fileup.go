package controllers

import (
	"VTKServer-Go/tool/execfunc"
	"encoding/json"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/astaxie/beego"
)

//ProcessFileUpController 流程文件上传
type ProcessFileUpController struct {
	beego.Controller
}

//ProFileUp 接收前端传来的文件信息
type ProFileUp struct {
	FileName string `json:"fileName"` //文件名称
}

//OnePost 上传文件
func (u *ProcessFileUpController) OnePost() {
	//读取配置路径
	uploadFile := beego.AppConfig.String("ProcessPath")
	uploadFilePath := beego.AppConfig.String("UploadFile")
	//接收客户端传来的文件 uploadFile 与客户端保持一致
	file, handler, err := u.Ctx.Request.FormFile("uploadFile")
	if err != nil {
		beego.Error("upload file err", err)
		return
	}
	defer file.Close()
	//上传的文件保存在指定路径下
	fileNewName := handler.Filename
	filePath := filepath.Join(uploadFile, fileNewName)
	f, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		beego.Error("upload save file err", err)
		u.Data["json"] = map[string]interface{}{"state": 2, "message": "文件上传失败!!!"}
		u.ServeJSON()
		return
	}
	io.Copy(f, file)
	errc := f.Close()
	if errc == nil {
		//数据json文件是否存在
		fileType, data, pdata := execfunc.DoesJSONExist(uploadFilePath, fileNewName)
		if !strings.Contains(fileNewName, ".obj") {
			if fileType != "" {
				if data != "no" && pdata == "yes" {
					beego.Debug("type"+fileType, "filePath"+data)
					u.Data["json"] = map[string]interface{}{"state": 1, "message": "文件上传成功"}
					u.ServeJSON()
					return
				}
				if data != "no" && pdata != "yes" {
					beego.Debug("type"+fileType, "filePath"+data)
					u.Data["json"] = map[string]interface{}{"state": 1, "message": "文件上传成功"}
					u.ServeJSON()
				}
			}
		} else {
			if data != "no" {
				u.Data["json"] = map[string]interface{}{"state": 1, "message": "文件上传成功"}
				u.ServeJSON()
				return
			}
		}
		//调用方法处理文件
		mesInfo := execfunc.CallCommandPro(uploadFilePath, fileNewName)
		if !strings.Contains(mesInfo, "成功") {
			u.Data["json"] = map[string]interface{}{"state": 1, "message": "文件上传成功" + mesInfo}
			u.ServeJSON()
			return
		}
		//处理各类文件
		_, _, errw := execfunc.DataPro(uploadFilePath, fileNewName, data, pdata)

		if errw != nil {
			u.Data["json"] = map[string]interface{}{"state": 1, "message": "文件上传成功", "pro": errw}
			u.ServeJSON()
			return
		}
		if !strings.Contains(fileNewName, ".obj") {
			u.Data["json"] = map[string]interface{}{"state": 1, "message": "文件上传成功"}
			u.ServeJSON()
		} else {
			u.Data["json"] = map[string]interface{}{"state": 1, "message": "文件上传成功"}
			u.ServeJSON()
		}
	}

}

//TwoPost 返回前端文件内容
func (u *ProcessFileUpController) TwoPost() {
	//接收前端发送的数据
	fileInfo := ProFileUp{}
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		beego.Debug("userchange get web info", string(b))
		errr := json.Unmarshal(b, &fileInfo)
		if errr != nil {
			beego.Error("e is :", errr)
		}
		beego.Debug("userchange get data from web :", string(b))
	}
	beego.Debug("flieName", u.GetString("fileName"))
	//配置中读取文件路径
	uploadFilePath := beego.AppConfig.String("UploadFile")
	//打印文件名
	beego.Debug("fileinfo filename", fileInfo.FileName)
	if strings.Contains(fileInfo.FileName, ".res") {
		fileInfo.FileName = strings.Replace(fileInfo.FileName, ".res", ".msh", -1)
	}
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
	mesInfo := execfunc.CallCommandPro(uploadFilePath, fileInfo.FileName)
	if !strings.Contains(mesInfo, "成功") {
		u.Data["json"] = map[string]interface{}{"message": mesInfo}
		u.ServeJSON()
		return
	}
	//处理各类文件
	webInfo, dataType, errw := execfunc.DataPro(uploadFilePath, fileInfo.FileName, data, pdata)
	if webInfo == "0" {
		u.Data["json"] = map[string]interface{}{"data": dataType, "type": "no type"}
		u.ServeJSON()
		return
	}
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
