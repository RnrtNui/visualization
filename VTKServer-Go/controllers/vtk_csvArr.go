package controllers

import (
	"VTKServer-Go/tool/execfunc"
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/astaxie/beego"
)

//CsvFileSaveController 处理obj文件数组数据
type CsvFileSaveController struct {
	beego.Controller
}

//CsvSaveFile 接收前端传来的csv文件信息
type CsvSaveFile struct {
	POINTS   []interface{} `json:"POINTS"`   //obj文件内容数组
	FileName string        `json:"fileName"` //文件名
	DataType string        `json:"dataType"` //文件名
}

//Post 返回前端文件内容
func (u *CsvFileSaveController) Post() {
	//接收前端发送的数据
	fileInfo := CsvSaveFile{}
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
	saveFilePath := filepath.Join(uploadFilePath, "dicom", strings.Split(fileInfo.FileName, ".")[0]+"_POINTS.json")
	_, errf := os.Stat(saveFilePath)
	if errf == nil {
		u.Data["json"] = map[string]interface{}{"type": fileInfo.DataType, "data": "/dicom/" + strings.Split(fileInfo.FileName, ".")[0] + ".json"}
		u.ServeJSON()
		return
	}
	switch fileInfo.DataType {
	case ".csv":
		tempArr := make([]interface{}, 0)
		for i := 0; i < len(fileInfo.POINTS); i++ {
			// if (i+1)%3 == 0 {
			// 	numCsv, _ := strconv.ParseInt(fileInfo.POINTS[i], 10, 32)
			// 	numCsv = numCsv / 10000
			// 	tempArr = append(tempArr, strconv.Itoa(int(numCsv)))
			// } else {
			tempArr = append(tempArr, fileInfo.POINTS[i])
			// }
		}
		if len(tempArr) > 0 {
			errj := execfunc.SaveToJSON(tempArr, saveFilePath)
			if errj != nil {
				u.Data["json"] = map[string]interface{}{"message": "json文件保存失败"}
				u.ServeJSON()
				return
			}
		}
		u.Data["json"] = map[string]interface{}{"data": "文件保存成功"}
		u.ServeJSON()
	default:
		u.Data["json"] = map[string]interface{}{"data": "没有对应文件类型数据"}
		u.ServeJSON()
	}

}
