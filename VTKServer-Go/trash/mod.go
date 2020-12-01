package controllers

/************************
*author haoyingfeng
*date	2020/10/27
*introduction:  读取mod3文件内容
**************************/

import (
	"VTKServer-Go/tool/execfunc"
	"encoding/json"
	"io/ioutil"

	// "encoding/json"
	// "io/ioutil"
	"bufio"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/astaxie/beego"
)

//ModFileController 处理文件数据
type ModFileController struct {
	beego.Controller
}

//ModFile 接收前端传来的文件信息
type ModFile struct {
	FileName string `json:"fileName"` //文件名称
}

// ModData mod文件数据
type ModData struct {
	// MeshFormat		string
	Nodes       []string
	Elements    []string
	ElementData map[string][]string
}

//Post 返回给前端数据内容
func (u *ModFileController) Post() {

	//接收前端发送的数据
	fileInfo := ModFile{}
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {

		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		beego.Debug("userchange get web info", string(b))
		errr := json.Unmarshal(b, &fileInfo)
		if errr != nil {
			beego.Error("e is :", errr)
		}
		beego.Debug("userchange get data from web :", string(b))
	}
	//跨域请求,仅限接口
	u.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	u.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Headers", "*")
	u.Ctx.ResponseWriter.Header().Set("Content-Type", "multipart/form-data")
	u.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	u.Ctx.Request.ParseMultipartForm(32 << 20)

	//配置中读取文件路径
	uploadFilePath := beego.AppConfig.String("UploadFile")

	filePath := filepath.Join(uploadFilePath + fileInfo.FileName)
	//打印文件名
	beego.Debug("fileinfo filename", fileInfo.FileName)

	//判断文件是否存在
	b := execfunc.IsExists(filePath)
	if !b {
		u.Data["json"] = map[string]interface{}{"message": "文件不存在"}
		u.ServeJSON()
		return
	}

	// 读取文件并记录参数位置
	info, err := ReadFile(filePath)
	if err != nil {
		beego.Error("read vtk fail:", err)
	}
	// defer info.Close()

	//打开文件，执行完成关闭文件
	file, errs := os.Open(filePath)
	defer file.Close()

	// 把文件读取到缓冲区中
	rd := bufio.NewReader(file)
	var count int = 0
	moddata := ModData{}
	// moddata.MeshFormat = "$MeshFormat"
	moddata.Nodes = make([]string, 0)
	moddata.Elements = make([]string, 0)
	moddata.ElementData = make(map[string][]string, 0)
	beego.Debug("info", info)

	for {

		line, errf := rd.ReadString('\n')
		if info.MeshFormat > 0 {
			count++

			//写入坐标系内容
			if count > info.Nodes && count < info.NodesIden {
				// fmt.Println("读取 Nodes 字段")
				lineNew := strings.ReplaceAll(line, "	", " ")
				for i := 0; i < len(strings.Split(lineNew, " ")); i++ {
					strArr := strings.Split(strings.Replace(strings.ReplaceAll(lineNew, "\r\n", ""), "\n", "", -1), " ")
					if strArr[i] != "" && strArr[i] != " " && len(strArr) == 3 {

						moddata.Nodes = append(moddata.Nodes, strArr[i])
					}
				}
			}

			// Elements参数部分
			if count > info.Elements && count < info.ElementsIden {

				lineNew := strings.ReplaceAll(line, "	", " ")
				for i := 0; i < len(strings.Split(lineNew, " ")); i++ {
					// fmt.Println("Elements报数: ", count)
					strArr := strings.Split(strings.Replace(strings.ReplaceAll(lineNew, "\r\n", ""), "\n", "", -1), " ")
					lenn := len(strArr)
					if strArr[i] != "" && strArr[i] != " " && lenn == 6 {
						// fmt.Println("读取 Elements 字段")
						// 将第一个参数替换成 4
						if i == 0 {
							moddata.Elements = append(moddata.Elements, "4")
						} else {
							moddata.Elements = append(moddata.Elements, strArr[i])
						}

					}
				}
			}

			// ElementData参数部分
			if count > info.ElementData && count < info.ElementDataIden {
				// fmt.Println("读取ElementData字段")
				lineNew := strings.ReplaceAll(line, "	", " ")

				strArr := strings.Split(strings.Replace(strings.ReplaceAll(lineNew, "\r\n", ""), "\n", "", -1), " ")
				lend := len(strArr)
				// fmt.Println("ElementData数据：", count)
				if lend > 6 && strArr[lend-3] != "" {
					moddata.ElementData["elementdata"] = append(moddata.ElementData["elementdata"], strArr[lend-1])
				}

			}
		}
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}

	}

	// Nodes 返回
	if errs != nil {

		u.Data["json"] = map[string]interface{}{"data": "数据为空", "jsonFile": errs}
		u.ServeJSON()
		return
	} else {
		// fmt.Println(len(moddata.ElementData["elementdata"]))
		u.Data["json"] = map[string]interface{}{"type": ".gmsh", "data": moddata, "jsonFile": "false"}
		u.ServeJSON()
		return
	}

}

//ModParamInfo 文件参数
type ModParamInfo struct {
	MeshFormat int //MeshFormat出现的行数
	// MeshFormatIden		int		//MeshFormat后面的关键字

	Nodes        int //Node出现的行数
	NodesIden    int //Node后面的关键字
	Elements     int //Elements关键字所在的行数组
	ElementsIden int //Elements后面的关键字

	ElementData     int //ElementData出现的行数
	ElementDataIden int //ElementData后面的关键字

}

//ReadFile 获取源文件关键变量数据
func ReadFile(paths string) (ModParamInfo, error) {

	// 读取文件内容，在执行完后，关闭
	file, err := os.Open(paths)
	if err != nil {
		fmt.Println("read fail")

	}
	defer file.Close()

	rd := bufio.NewReader(file)
	info := ModParamInfo{}
	var count int = 0

	for {
		linez, errf := rd.ReadString('\n')
		count++

		// 判断 $MeshFormat 是否出现在此行中
		if strings.Contains(linez, "MeshFormat") {
			info.MeshFormat = count
		}
		// if strings.Contains(linez, "EndMeshFormat") {
		// 	info.MeshFormatIden = count
		// }
		if strings.Contains(linez, "$Nodes") {
			info.Nodes = count
		}
		if strings.Contains(linez, "$EndNodes") {
			info.NodesIden = count
		}
		if strings.Contains(linez, "$Elements") {
			info.Elements = count
		}
		if strings.Contains(linez, "$EndElements") {
			info.ElementsIden = count
		}
		if strings.Contains(linez, "$ElementData") {
			info.ElementData = count
		}
		if strings.Contains(linez, "$EndElementData") {
			info.ElementDataIden = count
		}
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
	}
	return info, err
}
