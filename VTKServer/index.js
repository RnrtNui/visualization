/**
* 文件名：VTKServer/index.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：nodejs Server代码。
 */
const app = require('express')();
const fs = require("fs");
const events = require('events');
let path = require('path');
let cmd = require('node-cmd');
let http = require('http').createServer(app);
let io = require('socket.io')(http);
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("access-control-allow-credentials", "true")
    res.header("X-Powered-By", '3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
let newObj = {};
let Obj = {};
// let dirPath = '/public/home/hzhang/hwtest/';
// let username = "hzhang";
// let ip = '12.2.5.7';
// let password = "hzhang@CASJC0424A7";
// let name = 'hw';
//read .CSV file
function readCSV(arr, res, extname) {
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
        newArr.push(arr[i].split(","));
    }
    let obj = {
        type: extname,
        data: newArr
    }
    res.send(obj);
    res.end();
}
//read .VTK file
function readVTK(arr, res, extname) {
    let obj = {};
    let newArr = [];
    newArr = arr[0].split("\n");

    let POINTS = 0, CELLS = 0, CELL_TYPES = 0, LOOKUP_TABLE = 0;
    for (let i = 0; i < newArr.length; i++) {
        let array = newArr[i];
        if (array.indexOf("POINTS") !== -1) {
            POINTS = i;
        } else if (array.indexOf("CELLS") !== -1) {
            CELLS = i
        } else if (array.indexOf("CELL_TYPES") !== -1) {
            CELL_TYPES = i
        } else if (array.indexOf("LOOKUP_TABLE") !== -1) {
            LOOKUP_TABLE = i
        }
    }
    let array1 = newArr.slice(Number(POINTS) + 1, CELLS);
    newObj.POINTS = array1;
    let array2 = newArr.slice(Number(CELLS) + 1, CELL_TYPES);
    newObj.CELLS = array2;
    let array3 = newArr.slice(Number(LOOKUP_TABLE) + 1);
    newObj.POINT_DATA = array3;


    if (newObj.CELLS) {
        obj.CELLS = [];
        for (let j = 0; j < newObj.CELLS.length; j++) {
            let len = newObj.CELLS[j].split(" ");
            obj.CELLS.push(len);
        }
    }
    if (newObj.POINTS) {
        obj.POINTS = [];
        for (let j = 0; j < newObj.POINTS.length; j++) {
            let len = newObj.POINTS[j].split(" ");
            for (let x = 0; x < len.length; x++) {
                obj.POINTS.push(Number(len[x]));
            }
        }
    }
    if (newObj.POINT_DATA) {
        obj.POINT_DATA = [];
        for (let j = 0; j < newObj.POINT_DATA.length - 1; j++) {
            obj.POINT_DATA.push(Number(newObj.POINT_DATA[j]));
        }
    }
    let CELL = JSON.parse(JSON.stringify(obj.CELLS));
    let cells = [];
    for (let i = 0; i < CELL.length; i++) {
        if (CELL[i].length === 5) {
            let cell = CELL[i]
            cells.push(cell[0], cell[1], cell[2], cell[3])
        } else if (CELL[i].length === 6) {
            let cell = CELL[i]
            cells.push(cell[0], cell[1], cell[2], cell[3], cell[4])
        }
    }
    obj.CELLS = cells
    let objData = {
        type: extname,
        data: obj,
    }
    res.send(objData);
    res.end();
}

//write .Geo file
function writeStlGeoFile(fileName) {
    let context = `
            Merge "${fileName}";
            DefineConstant[
              angle = {40, Min 20, Max 120, Step 1, Name "Parameters/Angle for surface detection"},
              forceParametrizablePatches = {0, Choices{0,1}, Name "Parameters/Create surfaces guaranteed to be parametrizable"},includeBoundary = 1,curveAngle = 180
            ];
            ClassifySurfaces{angle * Pi/180, includeBoundary, forceParametrizablePatches, curveAngle * Pi / 180};
            CreateGeometry;
            Surface Loop(1) = Surface{:};
            Volume(1) = {1};
            
            funny = DefineNumber[0, Choices{0,1},
              Name "Parameters/Apply funny mesh size field?" ];
            
            Field[1] = MathEval;
            If(funny)
              Field[1].F = "2*Sin((x+y)/5) + 30";
            Else
              Field[1].F = "20";
            EndIf
            Background Field = 1;
            `
    fs.writeFile('../data/process/stl.geo', context, function (err) {
        if (err) {
            console.log('写入失败', err);
        } else {
            console.log('写入成功');
        }
    })
}
function writeStpGeoFile(fileName) {
    let context = `
            SetFactory("OpenCASCADE");
            v() = ShapeFromFile("${fileName}");
            Mesh.CharacteristicLengthMin = 6;
            Mesh.CharacteristicLengthMax = 6;
        `
    fs.writeFile('../data/process/stp.geo', context, function (err) {
        if (err) {
            console.log('写入失败', err);
        } else {
            console.log('写入成功');
        }
    })
}
function writeIgsGeoFile(fileName) {
    let context = `
    SetFactory("OpenCASCADE");
    v() = ShapeFromFile("${fileName}");
    Mesh.CharacteristicLengthMin = 1;
    Mesh.CharacteristicLengthMax = 1;
            `
    fs.writeFile('../data/process/igs.geo', context, function (err) {
        if (err) {
            console.log('写入失败', err);
        } else {
            console.log('写入成功');
        }
    })
}

app.post('/vtkReadFile', function (req, res) {
    var postData = '';
    req.on('data', function (chunk) {
        // chunk 默认是一个二进制数据，和 data 拼接会自动 toString
        postData += chunk;
    });
    req.on('end', function () {
        //对url进行解码（url会对中文进行编码）
        postData = decodeURI(postData);

        let fileName = JSON.parse(postData).fileName
        let extname = path.extname(fileName);
        if (extname === ".csv") {
            var data = fs.readFileSync("../data/project/3/dataStr/" + fileName);
            let ndata = data.toString();
            let arr = ndata.split("\r\n");
            readCSV(arr, res, extname);
        } else if (extname === ".vtk") {
            var data2 = fs.readFileSync("../data/project/3/dataUstr/" + fileName);
            let ndata = data2.toString();
            let arr = ndata.split("\r\n");
            readVTK(arr, res, extname);
        } else if (extname === ".tiff") {
            var data2 = fs.readFileSync("../data/dataTiff/" + fileName);
            let ndata = data2.toString();
            res.send(ndata);
            res.end();
        } else {
            // var data = fs.readFileSync("../data/project/3/dataUstr/" + fileName);
            res.send(null);
            res.end();
        }

    });

})
app.post('/vtkFoundFile', function (req, res) {
    let dir = "../data/project";
    fs.readdir(dir, function (err, files) {
        if (err) {
            console.error(err);
            return;
        }
        let proDir = {};
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let pathName = path.join(dir, file);
            let obj = proDir[file] = {};
            (function () {
                fs.readdir(pathName, function (err, files1) {
                    for (let j = 0; j < files1.length; j++) {
                        let file1 = files1[j];
                        let pathName1 = path.join(pathName, file1);
                        let arr = obj[file1] = [];
                        fs.readdir(pathName1, function (err, files2) {
                            arr = files2;
                        })
                        obj[file1] = arr;
                    }
                })
            })()
            proDir[file] = obj;
        }
        console.log(proDir)

    })
})

//转换vtk网格
app.post('/transformation', function (req, res) {
    var postData = '';
    req.on('data', function (chunk) {
        // chunk 默认是一个二进制数据，和 data 拼接会自动 toString
        postData += chunk;
    });
    req.on('end', function () {
        let date = new Date();
        let time = date.getTime()
        //对url进行解码（url会对中文进行编码）
        postData = decodeURI(postData);
        let fileName = JSON.parse(postData).fileName,
            inputFormat = JSON.parse(postData).inputFormat,
            meshType = JSON.parse(postData).meshType,
            outputFormat = JSON.parse(postData).outputFormat;
        let names = fileName.split('.');
        if (inputFormat === ".stl" || inputFormat === ".STL") {
            writeStlGeoFile(fileName);
            fileName = "stl.geo";
        } else if (inputFormat === ".stp" || inputFormat === ".step") {
            writeStpGeoFile(fileName);
            fileName = "stp.geo";
        } else if (inputFormat === ".igs" || inputFormat === ".iges") {
            writeIgsGeoFile(fileName);
            fileName = "igs.geo";
        }
        let gmshPath = "/home/luyangfei/Downloads/gmsh-4.6.0-Linux64/bin/gmsh";
        let processPath = "/home/luyangfei/project/visualization/data/process/";
        let command = gmshPath + ' ' + processPath + fileName + ' -' + meshType + ' -o ' + processPath + names[0] + "_" + time + outputFormat + ' -format ' + outputFormat.substr(1);
        cmd.get(
            command,
            function (err, data1, stderr) {
                console.log(data);
                res.send("http://192.168.2.134:4000/visualization/" + names[0] + "_" + time + outputFormat);
            }
        );
    })
})
//创建项目
app.post('/createPro', function (req, res) {
    var postData = ''; -
        req.on('data', function (chunk) {
            // chunk 默认是一个二进制数据，和 data 拼接会自动 toString
            postData += chunk;
        });
    req.on('end', function () {
        //对url进行解码（url会对中文进行编码）
        postData = decodeURI(postData);
        let fileName = JSON.parse(postData).fileName;
        fs.mkdir("/home/luyangfei/project/visualization/data/process/" + fileName, (err) => {
            res.send({ status: "项目创建成功" })
        });
    })
})
//拉取模型数据
app.post('/getModel', function (req, res) {
    var postData = ''; -
        req.on('data', function (chunk) {
            // chunk 默认是一个二进制数据，和 data 拼接会自动 toString
            postData += chunk;
        });
    req.on('end', function () {
        let date = new Date();
        let time = date.getTime()
        //对url进行解码（url会对中文进行编码）
        postData = decodeURI(postData);
        let fileName = JSON.parse(postData).fileName;
        // fs.readdir("/home/luyangfei/project/visualization/data/process/" + fileName + '/', (err, files) => {
        let command = `sshpass -p "ma" scp -r -o "StrictHostKeyChecking=no" ma@192.168.2.112:/home/ma/\{greenland5km3d.flavia.msh,greenland5km3d.flavia.res\} /home/luyangfei/project/visualization/data/process/`;
        cmd.get(
            command,
            function (err, data1, stderr) {
                if (err !== null) {
                    console.log(stderr);
                } else {
                    cmd.get("rm /home/luyangfei/project/visualization/data/dicom/greenland5km3d.flavia.msh.json", function () {
                        res.send("http://192.168.2.134:4000/visualization/greenland5km3d.flavia.msh");
                    })
                }
            }
        );
        // })
    })
})
// sshpass -p "hzhang@CASJC0424A7" scp -r -o "StrictHostKeyChecking=no" hzhang@12.2.5.7

//SSH远程连接
app.post('/sshConnection', function (req, res) {
    var postData = '';
    req.on('data', function (chunk) {
        // chunk 默认是一个二进制数据，和 data 拼接会自动 toString
        postData += chunk;
    });
    req.on('end', function () {
        //对url进行解码（url会对中文进行编码）
        postData = JSON.parse(decodeURI(postData));
        let timeStamp = postData["timeStamp"];
        let data = {};
        data[timeStamp] = 1;
        io.emit('sshConnection', data);
        Obj[timeStamp] = {};
        Obj[timeStamp] = Object.assign(Obj[timeStamp], postData.params);
        let command = `sshpass -p "${Obj[timeStamp].password}" ssh ${Obj[timeStamp].username}@${Obj[timeStamp].ip} ls`;
        cmd.get(command, function (err, data1, stderr) {
            if (err !== null) {
                res.send(false);
                data[timeStamp] = 2;
                io.emit('sshConnection', data);
            } else {
                res.send(true);
                data[timeStamp] = 0;
                io.emit('sshConnection', data);
            }
        });
        req.on('error', (err) => {
            console.log(err.message);
            res.send(err.message);
        })
    });
});
//指定目录
app.post('/assignPath', function (req, res) {
    var postData = '';
    req.on('data', function (chunk) {
        postData += chunk;
    });
    req.on('end', function () {
        postData = JSON.parse(decodeURI(postData));
        let timeStamp = postData["timeStamp"];
        if (timeStamp in Obj) {
            let data = {};
            data[timeStamp] = 1;
            io.emit('assignPath', data);
            Obj[timeStamp] = Object.assign(Obj[timeStamp], postData.params);
            let command = `sshpass -p "${Obj[timeStamp].password}" ssh -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip} "ls ${Obj[timeStamp].dirPath}"`;
            cmd.get(command, function (err, data1, stderr) {
                if (err !== null) {
                    res.send(false);
                    data[timeStamp] = 2;
                    io.emit('assignPath', data);
                } else {
                    res.send(true);
                    data[timeStamp] = 0;
                    io.emit('assignPath', data);
                }
            });
        } else {
            data[timeStamp] = 2;
            io.emit('assignPath', data);
            res.send(false);
        }
    });
    req.on('error', (err) => {
        console.log(err.message);
        res.send(err.message);
    })
})
//生成作业脚本
app.post('/taskScripts', function (req, res) {
    var postData = '';
    req.on('data', function (chunk) {
        postData += chunk;
    });
    req.on('end', function () {
        //对url进行解码（url会对中文进行编码）
        postData = JSON.parse(decodeURI(postData));
        let timeStamp = postData["timeStamp"];
        if (timeStamp in Obj) {
            let data = {};
            data[timeStamp] = 1;
            io.emit('taskScripts', data);
            Obj[timeStamp] = Object.assign(Obj[timeStamp], postData.params);
            let context =
                `#!/bin/bash
#PBS -N ${Obj[timeStamp].name}
#PBS -l nodes=${Obj[timeStamp].resourcesNodes}:ppn=${Obj[timeStamp].resourcesPpn}
#PBS -q ${Obj[timeStamp].queue} 
#PBS -o ${Obj[timeStamp].dirPath}${Obj[timeStamp].name}.log
#PBS -e ${Obj[timeStamp].dirPath}${Obj[timeStamp].name}.err
#PBS -l walltime=${Obj[timeStamp].walltime}
        
${Obj[timeStamp].command}`
            fs.writeFile('../data/process/' + Obj[timeStamp].name + '.pbs', context, function (err) {
                if (err) {
                    console.log('Script write failed', err);
                    res.send("Script write failed")
                } else {
                    let command = `sshpass -p "${Obj[timeStamp].password}" scp -r -o "StrictHostKeyChecking=no" /home/luyangfei/project/visualization/data/process/${Obj[timeStamp].name + '.pbs'} ${Obj[timeStamp].username}@${Obj[timeStamp].ip}:${Obj[timeStamp].dirPath}`;
                    cmd.get(command, function (err, data1, stderr) {
                        if (err !== null) {
                            console.log(false);
                            res.send('Script written error!');
                            data[timeStamp] = 2;
                            io.emit('taskScripts', data);
                        } else {
                            res.send('Script written successfully!');
                            data[timeStamp] = 0;
                            io.emit('taskScripts', data);
                        }
                    })
                }
            })
        } else {
            data[timeStamp] = 2;
            io.emit('taskScripts', data);
            res.send(false);
        }
    });
    req.on('error', (err) => {
        console.log(err.message);
        res.send(err.message);
    })
});
//执行作业脚本
app.post('/runTaskScripts', function (req, res) {
    var postData = '';
    req.on('data', function (chunk) {
        postData += chunk;
    });
    req.on('end', function () {
        //对url进行解码（url会对中文进行编码）
        postData = JSON.parse(decodeURI(postData));
        let timeStamp = postData["timeStamp"];
        if (timeStamp in Obj) {
            let data = {};
            data[timeStamp] = 1;
            io.emit('runTaskScripts', data);
            cmd.get(
                `sshpass -p "${Obj[timeStamp].password}" ssh -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip} "rm ${Obj[timeStamp].dirPath}${Obj[timeStamp].name}.log ${Obj[timeStamp].dirPath}${Obj[timeStamp].name}.err"`,
                function (err, data1, stderr) {
                    console.log("Log deleted successfully!")
                    cmd.get(
                        `sshpass -p "${Obj[timeStamp].password}" ssh -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip} qsub ${Obj[timeStamp].dirPath}${Obj[timeStamp].name}.pbs`,
                        function (err, data1, stderr) {
                            let getStatus = () => {
                                // /usr/bin/cat ${dirPath}${name}.log`
                                cmd.get(
                                    `sshpass -p "${Obj[timeStamp].password}" ssh -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip} qstat | grep ${Obj[timeStamp].name}`,
                                    function (err, data1, stderr) {
                                        if (data1.length > 1) {
                                            return getStatus();
                                        } else {
                                            console.log("Script execution completed");
                                            res.send(true);
                                            data[timeStamp] = 0;
                                            io.emit('runTaskScripts', data);
                                        }
                                    }
                                );
                            }
                            getStatus();
                        }
                    );
                }
            );
        } else {
            data[timeStamp] = 2;
            io.emit('runTaskScripts', data);
            res.send(false);
        }
    });
    req.on('error', (err) => {
        console.log(err.message);
        res.send(err.message);
    })
});

//pull modelData
app.post('/pullData', function (req, res) {
    let postData = '';
    req.on('data', function (chunk) {
        postData += chunk;
    });
    req.on('end', function () {
        postData = JSON.parse(decodeURI(postData));
        let timeStamp = postData["timeStamp"];
        if (timeStamp in Obj) {
            let data = {};
            data[timeStamp] = 1;
            io.emit('pullData', data);
            Obj[timeStamp] = Object.assign(Obj[timeStamp], postData.params);
            if (Obj[timeStamp].dataNames === null || Obj[timeStamp].dataNames === []) {
                let command = `sshpass -p "${Obj[timeStamp].password}" scp -r -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip}:${Obj[timeStamp].dirPath}/\{*.msh,*.res\} /home/luyangfei/project/visualization/data/process/`;
                cmd.get(
                    command,
                    function (err, data1, stderr) {
                        if (err !== null) {
                            data[timeStamp] = 2;
                            io.emit('pullData', data);
                            res.send(false);
                        } else {
                            res.send("Data pull succeeded");
                            data[timeStamp] = 0;
                            io.emit('pullData', data);
                        }
                    }
                );
            } else {
                let command = `sshpass -p "${Obj[timeStamp].password}" scp -r -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip}:${Obj[timeStamp].dirPath}/\{${Obj[timeStamp].dataNames}\} /home/luyangfei/project/visualization/data/process/`;
                cmd.get(
                    command,
                    function (err, data1, stderr) {
                        if (err !== null) {
                            res.send(false);
                            data[timeStamp] = 2;
                            io.emit('pullData', data);
                        } else {
                            res.send("Data pull succeeded");
                            data[timeStamp] = 0;
                            io.emit('pullData', data);
                        }
                    }
                );
            }
        } else {
            data[timeStamp] = 2;
            io.emit('pullData', data);
            res.send(false);
        }
    });
    req.on('error', (err) => {
        console.log(err.message);
        res.send(err.message);
    })
});
//获取模型name
app.post('/getFileName', function (req, res) {
    let postData = '';
    req.on('data', function (chunk) {
        postData += chunk;
    });
    req.on('end', function () {
        postData = JSON.parse(decodeURI(postData));
        let timeStamp = postData["timeStamp"];
        if (timeStamp in Obj) {

            let data = {};
            data[timeStamp] = 1;
            io.emit('pullgetFileNameData', data);
            let command = `sshpass -p "${Obj[timeStamp].password}" ssh -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip} ls ${Obj[timeStamp].dirPath}/*.msh`;
            cmd.get(command, function (err, data1, stderr) {
                if (err !== null) {
                    res.send(false);
                    data[timeStamp] = 2;
                    io.emit('pullgetFileNameData', data);
                } else {
                    let files = data1.split('/');
                    res.send(files[files.length - 1]);
                    data[timeStamp] = 0;
                    io.emit('pullgetFileNameData', data);
                }
            });
        } else {
            data[timeStamp] = 2;
            io.emit('getFileName', data);
            res.send(false);
        }
    });
    req.on('error', (err) => {
        console.log(err.message);
        res.send(err.message);
    })
});
//顺序执行流程
app.post('/runProcess', function (req, res) {
    let postData = '';
    req.on('data', function (chunk) {
        postData += chunk;
    });
    req.on('end', function () {
        postData = JSON.parse(decodeURI(postData));
        let timeStamp = postData[0]["timeStamp"];
        let data = {}, lins = [];
        data[timeStamp] = 1;
        Obj[timeStamp] = {};
        function sshConnection(Obj, resolve, reject) {
            let command = `sshpass -p "${Obj[timeStamp].password}" ssh ${Obj[timeStamp].username}@${Obj[timeStamp].ip} ls`;
            cmd.get(command, function (err, data1, stderr) {
                if (err !== null) {
                    reject(false);
                } else {
                    resolve(true);
                }
            });
        }
        function assignPath(Obj, resolve, reject) {
            let command = `sshpass -p "${Obj[timeStamp].password}" ssh -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip} "ls ${Obj[timeStamp].dirPath}"`;
            cmd.get(command, function (err, data1, stderr) {
                if (err !== null) {
                    reject(false);
                } else {
                    resolve(true);
                }
            });
        }
        function taskScripts(Obj, resolve, reject) {
            let context =
                `#!/bin/bash
#PBS -N ${Obj[timeStamp].name}
#PBS -l nodes=${Obj[timeStamp].resourcesNodes}:ppn=${Obj[timeStamp].resourcesPpn}
#PBS -q ${Obj[timeStamp].queue} 
#PBS -o ${Obj[timeStamp].dirPath}${Obj[timeStamp].name}.log
#PBS -e ${Obj[timeStamp].dirPath}${Obj[timeStamp].name}.err
#PBS -l walltime=${Obj[timeStamp].walltime}
        
${Obj[timeStamp].command}`
            fs.writeFile('../data/process/' + Obj[timeStamp].name + '.pbs', context, function (err) {
                if (err) {
                    console.log('Script write failed', err);
                } else {
                    let command = `sshpass -p "${Obj[timeStamp].password}" scp -r -o "StrictHostKeyChecking=no" /home/luyangfei/project/visualization/data/process/${Obj[timeStamp].name + '.pbs'} ${Obj[timeStamp].username}@${Obj[timeStamp].ip}:${Obj[timeStamp].dirPath}`;
                    cmd.get(command, function (err, data1, stderr) {
                        if (err !== null) {
                            console.log(false);
                            reject('Script written error!');
                        } else {
                            console.log('Script written successfully!');
                            resolve(true);
                        }
                    })
                }
            })
        }
        function runTaskScripts(Obj, resolve, reject) {
            cmd.get(
                `sshpass -p "${Obj[timeStamp].password}" ssh -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip} "rm ${Obj[timeStamp].dirPath}${Obj[timeStamp].name}.log ${Obj[timeStamp].dirPath}${Obj[timeStamp].name}.err"`,
                function (err, data1, stderr) {
                    console.log("Log deleted successfully!")
                    cmd.get(
                        `sshpass -p "${Obj[timeStamp].password}" ssh -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip} qsub ${Obj[timeStamp].dirPath}${Obj[timeStamp].name}.pbs`,
                        function (err, data1, stderr) {
                            let getStatus = () => {
                                cmd.get(
                                    `sshpass -p "${Obj[timeStamp].password}" ssh -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip} qstat | grep ${Obj[timeStamp].name}`,
                                    function (err, data1, stderr) {
                                        if (data1.length > 1) {
                                            return getStatus();
                                        } else {
                                            console.log("Script execution completed");
                                            resolve(true);
                                        }
                                    }
                                );
                            }
                            getStatus();
                        }
                    );
                }
            );
        }
        function pullData(Obj, resolve, reject) {
            if (Obj[timeStamp].dataNames === null) {
                let command = `sshpass -p "${Obj[timeStamp].password}" scp -r -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip}:${Obj[timeStamp].dirPath}/\{*.msh,*.res\} /home/luyangfei/project/visualization/data/process/`;
                cmd.get(command, function (err, data1, stderr) {
                    if (err !== null) {
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            } else {
                let command = `sshpass -p "${Obj[timeStamp].password}" scp -r -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip}:${Obj[timeStamp].dirPath}/\{${Obj[timeStamp].dataNames}\} /home/luyangfei/project/visualization/data/process/`;
                cmd.get(command, function (err, data1, stderr) {
                    if (err !== null) {
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            }
        }
        function getFileName(Obj, resolve, reject) {
            let command = `sshpass -p "${Obj[timeStamp].password}" ssh -o "StrictHostKeyChecking=no" ${Obj[timeStamp].username}@${Obj[timeStamp].ip} ls ${Obj[timeStamp].dirPath}/*.msh`;
            cmd.get(command, function (err, data1, stderr) {
                if (err !== null) {
                    rreject(false);
                } else {
                    let files = data1.split('/');
                    resolve(files[files.length - 1]);
                }
            });
        }
        for (let i = 0; i < postData.length; i++) {
            lins.push(postData[i].url);
            Obj[timeStamp] = Object.assign(Obj[timeStamp], postData[i].params);
        }
        let i = 0;
        let runProcess = function (res, Obj) {
            data[timeStamp] = 1;
            io.emit('sshConnection', data);
            new Promise((resolve, reject) => {
                if (i < postData.length && lins[i] === 'sshConnection') {
                    sshConnection(Obj, resolve, reject);
                } else if (i >= postData.length && lins[i] === 'sshConnection') {
                    resolve(true);
                } else {
                    reject(false)
                }
            }).then(value => {
                data[timeStamp] = 0;
                io.emit('sshConnection', data);
                if (value === true) {
                    i = i + 1;
                    return new Promise((resolve, reject) => {
                        data[timeStamp] = 1;
                        io.emit('assignPath', data);
                        if (i < postData.length && lins[i] === 'assignPath') {
                            assignPath(Obj, resolve, reject);
                            i = i + 1;
                        } else if (i >= postData.length && lins[i] === 'assignPath') {
                            resolve(true);
                        } else {
                            reject(false)
                        }
                    }).then(value => {
                        data[timeStamp] = 0;
                        io.emit('assignPath', data);
                        if (value === true) {
                            return new Promise((resolve, reject) => {
                                data[timeStamp] = 1;
                                io.emit('taskScripts', data);
                                if (i < postData.length && lins[i] === 'taskScripts') {
                                    taskScripts(Obj, resolve, reject);
                                    i = i + 1;
                                } else if (i >= postData.length && lins[i] === 'taskScripts') {
                                    resolve(true);
                                } else {
                                    reject(false)
                                }
                            }).then(value => {
                                data[timeStamp] = 0;
                                io.emit('taskScripts', data);
                                if (value === true) {
                                    return new Promise((resolve, reject) => {
                                        data[timeStamp] = 1;
                                        io.emit('runTaskScripts', data);
                                        if (i < postData.length && lins[i] === 'runTaskScripts') {
                                            runTaskScripts(Obj, resolve, reject);
                                            i = i + 1;
                                        } else if (i >= postData.length && lins[i] === 'runTaskScripts') {
                                            resolve(true);
                                        } else {
                                            reject(false)
                                        }
                                    }).then(value => {
                                        data[timeStamp] = 0;
                                        io.emit('runTaskScripts', data);
                                        if (value === true) {
                                            return new Promise((resolve, reject) => {
                                                data[timeStamp] = 1;
                                                io.emit('pullData', data);
                                                if (i < postData.length && lins[i] === 'pullData') {
                                                    pullData(Obj, resolve, reject);
                                                    i = i + 1;
                                                } else if (i >= postData.length && lins[i] === 'pullData') {
                                                    resolve(true);
                                                } else {
                                                    reject(false)
                                                }
                                            }).then(value => {
                                                data[timeStamp] = 0;
                                                io.emit('pullData', data);
                                                if (value === true) {
                                                    return new Promise((resolve, reject) => {
                                                        data[timeStamp] = 1;
                                                        io.emit('getFileName', data);
                                                        if (i < postData.length && lins[i] === 'getFileName') {
                                                            getFileName(Obj, resolve, reject);
                                                            i = i + 1;
                                                        } else if (i >= postData.length && lins[i] === 'getFileName') {
                                                            resolve(true);
                                                        } else {
                                                            reject(false)
                                                        }
                                                    }).then(value => {
                                                        data[timeStamp] = 0;
                                                        io.emit('getFileName', data);
                                                        res.send(value);
                                                    }).catch((err) => {
                                                        res.send('getFileName' + err);
                                                        data[timeStamp] = 2;
                                                        io.emit('getFileName', data);
                                                    });
                                                }
                                            }).catch((err) => {
                                                res.send('pullData' + err);
                                                data[timeStamp] = 2;
                                                io.emit('pullData', data);
                                            });
                                        }
                                    }).catch((err) => {
                                        res.send('runTaskScripts' + err);
                                        data[timeStamp] = 2;
                                        io.emit('runTaskScripts', data);
                                    });
                                }
                            }).catch((err) => {
                                res.send('taskScripts' + err);
                                data[timeStamp] = 2;
                                io.emit('taskScripts', data);
                            });
                        }
                    }).catch((err) => {
                        res.send('assignPath' + err);
                        data[timeStamp] = 2;
                        io.emit('assignPath', data);
                    });
                }
            }).catch((err) => {
                res.send('sshConnection' + err);
                data[timeStamp] = 2;
                io.emit('sshConnection', data);
            });
        }
        runProcess(res, Obj);
    });
    req.on('error', (err) => {
        console.log(err.message);
        res.send(err.message);
    })
});
//socket.io向前端发送状态
io.on('connection', (socket) => {
    let user = socket.handshake.address.split('ffff:')[1];
    console.log(user + " Connected!");
    socket.on('disconnect', () => {
        console.log(user + ' Disconnected!');
    })
});
// 创建一个事件监听对象
const emitter = new events.EventEmitter();
// 监听error事件
emitter.addListener('error', (e) => {
    // 处理异常信息
    console.log(e);
});

// 触发 error事件
// emitter.emit('error', new Error('代码出错了'));
http.listen(8003);