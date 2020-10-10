package execfunc

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/astaxie/beego"
)

//ObjData 返回前端对象数组
type ObjData struct {
	CELLS     []string
	POINTS    []string
	CELLDATA  map[string][]string
	POINTDATA map[string][]string
	VECTORS   map[string][]string
}

//HandleVTK 处理vtk
func HandleVTK(filePath string) (ObjData, error) {

	info, err := ReadFile(filePath)
	if err != nil {
		beego.Error("read vtk fail:", err)
	}
	file, errs := os.Open(filePath)
	defer file.Close()

	// 把文件读取到缓冲区中
	rd := bufio.NewReader(file)
	var count int = 0
	objdata := ObjData{}
	objdata.POINTS = make([]string, 0)
	objdata.CELLS = make([]string, 0)
	objdata.CELLDATA = make(map[string][]string, 0)
	objdata.POINTDATA = make(map[string][]string, 0)
	objdata.VECTORS = make(map[string][]string, 0)
	beego.Debug("info", info)
	for {

		line, errf := rd.ReadString('\n')
		count++
		//写入坐标系内容
		if len(info.meta) > 0 {
			if count > info.points && count < info.meta[0] {
				lineNew := strings.ReplaceAll(line, "	", " ")
				for i := 0; i < len(strings.Split(lineNew, " ")); i++ {
					strArr := strings.Split(strings.Replace(strings.ReplaceAll(lineNew, "\r\n", ""), "\n", "", -1), " ")
					if strArr[i] != "" && strArr[i] != " " {
						// pointObj, err := strconv.ParseFloat(strArr[i], 64)
						// if err != nil {
						// 	fmt.Println(err)
						// }
						objdata.POINTS = append(objdata.POINTS, strArr[i])
					}
				}

			}

			if count > info.poly && count < info.pointData[0] {
				linez := DeleteExtraSpace(line)
				if len(strings.FieldsFunc(linez, Split)) > 0 {
					strArr1 := strings.Split(strings.FieldsFunc(linez, Split)[0], " ")
					var strArr []string
					if strArr1[0] == "" || strArr1[0] == " " {
						for s := 1; s < len(strArr1); s++ {
							strArr = append(strArr, strArr1[s])
						}
					} else {
						for s := 0; s < len(strArr1); s++ {
							strArr = append(strArr, strArr1[s])
						}
					}
					if len(strArr) > 0 {
						if strArr[0] == "3" || strArr[0] == "4" {
							for i := 0; i < len(strArr); i++ {
								if strArr[i] != "" {
									objdata.CELLS = append(objdata.CELLS, strArr[i])
								}
							}
						} else if strArr[0] == "8" {
							objdata.CELLS = append(objdata.CELLS,
								"4", strArr[1], strArr[2], strArr[3], strArr[4],
								"4", strArr[1], strArr[2], strArr[6], strArr[5],
								"4", strArr[1], strArr[4], strArr[8], strArr[5],
								"4", strArr[4], strArr[8], strArr[7], strArr[3],
								"4", strArr[2], strArr[3], strArr[7], strArr[6],
								"4", strArr[5], strArr[6], strArr[7], strArr[8])
						}
					}
				}
			}
		} else {
			if count > info.points && count < info.cells {
				lineNew := strings.ReplaceAll(line, "	", " ")
				for i := 0; i < len(strings.Split(lineNew, " ")); i++ {
					strArr := strings.Split(strings.Replace(strings.ReplaceAll(lineNew, "\r\n", ""), "\n", "", -1), " ")
					if strArr[i] != "" && strArr[i] != " " {
						// pointObj, err := strconv.ParseFloat(strArr[i], 64)
						// if err != nil {
						// 	fmt.Println(err)
						// }
						objdata.POINTS = append(objdata.POINTS, strArr[i])
					}
				}

			}

			if count > info.cells && count < info.cellTypes {
				linez := DeleteExtraSpace(line)
				if len(strings.FieldsFunc(linez, Split)) > 0 {
					strArr1 := strings.Split(strings.FieldsFunc(linez, Split)[0], " ")
					var strArr []string
					if strArr1[0] == "" || strArr1[0] == " " {
						for s := 1; s < len(strArr1); s++ {
							strArr = append(strArr, strArr1[s])
						}
					} else {
						for s := 0; s < len(strArr1); s++ {
							strArr = append(strArr, strArr1[s])
						}
					}
					if len(strArr) > 0 {
						if strArr[0] == "3" || strArr[0] == "4" {
							for i := 0; i < len(strArr); i++ {
								if strArr[i] != "" {
									objdata.CELLS = append(objdata.CELLS, strArr[i])
								}
							}
						} else if strArr[0] == "8" {
							objdata.CELLS = append(objdata.CELLS,
								"4", strArr[1], strArr[2], strArr[3], strArr[4],
								"4", strArr[1], strArr[2], strArr[6], strArr[5],
								"4", strArr[1], strArr[4], strArr[8], strArr[5],
								"4", strArr[4], strArr[8], strArr[7], strArr[3],
								"4", strArr[2], strArr[3], strArr[7], strArr[6],
								"4", strArr[5], strArr[6], strArr[7], strArr[8])
						}
					}
				}
			}
		}

		if len(info.scalars) > 0 {
			for i := 0; i < len(info.scalars); i++ {
				if len(info.scalars) < 2 && len(info.vectors) == 0 {
					if count > info.scalars[0]+1 {
						lineNew := strings.ReplaceAll(line, "	", " ")
						if strings.Replace(strings.Split(lineNew, "\n")[0], " ", "", -1) != "" && strings.Replace(strings.Split(lineNew, "\r")[0], " ", "", -1) != "" {
							pointDataObj := strings.Replace(strings.Replace(strings.Split(lineNew, "\n")[0], "\r", "", -1), " ", "", -1)
							cellKey := info.scalarIden[0]
							objdata.CELLDATA[cellKey] = append(objdata.CELLDATA[cellKey], pointDataObj)
							// objdata.POINTDATA = nil
						}
					}
				}
				if len(info.scalars) >= 2 {
					if count > info.scalars[0]+1 && count < info.scalars[1]-1 {
						// objdata.CELLDATA = nil
					}
					if i >= 1 && i < len(info.scalars)-1 {
						if count > info.scalars[i]+1 && count < info.scalars[i+1] {
							lineNew := strings.ReplaceAll(line, "	", " ")
							if strings.Replace(strings.Split(lineNew, "\n")[0], " ", "", -1) != "" && strings.Replace(strings.Split(lineNew, "\r")[0], " ", "", -1) != "" {
								pointDataObj := strings.Replace(strings.Replace(strings.Split(lineNew, "\n")[0], "\r", "", -1), " ", "", -1)
								objdata.POINTDATA[info.scalarIden[i]] = append(objdata.POINTDATA[info.scalarIden[i]], pointDataObj)
							}
						}
					}
					if i == len(info.scalars)-1 {
						if count > info.scalars[i]+1 && count < info.vectors[0] {
							lineNew := strings.ReplaceAll(line, "	", " ")
							if strings.Replace(strings.Split(lineNew, "\n")[0], " ", "", -1) != "" && strings.Replace(strings.Split(lineNew, "\r")[0], " ", "", -1) != "" {
								pointDataObj := strings.Replace(strings.Replace(strings.Split(lineNew, "\n")[0], "\r", "", -1), " ", "", -1)
								objdata.POINTDATA[info.scalarIden[i]] = append(objdata.POINTDATA[info.scalarIden[i]], pointDataObj)
							}
						}
					}
				}
			}
		}
		if len(info.vectors) > 0 {
			if count > info.vectors[0] {
				lineNew := strings.ReplaceAll(line, "	", " ")
				if strings.Replace(strings.Split(lineNew, "\n")[0], " ", "", -1) != "" && strings.Replace(strings.Split(lineNew, "\r")[0], " ", "", -1) != "" {
					linen := DeleteExtraSpace(lineNew)           //去除多余空格
					linee := strings.FieldsFunc(linen, Split)[0] //去除/r和/n
					lineArr := strings.Split(linee, " ")
					for k := 1; k < len(lineArr); k++ {
						if lineArr[k] != "" && lineArr[k] != " " {
							objdata.VECTORS[info.vectorIden[0]] = append(objdata.VECTORS[info.vectorIden[0]], lineArr[k])
						}
					}

				}
			}
		}
		//判断不包含矢量标量关键字的vtk格式文件
		if len(info.scalars) == 0 && len(info.vectors) == 0 && len(info.floats) > 0 {
			linez := DeleteExtraSpace(line)
			if len(strings.FieldsFunc(linez, Split)) > 0 {
				line = strings.FieldsFunc(linez, Split)[0]
			}

			lines := strings.Split(line, " ")
			for f := 1; f < len(info.floats); f++ {
				if len(info.meta) > 0 {
					if count >= info.floats[f] && count < info.meta[f] {
						if count > info.floats[f] {
							if len(info.floatData[f]) > 0 {
								if info.floatData[f][2] == info.pNum && info.floatData[f][1] == "1" {
									pKey := info.floatData[f][0]
									if len(lines) > 0 {
										if info.floatData[f][1] == "1" {
											if lines[len(lines)-1] == "" {
												for _, lin := range lines[:len(lines)-1] {
													objdata.POINTDATA[pKey] = append(objdata.POINTDATA[pKey], lin)
												}
											} else {
												for _, lin := range lines {
													objdata.POINTDATA[pKey] = append(objdata.POINTDATA[pKey], lin)
												}
											}
										}
										if info.floatData[f][1] == "3" {
											if lines[len(lines)-1] == "" {
												for _, lin := range lines[:len(lines)-1] {
													objdata.VECTORS[pKey] = append(objdata.VECTORS[pKey], lin)
												}
											} else {
												for _, lin := range lines {
													objdata.VECTORS[pKey] = append(objdata.VECTORS[pKey], lin)
												}
											}
										}

									}
								}
							}
						}

					}
				} else {
					if f == len(info.floats)-1 {
						if count > info.floats[f] {
							if len(info.floatData[f]) > 0 {
								if info.floatData[f][2] == info.pNum {
									pKey := info.floatData[f][0]
									if len(lines) > 0 {
										if info.floatData[f][1] == "1" {
											if lines[len(lines)-1] == "" {
												for _, lin := range lines[:len(lines)-1] {
													objdata.POINTDATA[pKey] = append(objdata.POINTDATA[pKey], lin)
												}
											} else {
												for _, lin := range lines {
													objdata.POINTDATA[pKey] = append(objdata.POINTDATA[pKey], lin)
												}
											}
										}
										if info.floatData[f][1] == "3" {
											if lines[len(lines)-1] == "" {
												for _, lin := range lines[:len(lines)-1] {
													objdata.VECTORS[pKey] = append(objdata.VECTORS[pKey], lin)
												}
											} else {
												for _, lin := range lines {
													objdata.VECTORS[pKey] = append(objdata.VECTORS[pKey], lin)
												}
											}
										}
									}
								}
							}
						}
					} else if count >= info.floats[f] && count < info.floats[f+1] {
						if count > info.floats[f] {
							if len(info.floatData[f]) > 0 {
								if info.floatData[f][2] == info.pNum && info.floatData[f][1] == "1" {
									pKey := info.floatData[f][0]
									if len(lines) > 0 {
										if info.floatData[f][1] == "1" {
											if lines[len(lines)-1] == "" {
												for _, lin := range lines[:len(lines)-1] {
													objdata.POINTDATA[pKey] = append(objdata.POINTDATA[pKey], lin)
												}
											} else {
												for _, lin := range lines {
													objdata.POINTDATA[pKey] = append(objdata.POINTDATA[pKey], lin)
												}
											}
										}
										if info.floatData[f][1] == "3" {
											if lines[len(lines)-1] == "" {
												for _, lin := range lines[:len(lines)-1] {
													objdata.VECTORS[pKey] = append(objdata.VECTORS[pKey], lin)
												}
											} else {
												for _, lin := range lines {
													objdata.VECTORS[pKey] = append(objdata.VECTORS[pKey], lin)
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
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}

	}

	return objdata, errs

}

//ReadFile 获取源文件关键变量数据
func ReadFile(paths string) (VtkParamInfo, error) {
	file, err := os.Open(paths)
	if err != nil {
		fmt.Println("read fail")

	}

	defer file.Close()
	rd := bufio.NewReader(file)
	info := VtkParamInfo{}
	var count int = 0
	for {
		linez, errf := rd.ReadString('\n')
		count++
		if strings.Contains(linez, "POINTS") {
			info.points = count
			info.pNum = strings.Split(linez, " ")[1]
		}
		if strings.Contains(linez, "CELLS") {
			info.cells = count
			info.cNum = strings.Split(linez, " ")[1]
		}
		if strings.Contains(linez, "CELL_TYPES") {
			info.cellTypes = count
		}
		if strings.Contains(linez, "SCALARS") {
			info.scalars = append(info.scalars, count)
			lineNew := DeleteExtraSpace(linez)
			info.scalarIden = append(info.scalarIden, strings.Split(lineNew, " ")[1])
		}
		if strings.Contains(linez, "CELL_DATA") {
			info.cellData = append(info.cellData, count)
		}
		if strings.Contains(linez, "POINT_DATA") {
			info.pointData = append(info.pointData, count)
		}
		if strings.Contains(linez, "VECTORS") {
			info.vectors = append(info.vectors, count)
			lineNew := DeleteExtraSpace(linez)
			info.vectorIden = append(info.vectorIden, strings.Split(lineNew, " ")[1])
		}
		if strings.Contains(linez, "float") {
			info.floats = append(info.floats, count)
			linezs := strings.Split(linez, " ")
			info.floatData = append(info.floatData, linezs)
		}
		if strings.Contains(linez, "METADATA") {
			info.meta = append(info.meta, count)
		}
		if strings.Contains(linez, "POLYGONS") {
			info.poly = count
		}
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
	}

	return info, err
}

//VtkParamInfo 文件参数
type VtkParamInfo struct {
	points     int        //点坐标
	cells      int        //单元
	cellTypes  int        //单元类型
	scalars    []int      //scalars出现的行数
	scalarIden []string   //scalars后面的关键字
	cellData   []int      //单元数据
	pointData  []int      //标量及材料号数据
	vectors    []int      //矢量所在的行
	vectorIden []string   //矢量后面跟的关键字
	floats     []int      //float关键字所在的行数组
	floatData  [][]string //float关键字所在行的内容
	meta       []int      //metadata出现的位置
	poly       int        //polygons出现的位置
	pNum       string     //点的个数
	cNum       string     //单元的个数
}
