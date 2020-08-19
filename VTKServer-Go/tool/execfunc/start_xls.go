package execfunc

import (
	"github.com/360EntSecGroup-Skylar/excelize"
)

//HandleXls 处理xls文件
func HandleXls(filePath string) ([][]string, error) {

	file, err := excelize.OpenFile(filePath)
	data := file.GetRows("Sheet1")
	return data, err
}
