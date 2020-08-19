package execfunc

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"sort"
	"strconv"
	"strings"

	"github.com/astaxie/beego"
)

//HandleFlaviaMSH 处理F.flavia.msh、T.flavia.res、NT.flavia.res文件
func HandleFlaviaMSH(tfileRes string, fileRes string, fileMsh string) (FlaviaData, error) {

	var flaviaData = FlaviaData{}             //定义结果变量
	info, err := ReadPostMshFile(fileMsh)     //调用方法读取文件中的参数
	resInfo, errs := handleFlaviaRes(fileRes) //读取NT.flavia.res文件内容
	tresInfo, errt := handleTRes(tfileRes)    //读取T.flavia/post.res文件内容
	beego.Debug("info:", info)
	if err != nil || errs != nil || errt != nil {
		beego.Error("read msh fail:", err)
		beego.Error("read res fail:", errs)
		beego.Error("read tres fail:", errt)
	}
	file, errs := os.Open(fileMsh) //读取文件数据
	defer file.Close()             //关闭文件流

	// 把文件读取到缓冲区中
	rd := bufio.NewReader(file)
	var count int = 0                    //定义int变量记录行数
	var strArrCoord1 = make([]string, 0) //定义临时数组存储点数据
	var strElem = make([]int, 0)         //定义临时变量存储单元数据
	for {
		line, errf := rd.ReadString('\n') //逐行读取文件
		count++
		var strArrCoord []string //定义临时数组存储一行中的有效数据
		//循环每一组点数据
		for z := 0; z < len(info.coord); z++ {
			//判断点对应的行范围
			if count > info.coord[z] && count < info.endCoord[z] {
				lineNew := strings.ReplaceAll(line, "	", " ")
				//判断当前行不为空
				if len(strings.FieldsFunc(lineNew, Split)) > 0 {
					//循环本行，将不为空的点数据放入临时数组
					for i := 0; i < len(strings.Split(lineNew, " ")); i++ {
						strArr := strings.Split(strings.FieldsFunc(lineNew, Split)[0], " ")
						if strArr[i] != "" && strArr[i] != " " {
							strArrCoord = append(strArrCoord, strArr[i])
						}
					}
					//将点数据中前端需要的元素放入临时数组
					for _, strs := range strArrCoord[1:] {
						strArrCoord1 = append(strArrCoord1, strs)
					}
				}

			}
		}
		//循环每一组单元数据
		for j := 0; j < len(info.elem); j++ {
			//判断单元对应的行范围
			if count > info.elem[j] && count < info.endElem[j] {
				lineNew := strings.ReplaceAll(line, "	", " ")
				var strArrnew []string //定义临时数组存储一行中的有效单元数据
				//判断当前行不为空
				if len(strings.FieldsFunc(lineNew, Split)) > 0 {
					//循环本行，将不为空的单元数据放入临时数组
					for i := 0; i < len(strings.Split(lineNew, " ")); i++ {
						strArr := strings.Split(strings.FieldsFunc(lineNew, Split)[0], " ")
						if strArr[i] != "" && strArr[i] != " " {
							strArrnew = append(strArrnew, strArr[i])
						}
					}
					//判断本行单元元素长度
					if len(strArrnew)-2 == 3 {
						strElem = append(strElem, len(strArrnew)-2) //添加本行单元个数
						//循环添加本行单元数据
						for z := 1; z < len(strArrnew)-1; z++ {
							a, _ := strconv.Atoi(strArrnew[z])
							strElem = append(strElem, a-1)
						}
					} else if len(strArrnew)-2 > 3 {
						//如果单元数据为4个，取123，134两组单元数据转化为整型减一（配合前端）
						a1, _ := strconv.Atoi(strArrnew[1])
						a2, _ := strconv.Atoi(strArrnew[2])
						a3, _ := strconv.Atoi(strArrnew[3])
						a4, _ := strconv.Atoi(strArrnew[4])
						strElem = append(strElem, len(strArrnew)-2-1, a1-1, a2-1, a3-1)
						strElem = append(strElem, len(strArrnew)-2-1, a1-1, a3-1, a4-1)
					}
				}
			}
		}
		//读取结束，跳出循环
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
	}
	//将存有数据的临时数组给结果变量，返回给前端
	if len(strArrCoord1) > 0 {
		flaviaData.Data = append(flaviaData.Data, strArrCoord1)
	}
	if len(strElem) > 0 {
		flaviaData.Data = append(flaviaData.Data, strElem)
	}
	if len(tresInfo) > 0 {
		flaviaData.Data = append(flaviaData.Data, tresInfo)
	}
	flaviaData.Mo = resInfo.Mo
	flaviaData.Point = resInfo.Point
	flaviaData.PointData = resInfo.Pointdata
	flaviaData.Type = "flavia"

	return flaviaData, errs

}

//handleFlaviaRes 处理NT.flavia.res文件内容
func handleFlaviaRes(fileRes string) (FlaviaResData, error) {

	var flaviaResData = FlaviaResData{} //定义返回结果变量
	info, err := readFlaviaMsh(fileRes) //调用方法，获取文件参数
	beego.Debug("info:", info)
	if err != nil {
		beego.Error("read msh fail:", err)
	}
	file, errs := os.Open(fileRes)
	defer file.Close()
	// 把文件读取到缓冲区中
	rd := bufio.NewReader(file)

	var count int = 0 //定义变量记录行数
	//初始化临时数组存放模、点数据
	var strMo1 = make([]string, 0)
	var strMo2 = make([]string, 0)
	var strPoint1 = make([]string, 0)
	//var strPoint2 []string
	var strPData1 = make([]string, 0)
	//var strPData2 []string

	for {
		//逐行读取
		line, errf := rd.ReadString('\n')
		count++
		for j := 0; j < len(info.vParams); j++ {
			var strArrnew []string //临时数组存放本行有效数据
			//var strArrnew1 []string
			//判断有效数据行范围
			if count > info.vParams[j] && count < info.evParams[j] {
				lineNew := strings.ReplaceAll(line, "	", " ")
				//判断不为空
				if len(strings.FieldsFunc(lineNew, Split)) > 0 {
					//循环将有效数据插入临时数组
					for i := 0; i < len(strings.Split(lineNew, " ")); i++ {
						strArr := strings.Split(strings.FieldsFunc(lineNew, Split)[0], " ")
						if strArr[i] != "" && strArr[i] != " " {
							strArrnew = append(strArrnew, strArr[i])
						}
					}
					if len(strArrnew) > 0 {
						//将模数据和点数据放入临时数组
						if j == 0 {
							strMo1 = append(strMo1, strArrnew[len(strArrnew)-1])
							for z := 1; z < info.cpName[j]; z++ {
								strPData1 = append(strPData1, strArrnew[3+z])
							}
							strPoint1 = append(strPoint1, strArrnew[1], strArrnew[2], strArrnew[3])

						} else if j == 1 {
							strMo2 = append(strMo2, strArrnew[len(strArrnew)-1])
							//for z := 1; z < info.cpName[j]; z++ {
							//	strPData2 = append(strPData2, strArrnew[3+z])
							//}
							//strPoint2 = append(strPoint2, strArrnew[1], strArrnew[2], strArrnew[3])

						}
					}
				}
			}
		}
		//读取结束，跳出
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}

	}
	//将数据放入结果变量返回
	flaviaResData.Mo = append(flaviaResData.Mo, strMo1, strMo2)
	flaviaResData.Point = append(flaviaResData.Point, strPoint1)

	flaviaResData.Pointdata = append(flaviaResData.Pointdata, strPData1)

	return flaviaResData, errs

}

//handleTFlaviaRes 处理Tflavia.res/post.res文件
func handleTRes(tfileRes string) (map[string]interface{}, error) {

	info, err := readFlaviaMsh(tfileRes) //文件参数
	beego.Debug("info:", info)
	if err != nil {
		beego.Error("read msh fail:", err)
	}
	file, errs := os.Open(tfileRes)
	defer file.Close()

	// 把文件读取到缓冲区中
	rd := bufio.NewReader(file)
	var count int = 0

	var sortSc = make([]int, 0)                      //文件中标量结果的序列数组
	var sortVe = make([]int, 0)                      //文件中矢量结果的序列数组
	var sortMa = make([]int, 0)                      //文件中矩阵结果的序列数组
	var veData = make(map[string][]string, 0)        //文件中标量结果数据
	var maData = make(map[string][]string, 0)        //文件中矢量结果数据
	var scData = make(map[string][]string, 0)        //文件中矩阵结果数据
	var strResData0 = make([][]string, 2)            //文件中标量结果数据集
	var strTempSc = make(map[int][]string)           //存放临时标量文件数据
	var strResData1 = make([][]string, 3)            //文件中矢量结果数据集
	var strTempVe = make(map[int][]string)           //存放临时矢量文件数据
	var strResData2 = make([][]string, 6)            //文件中矩阵结果数据集
	var strTempMa = make(map[int][]string)           //存放临时矩阵文件数据
	var strResData = make(map[string]interface{}, 0) //返回结果集
	for {
		//逐行读取
		line, errf := rd.ReadString('\n')
		count++

		for j := 0; j < len(info.vParams); j++ {
			//临时数组存放本行有效数据
			var strArrnew []string
			if count > info.vParams[j] && count < info.evParams[j] {
				lineNew := strings.ReplaceAll(line, "	", " ")
				if len(strings.FieldsFunc(lineNew, Split)) > 0 {
					for i := 0; i < len(strings.Split(lineNew, " ")); i++ {
						strArr := strings.Split(strings.FieldsFunc(lineNew, Split)[0], " ")
						if strArr[i] != "" && strArr[i] != " " {
							strArrnew = append(strArrnew, strArr[i])
						}
					}
					//如果本行存在数据
					if len(strArrnew) > 0 {
						//如果存在标量数据
						if len(info.scNum) >= 1 {
							//获取标量前序号，和标量数据分别存入数组
							if info.scNum[0]+2 == info.vParams[j] {
								scSortNum, _ := strconv.Atoi(strArrnew[0])
								sortSc = append(sortSc, scSortNum)
								strTempSc[scSortNum] = append(strTempSc[scSortNum], strArrnew[1])
							}
							if len(info.scNum) >= 2 {
								if info.scNum[1]+2 == info.vParams[j] {
									scSortNum1, _ := strconv.Atoi(strArrnew[0])
									strTempSc[scSortNum1] = append(strTempSc[scSortNum1], strArrnew[1])
								}
							}

						}
						//判断存在矢量数据
						if len(info.veNum) >= 1 {
							//获取矢量前序号，和矢量数据分别存入数组
							if info.veNum[0]+2 == info.vParams[j] {
								veSortNum, _ := strconv.Atoi(strArrnew[0])
								sortVe = append(sortVe, veSortNum)
								strTempVe[veSortNum] = append(strTempVe[veSortNum],
									strArrnew[1],
									strArrnew[2],
									strArrnew[3])
							}
						}
						//判断存在矩阵数据
						if len(info.maNum) >= 1 {
							//获取矩阵前序号，和矩阵数据分别存入数组
							if info.maNum[0]+2 == info.vParams[j] {
								maSortNum, _ := strconv.Atoi(strArrnew[0])
								sortMa = append(sortMa, maSortNum)
								strTempMa[maSortNum] = append(strTempMa[maSortNum],
									strArrnew[1],
									strArrnew[2],
									strArrnew[3],
									strArrnew[4],
									strArrnew[5],
									strArrnew[6])
							}
						}
					}
				}
			}
		}
		//读取结束，跳出
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}

	}

	if len(sortSc) > 0 {
		//对标量序列从小到大排序
		sort.Ints(sortSc)
		for i := 0; i < len(sortSc); i++ {
			//按照顺序将标量数据添加到临时数组，（为空的序列对应的数据用null填充）
			if len(info.scNum) >= 1 {
				if i == 0 {
					for k := 1; k <= (sortSc[i] - 1); k++ {
						strResData0[0] = append(strResData0[0], "null")
					}
					strResData0[0] = append(strResData0[0], strTempSc[sortSc[i]][0])
				} else {
					for k := 1; k <= (sortSc[i] - sortSc[i-1] - 1); k++ {
						strResData0[0] = append(strResData0[0], "null")
					}
					strResData0[0] = append(strResData0[0], strTempSc[sortSc[i]][0])
				}
				if len(info.scNum) >= 2 {
					if i == 0 {
						for k := 1; k <= (sortSc[i] - 1); k++ {
							strResData0[1] = append(strResData0[1], "null")
						}
						strResData0[1] = append(strResData0[1], strTempSc[sortSc[i]][1])
					} else {
						for k := 1; k <= (sortSc[i] - sortSc[i-1] - 1); k++ {
							strResData0[1] = append(strResData0[1], "null")
						}
						strResData0[1] = append(strResData0[1], strTempSc[sortSc[i]][1])
					}
				}
			}
		}
	}
	if len(sortVe) > 0 {
		//对矢量序列从小到大排序
		sort.Ints(sortVe)
		for i := 0; i < len(sortVe); i++ {
			//按照顺序将矢量数据添加到临时数组，（为空的序列对应的数据用null填充）
			if len(info.veNum) >= 1 {
				if i == 0 {
					for k := 1; k <= (sortVe[i] - 1); k++ {
						for z := 0; z < 3; z++ { //矢量每行有三个有效数据，没有的序列用null
							strResData1[z] = append(strResData1[z], "null")
						}
					}
					for z := 0; z < 3; z++ { //矢量每行有三个有效数据，每列分别加入对应数组
						strResData1[z] = append(strResData1[z], strTempVe[sortVe[i]][z])
					}
				} else {
					for k := 1; k <= (sortVe[i] - sortVe[i-1] - 1); k++ {
						for z := 0; z < 3; z++ {
							strResData1[z] = append(strResData1[z], "null")
						}
					}
					for z := 0; z < 3; z++ {
						strResData1[z] = append(strResData1[z], strTempVe[sortVe[i]][z])
					}
				}
			}
		}
	}
	if len(sortMa) > 0 {
		//对矩阵序列从小到大排序
		sort.Ints(sortMa)
		for i := 0; i < len(sortMa); i++ {
			//按照顺序将矩阵数据添加到临时数组，（为空的序列对应的数据用null填充）
			if len(info.maNum) >= 1 {
				if i == 0 {
					for k := 1; k <= (sortMa[i] - 1); k++ {
						for z := 0; z < 6; z++ { //矩阵对应的有6个有效数据，没有的序列用null补充
							strResData2[z] = append(strResData2[z], "null")
						}
					}
					for z := 0; z < 6; z++ { //矩阵对应的有6个有效数据，对应的矩阵数据放入对应数组
						strResData2[z] = append(strResData2[z], strTempMa[sortMa[i]][z])
					}
				} else {
					for k := 1; k <= (sortMa[i] - sortMa[i-1] - 1); k++ {
						for z := 0; z < 6; z++ { //矩阵对应的有6个有效数据，没有的序列用null补充
							strResData2[z] = append(strResData2[z], "null")
						}
					}
					for z := 0; z < 6; z++ { //矩阵对应的有6个有效数据，对应的矩阵数据放入对应数组
						strResData2[z] = append(strResData2[z], strTempMa[sortMa[i]][z])
					}
				}
			}
		}
	}
	//将标量矢量矩阵数据放入对应的map集合中
	if len(info.scNum) >= 1 {
		scData[strings.Replace(info.cpNameArr[info.scNum[0]+1][1], "\"", "", -1)] = strResData0[0]
		if len(info.scNum) >= 2 {
			scData[strings.Replace(info.cpNameArr[info.scNum[1]+1][1], "\"", "", -1)] = strResData0[1]
		}
	}
	if len(info.veNum) >= 1 {
		for z := 0; z < 3; z++ {
			veData[strings.Replace(info.cpNameArr[info.veNum[0]+1][z+1], "\"", "", -1)] = strResData1[z]
		}
	}
	if len(info.maNum) >= 1 {
		for z := 0; z < 6; z++ {
			maData[strings.Replace(info.cpNameArr[info.maNum[0]+1][z+1], "\"", "", -1)] = strResData2[z]
		}
	}
	//数据返回
	if len(veData) > 0 {
		strResData["vector"] = veData
	}
	if len(scData) > 0 {
		strResData["scalar"] = scData
	}
	if len(maData) > 0 {
		strResData["matrix"] = maData
	}

	return strResData, errs

}

//readFlaviaMsh 获取源文件关键变量数据
func readFlaviaMsh(paths string) (FlaviaParams, error) {
	file, err := os.Open(paths)
	if err != nil {
		fmt.Println("read fail")

	}

	defer file.Close()
	rd := bufio.NewReader(file)
	info := FlaviaParams{}
	var count int = 0
	info.cpNameArr = make(map[int][]string, 0)
	for {
		linez, errf := rd.ReadString('\n')
		count++
		if strings.Contains(strings.ToLower(linez), "scalar") {
			info.scNum = append(info.scNum, count)
		}
		if strings.Contains(strings.ToLower(linez), "vector") {
			info.veNum = append(info.veNum, count)
		}
		if strings.Contains(strings.ToLower(linez), "matrix") {
			info.maNum = append(info.maNum, count)
		}
		if strings.Contains(strings.ToLower(linez), "values") && !strings.Contains(strings.ToLower(linez), "end") {
			info.vParams = append(info.vParams, count)
		}
		if strings.Contains(strings.ToLower(linez), "values") && strings.Contains(strings.ToLower(linez), "end") {
			info.evParams = append(info.evParams, count)
		}
		if strings.Contains(strings.ToLower(linez), "componentnames") {
			lens := len(strings.Split(linez, "\" \""))
			info.cpName = append(info.cpName, lens)

			strArr := strings.Split(strings.FieldsFunc(linez, Split)[0], " ")
			var strArrNew = make([]string, 0)
			for _, str := range strArr {
				if str != "" && str != " " {
					strArrNew = append(strArrNew, str)
				}
			}
			info.cpNameArr[count] = strArrNew
		}
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
	}
	//返回参数数据
	return info, err
}

//FlaviaData 数据
type FlaviaData struct {
	Data      []interface{} //点 单元 和所有点的结果
	Mo        [][]string    //结果的模
	Point     [][]string    //外围面上的点的坐标
	PointData []interface{} //外围面上点的结果
	Type      string        // 文件类型
}

//FlaviaResData res数据
type FlaviaResData struct {
	Mo        [][]string    //结果的模
	Point     [][]string    //外围面上的点的坐标
	Pointdata []interface{} //外围面上点的结果
}

//FlaviaParams 参数
type FlaviaParams struct {
	vParams   []int            //文件中value所对的行位置（可能有多个，数组）
	evParams  []int            //文件中end value 所对的行位置（可能有多个，数组）
	cpName    []int            //文件中componentnames所对的行的位置（可能有多个，数组）
	cpNameArr map[int][]string //文件中componentnames中的名字（每一行为一个数组）
	scNum     []int            // 文件中标量scalar的数量
	veNum     []int            // 文件中标量Vector的数量
	maNum     []int            // 文件中Matrix的数量
}
