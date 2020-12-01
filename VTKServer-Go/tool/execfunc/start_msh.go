package execfunc

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
	// "reflect"

	"github.com/astaxie/beego"
)

//ModParamInfo 文件参数
//20201125 进行调整
type ModParamInfo struct {
	MeshFormat int //MeshFormat出现的行数

	Nodes        int //Node出现的行数
	NodesIden    int //Node后面的关键字
	Elements     int //Elements关键字所在的行数组
	ElementsIden int //Elements后面的关键字

	ElementData     int //ElementData出现的行数
	ElementDataIden int //ElementData后面的关键字

}

//ReadMeshFormatFile 获取源文件关键变量数据
//20201125 进行调整
func ReadMeshFormatFile(filePath string) (ModParamInfo, error) {

	beego.Debug("start_msh文件34行，info", filePath)
	// 读取文件内容，在执行完后，关闭
	file, err := os.Open(filePath)
	if err != nil {
		fmt.Println("read fail")

	}
	defer file.Close()

	beego.Debug("start_msh文件42行，file", file)
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

//HandleMSH 处理msh文件内容
/**
*20201125 添加备注
*filePath		文件路径
*
*@返回值 []interface{}, error
*@[]interface{}			返回文件处理结果
*@error					错误信息
**/
func HandleMSH(filePath string) ([]interface{}, error) {

	beego.Debug("start_msh文件96行，filePath", filePath)
	// 读取文件并记录参数位置
	info, err := ReadMeshFormatFile(filePath)
	if err != nil {
		beego.Error("read mod_vtk_msh fail:", err)
	}
	beego.Debug("start_msh文件102行，info", info)
	switch {
	case info.MeshFormat > 0:

		beego.Debug("info", info.MeshFormat)
		//打开文件，执行完成关闭文件
		file, errs := os.Open(filePath)
		defer file.Close()

		// 把文件读取到缓冲区中
		rd := bufio.NewReader(file)
		// 统计行数
		var count int = 0
		//定义结果变量
		var strArrs []interface{}

		// 定义临时变量
		var Nodes = make([]string, 0)
		var Elements = make([]string, 0)
		var ElementData = make(map[string][]string, 0)

		// 定义Elements 替换第一个数组
		// var ElementsOne = make([]string, 0)

		// 定义Elemts 将一个数组拆分成四个数组
		var ElementsTwo = make([]string, 0)
		var ElementsThree = make([]string, 0)
		var ElementsFour = make([]string, 0)
		var ElementsFive = make([]string, 0)
	
		for {

			line, errf := rd.ReadString('\n')
			count++
			//写入坐标系内容
			if count > info.Nodes && count < info.NodesIden {

				lineNew := strings.ReplaceAll(line, "	", " ")
				for i := 0; i < len(strings.Split(lineNew, " ")); i++ {
					strArr := strings.Split(strings.Replace(strings.ReplaceAll(lineNew, "\r\n", ""), "\n", "", -1), " ")
					if strArr[i] != "" && strArr[i] != " " && len(strArr) == 3 {
						Nodes = append(Nodes, strArr[i])
					}
				}
			}

			// Elements参数部分
			if count > info.Elements && count < info.ElementsIden {

				lineNew := strings.ReplaceAll(line, "	", " ")
				var strArr1 []string
				if len(strings.Split(lineNew, " ")) > 5 {
					strArr := strings.Split(strings.Replace(strings.ReplaceAll(lineNew, "\r\n", ""), "\n", "", -1), " ")
					if strArr[0] != "" && strArr[0] != " " && len(strArr) == 6 {

						for i := 0; i < len(strArr); i++ {
							if i == 0 {
								strArr1 = append(strArr1, "4")
							} else {
								strArr1 = append(strArr1, strArr[i])
							}
						}
						// beego.Debug("start_msh文件165行，strArr1", strArr1)

					} else {
						for s := 0; s < len(strArr); s++ {
							strArr1 = append(strArr1, strArr[s])
						}
					}

					// beego.Debug("start_msh文件173行，strArr1", strArr1)

				ElementsTwo = ElementsArrTwo(strArr1)
				ElementsThree = ElementsArrThree(strArr1)
				ElementsFour = ElementsArrFour(strArr1)
				ElementsFive = ElementsArrFive(strArr1) 

				Elements = append(Elements, ElementsTwo...)
				Elements = append(Elements, ElementsThree...)
				Elements = append(Elements, ElementsFour...)
				Elements = append(Elements, ElementsFive...)
				// beego.Debug("start_msh文件182行，Elements", Elements)
				
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
					for i := 1; i < 5; i++ {
						ElementData["elementdata"] = append(ElementData["elementdata"], strArr[lend-1])
					}
				}

			}

			if errf != nil || io.EOF == errf {
				fmt.Println("for run result:", "over")
				break
			}
		}

		//数据放入结果变量返回
		if len(Nodes) > 0 && len(Elements) > 0 && len(ElementData["elementdata"]) > 0 {
			strArrs = append(strArrs, Nodes, Elements, ElementData["elementdata"])
		}

		return strArrs, errs

	default:

		beego.Debug("start_msh文件193行，info")
		//读取数据文件
		info, err := readMshFile(filePath)
		beego.Debug("info:", info)
		if err != nil {
			beego.Error("read msh fail:", err)
		}
		file, errs := os.Open(filePath)
		defer file.Close() //最后关闭文件流

		// 把文件读取到缓冲区中
		rd := bufio.NewReader(file)
		var count int = 0         //定义变量记录行数
		var strArrs []interface{} //定义结果变量
		//定义临时变量
		var strArr1 = make([]string, 0)
		var strArr2 = make([]int, 0)

		for {
			//逐行读取
			line, errf := rd.ReadString('\n')
			count++
			if count > 1 && count < info {
				strArr := strings.Split(strings.FieldsFunc(line, Split)[0], " ")
				for i := 0; i < len(strArr); i++ {
					strArr1 = append(strArr1, strArr[i]) //将每行中的有效数据放入临时数组
				}

			}
			if count > (info + 1) {
				if len(strings.FieldsFunc(line, Split)) > 0 {
					strCell := strings.FieldsFunc(line, Split)[0]
					strArr := strings.Split(strCell, " ")
					strArr2 = append(strArr2, 3)
					for i := 0; i < len(strArr)-1; i++ {
						a, _ := strconv.Atoi(strArr[i]) //将每行有效数据转化为整型
						strArr2 = append(strArr2, a-1)  //将整型数据放入临时数组
					}

				}
			}
			//读取结束跳出
			if errf != nil || io.EOF == errf {
				fmt.Println("for run result:", "over")
				break
			}

		}
		//数据放入结果变量返回
		if len(strArr1) > 0 && len(strArr2) > 0 {
			strArrs = append(strArrs, strArr1, strArr2)
		}

		return strArrs, errs

	}

}

//readFile 获取源文件关键变量数据
/**
*@paths			文件上传路径
*
*返回值 int error
*@int		统计文件行数
*@error		没有打开文件，读取错误等情况下返回错误信息
 */
func readMshFile(paths string) (int, error) {

	file, err := os.Open(paths)
	if err != nil {
		fmt.Println("read fail")
	}
	defer file.Close()
	rd := bufio.NewReader(file)
	beego.Debug("start_msh文件265行，file", file)

	var count int = 0
	var index1 int
	for {
		linez, errf := rd.ReadString('\n')
		count++
		if len(strings.FieldsFunc(linez, Split)) > 0 {
			if strings.FieldsFunc(linez, Split)[0] == "1" {
				index1 = count //记录文件中的关键参数对应的行数
				beego.Debug("index:", index1)
			}
		}
		//读取结束跳出循环
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
	}
	return index1, err
}


// ElementsArrSplit 以4为拆分，并进行
// func  ElementsArrSplit(ElementsOne []string)  []string {

// 	beego.Debug("ElementsOne : ", ElementsOne)
// 	//ElementsTwo 
// 	ElementsTwo := make([]string, 0)
	
// 	ElementsTwo = strings.Split(strings.Trim(string(ElementsOne), "[]"), "4")





// 	beego.Debug("ElementsTwo : ", ElementsTwo)

// 	return ElementsTwo
// }


// ElementsArrTwo 拆分Elements数组重新组合 20201127
/**
*@ElementsOne		传入的 string切片
*@
*@ElementsTwo		拆分并重组后的 string切片
**/
func  ElementsArrTwo(ElementsOne []string)  []string {

	// beego.Debug("ElementsOne : ", ElementsOne)
	//ElementsTwo 
	ElementsTwo := make([]string, 0)
	for k, v := range ElementsOne {
		switch {
		case k == 0 :
			ElementsTwo = append(ElementsTwo, strings.ReplaceAll(v, "4", "3"))
		case k ==1 || k==2 || k==3 :
			v1, _ := strconv.Atoi(v)
			ElementsTwo =  append(ElementsTwo, strconv.Itoa(v1 - 1))
		}
	}
	// ElementsTwo = append(ElementsTwo, strings.ReplaceAll(ElementsOne[0], "4", "3"))
	// ElementsTwo =  append(ElementsTwo, ElementsOne[1])
	// ElementsTwo =  append(ElementsTwo, ElementsOne[2])
	// ElementsTwo =  append(ElementsTwo, ElementsOne[3])
	// beego.Debug("ElementsTwo : ", ElementsTwo)

	return ElementsTwo
}



// ElementsArrThree 拆分Elements数组重新组合 20201127
/**
*@ElementsOne  替换后的数组
*@
*@ElementsThree		拆分并重组后的数组
**/
func  ElementsArrThree(ElementsOne []string) []string {

	//ElementsTwo 重组后的切片
	ElementsThree := make([]string, 0)
	for k, v := range ElementsOne {
		switch {
		case k == 0 :
			ElementsThree = append(ElementsThree, strings.ReplaceAll(v, "4", "3"))
		case k ==1 || k==2 || k==4 :
			v1, _ := strconv.Atoi(v)
			ElementsThree =  append(ElementsThree, strconv.Itoa(v1 - 1))
		}
	}
	// ElementsThree[0] = strings.ReplaceAll(ElementsOne[0], "4", "3")
	// ElementsThree[1] = ElementsOne[1]
	// ElementsThree[2] = ElementsOne[2]
	// ElementsThree[3] = ElementsOne[4]

	return ElementsThree
}

// ElementsArrFour 拆分Elements数组重新组合 20201127
/**
*@ElementsOne  替换后的数组
*@
*@ElementsFour		拆分并重组后的数组
**/
func  ElementsArrFour(ElementsOne []string) []string {

	//ElementsTwo 重组后的切片
	ElementsFour := make([]string, 0)
	for k, v := range ElementsOne {
		switch {
		case k == 0 :
			ElementsFour = append(ElementsFour, strings.ReplaceAll(v, "4", "3"))
		case k ==1 || k==3 || k==4 :
			v1, _ := strconv.Atoi(v)
			ElementsFour =  append(ElementsFour, strconv.Itoa(v1 - 1))
		}
	}
	// ElementsFour[0] = strings.ReplaceAll(ElementsOne[0], "4", "3")
	// ElementsFour[1] = ElementsOne[1]
	// ElementsFour[2] = ElementsOne[3]
	// ElementsFour[3] = ElementsOne[4]

	return ElementsFour
}

// ElementsArrFive 拆分Elements数组重新组合 20201127
/**
*@ElementsOne  替换后的数组
*@
*@ElementsFive		拆分并重组后的数组
**/
func  ElementsArrFive(ElementsOne []string) []string {
 
	//ElementsFive 重组后的切片
	ElementsFive := make([]string, 0)
	for k, v := range ElementsOne {
		switch {
		case k == 0 :
			ElementsFive = append(ElementsFive, strings.ReplaceAll(v, "4", "3"))
		case k ==2 || k==3 || k==4 :
			v1, _ := strconv.Atoi(v)
			ElementsFive =  append(ElementsFive, strconv.Itoa(v1 - 1))
		}
	}
	// ElementsFive[0] = strings.ReplaceAll(ElementsOne[0], "4", "3")
	// ElementsFive[1] = ElementsOne[2]
	// ElementsFive[2] = ElementsOne[3]
	// ElementsFive[3] = ElementsOne[4]

	return ElementsFive
}