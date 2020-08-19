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

//ResultData 结果数据
type ResultData struct {
	StrCoord []string               //coord
	StrElem  map[string][]int       //elem
	ResData  map[string]interface{} //resData
}

//HandlePostMSH 处理post
func HandlePostMSH(filePath string, tfilePath string) (ResultData, error) {

	info, err := ReadPostMshFile(filePath) //获得文件参数
	tinfo, errs := handleTRes(tfilePath)   //获得res文件数据
	beego.Debug("info:", info)
	if err != nil || errs != nil {
		beego.Error("read post msh fail:", err)
		beego.Error("read post res fail:", errs)
	}
	file, errs := os.Open(filePath) //处理post.msh文件
	defer file.Close()
	// 把文件读取到缓冲区中
	rd := bufio.NewReader(file)
	var count int = 0
	//var numCoor = 0 //判断文件coord是否连续，不连续加
	var resdata = ResultData{}
	var StrCoordTemp = make(map[int][]string)         //存放临时点文件数据
	var sortCoord = make([]int, 0)                    //文件中点的序列数组
	resdata.StrCoord = make([]string, 0)              //返回前端的点数据
	resdata.StrElem = make(map[string][]int, 0)       //返回前端的单元数据
	resdata.ResData = make(map[string]interface{}, 0) //返回前端的结果数据
	beego.Debug("modelType", info.modelType)
	for {
		//逐行读取
		line, errf := rd.ReadString('\n')
		count++
		//for z := 0; z < len(info.coord); z++ {
		if count > info.coord[0] && count < info.endCoord[0] {
			lineNew := strings.ReplaceAll(line, "	", " ")
			var strArrnew []string //临时数据记录本行数据
			if len(strings.FieldsFunc(lineNew, Split)) > 0 {
				for i := 0; i < len(strings.Split(lineNew, " ")); i++ {
					strArr := strings.Split(strings.FieldsFunc(lineNew, Split)[0], " ")
					if strArr[i] != "" && strArr[i] != " " {
						strArrnew = append(strArrnew, strArr[i]) //每行有效数据放入临时数组
					}
				}
				numCoor, _ := strconv.Atoi(strArrnew[0])
				for _, strs := range strArrnew[1:] {
					StrCoordTemp[numCoor] = append(StrCoordTemp[numCoor], strs)
				}
				sortCoord = append(sortCoord, numCoor)
			}

		}
		//	}
		for j := 0; j < len(info.elem); j++ {
			if count > info.elem[j] && count < info.endElem[j] {
				lineNew := strings.ReplaceAll(line, "	", " ")
				var strArrnew []string
				var strArrnew1 []int
				if len(strings.FieldsFunc(lineNew, Split)) > 0 {
					for i := 0; i < len(strings.Split(lineNew, " ")); i++ {
						strArr := strings.Split(strings.FieldsFunc(lineNew, Split)[0], " ")
						if strArr[i] != "" && strArr[i] != " " {
							strArrnew = append(strArrnew, strArr[i])
						}
					}
					s := len(strArrnew)
					//对文件中只包含四面体的数据进行处理
					if strings.Contains(info.modelType, "四面体") && !strings.Contains(info.modelType, "六面体") {
						if s > 1 {
							strArrnew1 = append(strArrnew1, 3)
							for _, strs := range strArrnew[1:] {
								ints, _ := strconv.Atoi(strs)
								strArrnew1 = append(strArrnew1, ints)
							}
						}
						resdata.StrElem[strArrnew[len(strArrnew)-1]] = append(resdata.StrElem[strArrnew[len(strArrnew)-1]],
							strArrnew1[0], strArrnew1[1]-1, strArrnew1[2]-1, strArrnew1[3]-1,
							strArrnew1[0], strArrnew1[1]-1, strArrnew1[2]-1, strArrnew1[4]-1,
							strArrnew1[0], strArrnew1[1]-1, strArrnew1[3]-1, strArrnew1[4]-1,
							strArrnew1[0], strArrnew1[2]-1, strArrnew1[3]-1, strArrnew1[4]-1)
					}
					//对文件中只包含六面体的数据进行处理
					if strings.Contains(info.modelType, "六面体") && !strings.Contains(info.modelType, "四面体") {
						if s > 1 {
							strArrnew1 = append(strArrnew1, 4)
							for _, strs := range strArrnew[1 : s-1] {
								ints, _ := strconv.Atoi(strs)
								strArrnew1 = append(strArrnew1, ints)
							}
						}

						resdata.StrElem[strArrnew[len(strArrnew)-1]] = append(resdata.StrElem[strArrnew[len(strArrnew)-1]],
							strArrnew1[0], strArrnew1[1]-1, strArrnew1[2]-1, strArrnew1[3]-1, strArrnew1[4]-1,
							strArrnew1[0], strArrnew1[1]-1, strArrnew1[2]-1, strArrnew1[6]-1, strArrnew1[5]-1,
							strArrnew1[0], strArrnew1[1]-1, strArrnew1[4]-1, strArrnew1[8]-1, strArrnew1[5]-1,
							strArrnew1[0], strArrnew1[3]-1, strArrnew1[4]-1, strArrnew1[8]-1, strArrnew1[7]-1,
							strArrnew1[0], strArrnew1[2]-1, strArrnew1[3]-1, strArrnew1[7]-1, strArrnew1[6]-1,
							strArrnew1[0], strArrnew1[5]-1, strArrnew1[6]-1, strArrnew1[7]-1, strArrnew1[8]-1)
					}
					//对文件中即包含四面体又包含六面体的数据进行处理
					if strings.Contains(info.modelType, "六面体") && strings.Contains(info.modelType, "四面体") {
						if s == 10 {
							strArrnew1 = append(strArrnew1, 4)
							for _, strs := range strArrnew[1 : s-1] {
								ints, _ := strconv.Atoi(strs)
								strArrnew1 = append(strArrnew1, ints)
							}

							resdata.StrElem[strArrnew[len(strArrnew)-1]] = append(resdata.StrElem[strArrnew[len(strArrnew)-1]],
								strArrnew1[0], strArrnew1[1]-1, strArrnew1[2]-1, strArrnew1[3]-1, strArrnew1[4]-1,
								strArrnew1[0], strArrnew1[1]-1, strArrnew1[2]-1, strArrnew1[6]-1, strArrnew1[5]-1,
								strArrnew1[0], strArrnew1[1]-1, strArrnew1[4]-1, strArrnew1[8]-1, strArrnew1[5]-1,
								strArrnew1[0], strArrnew1[3]-1, strArrnew1[4]-1, strArrnew1[8]-1, strArrnew1[7]-1,
								strArrnew1[0], strArrnew1[2]-1, strArrnew1[3]-1, strArrnew1[7]-1, strArrnew1[6]-1,
								strArrnew1[0], strArrnew1[5]-1, strArrnew1[6]-1, strArrnew1[7]-1, strArrnew1[8]-1)
						}
						if s == 6 {
							strArrnew1 = append(strArrnew1, 3)
							for _, strs := range strArrnew[1:] {
								ints, _ := strconv.Atoi(strs)
								strArrnew1 = append(strArrnew1, ints)
							}

							resdata.StrElem[strArrnew[len(strArrnew)-1]] = append(resdata.StrElem[strArrnew[len(strArrnew)-1]],
								strArrnew1[0], strArrnew1[1]-1, strArrnew1[2]-1, strArrnew1[3]-1,
								strArrnew1[0], strArrnew1[1]-1, strArrnew1[2]-1, strArrnew1[4]-1,
								strArrnew1[0], strArrnew1[1]-1, strArrnew1[3]-1, strArrnew1[4]-1,
								strArrnew1[0], strArrnew1[2]-1, strArrnew1[3]-1, strArrnew1[4]-1)
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
	if len(sortCoord) > 0 {
		sort.Ints(sortCoord)
		for i := 0; i < len(sortCoord); i++ {
			if i == 0 {
				for k := 1; k <= (sortCoord[i]-1)*3; k++ {
					resdata.StrCoord = append(resdata.StrCoord, "null")
				}
				for z := 0; z < len(StrCoordTemp[sortCoord[i]]); z++ {
					resdata.StrCoord = append(resdata.StrCoord, StrCoordTemp[sortCoord[i]][z])
				}
			} else {
				for k := 1; k <= (sortCoord[i]-sortCoord[i-1]-1)*3; k++ {
					resdata.StrCoord = append(resdata.StrCoord, "null")
				}
				for z := 0; z < len(StrCoordTemp[sortCoord[i]]); z++ {
					resdata.StrCoord = append(resdata.StrCoord, StrCoordTemp[sortCoord[i]][z])
				}
			}
		}
	}
	beego.Debug("sortcoord", len(sortCoord))

	resdata.ResData = tinfo
	return resdata, errs

}

//ReadPostMshFile 获取源文件关键变量数据
func ReadPostMshFile(paths string) (MSHParams, error) {
	file, err := os.Open(paths)
	if err != nil {
		fmt.Println("read fail")

	}
	defer file.Close()
	rd := bufio.NewReader(file)
	//结果变量
	info := MSHParams{}
	var count int = 0
	for {
		linez, errf := rd.ReadString('\n')
		count++
		if strings.Contains(linez, "Tetrahedra") {
			info.modelType += "四面体"
		} else if strings.Contains(linez, "Hexahedra") {
			info.modelType += "六面体"
		}
		//记录coord数据开始行数
		if strings.Contains(strings.ToLower(linez), "coordinates") && !strings.Contains(linez, "End") {
			info.coord = append(info.coord, count)
		}
		//记录coord数据结束行数
		if strings.Contains(strings.ToLower(linez), "coordinates") && strings.Contains(linez, "End") {
			info.endCoord = append(info.endCoord, count)
		}
		//记录elem开始行数
		if strings.Contains(strings.ToLower(linez), "elements") && !strings.Contains(linez, "End") {
			info.elem = append(info.elem, count)
		}
		//记录elem结束行数
		if strings.Contains(strings.ToLower(linez), "elements") && strings.Contains(linez, "End") {
			info.endElem = append(info.endElem, count)
		}
		//读取结束跳出
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
	}
	return info, err
}

//MSHParams msh 参数
type MSHParams struct {
	coord     []int  //坐标起始位置
	endCoord  []int  //坐标结束位置
	elem      []int  //元素其实位置
	endElem   []int  //元素结束位置
	modelType string //文件数据模型
}
