package controllers

/************************
*author haoyingfeng
*date	2020/0921
*introduction:  转换vtk网格
**************************/

import (
	"VTKServer-Go/tool/execfunc"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os/exec"
	"strconv"
	"strings"
	"time"

	"github.com/astaxie/beego"
)

//TransformationController 处理文件数据
type TransformationController struct {
	beego.Controller
}

//Transformation 接收前端传来的文件信息
type Transformation struct {
	FileName     string `json:"fileName"`     //文件名称
	InputFormat  string `json:"inputFormat"`  // 输入格式
	MeshType     string `json:"meshType"`     // 网格类型
	OutputFormat string `json:"outputFormat"` // 输出格式
}

//Post 返回前端文件内容
func (u *TransformationController) Post() {
	//跨域请求,仅限接口
	u.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	u.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Headers", "*")
	u.Ctx.ResponseWriter.Header().Set("Content-Type", "multipart/form-data")
	u.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	u.Ctx.Request.ParseMultipartForm(32 << 20)

	//接收前端发送的数据
	transformation := Transformation{}
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		//beego.Debug("userchange get web info", string(b))
		errr := json.Unmarshal(b, &transformation)
		if errr != nil {
			beego.Error("e is :", errr)
		}
		beego.Debug("userchange get data from web :", string(b))
	}

	t := time.Now()
	timestr := strconv.FormatInt(t.UTC().Unix(), 10)
	fileNameT := transformation.FileName         //获取文件名
	inputFormatT := transformation.InputFormat   // 获取输入格式
	meshTypeT := transformation.MeshType         // 获取网格类型
	outputFormatT := transformation.OutputFormat // 获取输出格式

	//读取配置路径
	processPath := beego.AppConfig.String("ProcessPath")
	// 获取文件名
	var filenameWithSuffix string
	filenameWithSuffix = strings.TrimSuffix(fileNameT, inputFormatT)
	beego.Debug(filenameWithSuffix)

	// 获取输出格式文件名（去除点）
	outPutFormat := strings.TrimPrefix(outputFormatT, ".")

	// gmsh地址
	gmshPath := "/home/luyangfei/Downloads/gmsh-4.6.0-Linux64/bin/gmsh"

	switch inputFormatT {
	case ".stl":
		fileName := "stl.geo"
		errT := execfunc.WriteStlGeoFile(processPath, fileNameT, fileName)
		if errT != nil {
			u.Data["json"] = map[string]interface{}{"message": "vtk文件保存失败"}
			u.ServeJSON()
			return
		} else {
			geoFile := processPath + fileName // 拼装geo文件路径
			nummeshTypeT := "-" + meshTypeT   // 去掉点以后，拼装命令
			stlVtkFilepath := processPath + filenameWithSuffix + "_" + timestr + outputFormatT

			// 生成vtk文件
			_, err := exec.Command(gmshPath, geoFile, nummeshTypeT, "-o", stlVtkFilepath, "-format", outPutFormat).Output()
			// beego.Error("err :", err)
			if err != nil {
				fmt.Println("transformation.go 94:", err)
			}

			// cmd := exec.Command(gmshPath, geoFile, nummeshTypeT, "-o", stlVtkFilepath, "-format", outPutFormat)
			// beego.Error("err :", cmd)

			vtkPath := "http://192.168.2.134:4000/visualization/" + filenameWithSuffix + "_" + timestr + outputFormatT
			u.Data["json"] = map[string]interface{}{"url": vtkPath}
			u.ServeJSON()
			return
		}

	case ".STL":
		fileName := "stl.geo"
		errT := execfunc.WriteStlGeoFile(processPath, fileNameT, fileName)
		if errT != nil {
			u.Data["json"] = map[string]interface{}{"message": "vtk文件保存失败"}
			u.ServeJSON()
			return
		} else {
			geoFile := processPath + fileName // 拼装geo文件路径
			nummeshTypeT := "-" + meshTypeT   // 去掉点以后，拼装命令
			stlVtkFilepath := processPath + filenameWithSuffix + "_" + timestr + outputFormatT

			// 生成vtk文件
			_, err := exec.Command(gmshPath, geoFile, nummeshTypeT, "-o", stlVtkFilepath, "-format", outPutFormat).Output()
			// beego.Error("err :", err)
			// if err != nil {
			// 	u.Data["json"] = map[string]interface{}{"url": err}
			// 	u.ServeJSON()
			// 	return
			// }
			if err != nil {
				fmt.Println("transformation.go 127:", err)
			}

			vtkPath := "http://192.168.2.134:4000/visualization/" + filenameWithSuffix + "_" + timestr + outputFormatT
			u.Data["json"] = map[string]interface{}{"url": vtkPath}
			u.ServeJSON()
			return

		}
	case ".stp":
		fileName := "stp.geo"
		errT := execfunc.WriteStpGeoFile(processPath, fileNameT, fileName)
		if errT != nil {
			u.Data["json"] = map[string]interface{}{"message": "vtk文件保存失败"}
			u.ServeJSON()
			return
		} else {

			geoFile := processPath + fileName // 拼装geo文件路径
			nummeshTypeT := "-" + meshTypeT   // 去掉点以后，拼装命令
			stlVtkFilepath := processPath + filenameWithSuffix + "_" + timestr + outputFormatT

			// 生成vtk文件
			_, err := exec.Command(gmshPath, geoFile, nummeshTypeT, "-o", stlVtkFilepath, "-format", outPutFormat).Output()
			// beego.Error("err :", err)
			if err != nil {
				u.Data["json"] = map[string]interface{}{"url": err}
				u.ServeJSON()
				return
			}

			vtkPath := "http://192.168.2.134:4000/visualization/" + filenameWithSuffix + "_" + timestr + outputFormatT
			u.Data["json"] = map[string]interface{}{"url": vtkPath}
			u.ServeJSON()
			return
		}
	case ".step":
		fileName := "stp.geo"
		errT := execfunc.WriteStpGeoFile(processPath, fileNameT, fileName)
		if errT != nil {
			u.Data["json"] = map[string]interface{}{"message": "vtk文件保存失败"}
			u.ServeJSON()
			return
		} else {

			geoFile := processPath + fileName // 拼装geo文件路径
			nummeshTypeT := "-" + meshTypeT   // 去掉点以后，拼装命令
			stlVtkFilepath := processPath + filenameWithSuffix + "_" + timestr + outputFormatT

			// 生成vtk文件
			_, err := exec.Command(gmshPath, geoFile, nummeshTypeT, "-o", stlVtkFilepath, "-format", outPutFormat).Output()
			// beego.Error("err :", err)
			if err != nil {
				u.Data["json"] = map[string]interface{}{"url": err}
				u.ServeJSON()
				return
			}

			vtkPath := "http://192.168.2.134:4000/visualization/" + filenameWithSuffix + "_" + timestr + outputFormatT
			u.Data["json"] = map[string]interface{}{"url": vtkPath}
			u.ServeJSON()
			return
		}
	case ".igs":
		fileName := "igs.geo"
		errT := execfunc.WriteIgsGeoFile(processPath, fileNameT, fileName)
		if errT != nil {
			u.Data["json"] = map[string]interface{}{"message": "vtk文件保存失败"}
			u.ServeJSON()
			return
		} else {
			geoFile := processPath + fileName // 拼装geo文件路径
			nummeshTypeT := "-" + meshTypeT   // 去掉点以后，拼装命令
			stlVtkFilepath := processPath + filenameWithSuffix + "_" + timestr + outputFormatT

			// 生成vtk文件
			_, err := exec.Command(gmshPath, geoFile, nummeshTypeT, "-o", stlVtkFilepath, "-format", outPutFormat).Output()
			// beego.Error("err :", err)
			if err != nil {
				u.Data["json"] = map[string]interface{}{"url": err}
				u.ServeJSON()
				return
			}

			vtkPath := "http://192.168.2.134:4000/visualization/" + filenameWithSuffix + "_" + timestr + outputFormatT
			u.Data["json"] = map[string]interface{}{"url": vtkPath}
			u.ServeJSON()
			return
		}
	case ".iges":
		//WriteStlGeoFile(fileNameT);
		fileName := "igs.geo"
		errT := execfunc.WriteIgsGeoFile(processPath, fileNameT, fileName)
		if errT != nil {
			u.Data["json"] = map[string]interface{}{"message": "vtk文件保存失败"}
			u.ServeJSON()
			return
		} else {
			geoFile := processPath + fileName // 拼装geo文件路径
			nummeshTypeT := "-" + meshTypeT   // 去掉点以后，拼装命令
			stlVtkFilepath := processPath + filenameWithSuffix + "_" + timestr + outputFormatT

			// 生成vtk文件
			_, err := exec.Command(gmshPath, geoFile, nummeshTypeT, "-o", stlVtkFilepath, "-format", outPutFormat).Output()
			// beego.Error("err :", err)
			if err != nil {
				u.Data["json"] = map[string]interface{}{"url": err}
				u.ServeJSON()
				return
			}

			vtkPath := "http://192.168.2.134:4000/visualization/" + filenameWithSuffix + "_" + timestr + outputFormatT
			u.Data["json"] = map[string]interface{}{"url": vtkPath}
			u.ServeJSON()
			return
		}

	}

}
