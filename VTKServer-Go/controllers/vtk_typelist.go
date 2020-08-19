package controllers

import (
	"github.com/astaxie/beego"
)

//TypeListController 类型列表
type TypeListController struct {
	beego.Controller
}

//Get 获取项目列表
func (u *TypeListController) Get() {

	var typeList = []string{"csv", "vtk", "msh", "post.msh", "flavia.msh", "obj", "off", "stl"}
	//返回前端数据信息
	u.Data["json"] = map[string]interface{}{"fileType": typeList}
	u.ServeJSON()
}
