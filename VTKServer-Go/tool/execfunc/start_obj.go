package execfunc

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
)

//OBJData 返回前端对象数组
type OBJData struct {
	CELLS  []int
	POINTS []string
}

//HandleObj 处理off文件
func HandleObj(filePath string) (*OBJData, error) {

	file, errs := os.Open(filePath)
	defer file.Close()
	// 把文件读取到缓冲区中
	rd := bufio.NewReader(file)
	// var count int = 0
	// var pointNum = 2
	// var infoFile int //记录文件中得点行数
	objdata := &OBJData{}
	objdata.POINTS = make([]string, 0)
	objdata.CELLS = make([]int, 0)
	for {

		line, errf := rd.ReadString('\n')
		if strings.Contains(line, "v ") {
			line1 := DeleteExtraSpace(line)
			line2 := strings.FieldsFunc(line1, Split)[0]
			lineArr := strings.Split(line2, " ")
			for _, str := range lineArr[1:] {
				objdata.POINTS = append(objdata.POINTS, str)
			}

		}
		if strings.Contains(line, "f ") && !strings.Contains(line, "off") {
			//line1 := DeleteExtraSpace(line)
			lineArr := strings.Split(line, " ")
			switch len(lineArr) {
			case 5:
				objdata.CELLS = append(objdata.CELLS, 3)
			case 6:
				objdata.CELLS = append(objdata.CELLS, 4)
			case 7:
				objdata.CELLS = append(objdata.CELLS, 5)
			default:
				objdata.CELLS = append(objdata.CELLS, 0)
			}

			for _, str := range lineArr[1:] {
				if len(str) > 3 {
					cdata, _ := strconv.Atoi(strings.Split(str, "/")[1])
					objdata.CELLS = append(objdata.CELLS, cdata-1)
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
