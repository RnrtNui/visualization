package execfunc

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"github.com/astaxie/beego"
)

//DeleteExtraSpace 删除多余空格
func DeleteExtraSpace(s string) string {
	//删除字符串中的多余空格，有多个空格时，仅保留一个空格
	s1 := strings.Replace(s, "  ", " ", -1)     //替换tab为空格
	regstr := "\\s{2,}"                         //两个及两个以上空格的正则表达式
	reg, _ := regexp.Compile(regstr)            //编译正则表达式
	s2 := make([]byte, len(s1))                 //定义字符数组切片
	copy(s2, s1)                                //将字符串复制到切片
	spcIndex := reg.FindStringIndex(string(s2)) //在字符串中搜索
	for len(spcIndex) > 0 {                     //找到适配项
		s2 = append(s2[:spcIndex[0]+1], s2[spcIndex[1]:]...) //删除多余空格
		spcIndex = reg.FindStringIndex(string(s2))           //继续在字符串中搜索
	}
	return string(s2) //返回去除多余空格后的数据
}

//Split 公共方法，每行切割规则
func Split(r rune) bool {
	return r == '\n' || r == '\r'
}

//FaceFind   球形数据找面
func FaceFind(filepath string) ([][]int, []int, *VtkParamInfo, error) {
	info, err := ReadFile(filepath)
	file, err := os.Open(filepath)
	if err != nil {
		fmt.Println("read fail")

	}
	defer file.Close()
	rd := bufio.NewReader(file)
	var count = 0
	pointArr := make([][]float64, 0)
	cellArr := make([][]int, 0)
	var newCellArr = make([][]int, 0)
	var idenCell []int
	for {
		linez, errf := rd.ReadString('\n')
		count++
		line2 := DeleteExtraSpace(linez)
		//line2 := strings.FieldsFunc(line1, Split)[0]

		if count > info.points && count < info.cells {
			line3 := strings.FieldsFunc(line2, Split)[0]
			strA := strings.Split(line3, " ")
			if count == info.points+1 {
				beego.Debug("point", strA)
			}
			var pointA []float64
			for i := 1; i < len(strA)-1; i++ {
				floatA, _ := strconv.ParseFloat(strA[i], 64)
				pointA = append(pointA, floatA)
			}
			pointArr = append(pointArr, pointA)
		}
		if count > info.cells && count < info.cellTypes {
			line3 := strings.FieldsFunc(line2, Split)[0]
			strB := strings.Split(line3, " ")
			if count == info.cells+1 {
				beego.Debug("str", strB)
			}

			var pointB []int
			for i := 1; i <= len(strB)-1; i++ {
				intA, _ := strconv.Atoi(strB[i])
				pointB = append(pointB, intA)
			}
			cellArr = append(cellArr, pointB)
		}
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
	}
	if len(cellArr) > 0 && len(pointArr) > 0 {
		for i := 0; i <= len(cellArr)-1; i++ {
			x := pointArr[cellArr[i][1]][0] * pointArr[cellArr[i][1]][0]
			y := pointArr[cellArr[i][1]][1] * pointArr[cellArr[i][1]][1]
			z := pointArr[cellArr[i][1]][2] * pointArr[cellArr[i][1]][2]
			r := math.Sqrt(x + y + z)
			if r > 6200.0 {
				newCellArr = append(newCellArr, cellArr[i])
			}
		}
	}
	idenCell = append(idenCell, info.cells, info.cellTypes)
	return newCellArr, idenCell, &info, err
}

//FileToWrite 写文件
func FileToWrite(filePath string, wfilePath string) error {
	rfile, err := os.Open(filePath)
	if err != nil {
		beego.Error("err:", err)
		return err
	}
	wfile, err := os.Create(wfilePath)
	if err != nil {
		beego.Error("err:", err)
		return err
	}
	cellArr, idCell, info, err := FaceFind(filePath)
	if err != nil {
		beego.Error("err:", err)
		return err
	}
	defer rfile.Close()
	defer wfile.Close()
	br := bufio.NewReader(rfile)
	bw := bufio.NewWriter(wfile)
	var count = 0
	for {
		line, errf := br.ReadString('\n')
		count++
		if count <= info.points {
			bw.WriteString(line)
			if count == info.points {
				bw.Flush()
			}
		}
		if count <= idCell[0] && count > info.points+641151 {
			bw.WriteString(line)
			if count == idCell[0] {
				bw.Flush()
			}
		}
		if count == idCell[0]+1 {
			for i := 0; i <= len(cellArr)-1; i++ {
				var str string
				for j := 0; j <= len(cellArr[i])-1; j++ {
					cellNum := strconv.Itoa(cellArr[i][j])
					if cellNum != "8" {
						cellNum = strconv.Itoa(cellArr[i][j] - 641151)
					}
					str += " " + cellNum
				}
				bw.WriteString(str + "\n")
			}
			bw.Flush()
		}
		for k := 0; k < len(info.scalars); k++ {
			if k == 0 {
				if count >= info.scalars[k]-1 && count <= info.scalars[k]+1 {
					bw.WriteString(line)
				}
			} else if k > 0 {
				if count > info.scalars[k-1]+641152 && count <= info.scalars[k]+1 {
					bw.WriteString(line)
				}
			}
			if k == len(info.scalars)-1 {
				if count > info.scalars[k]+641152 && count <= info.vectors[0] {
					bw.WriteString(line)
				}
			}

		}
		if count > info.vectors[0]+641151 {
			bw.WriteString(line)
		}

		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
	}
	bw.Flush()
	return nil
}

//SaveToJSON 保存为json文件
func SaveToJSON(jsonFile interface{}, filePath string) error {
	//判断文件是否存在
	if IsExists(filePath) {
		return errors.New("json is exist")
	}
	//返回的对象信息解析存入json文件
	save, err := json.Marshal(jsonFile)
	if err != nil {
		beego.Error("err to save", err)
		return err
	}
	fd, _ := os.OpenFile(filePath, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0644)
	defer fd.Close()
	fd.Write(save)
	fd.Write([]byte("\n"))
	return nil
}

//SaveToCsv 保存为csv文件
func SaveToCsv(fileData [][]string, filePath string) error {
	wfile, err := os.Create(filePath)
	bw := bufio.NewWriter(wfile)
	defer wfile.Close()
	for i := 0; i < len(fileData); i++ {
		for j := 0; j < len(fileData[i]); j++ {
			if j == len(fileData[i])-1 {
				_, err = bw.WriteString(fileData[i][j] + "\n")
			} else {
				_, err = bw.WriteString(fileData[i][j] + ",")
			}

		}
		bw.Flush()
	}
	bw.Flush()
	return err
}

//CallCommand 调用c命令处理文件
func CallCommand(uploadFilePath string, proName string, fileName string) string {
	var execFile string
	//参数
	if strings.Contains(uploadFilePath, "\\") {
		execFile = filepath.Join(uploadFilePath, "command")
	} else if strings.Contains(uploadFilePath, "/") {
		execFile = filepath.Join(uploadFilePath, "commandLinux")
	}

	filePaths := filepath.Join(uploadFilePath, "project", proName, "dataUstr")
	//执行命令文件生成指定类型数据文件
	if strings.Contains(fileName, "flavia.msh") {
		if !strings.HasPrefix(fileName, "F") {
			if !strings.HasPrefix(fileName, "T") {
				newFileName := strings.Replace(fileName, ".msh", ".res", -1)
				strNew := ComputeTypeFile(execFile, filePaths, newFileName)
				if strings.Contains(strNew, "错误") {
					//返数据信息
					return "文件处理失败"
				}
			}
			strs := ComputeTypeFile(execFile, filePaths, fileName)
			if strings.Contains(strs, "错误") {
				//返回数据信息
				return "文件处理失败"
			}
		}
	} else if strings.Contains(fileName, "flavia.res") {
		strs := ComputeTypeFile(execFile, filePaths, fileName)
		if strings.Contains(strs, "错误") {
			//返回数据信息
			return "文件处理失败"
		}
		newFileName := strings.Replace(fileName, ".res", ".msh", -1)
		strNew := ComputeTypeFile(execFile, filePaths, newFileName)
		if strings.Contains(strNew, "错误") {
			//返回数据信息
			return "文件处理失败"
		}
	} else if strings.Contains(fileName, ".msh") && len(strings.Split(fileName, ".")) == 2 {
		if !strings.HasPrefix(fileName, "T") {
			strs := ComputeTypeFile(execFile, filePaths, fileName)
			if strings.Contains(strs, "错误") {
				return "文件处理失败"
			}
		}
	}
	return "成功"
}

//CallCommandPro 调用c命令处理文件
func CallCommandPro(uploadFilePath string, fileName string) string {
	var execFile string
	//参数
	if strings.Contains(uploadFilePath, "\\") {
		execFile = filepath.Join(uploadFilePath, "command")
	} else if strings.Contains(uploadFilePath, "/") {
		execFile = filepath.Join(uploadFilePath, "commandLinux")
	}

	filePaths := filepath.Join(uploadFilePath, "process")
	//执行命令文件生成指定类型数据文件
	if strings.Contains(fileName, "flavia.msh") {
		if !strings.HasPrefix(fileName, "F") {
			if !strings.HasPrefix(fileName, "T") {
				newFileName := strings.Replace(fileName, ".msh", ".res", -1)
				strNew := ComputeTypeFile(execFile, filePaths, newFileName)
				if strings.Contains(strNew, "错误") {
					//返数据信息
					return "文件处理失败"
				}
			}
			strs := ComputeTypeFile(execFile, filePaths, fileName)
			if strings.Contains(strs, "错误") {
				//返回数据信息
				return "文件处理失败"
			}
		}
	} else if strings.Contains(fileName, "flavia.res") {
		strs := ComputeTypeFile(execFile, filePaths, fileName)
		if strings.Contains(strs, "错误") {
			//返回数据信息
			return "文件处理失败"
		}
		newFileName := strings.Replace(fileName, ".res", ".msh", -1)
		strNew := ComputeTypeFile(execFile, filePaths, newFileName)
		if strings.Contains(strNew, "错误") {
			//返回数据信息
			return "文件处理失败"
		}
	} else if strings.Contains(fileName, ".msh") && len(strings.Split(fileName, ".")) == 2 {
		if !strings.HasPrefix(fileName, "T") {
			strs := ComputeTypeFile(execFile, filePaths, fileName)
			if strings.Contains(strs, "错误") {
				return "文件处理失败"
			}
		}
	}
	return "成功"
}

//DoesJSONExist 是否存在json文件
func DoesJSONExist(uploadFilePath string, fileName string) (string, string, string) {
	var pointJSONFile string
	var fileType string
	var errp error
	nameStr := strings.Split(fileName, ".")
	jsonFile := fileName + ".json"
	if !strings.Contains(fileName, ".obj") {
		pointJSONFile = strings.Replace(fileName, "."+nameStr[len(nameStr)-1], "_"+nameStr[len(nameStr)-1]+"_POINTS.json", -1)
	}
	fileName1 := strings.ToLower(fileName)
	switch {
	case strings.Contains(fileName1, ".msh") && len(strings.Split(fileName1, ".")) == 2:
		fileType = ".msh"
	case strings.Contains(fileName1, ".csv"):
		fileType = ".csv"
	case strings.Contains(fileName1, ".vtk"):
		fileType = ".vtk"
	case strings.Contains(fileName1, ".off"):
		fileType = ".off"
	case strings.Contains(fileName1, ".stl"):
		fileType = ".off"
	case strings.Contains(fileName1, ".inp"):
		fileType = ".inp"
	case strings.Contains(fileName1, ".obj"):
		fileType = ".obj"
	case strings.Contains(fileName1, ".post.msh"):
		fileType = ".post.msh"
	case strings.Contains(fileName1, ".flavia.msh"):
		fileType = ".flavia.msh"
	default:
		return "", "no", "no"
	}
	beego.Debug("jsonfi", jsonFile, fileName)
	jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
	_, errf := os.Stat(jsonFilePath)
	if pointJSONFile != "" {
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", pointJSONFile)
		_, errp = os.Stat(jsonPFilePath)
	} else {
		if errf == nil {
			staticFile := "/dicom/" + jsonFile
			return fileType, staticFile, "no"
		}
		if errf != nil {
			return fileType, "no", "no"
		}
	}
	if errf == nil && errp == nil {
		staticFile := "/dicom/" + jsonFile
		return fileType, staticFile, "yes"
	}
	if errf == nil && errp != nil {
		staticFile := "/dicom/" + jsonFile
		return fileType, staticFile, "no"
	}
	if errf != nil && errp == nil {
		return fileType, "no", "yes"
	}
	if errf != nil && errp != nil {
		return fileType, "no", "no"
	}

	return "", "no", "no"
}

//IsExists 文件路径是否存在
func IsExists(path string) bool {
	_, err := os.Stat(path)
	beego.Debug("1", path)
	if err != nil {
		return false
	}
	if os.IsNotExist(err) {
		return false
	}
	beego.Debug(path)
	return true
}

//IsBinary 判断是否为二进制文件
func IsBinary(filePath string) bool {
	b := true
	files, _ := os.Open(filePath)
	bs := bufio.NewReader(files)
	for {
		d, errf := bs.ReadString('\n')
		if strings.Contains(d, "vertex") || strings.Contains(d, "ASCII") {
			b = false
			break
		}
		if errf != nil || io.EOF == errf {
			break
		}
	}
	return b
}

//ProcessData 处理各类型数据
func ProcessData(uploadFilePath string, proName string, fileName string, data string, pdata string) (interface{}, string, error) {
	nameStr := strings.Split(fileName, ".")
	jsonFile := fileName + ".json"
	jsonPFile := strings.ReplaceAll(fileName, "."+nameStr[len(nameStr)-1], "_"+nameStr[len(nameStr)-1]+"_POINTS.json")
	beego.Debug("jsonFile", jsonFile, jsonPFile)
	switch {
	//处理csv文件数据
	case strings.Contains(fileName, ".csv"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		filePath := filepath.Join(uploadFilePath, "project", proName, "dataStr", fileName)
		csvFilePath := filepath.Join(uploadFilePath, "dicom", fileName)
		csvArr, err := HandleCSV(filePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(csvArr, jsonFilePath)
			err = SaveToCsv(csvArr, csvFilePath)
		}

		if err != nil {
			beego.Error("read csv file is fail :", err)
			//返回前端数据信息
			return "", "无csv文件", err
		}
		// jfilePath := ""
		// if errs == nil {
		// 	jfilePath = staticFile
		// }
		// info := &dao.JFile{
		// 	FileType:  "csv",
		// 	FileName:  fileName,
		// 	JFilePath: jfilePath,
		// }
		// dao.JFileAdd(info)
		//返回前端数据信息
		return csvArr, ".csv", nil
	case strings.Contains(fileName, ".vtk"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		filePath := filepath.Join(uploadFilePath, "project", proName, "dataUstr", fileName)
		objdata, err := HandleVTK(filePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(objdata, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(objdata.POINTS, jsonPFilePath)
		}
		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无vtk文件", err
		}
		//返回前端数据信息
		return objdata, ".vtk", nil
	case strings.Contains(fileName, ".off"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		filePath := filepath.Join(uploadFilePath, "project", proName, "dataUstr", fileName)
		objdata, err := HandleOFF(filePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(objdata, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(objdata.POINTS, jsonPFilePath)
		}

		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无off文件", err
		}

		//返回前端数据信息
		return objdata, ".off", nil
	case strings.Contains(strings.ToLower(fileName), ".stl"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		filePath := filepath.Join(uploadFilePath, "project", proName, "dataUstr", fileName)
		//objdata, err := binarypro.BackSTLInfo(filePath)
		var err error
		objdata := &StlData{}
		if b := IsBinary(filePath); b {
			objdata, err = BackSTLInfo(filePath)
		} else {
			objdata, err = HandleStl(filePath)
		}

		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(&objdata, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(&objdata.POINTS, jsonPFilePath)
		}
		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无stl文件", err
		}
		beego.Debug("web obj:", len(objdata.CELLS))
		//返回前端数据信息
		return objdata, ".off", err
	case strings.Contains(strings.ToLower(fileName), ".inp"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		filePath := filepath.Join(uploadFilePath, "project", proName, "dataUstr", fileName)
		objdata, err := HandleInp(filePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(objdata, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(objdata.POINTS, jsonPFilePath)
		}
		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无inp文件", err
		}
		//返回前端数据信息
		return objdata, ".inp", nil
	case strings.Contains(fileName, ".obj"):
		objFile := strings.ReplaceAll(fileName, ".obj", "")
		objFilePath := filepath.Join(uploadFilePath, "dicom", objFile)
		_, errb := os.Stat(objFilePath)
		if errb == nil {
			staticFile := "/dicom/" + objFile
			return staticFile, ".obj", nil
		}
		return "", "不存在obj文件", nil
	case strings.Contains(fileName, ".msh") && len(strings.Split(fileName, ".")) == 2:
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		var tfileName string
		if !strings.HasPrefix(fileName, "T") {
			tfileName = "T" + fileName
		} else {
			tfileName = fileName
		}
		filePath := filepath.Join(uploadFilePath, "project", proName, "dataUstr", tfileName)
		strArrs, err := HandleMSH(filePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(strArrs, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(strArrs[0], jsonPFilePath)
		}
		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无msh文件", err
		}
		//返回前端数据信息
		return strArrs, ".msh", nil
	case strings.Contains(fileName, ".post.msh"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		filePath := filepath.Join(uploadFilePath, "project", proName, "dataUstr", fileName)
		tfileName := strings.Replace(fileName, ".msh", ".res", -1)
		tfilePath := filepath.Join(uploadFilePath, "project", proName, "dataUstr", tfileName)
		strArrs, err := HandlePostMSH(filePath, tfilePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(strArrs, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(strArrs.StrCoord, jsonPFilePath)
		}

		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无post.msh文件", err
		}
		//返回前端数据信息
		return strArrs, ".post.msh", nil
	case strings.Contains(fileName, ".flavia.msh"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		var ffileName string
		if !strings.HasPrefix(fileName, "F") {
			ffileName = "F" + fileName
		} else {
			ffileName = fileName
		}
		fileRes := strings.Replace(strings.Replace(ffileName, "F", "NT", -1), ".msh", ".res", -1)
		filePathRes := filepath.Join(uploadFilePath, "project", proName, "dataUstr", fileRes)
		tfileRes := strings.Replace(strings.Replace(ffileName, "F", "T", -1), ".msh", ".res", -1)
		tfilePathRes := filepath.Join(uploadFilePath, "project", proName, "dataUstr", tfileRes)
		filePath := filepath.Join(uploadFilePath, "project", proName, "dataUstr", ffileName)
		strArrs, err := HandleFlaviaMSH(tfilePathRes, filePathRes, filePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(strArrs, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(strArrs.Point[0], jsonPFilePath)
		}

		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无flavia.msh文件", err
		}
		//返回前端数据信息
		return strArrs, ".flavia.msh", nil
	default:
		return "", "没有对应类型的文件", nil
	}

}

//DataPro 处理各类型数据
func DataPro(uploadFilePath string, fileName string, data string, pdata string) (interface{}, string, error) {
	if !IsExists(filepath.Join(uploadFilePath, "process", fileName)) {
		return "0", "文件不存在,请上传数据文件", nil
	}
	nameStr := strings.Split(fileName, ".")
	jsonFile := fileName + ".json"
	jsonPFile := strings.ReplaceAll(fileName, "."+nameStr[len(nameStr)-1], "_"+nameStr[len(nameStr)-1]+"_POINTS.json")
	beego.Debug("jsonFile", jsonFile, jsonPFile)
	switch {
	//处理csv文件数据
	case strings.Contains(fileName, ".csv"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		filePath := filepath.Join(uploadFilePath, "process", fileName)
		csvFilePath := filepath.Join(uploadFilePath, "dicom", fileName)
		csvArr, err := HandleCSV(filePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(csvArr, jsonFilePath)
			err = SaveToCsv(csvArr, csvFilePath)
		}

		if err != nil {
			beego.Error("read csv file is fail :", err)
			//返回前端数据信息
			return "", "无csv文件", err
		}
		// jfilePath := ""
		// if errs == nil {
		// 	jfilePath = staticFile
		// }
		// info := &dao.JFile{
		// 	FileType:  "csv",
		// 	FileName:  fileName,
		// 	JFilePath: jfilePath,
		// }
		// dao.JFileAdd(info)
		//返回前端数据信息
		return csvArr, ".csv", nil
	case strings.Contains(fileName, ".vtk"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		filePath := filepath.Join(uploadFilePath, "process", fileName)
		objdata, err := HandleVTK(filePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(objdata, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(objdata.POINTS, jsonPFilePath)
		}
		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无vtk文件", err
		}
		//返回前端数据信息
		return objdata, ".vtk", nil
	case strings.Contains(fileName, ".off"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		filePath := filepath.Join(uploadFilePath, "process", fileName)
		objdata, err := HandleOFF(filePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(objdata, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(objdata.POINTS, jsonPFilePath)
		}

		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无off文件", err
		}

		//返回前端数据信息
		return objdata, ".off", nil
	case strings.Contains(strings.ToLower(fileName), ".stl"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		filePath := filepath.Join(uploadFilePath, "process", fileName)
		//objdata, err := binarypro.BackSTLInfo(filePath)
		var err error
		objdata := &StlData{}
		if b := IsBinary(filePath); b {
			objdata, err = BackSTLInfo(filePath)
		} else {
			objdata, err = HandleStl(filePath)
		}

		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(&objdata, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(&objdata.POINTS, jsonPFilePath)
		}
		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无stl文件", err
		}
		beego.Debug("web obj:", len(objdata.CELLS))
		//返回前端数据信息
		return objdata, ".off", err
	case strings.Contains(strings.ToLower(fileName), ".inp"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		filePath := filepath.Join(uploadFilePath, "process", fileName)
		objdata, err := HandleInp(filePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(objdata, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(objdata.POINTS, jsonPFilePath)
		}
		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无inp文件", err
		}
		//返回前端数据信息
		return objdata, ".inp", nil
	case strings.Contains(fileName, ".obj"):
		objFile := strings.ReplaceAll(fileName, ".obj", "")
		objFilePath := filepath.Join(uploadFilePath, "dicom", objFile)
		_, errb := os.Stat(objFilePath)
		if errb == nil {
			staticFile := "/dicom/" + objFile
			return staticFile, ".obj", nil
		}
		return "", "不存在obj文件", nil
	case strings.Contains(fileName, ".msh") && len(strings.Split(fileName, ".")) == 2:
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		var tfileName string
		if !strings.HasPrefix(fileName, "T") {
			tfileName = "T" + fileName
		} else {
			tfileName = fileName
		}
		filePath := filepath.Join(uploadFilePath, "process", tfileName)
		strArrs, err := HandleMSH(filePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(strArrs, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(strArrs[0], jsonPFilePath)
		}
		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无msh文件", err
		}
		//返回前端数据信息
		return strArrs, ".msh", nil
	case strings.Contains(fileName, ".post.msh"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		filePath := filepath.Join(uploadFilePath, "process", fileName)
		tfileName := strings.Replace(fileName, ".msh", ".res", -1)
		tfilePath := filepath.Join(uploadFilePath, "process", tfileName)
		strArrs, err := HandlePostMSH(filePath, tfilePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(strArrs, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(strArrs.StrCoord, jsonPFilePath)
		}

		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无post.msh文件", err
		}
		//返回前端数据信息
		return strArrs, ".post.msh", nil
	case strings.Contains(fileName, ".flavia.msh"):
		jsonFilePath := filepath.Join(uploadFilePath, "dicom", jsonFile)
		jsonPFilePath := filepath.Join(uploadFilePath, "dicom", jsonPFile)
		var ffileName string
		if !strings.HasPrefix(fileName, "F") {
			ffileName = "F" + fileName
		} else {
			ffileName = fileName
		}
		fileRes := strings.Replace(strings.Replace(ffileName, "F", "NT", -1), ".msh", ".res", -1)
		filePathRes := filepath.Join(uploadFilePath, "process", fileRes)
		tfileRes := strings.Replace(strings.Replace(ffileName, "F", "T", -1), ".msh", ".res", -1)
		tfilePathRes := filepath.Join(uploadFilePath, "process", tfileRes)
		filePath := filepath.Join(uploadFilePath, "process", ffileName)
		strArrs, err := HandleFlaviaMSH(tfilePathRes, filePathRes, filePath)
		if !strings.Contains(data, "/dicom/") {
			err = SaveToJSON(strArrs, jsonFilePath)
		}
		if pdata != "yes" {
			err = SaveToJSON(strArrs.Point[0], jsonPFilePath)
		}

		if err != nil {
			beego.Error("read vtk file is fail :", err)
			return "", "无flavia.msh文件", err
		}
		//返回前端数据信息
		return strArrs, ".flavia.msh", nil
	default:
		return "", "没有对应类型的文件", nil
	}

}
