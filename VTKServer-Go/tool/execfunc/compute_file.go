package execfunc

import (
	"path/filepath"
	"strings"

	"github.com/astaxie/beego"
)

//ComputeTypeFile 返回前端文件内容(execFile:执行命令目录位置；filePath：数据文件目录；fileNameM：数据文件)
func ComputeTypeFile(execFile string, filePath string, fileNameM string) string {
	//文件路径
	fileNameMsh := filepath.Join(filePath, fileNameM)
	beego.Debug("filenameMsh:", fileNameMsh)

	switch {
	case strings.Contains(fileNameM, ".flavia.msh"):
		com := filepath.Join(execFile, "special_FROF.exe")
		//调用可执行程序

		str, err := RunMsh(com, fileNameMsh)
		if err != nil || strings.Contains(str, "0.00000") {
			if err != nil {
				beego.Error("命令执行错误：", err)
				return "special_FROF.exe命令执行错误"
			}
			return "文件读取失败！"
		} else if err == nil {
			com := filepath.Join(execFile, "FROFMeshRes.exe")
			ffileNameMsh := filepath.Join(filePath, "F"+fileNameM)
			//调用可执行程序
			strFile := strings.Replace(fileNameM, ".msh", ".res", -1)
			tfileNameMsh := filepath.Join(filePath, "T"+strFile)
			_, err := RunMsh(com, ffileNameMsh, tfileNameMsh)
			if err != nil {
				beego.Error("命令执行错误：", err)
				return "FROFMeshRes.exe执行错误"
			}
			//返回前端数据信息
			return "执行成功 信息：" + str
		}
	case strings.Contains(fileNameM, ".flavia.res"):
		com := filepath.Join(execFile, "ResPreTreat.exe")
		//调用可执行程序
		str, err := RunMsh(com, fileNameMsh)
		if err != nil {
			beego.Error("命令执行错误：", err)
			return "ResPreTreat.exe执行错误"
		}
		return "执行成功 信息：" + str
	case strings.Contains(fileNameM, ".msh") && !strings.Contains(fileNameM, ".flavia") && !strings.Contains(fileNameM, ".post"):
		com := filepath.Join(execFile, "MshPreTreat.exe")
		//调用可执行程序
		str, err := RunMsh(com, fileNameMsh)
		if err != nil {
			beego.Error("命令执行错误：", err)
			return "MshPreTreat.exe执行错误"
		}
		return "执行成功 信息：" + str
	default:
		return "没有发现要处理的文件"
	}
	return "没有发现要处理的文件"
}
