package controllers

import (
	"VTKServer-Go/tool/execfunc"
	"encoding/json"
	"io/ioutil"
	"path/filepath"
	"strings"

	"github.com/astaxie/beego"
)

//ComputerFileController 处理文件数据
type ComputerFileController struct {
	beego.Controller
}

//ComputeFile 接收前端传来的文件信息
type ComputeFile struct {
	FileName string `json:"fileName"` //文件名称
}

//Post 返回前端文件内容
func (u *ComputerFileController) Post() {
	//接收前端发送的数据
	fileInfo := ComputeFile{}
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {

		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		beego.Debug("userchange get web info", string(b))
		errr := json.Unmarshal(b, &fileInfo)
		if errr != nil {
			beego.Error("e is :", errr)
		}
		beego.Debug("userchange get data from web :", string(b))
	}
	fileNameM := u.GetString("fileName") //获取文件名
	//配置中读取文件路径
	uploadFilePath := beego.AppConfig.String("UploadFile")
	fileNameMsh := filepath.Join(uploadFilePath, "project", "3", "dataUstr", fileNameM)
	beego.Debug("filenameMsh:", fileNameMsh)

	switch {
	case strings.Contains(fileNameM, ".flavia.msh"):
		com := filepath.Join(uploadFilePath, "command", "special_FROF.exe")
		//调用可执行程序

		str, err := execfunc.RunMsh(com, fileNameMsh)
		if err != nil || strings.Contains(str, "0.00000") {
			if err != nil {
				beego.Error("命令执行错误：", err)
			}
			u.Data["json"] = map[string]interface{}{"message1": "文件读取失败..."}
			u.ServeJSON()
			return
		} else if err == nil {
			com := filepath.Join(uploadFilePath, "command", "FROFMeshRes.exe")
			ffileNameMsh := filepath.Join(uploadFilePath, "project", "3", "dataUstr", "F"+fileNameM)
			//调用可执行程序
			strFile := strings.Replace(fileNameM, ".msh", ".res", -1)
			tfileNameMsh := filepath.Join(uploadFilePath, "project", "3", "dataUstr", "T"+strFile)
			strs, err := execfunc.RunMsh(com, ffileNameMsh, tfileNameMsh)
			if err != nil {
				beego.Error("命令执行错误：", err)
				return
			}
			//返回前端数据信息
			u.Data["json"] = map[string]interface{}{"message1": str, "message2": strs}
			u.ServeJSON()
			return
		}
	case strings.Contains(fileNameM, ".flavia.res"):
		com := filepath.Join(uploadFilePath, "command", "ResPreTreat.exe")
		//调用可执行程序
		str, err := execfunc.RunMsh(com, fileNameMsh)
		if err != nil {
			if err != nil {
				beego.Error("命令执行错误：", err)
			}
		}
		u.Data["json"] = map[string]interface{}{"message1": str, "message2": "res处理成功"}
		u.ServeJSON()
		return
	case strings.Contains(fileNameM, ".msh") && !strings.Contains(fileNameM, ".flavia") && !strings.Contains(fileNameM, ".post"):
		com := filepath.Join(uploadFilePath, "command", "MshPreTreat.exe")
		//调用可执行程序
		str, err := execfunc.RunMsh(com, fileNameMsh)
		if err != nil {
			if err != nil {
				beego.Error("命令执行错误：", err)
			}
		}
		u.Data["json"] = map[string]interface{}{"message1": str, "message2": "msh处理成功"}
		u.ServeJSON()
		return
	default:
		u.Data["json"] = map[string]interface{}{"message1": "没有发现要处理的文件"}
		u.ServeJSON()
	}

}
