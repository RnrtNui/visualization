package controllers

import (
	"encoding/json"
	"io/ioutil"
	"sort"
	"strconv"
	"strings"

	"github.com/astaxie/beego"
)

//ProTransController 传输数据
type ProTransController struct {
	beego.Controller
	//OneData string
	//TwoData []interface{}
}

//ProTransData 接收前端传来的文件信息
type ProTransData struct {
	ID        string      `json:"id"`
	TransData []TransData `json:"data"`
}

//TransData 接收前端传来的文件信息
type TransData struct {
	Title     string  `json:"title"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Desc      string  `json:"desc"`
	DescType  string  `json:"类型描述"`
	Colour    string  `json:"颜色"`
	PointX    string  `json:"pointX"`
	PointY    string  `json:"pointY"`
	Pel       string  `json:"pel"`
	AreaName  string  `json:"areaName"`
	Count     int     `json:"count"`
	Lat       string  `json:"lat"`
	Lng       string  `json:"lng"`
}

//OneData ss
var OneData = make(map[string][]TransData)

//OnePost 返回前端文件内容
func (u *ProTransController) OnePost() {
	//接收前端发送的数据
	fileInfo := ProTransData{}
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		errr := json.Unmarshal(b, &fileInfo)
		if errr != nil {
			beego.Error("e is :", errr)
		}
		beego.Debug("userchange get data from web :", string(b))
	}

	//固定map数量
	OneData = SortByKey(OneData)

	if len(fileInfo.TransData) > 0 {
		keyID := fileInfo.ID
		for _, tdata := range fileInfo.TransData {
			OneData[keyID] = append(OneData[keyID], tdata)
		}
	}
	beego.Debug("OneData", OneData)
	if OneData[fileInfo.ID] == nil {
		u.Data["json"] = map[string]interface{}{"message": "数据接收失败"}
		u.ServeJSON()
	}

}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//TwoTime 接收时间戳id
type TwoTime struct {
	TimeID string `json:"timeID"`
}

//TwoPost 返回前端文件内容
func (u *ProTransController) TwoPost() {
	info := TwoTime{}
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		err := json.Unmarshal(b, &info)
		if err != nil {
			beego.Error("e is :", err)
		}
		beego.Debug("userchange get data from web :", string(b))
	}
	if len(OneData[info.TimeID]) == 0 {
		u.Data["json"] = map[string]interface{}{"data": "数据未提交"}
		u.ServeJSON()
		return
	}
	u.Data["json"] = map[string]interface{}{"data": OneData[info.TimeID]}
	u.ServeJSON()

}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//SortByKey 对map中的key进排序并取最后300个
func SortByKey(dataMap map[string][]TransData) map[string][]TransData {
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
