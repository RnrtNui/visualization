package execfunc

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
)

//HandleStl 处理off文件
func HandleStl(filePath string) (*StlData, error) {

	file, errs := os.Open(filePath)
	defer file.Close()
	// 把文件读取到缓冲区中
	rd := bufio.NewReader(file)

	var count int = 0
	stldata := &StlData{}
	stldata.POINTS = make([]float32, 0)
	stldata.CELLS = make([]int, 0)
	for {
		line, errf := rd.ReadString('\n')
		//找出文件中的点(x,y,z)数据
		if strings.Contains(line, "vertex") {
			line1 := DeleteExtraSpace(line)
			//判断文件中是否含有特殊字符
			if strings.Contains(line1, "\r") {
				line1 = strings.FieldsFunc(line1, Split)[0]
			}
			lineArr := strings.Split(line1, " ")
			if len(lineArr) >= 4 {
				x, _ := strconv.ParseFloat(lineArr[len(lineArr)-3], 32)
				y, _ := strconv.ParseFloat(lineArr[len(lineArr)-2], 32)
				z, _ := strconv.ParseFloat(lineArr[len(lineArr)-1], 32)
				//stldata变量中添加点
				stldata.POINTS = append(stldata.POINTS,
					float32(x),
					float32(y),
					float32(z))
				//stldata变量中添加单元
				if count%3 == 0 {
					stldata.CELLS = append(stldata.CELLS, 3)
				}
				stldata.CELLS = append(stldata.CELLS, count)
				count++
			}
		}
		//读取结束跳出循环
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
	}
	return stldata, errs
}
