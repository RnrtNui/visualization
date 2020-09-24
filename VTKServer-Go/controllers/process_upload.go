package controllers

import (
	"io"
	"os"
	"path/filepath"

	"github.com/astaxie/beego"
)

//ProcessuploadFileController 流程文件上传
type ProcessuploadFileController struct {
	beego.Controller
	By map[string]interface{}
}

//ProuploadFile 接收前端传来的文件信息
type ProuploadFile struct {
	FileName string `json:"fileName"` //文件名称
}

//Post 上传文件
func (u *ProcessuploadFileController) Post() {
	//读取配置路径
	uploadFile := beego.AppConfig.String("ProcessPath")
	beego.Debug(uploadFile)
	//接收客户端传来的文件 uploadFile 与客户端保持一致
	file, handler, err := u.Ctx.Request.FormFile("file")
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
		u.Data["json"] = map[string]interface{}{"state": 2, "message": "excel文件上传失败!!!"}
		u.ServeJSON()
		return
	}
	io.Copy(f, file)
	f.Close()
	u.Data["json"] = map[string]interface{}{"state": 1, "message": "文件上传成功"}
	u.ServeJSON()
}
