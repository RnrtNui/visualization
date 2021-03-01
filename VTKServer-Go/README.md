## 基础环境
  go1.13
## 数据位置
  当前目录下创建 data/dataStr/ 目录和 data/dataUst目录
  指定数据文件放入该目录
## 添加代理在终端下执行
go env -w GOPROXY=https://goproxy.cn,direct
## 运行
  go build
  ./VTKServer-Go
