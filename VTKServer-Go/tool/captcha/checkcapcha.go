package captcha

import (
	"github.com/astaxie/beego/cache"
	"github.com/astaxie/beego/context"
	"github.com/astaxie/beego/utils/captcha"
)

// Cap 验证码的全局变量
var Cap *captcha.Captcha

func init() {

	//缓存验证码
	store := cache.NewMemoryCache()
	Cap = captcha.NewWithFilter("/vizCaptcha/", store)
	//每一次刷新验证码id号，防止漏洞
	//此值和默认相同
	Cap.FieldIDName = "captcha_id"
	//验证码内容
	//此值和默认相同
	Cap.FieldCaptchaName = "captcha"
	//验证码数量
	Cap.ChallengeNums = 4
	//验证码大小
	Cap.StdWidth = 100
	Cap.StdHeight = 44

}

//Verify 验证码验证包括两个内容的验证captcha_id和captcha
func Verify(this *context.Context) bool {
	return Cap.VerifyReq(this.Request)
}

//JSONVerify jwt
func JSONVerify(id, val string) bool {
	return Cap.Verify(id, val)
}
