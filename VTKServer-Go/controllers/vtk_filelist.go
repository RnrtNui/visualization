package controllers

import (
	"io/ioutil"
	"path/filepath"
	"strings"

	"github.com/astaxie/beego"
)

//VtkFileListController 文件列表
type VtkFileListController struct {
	beego.Controller
}

//VtkFileList 接收前端的数据
type VtkFileList struct {
	//UserName string `json:"userName"`
	ProjectName string `json:"projectName"` //项目名称
}

//Get 返回文件列表
func (u *VtkFileListController) Get() {
	/*
		var appinfo AppFileList
		if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
			var reader io.Reader = u.Ctx.Request.Body
			b, e := ioutil.ReadAll(reader)
			beego.Debug("userchange get web info", string(b))
			json.Unmarshal(b, &appinfo)
			if e != nil {
			}
			beego.Debug("userchange get data from web :", string(b))
		}
	*/
	//beego.Debug("appname", u.GetString("projectName"))
	//获取前端项目名
	projectName := u.GetString("projectName")
	//配置中读取文件路径
	uploadFilePath := beego.AppConfig.String("UploadFile")

	//查询项目下的目录
	var fileList []string
	fsList, _ := ioutil.ReadDir(filepath.Join(uploadFilePath, "project", projectName, "dataStr"))
	beego.Debug("Str", filepath.Join(uploadFilePath, "project", projectName, "dataStr"))
	for _, f := range fsList {
		if strings.Contains(f.Name(),".zip"){
			fileList = append(fileList, strings.ReplaceAll(f.Name(),".zip",""))
		}else {
			fileList = append(fileList, f.Name())
		}
	}
	fuList, _ := ioutil.ReadDir(filepath.Join(uploadFilePath, "project", projectName, "dataUstr"))
	for _, f := range fuList {
		if strings.Contains(f.Name(),".zip"){
			fileList = append(fileList, strings.ReplaceAll(f.Name(),".zip",""))
		}else {
			fileList = append(fileList, f.Name())
		}
	}

	beego.Debug("fileDataList.FileList:", fileList)
	//返回前端数据信息
	u.Data["json"] = map[string]interface{}{"message": "查询成功", "data": fileList}
	u.ServeJSON()
}
