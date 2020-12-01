package controllers

import (
	"encoding/json"
	"io/ioutil"
	"sort"
	"strconv"
	"strings"

	"github.com/astaxie/beego"
)

//CloudWordController 词云图接口
type CloudWordController struct {
	beego.Controller
}

//CloudData 接收前端传来的文件信息
type CloudData struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

//WordData 接收前端传来的文件信息
type WordData struct {
	ID        string      `json:"id"`
	Shape     string      `json:"shape"`
	Data      []CloudData `json:"data"`
	MaskImage string      `json:"maskImage"`
}

//COWData 变量
var COWData = make(map[string]WordData)

//OnePost 返回前端文件内容
func (u *CloudWordController) OnePost() {
	//接收前端发送的数据
	fileInfo := WordData{}
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		errr := json.Unmarshal(b, &fileInfo)
		if errr != nil {
			beego.Error("e is :", errr)
		}
		beego.Debug("userchange get data from web :", string(b))
	}

	//固定map数量
	COWData = SortCloudWord(COWData)

	if len(fileInfo.Data) > 0 {
		keyID := fileInfo.ID
		COWData[keyID] = fileInfo
	}
	beego.Debug("COWData", COWData)
	if len(COWData[fileInfo.ID].Data) == 0 {
		u.Data["json"] = map[string]interface{}{"message": "数据接收失败"}
		u.ServeJSON()
	}

}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//TwoPost 返回前端文件内容
func (u *CloudWordController) TwoPost() {
	info := TwoTime{}
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		err := json.Unmarshal(b, &info)
		if err != nil {
			beego.Error("e is :", err)
		}
		beego.Debug("userchange get data from web :", string(b))
	}
	if len(COWData[info.TimeID].Data) == 0 {
		u.Data["json"] = map[string]interface{}{"data": "数据未提交"}
		u.ServeJSON()
		return
	}
	u.Data["json"] = map[string]interface{}{"data": COWData[info.TimeID]}
	u.ServeJSON()

}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//SortCloudWord 对map中的key进排序并取最后300个
func SortCloudWord(dataMap map[string]WordData) map[string]WordData {
	var sk []int
	//循环获取所有的key
	for k := range dataMap {
		kint, err := strconv.ParseInt(k, 10, 64)
		if err != nil {
			beego.Error("sortbykey err ", err)
		}
		sk = append(sk, (int)(kint))
	}
	sort.Ints(sk)
	beego.Debug("sk", sk)
	if len(sk) > 300 {
		for i := 0; i < len(sk)-300; i++ {
			key := strconv.FormatInt((int64)(sk[i]), 10)
			delete(dataMap, key)
		}
	}
	return dataMap
}
