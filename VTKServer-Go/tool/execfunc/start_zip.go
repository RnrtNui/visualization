package execfunc

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"os"

	"github.com/astaxie/beego"
)

//ZipJsonFile 信息
// type ZipJsonFile struct {
// }

//VtkProList 接收前端的数据
type VtkProList struct {
	ProjectName string `json:"projectName"` //项目名称
	ProjectDesc string `json:"projectDesc"` //项目描述
	IconURL     string `json:"iconUrl"`     //图标路径
}

//ReturnProjectInfo 返回项目信息
func ReturnProjectInfo(jsonPath string) (*[]VtkProList, error) {
	p := []VtkProList{}
	fi, err := os.Open(jsonPath)
	if err != nil {
		beego.Error("err for geting", err)
		return nil, nil
	}
	defer fi.Close()
	d := VtkProList{}
	br := bufio.NewReader(fi)
	for {
		b, _, c := br.ReadLine()

		if c == io.EOF {
			break
		}
		if err := json.Unmarshal(b, &d); err != nil { //解析json信息
			beego.Error("err for geting", err)
			return nil, err
		}

		p = append(p, d)
	}
	return &p, nil
}

//JSONToStr tostring
func JSONToStr(jsonPath string) string {
	file, errs := os.Open(jsonPath)
	if errs != nil {
		beego.Error("err:", errs)
	}
	defer file.Close()
	// 把文件读取到缓冲区中
	rd := bufio.NewReader(file)
	var str string

	for {

		line, errf := rd.ReadString('\n')
		str += line
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
	}
	return str
}

//ReadZipFile 读取压缩文件
func ReadZipFile(zipFilePath string) string {
	file, errs := os.Open(zipFilePath)
	if errs != nil {
		beego.Error("err:", errs)
	}
	defer file.Close()
	//把文件读取到缓冲区中
	// rd, errz := gzip.NewReader(file)
	// defer rd.Close()
	// if errz != nil {
	// 	beego.Error("err:", errz)
	// }
	// gr, errr := ioutil.ReadAll(rd)
	// if errr != nil {
	// 	beego.Error("err:", errr)
	// }
	// fmt.Printf("%s\n", gr)
	rd := bufio.NewReader(file)

	var str string

	for {

		// line, errf := rd.ReadBytes('\n')
		line, errf := rd.ReadString('\n')
		// for _, b := range line {
		// 	str = append(str, b)
		// }
		str += line
		if errf != nil || io.EOF == errf {
			fmt.Println("for run result:", "over")
			break
		}
	}

	// s := bytes.NewBuffer(str)
	// var a []int32
	// err := binary.Read(s, binary.LittleEndian, a)
	// beego.Debug("le:", err)
	return str
}
