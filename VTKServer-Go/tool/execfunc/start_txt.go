package execfunc

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/astaxie/beego"
)

//HandleTxt 处理scv文件
func HandleTxt(filePath string) ([][]string, error) {

	file, err := os.Open(filePath)

	defer file.Close()
	rd := bufio.NewReader(file)
	count := 0
	num := 0
	var txtArrss [][]string
	for {
		linez, errf := rd.ReadString('\n')
		count++
		if strings.Contains(linez, "NODATA_value") {
			num = count
		}

		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
		if num > 0 {
			if count > num && count < 1008 {
				var line2 []string
				line1 := strings.Split(strings.FieldsFunc(linez, Split)[0], " ")
				for i := 0; i <= 1000; i++ {
					if line1[i] != "" && line1[i] != " " {
						line2 = append(line2, line1[i])
					}
				}
				if len(line2) > 0 {
					txtArrss = append(txtArrss, line2)
				}

			}
		}
	}
	beego.Debug("num", num)
	return txtArrss, err

}
