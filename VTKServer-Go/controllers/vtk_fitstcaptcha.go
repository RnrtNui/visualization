package controllers

import (
	"VTKServer-Go/tool/captcha"

	"github.com/astaxie/beego"
)

//FirstGetCaptcha 第一次获得验证码id接口
type FirstGetCaptcha struct {
	beego.Controller
}

//Get 验证码id接口get方法
func (c *FirstGetCaptcha) Get() {

	//跨域请求，仅限接口
	c.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")

	//创建一个新的验证码id
	if numberID, err := captcha.Cap.CreateCaptcha(); err == nil {
		c.Data["json"] = map[string]interface{}{"getCaptchaID": numberID}
		c.ServeJSON()
	} else {
		c.Data["json"] = map[string]interface{}{"status": err}
		c.ServeJSON()
	}
}
