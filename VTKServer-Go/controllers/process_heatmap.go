package controllers

import (
	"encoding/json"
	"io/ioutil"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/astaxie/beego"
)

//HeatMapController 热力图接口
type HeatMapController struct {
	beego.Controller
}

//HeatMapData 接收前端传来的文件信息
type HeatMapData struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

//HeatData 接收前端传来的文件信息
type HeatData struct {
	ID   string `json:"id"`
	Data string `json:"data"`
	City string `json:"city"`
}

//HMData 变量
var HMData = make(map[string]HeatData)

//OnePost 返回前端文件内容
func (u *HeatMapController) OnePost() {
	//接收前端发送的数据
	fileInfo := HeatData{}
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		errr := json.Unmarshal(b, &fileInfo)
		if errr != nil {
			beego.Error("e is :", errr)
		}
		beego.Debug("userchange get data from web :", string(b))
	}

	//固定map数量
	HMData = SortHeatMap(HMData)

	if len(fileInfo.Data) > 0 {
		keyID := fileInfo.ID
		HMData[keyID] = fileInfo
	}
	beego.Debug("HMData", HMData)
	if len(HMData[fileInfo.ID].Data) == 0 {
		u.Data["json"] = map[string]interface{}{"message": "数据接收失败"}
		u.ServeJSON()
	}

}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//TwoPost 返回前端文件内容
func (u *HeatMapController) TwoPost() {
	info := TwoTime{}
	if h := u.Ctx.Request.Header.Get("Content-Type"); strings.Contains(h, "application/json") {
		b, _ := ioutil.ReadAll(u.Ctx.Request.Body)
		err := json.Unmarshal(b, &info)
		if err != nil {
			beego.Error("e is :", err)
		}
		beego.Debug("userchange get data from web :", string(b))
	}
	chinaPath := filepath.Join("dicom", "chinaData", HMData[info.TimeID].City+".json")
	if len(HMData[info.TimeID].Data) == 0 {
		u.Data["json"] = map[string]interface{}{"data": "数据未提交"}
		u.ServeJSON()
		return
	}
	u.Data["json"] = map[string]interface{}{"data": HMData[info.TimeID], "mapData": chinaPath}
	u.ServeJSON()

}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//SortHeatMap 对map中的key进排序并取最后300个
func SortHeatMap(dataMap map[string]HeatData) map[string]HeatData {
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
