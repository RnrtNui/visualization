#前端+node服务部分：

##作者：
    鲁杨飞
    
##概述：
    visualization可视化项目下包含数据可视化（DataVClient），模型可视化（VTKClient），nodeJs服务（VTKServer，DataVServer）和web终端（webssh2）:
    VTKClient （模型可视化）基于vtk.js实现的前端可视化项目，支持多种模型数据文件格式，进行数据模型及结果进行渲染;
    DataVClient （数据可视化）采用百度echarts、百度地图API等实现各种二维和三维图表、词云图、热力图等,实现数据可视化;
    VTKServer  流程化部分nodeJs后端接口服务代码;
    DataVServer  数据可视化部分nodeJs后端服务代码;
    webssh2 （web终端）在浏览器上运行的SSH终端服务代码。

##运行环境：
    node:v13.12.0

##运行指南：

###VTKClient（模型可视化）: 
    注意：每次更新package.json需要执行npm install更新依赖包。
    1、修改VTKClient目录下的webpack.config.js中的devServer.host改为本机ip地址、代理设置proxy下的target改为后端服务地址;
    2、修改src目录下的url.js。
    3、进入VTKClient目录下打开控制台通过　npm install 安装依赖包;
    4、npm run build 构建项目；
    5、通过 npm start 启动项目。

###DataVClient（数据可视化）:
    注意：每次更新package.json需要执行npm install更新依赖包。
    1、修改DataVClient目录下的webpack.config.js中的devServer.host改为本机ip地址、代理设置proxy下的target改为后端服务地址;
    2、修改src目录下的url.js。
    3、进入DataVClient目录下打开控制台通过　npm install 安装依赖包;
    4、npm run build 构建项目；
    5、通过 npm start 启动项目。

###webssh2（web终端）:
    注意：每次更新package.json需要执行npm install更新依赖包。
    1、进入webssh2目录下打开控制台通过  npm install 安装依赖包;
    2、修改webssh2/client/src/目录下的client.htm和/js目录下index.js中的"http://192.168.2.134:8004"改为本机ip地址+端口号;修改webssh2/server/app.js中监听的ip;
    3、npm run builddev 构建项目;
    4、通过 npm start 启动项目;
    5、浏览器访问http:// + 本机ip + :端口 + /ssh/host/ + 访问的终端ip + / + 用户名 + / + 密码。
    (例如:http://192.168.2.134:8004/ssh/host/192.168.2.134/luyangfei/123456)

###VTKServer:
    注意：每次更新package.json需要执行npm install更新依赖包。
    1、进入VTKServer目录下打开控制台通过  npm install 安装依赖包;
    2、通过 npm start 启动服务。

###DataVServer:
    注意：每次更新package.json需要执行npm install更新依赖包。
    1、进入DataVServer目录下打开控制台通过  npm install 安装依赖包;
    2、通过 npm start 启动服务。
    
##VTKClient后端配合名称：
    VTKServer-Go

#后端部分：

##作者：
    麻禄帅

##概述：
    VTKServer-Go可视化项目后端包含数据可视化、模型可视化、流程可视化；
    基于golang实现的可视化后端，支持多种模型数据文件格式（如 vtk、msh、obj、stl、csv、off等），进行数据模型的处理及结果的传输，对接前端进行渲染；
    实现百度地图数据、二维和三维图表、词云图、热力图等数据的处理传输,对接前端实现数据可视化。

##运行指南

###基础环境
    go1.15.2
    
###配置文件（需要修改的文件）
    项目下的conf/app.conf
    在该文件中配置数据库mysql链接及数据文件路径

###数据位置
    在配置文件中指定data路径
    在FTP上的”鲁杨飞“目录中下载data.zip解压到指定的data路径
    解压后（如果是linux系统）在data/commandLinux目录下将其中的几个命令赋予执行权限
    chmod -R +x 文件名

###添加代理在终端下执行
    go env -w GOPROXY=https://goproxy.cn,direct

###运行
    项目目录下执行命令:
    go build
    ./VTKServer-Go
    
##后端项目名
    VTKServer-Go
