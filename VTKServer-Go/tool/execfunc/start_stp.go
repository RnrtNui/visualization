package execfunc

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/astaxie/beego"
)

//StpData ss
type StpData struct {
	CELLS  []int
	POINTS []string
}

//HandleStp 处理off文件
func HandleStp(filePath string) (*StpData, error) {

	info, errs := GetfileData(filePath)
	if errs != nil {
		return nil, errs
	}
	var count = 0
	stldata := &StpData{}
	beego.Debug("info:", info.ClosedShell)
	for _, keydata := range info.ClosedShell {
		var tempMap = make(map[string][]string, 0)
		for i := 0; i < len(info.AdvancedFace); i++ {
			if HasP(info.AdvancedFace[i], keydata) {
				fbKey := GetKeyFromLine(info.AdvancedFace[i])[0]
				for j := 0; j < len(info.FaceBound); j++ {
					if HasP(info.FaceBound[j], fbKey) {
						beego.Debug("fbKey:", fbKey)
						elKey := strings.Split(info.FaceBound[j], ",")[1]
						for _, edData := range info.EdgeLoop {
							if HasP(edData, elKey) {
								beego.Debug("elKey:", elKey)
								oeKeys := GetKeyFromLine(edData)
								beego.Debug("oeKeys:", oeKeys)
								for _, oeKey := range oeKeys {
									beego.Debug("oeKey:", oeKey)
									for _, oeData := range info.OrientedEdge {
										if HasP(oeData, oeKey) {
											beego.Debug("oedata:", oeData)
											ecKey := strings.Split(oeData, ",")[3]
											for _, ecData := range info.EdgeCurve {
												if HasP(ecData, ecKey) {
													beego.Debug("ecKey:", ecKey)
													vpKey1 := strings.Split(ecData, ",")[1]
													vpKey2 := strings.Split(ecData, ",")[2]
													for _, vpData := range info.VertexPoint {
														if HasP(vpData, vpKey1) || HasP(vpData, vpKey2) {
															cpKey := strings.Split(strings.Split(vpData, ",")[1], ")")[0]
															for _, cpData := range info.CartesianPoint {
																if HasP(cpData, cpKey) {
																	beego.Debug("cpKey:", cpKey)
																	cpArr := GetKeyFromLine(cpData)
																	tempMap[cpKey] = cpArr
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		for k, v := range tempMap {
			beego.Debug("k:", k)
			stldata.POINTS = append(stldata.POINTS,
				v...)
			if count%3 == 0 {
				stldata.CELLS = append(stldata.CELLS, 3)
			}
			stldata.CELLS = append(stldata.CELLS, count)
			count++
		}

	}
	// file, errs := os.Open(filePath)
	// defer file.Close()
	// // 把文件读取到缓冲区中
	// rd := bufio.NewReader(file)

	// var count int = 0
	// stldata := &StpData{}
	// stldata.POINTS = make([]string, 0)
	// stldata.CELLS = make([]int, 0)
	// for {
	// 	line, errf := rd.ReadString('\n')
	// 	//找出文件中的点(x,y,z)数据
	// 	if strings.Contains(line, "CARTESIAN_POINT") {
	// 		arr1 := strings.Split(line, "(")
	// 		arr2 := strings.Split(arr1[len(arr1)-1], ")")
	// 		lineArr := strings.Split(arr2[0], ",")
	// 		if len(lineArr) == 3 {
	// 			// x, _ := strconv.ParseFloat(lineArr[0], 32)
	// 			// y, _ := strconv.ParseFloat(lineArr[1], 32)
	// 			// z, _ := strconv.ParseFloat(lineArr[2], 32)
	// 			//stldata变量中添加点
	// 			stldata.POINTS = append(stldata.POINTS,
	// 				lineArr[0],
	// 				lineArr[0],
	// 				lineArr[0])
	// 			//stldata变量中添加单元
	// 			if count%3 == 0 {
	// 				stldata.CELLS = append(stldata.CELLS, 3)
	// 			}
	// 			stldata.CELLS = append(stldata.CELLS, count)
	// 			count++
	// 		}
	// 	}
	// 	//读取结束跳出循环
	// 	if errf != nil || io.EOF == errf {
	// 		fmt.Println("for run result:", "over")
	// 		break
	// 	}
	// }
	return stldata, errs
}

//GetfileData 处理stp文件
func GetfileData(filePath string) (*StpFileInfo, error) {

	file, errs := os.Open(filePath)
	defer file.Close()
	// 把文件读取到缓冲区中
	rd := bufio.NewReader(file)
	Info := &StpFileInfo{}
	Info.FileData = make([]string, 0)
	var stmpData string = ""
	var count int = 0
	var startNum = 0
	for {
		line, errf := rd.ReadString('\n')
		count++
		line1 := DeleteExtraSpace(line)
		//判断文件中是否含有特殊字符
		// if strings.Contains(line1, "\r") || strings.Contains(line1, "\n") {
		// 	line1 = strings.FieldsFunc(line1, Split)[0]
		// }
		//找出文件中的点(x,y,z)数据
		if strings.Contains(line, "DATA;") {
			startNum = count
		}
		if count > startNum {
			if strings.Contains(line1, "=") {
				if stmpData != "" {
					Info.FileData = append(Info.FileData, stmpData)
					switch {
					case strings.Contains(line1, "ADVANCED_FACE"):
						Info.AdvancedFace = append(Info.AdvancedFace, line1)
					case strings.Contains(line1, "FACE_BOUND"):
						Info.FaceBound = append(Info.FaceBound, line1)
					case strings.Contains(line1, "FACE_OUTER_BOUND"):
						Info.FaceBound = append(Info.FaceBound, line1)
					case strings.Contains(line1, "EDGE_LOOP"):
						Info.EdgeLoop = append(Info.EdgeLoop, line1)
					case strings.Contains(line1, "ORIENTED_EDGE"):
						Info.OrientedEdge = append(Info.OrientedEdge, line1)
					case strings.Contains(line1, "EDGE_CURVE"):
						Info.EdgeCurve = append(Info.EdgeCurve, line1)
					case strings.Contains(line1, "VERTEX_POINT"):
						Info.VertexPoint = append(Info.VertexPoint, line1)
					case strings.Contains(line1, "CARTESIAN_POINT"):
						Info.CartesianPoint = append(Info.CartesianPoint, line1)
					}
				}
				stmpData = line1
			} else {
				stmpData += line1
			}

		}
		//读取结束跳出循环
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
	}
	for _, str := range Info.FileData {
		if strings.Contains(str, "CLOSED_SHELL") {
			Info.ClosedShell = GetKeyFromLine(DelSpeChar(str))
		}
	}

	return Info, errs
}

//GetKeyFromLine 提取行中的关键字
func GetKeyFromLine(keyd string) []string {
	arr1 := strings.Split(keyd, "(")
	arr2 := strings.Split(arr1[len(arr1)-1], ")")
	return strings.Split(arr2[0], ",")
}

//DelSpeChar 去除特殊字符
func DelSpeChar(str string) string {
	str1 := DeleteExtraSpace(str)
	str2 := strings.ReplaceAll(str1, " ", "")
	str3 := strings.ReplaceAll(str2, "\r", "")
	str4 := strings.ReplaceAll(str3, "\n", "")
	return str4
}

//HasP 判断是否包含前缀
func HasP(str string, subStr string) bool {
	if strings.HasPrefix(str, subStr+" ") ||
		strings.HasPrefix(str, subStr+"=") {
		return true
	}
	return false
}

//StpFileInfo stp文件信息
type StpFileInfo struct {
	FileData       []string
	ClosedShell    []string
	AdvancedFace   []string
	FaceBound      []string
	EdgeLoop       []string
	OrientedEdge   []string
	EdgeCurve      []string
	VertexPoint    []string
	CartesianPoint []string
}
