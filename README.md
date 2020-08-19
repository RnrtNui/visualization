#前端部分：
    ##作者：
        鲁杨飞<br>
    ##概述：
        visualization可视化项目下包含数据可视化（DataVClient），模型可视化（VTKClient）:<br>
            VTKClient（模型可视化）基于vtk.js实现的前端可视化项目，支持多种模型数据文件格式，进行数据模型及结果进行渲染;<br>
            DataVClient （数据可视化）采用百度echarts、百度地图API等实现各种二维和三维图表、词云图、热力图等,实现数据可视化。
    ##运行指南：
        ＃##VTKClient: 
            1、进入VTKClient目录打开控制台通过　npm install 安装依赖包;<br>
            2、通过 npm run dev  启动项目。
        ＃##DataVClient:
            1、进入DataVClient目录打开控制台通过　npm install 安装依赖包;<br>
            2、通过 npm run dev  启动项目。<br>
    ##后端配合名称：
        VTKServer-Go
#后端部分：
    ##作者：
        麻禄帅
    ##概述：
        VTKServer-Go可视化项目后端包含数据可视化、模型可视化、模型可视化；<br>
        基于golang实现的可视化后端，支持多种模型数据文件格式（如 vtk、msh、obj、stl、csv、off等），进行数据模型的处理及结果的传输，对接前端进行渲染；<br>
        实现百度地图数据、二维和三维图表、词云图、热力图等数据的处理传输,对接前端实现数据可视化。
    ##运行指南
        ＃##基础环境
            go1.13
        ＃##数据位置
            项目目录的data目录下
        ＃##添加代理在终端下执行
            go env -w GOPROXY=https://goproxy.cn,direct
        ###运行
            项目目录下执行命令:<br>
            go build<br>
            ./VTKServer-Go
    ##后端项目名
            VTKServer-Go
