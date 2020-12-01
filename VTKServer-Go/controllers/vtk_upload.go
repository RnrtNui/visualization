package controllers

import (
	"VTKServer-Go/tool/execfunc"
	"io"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/astaxie/beego"
)

//VtkuploadFileController 文件上传
type VtkuploadFileController struct {
	beego.Controller
}

//VtkuploadFile 接收前端传来的文件信息
type VtkuploadFile struct {
	ProjectName string `json:"projectName"` //项目名称
	FileName    string `json:"fileName"`    //文件名称
	//FileType    string `json:"fileType"`    //文件类型
}

//Post 上传文件
func (u *VtkuploadFileController) Post() {
	//读取配置路径
	uploadFile := beego.AppConfig.String("UploadFile")
	//解析前端数据
	var vtkData *VtkuploadFile
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "multipart/form-data") {
		vtkData = &VtkuploadFile{
			ProjectName: u.GetString("projectName"),
			FileName:    u.GetString("fileName"),
		}
	}
	//接收客户端传来的文件 uploadFile 与客户端保持一致
	file, handler, err := u.Ctx.Request.FormFile("uploadFile")
	if err != nil {
		beego.Error("upload file err", err)
		return
	}
	defer file.Close()
	//上传的文件保存在指定路径下
	fileNewName := handler.Filename
	switch {
	case strings.Contains(fileNewName, ".csv"):
		filePath := filepath.Join(uploadFile, "project", vtkData.ProjectName, "dataStr")
		f, err := os.OpenFile(filepath.Join(filePath, fileNewName), os.O_WRONLY|os.O_CREATE, 0666)
		if err != nil {
			beego.Error("upload save file err", err)
			u.Data["json"] = map[string]interface{}{"state": 2, "message": "csv文件上传失败!!!"}
			u.ServeJSON()
			return
		}
		io.Copy(f, file)
		f.Close()
	case strings.Contains(fileNewName, ".xls"):
		dirPath := filepath.Join(uploadFile, "dicom", "excel")
		filePath := filepath.Join(dirPath, fileNewName)
		f, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE, 0666)
		if err != nil {
			beego.Error("upload save file err", err)
			u.Data["json"] = map[string]interface{}{"state": 2, "message": "excel文件上传失败!!!"}
			u.ServeJSON()
			return
		}
		io.Copy(f, file)
		errf := f.Close()
		if errf == nil {
			objdata, _ := execfunc.HandleXls(filePath)
			jsonPath := strings.Split(filePath, ".")[0] + ".json"
			if !execfunc.IsExists(jsonPath) {
			execfunc.SaveToJSON(objdata, jsonPath)
			}
		}
	case path.Ext(fileNewName) == ".zip":
		filePath := filepath.Join(uploadFile, "dicom")
		filePath1 := filepath.Join(uploadFile, "project", vtkData.ProjectName, "dataUstr")
		f, err := os.OpenFile(filepath.Join(filePath1, fileNewName), os.O_WRONLY|os.O_CREATE, 0666)
		if err != nil {
			beego.Error("upload save file err", err)
			u.Data["json"] = map[string]interface{}{"state": 2, "message": "压缩文件上传失败!!!"}
			u.ServeJSON()
			return
		}
		io.Copy(f, file)
		errf := f.Close()
		if errf == nil {
			//解压文件
			filePathZip := filepath.Join(filePath1, fileNewName)
			if _, err := os.Stat(filePathZip); err == nil {
				errZip := execfunc.Unzip(filePathZip, filePath)
				if errZip != nil {
					beego.Error("解压失败：", errZip)
					return
				}
			}
		}
	default:
		filePath := filepath.Join(uploadFile, "project", vtkData.ProjectName, "dataUstr")
		f, err := os.OpenFile(filepath.Join(filePath, fileNewName), os.O_WRONLY|os.O_CREATE, 0666)
		if err != nil {
			beego.Error("upload save file err", err)
			u.Data["json"] = map[string]interface{}{"state": 2, "message": "文件上传失败!!!"}
			u.ServeJSON()
			return
		}
		io.Copy(f, file)
		f.Close()
	}
	u.Data["json"] = map[string]interface{}{"state": 1, "message": "文件上传成功"}
	u.ServeJSON()

}
