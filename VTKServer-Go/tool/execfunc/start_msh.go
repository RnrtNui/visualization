package execfunc

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"

	"github.com/astaxie/beego"
)

//HandleMSH 处理msh
func HandleMSH(filePath string) ([]interface{}, error) {
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

//readFile 获取源文件关键变量数据
func readMshFile(paths string) (int, error) {

	file, err := os.Open(paths)
	if err != nil {
		fmt.Println("read fail")
	}
	defer file.Close()
	rd := bufio.NewReader(file)

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
