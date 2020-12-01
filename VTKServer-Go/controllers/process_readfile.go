package controllers

import (
	"VTKServer-Go/tool/execfunc"
	"path/filepath"

	"github.com/astaxie/beego"
)

//ProReadFileController 处理文件数据
type ProReadFileController struct {
	beego.Controller
	//re interface{}
}

//Get 返回前端文件内容
func (u *ProReadFileController) Get() {
	//获取前端请求数据
	fileName := u.GetString("fileName")
	//配置中读取文件路径
	uploadFile := beego.AppConfig.String("ProcessPath")
	filePath := filepath.Join(uploadFile + fileName)
	//打印文件名
	beego.Debug("fileinfo filename", fileName)
	//判断文件是否存在
	b := execfunc.IsExists(filePath)
	if !b {
		u.Data["json"] = map[string]interface{}{"message": "文件不存在"}
		u.ServeJSON()
		return
	}
	// 
	data, err := execfunc.HandlePDF(filePath)
	if err != nil {
		beego.Error("pdf read err:", err)
	}

	u.Data["json"] = map[string]interface{}{"data": data}
	u.ServeJSON()

}
