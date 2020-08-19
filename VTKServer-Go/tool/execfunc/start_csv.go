package execfunc

import (
	"encoding/csv"
	"fmt"
	"io"
	"os"
)

//HandleCSV 处理scv文件
func HandleCSV(filePath string) ([][]string, error) {

	file, err := os.Open(filePath)

	defer file.Close()
	rd := csv.NewReader(file)

	var csvArrss = make([][]string, 0)
	for {
		linez, errf := rd.Read()

		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
		csvArrss = append(csvArrss, linez)
	}

	return csvArrss, err

}
