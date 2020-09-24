package routers

import (
	"VTKServer-Go/controllers"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/plugins/cors"
)

func init() {

	beego.InsertFilter("*", beego.BeforeRouter, cors.Allow(&cors.Options{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Content-Type", "x-requested-with"},
		ExposeHeaders:    []string{"Content-Length", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Content-Type"},
		AllowCredentials: true,
	}))

	//beego.AutoRouter(&controllers.TestController{})
	beego.AutoRouter(&controllers.LoginFilterController{})
	beego.AutoRouter(&controllers.TestController{})

	//其他接口
	beego.Router("/vtkReadFile", &controllers.VtkReadFileController{})    //处理数据接口
	beego.Router("/vtkIcon", &controllers.VtkAvatarController{})          //上传图标接口
	beego.Router("/vtkCreate", &controllers.VtkCreateProjectController{}) //项目创建接口
	beego.Router("/vtkUpload", &controllers.VtkuploadFileController{})    //文件上传接口
	beego.Router("/vtkFile", &controllers.VtkFileListController{})        //文件列表接口
	beego.Router("/vtkPro", &controllers.VtkProListController{})          //项目列表接口
	beego.Router("/vtkRegist", &controllers.RegisterController{})         //用户注册接口
	beego.Router("/vtkLogin", &controllers.LoginController{})             //登录页面
	beego.Router("/vizGetCaptchaId", &controllers.FirstGetCaptcha{})      //验证码id接口
	beego.Router("/option/computeFile", &controllers.ComputerFileController{})
	beego.Router("/vtkSave", &controllers.VtkSaveFileController{})
	beego.Router("/objData", &controllers.ObjFileSaveController{})           //保存前端数组
	beego.Router("/csvData", &controllers.CsvFileSaveController{})           //文件类型
	beego.Router("/fileType", &controllers.TypeListController{})             //文件类型
	beego.Router("/geoSave", &controllers.GeoDataSaveController{})           //保存地质数据接口
	beego.Router("/transformation", &controllers.TransformationController{}) //转换VTK网格 20200921

	//流程化接口
	beego.Router("/process/upload", &controllers.ProcessuploadFileController{}) //流程上传
	beego.Router("/process/readFile", &controllers.ProReadFileController{})     //处理文件

	//地图数据接口
	TransData := &controllers.ProTransController{}
	beego.Router("/process/transData", TransData, "post:OnePost") //数据传输
	beego.Router("/process/transTwo", TransData, "post:TwoPost")  //数据传输

	//词云图接口
	CloudWords := &controllers.CloudWordController{}
	beego.Router("/process/cloudWord", CloudWords, "post:OnePost") //数据传输
	beego.Router("/process/cloudTwo", CloudWords, "post:TwoPost")  //数据传输

	//热力图接口
	HeatMap := &controllers.HeatMapController{}
	beego.Router("/process/heatMap", HeatMap, "post:OnePost") //数据传输
	beego.Router("/process/heatTwo", HeatMap, "post:TwoPost") //数据传输

	//流程上传接口
	ProUp := &controllers.ProcessFileUpController{}
	beego.Router("/process/proFileUp", ProUp, "post:OnePost") //处理文件
	beego.Router("/process/proUpTwo", ProUp, "post:TwoPost")  //处理文件

}
