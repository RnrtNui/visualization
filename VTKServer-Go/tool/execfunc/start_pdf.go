package execfunc

import (
	"baliance.com/gooxml/document"
	"github.com/astaxie/beego"
)

//HandleWord 处理word文件
func HandleWord(filePath string) ([]string, error) {

	doc, err := document.Open(filePath)
	var data = []string{}
	if err != nil {
		beego.Debug("word read err", err)
	}
	for _, page := range doc.Paragraphs() {
		for _, run := range page.Runs() {
			//beego.Debug("doc :", run.Text())
			data = append(data, run.Text())
		}
	}
	return data, err
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//HandlePDF 处理pdf文件
func HandlePDF(filePath string) ([]string, error) {

	// f, errf := os.Open(filePath)
	// if errf != nil {
	// 	beego.Error("read file err :", errf)
	// }
	// defer f.Close()

	doc, err := document.Open(filePath)
	var data = []string{}
	if err != nil {
		beego.Debug("word read err", err)
	}
	for _, page := range doc.Paragraphs() {
		for _, run := range page.Runs() {
			//beego.Debug("doc :", run.Text())
			data = append(data, run.Text())
		}
	}
	return data, err
}
