package execfunc

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
)

//InpData 返回前端对象数组
type InpData struct {
	CELLS  []int64
	POINTS []string
	SCALAR map[string][]string
}

//HandleInp 处理inp文件
func HandleInp(filePath string) (*InpData, error) {

	file, errs := os.Open(filePath)
	defer file.Close()
	// 把文件读取到缓冲区中
	rd := bufio.NewReader(file)
	var count int = 0
	var zcoordNum = 0
	// var pointNum = 2
	// var infoFile int //记录文件中得点行数
	inpdata := &InpData{}
	inpdata.POINTS = make([]string, 0)
	inpdata.CELLS = make([]int64, 0)
	inpdata.SCALAR = make(map[string][]string, 0)
	var scalarKey string
	for {

		line, errf := rd.ReadString('\n')
		count++
		if count > 1 {
			line1 := DeleteExtraSpace(line)
			if strings.Contains(line1, "\r") || strings.Contains(line1, "\n") {
				line1 = strings.FieldsFunc(line1, Split)[0]
			}
			lineArr1 := strings.Split(line1, " ")
			var lineArr []string
			for _, str := range lineArr1 {
				if str != "" && str != " " {
					lineArr = append(lineArr, str)
				}
			}
			if len(lineArr) > 0 {
				if len(lineArr) > 3 && len(lineArr) < 6 {
					inpdata.POINTS = append(inpdata.POINTS,
						lineArr[len(lineArr)-3],
						lineArr[len(lineArr)-2],
						lineArr[len(lineArr)-1])
				}
				if strings.Contains(line1, "quad") {
					a1, _ := strconv.ParseInt(lineArr[len(lineArr)-4], 10, 64)
					a2, _ := strconv.ParseInt(lineArr[len(lineArr)-3], 10, 64)
					a3, _ := strconv.ParseInt(lineArr[len(lineArr)-2], 10, 64)
					a4, _ := strconv.ParseInt(lineArr[len(lineArr)-1], 10, 64)
					inpdata.CELLS = append(inpdata.CELLS, 4, a1-1, a2-1, a3-1, a4-1)
				}
				if strings.Contains(line1, "Zcoord") {
					zcoordNum = count
					scalarKey = lineArr[len(lineArr)-1]

				}
				if zcoordNum > 0 {
					if count > zcoordNum {
						inpdata.SCALAR[scalarKey] = append(inpdata.SCALAR[scalarKey], lineArr[len(lineArr)-1])
					}
				}
			}
		}
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}

	}

	return inpdata, errs

}
