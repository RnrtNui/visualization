package main

import (
	_ "VTKServer-Go/routers"
	"os"
	"runtime"
	"strings"

	"github.com/astaxie/beego/context"
	"github.com/pkg/errors"

	//_ "net/http/pprof"

	"github.com/astaxie/beego"
)

//ErrStatic a
var ErrStatic = errors.New("没有提供正确的文件目录")

func main() {
	defer func() {
		if err := recover(); err != nil {
			beego.Debug(err)
		}

	}()
	runtime.GOMAXPROCS(3)
	var uploadFile = beego.AppConfig.String("UploadFile")
	//beego.SetLogger("file", `{"filename":"logs/test.log"}`)
	switch runtime.GOOS {
	case "windows":
		if uploadFile[len(uploadFile)-2:] != "\\\\" {
			uploadFile += "\\\\"
		}
	case "linux":
		if uploadFile[len(uploadFile)-1:] != "/" {
			uploadFile += "/"
		}
	}
	if info, err := os.Stat(uploadFile); err != nil || !info.IsDir() {
		panic(ErrStatic)

	}
	beego.SetStaticPath("vtkicon", uploadFile+"vtkicon")
	beego.SetStaticPath("dicom", uploadFile+"dicom")
	//注册过滤器
	//beego.InsertFilter("/*", beego.BeforeRouter, FilterUser, true)

	beego.SetLogFuncCall(true)
	beego.Run()
}

//FilterUser 过滤器
var FilterUser = func(ctx *context.Context) {
	_, ok := ctx.Input.Session("uid").(string)
	ok2 := strings.Contains(ctx.Request.RequestURI, "/vtkLogin")
	beego.Debug(ok, ok2)
	if !ok && !ok2 {
		ctx.Redirect(302, "/vtkLogin/index")
	}
}
