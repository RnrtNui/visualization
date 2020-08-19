package controllers

import (
	"VTKServer-Go/models/dao"
	"VTKServer-Go/tool/captcha"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"io"
	"io/ioutil"
	"strings"

	"github.com/astaxie/beego"
)

//LoginController 登录结构体接口
type LoginController struct {
	beego.Controller
	//0 用户名查询不到 1 密码错误 2 验证码错误 3 登录成功
	status int
}

//BodyLogin 传入字段
type BodyLogin struct {
	Username  string `json:"username"`   //用户名
	Password  string `json:"password"`   //用户密码
	Captcha   string `json:"captcha"`    //验证码值
	CaptchaID string `json:"captcha_id"` //验证码id
}

//Post 登录结构体post方法
func (l *LoginController) Post() {

	//跨域请求,仅限接口
	l.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	l.Ctx.ResponseWriter.Header().Set("Access-Control-Allow-Headers", "*")
	l.Ctx.ResponseWriter.Header().Set("Content-Type", "application/json; charset=utf-8")

	//接受解析前端数据
	login := BodyLogin{}
	if h := l.Ctx.Request.Header.Get("Content-Type"); h == strings.TrimSpace("application/json") {
		var reader io.Reader = l.Ctx.Request.Body
		b, e := ioutil.ReadAll(reader)
		json.Unmarshal(b, &login)
		if e != nil {
		}

		beego.Debug("login get data from web :", string(b))
	}
	beego.Debug("login unmashal data:", login)

	username := login.Username
	password := login.Password
	md5Value := md5.New()
	md5Value.Write([]byte(password))
	password = hex.EncodeToString(md5Value.Sum([]byte{}))
	if login.CaptchaID == "" {
		l.status = -1
		l.Data["json"] = map[string]interface{}{"status": l.status, "message": "无法验证captcha_id"}
		l.ServeJSON()
		return
	}
	//登录验证过程 验证码->用户名密码
	if captcha.JSONVerify(login.CaptchaID, login.Captcha) {
		if user, err := dao.UserFind(username); err == nil {
			switch user.Password {
			case password:
				l.status = 1 | 2
				l.Data["json"] = map[string]interface{}{"status": l.status, "message": "登录成功"}
				l.ServeJSON()
				//todo session设计 redis 状态缓存
			default:
				l.status = 1
				l.Data["json"] = map[string]interface{}{"status": l.status, "message": "密码错误"}
				l.ServeJSON()
			}
		} else if err != nil {
			l.status = 3
			l.Data["json"] = map[string]interface{}{"status": l.status, "message": "mysql无法连接..."}
			l.ServeJSON()
		}
		l.status = 0
		l.Data["json"] = map[string]interface{}{"status": l.status, "message": "用户不存在"}
		l.ServeJSON()
	}
	l.status = 2
	l.Data["json"] = map[string]interface{}{"status": l.status, "message": "验证码错误"}
	l.ServeJSON()
}
