package controllers

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"

	"VTKServer-Go/models/dao"
	"VTKServer-Go/tool/captcha"
	"io"
	"io/ioutil"
	"strings"

	"github.com/astaxie/beego"
)

//RegisterController 注册接口
type RegisterController struct {
	beego.Controller
	status int
}

//RegisterData 注册的接收数据
type RegisterData struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	Email     string `json:"email"`
	Captcha   string `json:"captcha"`
	CaptchaID string `json:"captcha_id"`
}

//Post 这个页面采用浏览器默认的json行为，不多加解析
//Post 接受注册数据 0 服务端错误　１　成功　２　用户已经存在　３　验证码错误
func (r *RegisterController) Post() {

	//跨域请求,仅限接口
	r.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	//	l.Ctx.ResponseWriter.Header().Set("Content-Type", "application/json; charset=utf-8")
	r.Ctx.ResponseWriter.Header().Set("Content-Type", "application/x-www-form-urlencoded")
	register := RegisterData{}
	if h := r.Ctx.Request.Header.Get("Content-Type"); h == strings.TrimSpace("application/json") {
		var reader io.Reader = r.Ctx.Request.Body
		b, e := ioutil.ReadAll(reader)
		json.Unmarshal(b, &register)
		if e != nil {
		}
		beego.Debug("register info from web ", string(b))
	}
	beego.Debug("register info unmarshal", register)
	username := register.Username
	password := register.Password

	beego.Debug("register passwd md5", password)
	if captcha.JSONVerify(register.CaptchaID, register.Captcha) {
		//验证数据库是否存在此用户
		if _, err := dao.UserFind(username); err != nil {
			//因为前端做输入判断，输入一定是有内容且合法的，所以直接注册验证
			//将password进行MD5加密
			md5Value := md5.New()
			md5Value.Write([]byte(password))
			password = hex.EncodeToString(md5Value.Sum([]byte{}))

			user := &dao.Users{
				Username: username,
				Password: password,
				Email:    register.Email,
				Status:   1,
			}
			_, err := dao.UserAdd(user)
			if err != nil {
				r.status = 0
				r.Data["json"] = map[string]interface{}{"status": r.status, "message": err}
				r.ServeJSON()
				return
			}
			r.status = 1
			r.Data["json"] = map[string]interface{}{"status": r.status, "message": "注册成功请直接登入"}
			r.ServeJSON()
			return
		}
		r.status = 2
		r.Data["json"] = map[string]interface{}{"status": r.status, "message": "用户已经存在"}
		r.ServeJSON()
		return

	}
	r.status = 3
	r.Data["json"] = map[string]interface{}{"status": r.status, "message": "验证码错误"}
	r.ServeJSON()
}
