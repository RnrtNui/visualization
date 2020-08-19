package controllers

import (
	"io"
	"math/rand"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/astaxie/beego"
)

//VtkAvatarController 个人图标
type VtkAvatarController struct {
	beego.Controller
}

//Post 个人图标
func (u *VtkAvatarController) Post() {

	//跨域请求,仅限接口
	u.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	u.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Headers", "*")
	u.Ctx.ResponseWriter.Header().Set("Content-Type", "multipart/form-data")
	u.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	u.Ctx.Request.ParseMultipartForm(32 << 20)

	//接收客户端传来的文件 vtkIcon 与客户端保持一致
	file, _, err := u.Ctx.Request.FormFile("vtkIcon")
	if err != nil {
		beego.Error("upload file err", err)
		return
	}
	defer file.Close()

	//拼凑文件名
	fileNewName := "vtkicon"
	rand.Seed(time.Now().Unix())
	random := rand.Int()

	//配置中读取文件路径
	uploadFile := beego.AppConfig.String("UploadFile")

	//图标文件路径
	strPaths := "vtkicon/" + fileNewName + "_" + strconv.Itoa(random)
	strPath := filepath.Join("vtkicon", fileNewName+"_"+strconv.Itoa(random))
	//返回前端路径信息
	u.Data["json"] = map[string]interface{}{"status": "successful", "iconUrl": "/" + strPaths}
	u.ServeJSON()

	//将图标保存到本地指定路径下
	f, err := os.OpenFile(filepath.Join(uploadFile, strPath), os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		beego.Error("upload save file err", err)
		return
	}
	io.Copy(f, file)
	f.Close()
	return
}
