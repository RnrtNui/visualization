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
/**
*@filePath		处理文件的全路径
*
*@[]string		
**/
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
	//doc.Paragraphs()得到包含文档所有的段落的切片
	for _, page := range doc.Paragraphs() {
		//run为每个段落相同格式的文字组成的片段
		for _, run := range page.Runs() {
			//beego.Debug("doc :", run.Text())
			data = append(data, run.Text())
		}
	}
	return data, err
}
