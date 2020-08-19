package controllers

import (
	"encoding/json"
	"io/ioutil"
	"path/filepath"
	"strings"

	"github.com/astaxie/beego"
)

//VtkSaveFileController 处理文件数据
type VtkSaveFileController struct {
	beego.Controller
}

//VtkSaveFile 接收前端传来的文件信息
type VtkSaveFile struct {
	ProjectName string `json:"projectName"` //项目名称
	FileName    string `json:"fileName"`    //文件名称
	FileData    string `json:"fileData"`    //文件内容
}

//Post 返回前端文件内容
func (u *VtkSaveFileController) Post() {
	//接收前端发送的数据
	fileInfo := VtkSaveFile{}
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
	saveFilePath := filepath.Join(uploadFilePath, "project", fileInfo.ProjectName, "dataUstr", fileInfo.FileName, fileInfo.FileName)
	beego.Debug("savePath:", saveFilePath)
	// 将保存的字符串转换为字节流
	str := []byte(fileInfo.FileData)

	// 保存到文件
	errSave := ioutil.WriteFile(saveFilePath, str, 0666)
	if errSave != nil {
		u.Data["json"] = map[string]interface{}{"message": "文件保存失败"}
		u.ServeJSON()
		return
	}
	u.Data["json"] = map[string]interface{}{"message": "保存成功"}
	u.ServeJSON()

}
