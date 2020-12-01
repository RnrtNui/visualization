package controllers

import (
	"bufio"
	"encoding/json"
	"io"
	"os"

	"github.com/astaxie/beego"
)

//VtkProListController 项目列表
type VtkProListController struct {
	beego.Controller
}

//VtkProList 接收前端的数据
type VtkProList struct {
	ProjectName string `json:"projectName"` //项目名称
	ProjectDesc string `json:"projectDesc"` //项目描述
	IconURL     string `json:"iconUrl"`     //图标路径
}

//Get 获取项目列表
func (u *VtkProListController) Get() {

	//配置中读取文件路径
	uploadFilePath := beego.AppConfig.String("UploadFile")
	jsonPath := uploadFilePath + "projectjson.txt"
	//调用ReturnProjectInfos方法
	proList, err := ReturnProjectInfo(jsonPath)
	if err != nil {
		u.Data["json"] = map[string]interface{}{"message": "查询失败"}
		u.ServeJSON()
		return
	}
	//调用数据库查询返回信息
	// var proData []orm.Params
	// var proList1 = []VtkProList{}
	// o := orm.NewOrm()
	// _, errpro := o.Raw("select * from vtk_projects").Values(&proData)
	// if errpro != nil {
	// 	//返回前端数据信息
	// 	u.Data["json"] = map[string]interface{}{"message": errpro}
	// 	u.ServeJSON()
	// }

	// for _, pro := range proData {
	// 	pros := VtkProList{
	// 		pro["proname"].(string),
	// 		pro["prodesc"].(string),
	// 		pro["proicon"].(string),
	// 	}
	// 	proList1 = append(proList1, pros)
	// }
	//返回前端数据信息
	u.Data["json"] = map[string]interface{}{"message": "查询成功", "data": proList}
	u.ServeJSON()
}

//ReturnProjectInfo 返回项目信息
func ReturnProjectInfo(jsonPath string) (*[]VtkProList, error) {
	p := []VtkProList{}
	fi, err := os.Open(jsonPath)
	if err != nil {
		beego.Error("err for geting", err)
		return nil, nil
	}
	defer fi.Close()
	d := VtkProList{}
	br := bufio.NewReader(fi)
	for {
		b, _, c := br.ReadLine()

		if c == io.EOF {
			break
		}
		if err := json.Unmarshal(b, &d); err != nil { //解析json信息
			beego.Error("err for geting", err)
			return nil, err
		}

		p = append(p, d)
	}
	return &p, nil
}
