package controllers

import (
	"VTKServer-Go/models/dao"
	"encoding/json"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/astaxie/beego"
)

//VtkCreateProjectController 管理用户
type VtkCreateProjectController struct {
	beego.Controller
}

//VtkCreateProject 接收前端传来的项目信息
type VtkCreateProject struct {
	ProjectName        string `json:"projectName"` //创建的项目名
	ProjectDescription string `json:"projectDesc"` //项目描述
	ProjectIcon        string `json:"iconUrl"`     //项目图标路径
}

var projectMap = sync.Map{}

//Post 创建项目
func (u *VtkCreateProjectController) Post() {

	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
		//解析项目json
		vtkData := VtkCreateProject{}
		//解析jsonproject
		var reader io.Reader = u.Ctx.Request.Body
		b, e := ioutil.ReadAll(reader)
		if e != nil {
			beego.Error("no web result :", e)
		}
		beego.Debug("upload from web:", string(b))
		json.Unmarshal(b, &vtkData)

		//配置中读取文件路径
		basePath := beego.AppConfig.String("UploadFile")
		//调用CreateDirectory方法获取返回前端数据
		mapData := CreateDirectory(vtkData.ProjectName, vtkData.ProjectDescription, vtkData.ProjectIcon, basePath)
		u.Data["json"] = mapData
		u.ServeJSON()
	}
}

//CreateDirectory 创建目录保存数据
func CreateDirectory(projectName string, projectDescription string, projectIcon string, basePath string) map[string]interface{} {
	//判断项目是否存在
	_, ok := projectMap.Load(projectName)
	if ok {
		return map[string]interface{}{"state": 2, "message": "项目名已存在..."}
	}

	//sqlinfo 插入数据库内容
	sqlinfo := &dao.Projects{
		Proname: projectName,
		Prodesc: projectDescription,
		Proicon: projectIcon,
	}
	//项目信息存入数据库
	_, errdao := dao.ProAdd(sqlinfo)
	if errdao != nil {
		beego.Debug("数据库插入失败：", errdao)
		if strings.Contains(errdao.Error(), "UNIQUE") {
			return map[string]interface{}{"state": 2, "message": "项目名已经在.."}
		}
	}

	//创建项目下的目录
	const projects = "projectjson.txt"
	if projectName == "" {
		return map[string]interface{}{"state": 2, "message": "项目名不存在..."}
	}
	//创建项目目录
	if err := os.Mkdir(filepath.Join(basePath, "project", projectName), 0777); err != nil {
		beego.Error("fail to creat", err)
		return map[string]interface{}{"state": 2, "message": "项目目录创建失败..."}
	}
	//创建项目子目录dataLog
	if err := os.Mkdir(filepath.Join(basePath, "project", projectName, "dataLog"), 0777); err != nil {
		beego.Error("fail to creat", err)
		return map[string]interface{}{"state": 2, "message": "项目dataLog目录创建失败..."}
	}
	//创建项目子目录dataStr
	if err := os.Mkdir(filepath.Join(basePath, "project", projectName, "dataStr"), 0777); err != nil {
		beego.Error("fail to creat", err)
		return map[string]interface{}{"state": 2, "message": "项目dataStr目录创建失败..."}
	}
	//创建项目子目录dataUstr
	if err := os.Mkdir(filepath.Join(basePath, "project", projectName, "dataUstr"), 0777); err != nil {
		beego.Error("fail to creat", err)
		return map[string]interface{}{"state": 2, "message": "项目dataUstr目录创建失败..."}
	}
	//创建项目子目录dataImg
	if err := os.Mkdir(filepath.Join(basePath, "project", projectName, "dataImg"), 0777); err != nil {
		beego.Error("fail to creat", err)
		return map[string]interface{}{"state": 2, "message": "项目dataImg目录创建失败..."}
	}

	info := VtkCreateProject{
		projectName,
		projectDescription,
		projectIcon,
	}

	//项目信息解析存入json文件
	save, err := json.Marshal(info)
	if err != nil {
		beego.Error("err to save", err)
		return map[string]interface{}{"state": 2, "message": "json创建失败..."}
	}
	fd, _ := os.OpenFile(filepath.Join(basePath, projects), os.O_RDWR|os.O_CREATE|os.O_APPEND, 0644)
	defer fd.Close()
	fd.Write(save)
	fd.Write([]byte("\n"))
	projectMap.Store(projectName, '1')
	return map[string]interface{}{"state": 1, "message": "项目创建成功..."}
}
