package controllers

import (
	"fmt"

	"github.com/astaxie/beego"
)

//LoginFilterController 登录验证
type LoginFilterController struct {
	beego.Controller
}

//user u
type user struct {
	UserName string `form:"username"`
	//	Password  string `json:"password"`   //用户密码
}

//Index index
func (c *LoginController) Index() {
	//获取session值
	c.Data["uid"] = c.GetSession("uid")
	c.TplName = "login.html"
}

//Register res
func (c *LoginController) Register() {
	u := user{}
	//处理表单提交的数据
	if err := c.ParseForm(&u); err != nil {
		fmt.Println(err)
	} else {
		//注册session值
		c.SetSession("uid", u.UserName)
	}
	c.Data["uid"] = c.GetSession("uid")
	c.TplName = "login.html"
}
