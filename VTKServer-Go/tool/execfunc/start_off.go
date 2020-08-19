package execfunc

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
)

//OffData 返回前端对象数组
type OffData struct {
	CELLS  []string
	POINTS []string
}

//HandleOFF 处理off文件
func HandleOFF(filePath string) (*OffData, error) {

	file, errs := os.Open(filePath)
	defer file.Close()
	// 把文件读取到缓冲区中
	rd := bufio.NewReader(file)
	var count int = 0
	var pointNum = 2
	var infoFile int //记录文件中得点行数
	offdata := &OffData{}
	offdata.POINTS = make([]string, 0)
	offdata.CELLS = make([]string, 0)
	for {

		line, errf := rd.ReadString('\n')

		count++
		if count == 2 {
			infoFile, _ = strconv.Atoi(strings.Split(line, " ")[0])

		}

		//写入坐标系内容
		if count > pointNum && count <= pointNum+infoFile {
			for i := 0; i < len(strings.Split(line, " ")); i++ {
				strArr := strings.Split(strings.Replace(strings.ReplaceAll(line, "\r\n", ""), "\n", "", -1), " ")
				if strArr[i] != "" && strArr[i] != " " {
					// pointObj, err := strconv.ParseFloat(strArr[i], 64)
					// if err != nil {
					// 	fmt.Println(err)
					// }
					offdata.POINTS = append(offdata.POINTS, strArr[i])
				}
			}

		}

		if count > pointNum+infoFile {
			if len(strings.FieldsFunc(line, Split)) > 0 {
				strArr := strings.Split(strings.FieldsFunc(line, Split)[0], " ")
				for i := 0; i < len(strArr); i++ {
					if strArr[i] != "" {
						offdata.CELLS = append(offdata.CELLS, strArr[i])
					}
				}

			}
		}

		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}

	}

	return offdata, errs

}
