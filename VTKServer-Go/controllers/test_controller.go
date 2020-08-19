package controllers

import (
	"github.com/astaxie/beego"
)

//TestController t
type TestController struct {
	beego.Controller
}

//Index i
func (c *TestController) Index() {
	paramMap := c.Ctx.Input.Params()
	//获取RESTFUL风格的参数
	//此时的URL为 localhost:8080/test/index/aaa/bbb
	c.Data["UserName"] = paramMap["0"] //aaa

	v := c.GetSession("uid")
	c.Data["uid"] = v.(string)

	c.TplName = "test.html"
}
