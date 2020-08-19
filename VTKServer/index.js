const express = require('express');
const fs = require("fs");
var path = require('path');
var app = express();

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("access-control-allow-credentials", "true")
    res.header("X-Powered-By", '3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
let newObj = {}
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
    console.log(arr.length)
    newArr = arr[0].split("\n");

    console.log(newArr.length)
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
        for (let j = 0; j < newObj.POINT_DATA.length-1; j++) {
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

//read .Tiff file
function readTiff() {

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
        }else {
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
            (function(){
                fs.readdir(pathName, function (err, files1) {
                    for (let j = 0; j < files1.length; j++) {
                        let file1 = files1[j];
                        console.log(1)
                        let pathName1 = path.join(pathName, file1);
                        let arr = obj[file1]=[];
                        fs.readdir(pathName1, function (err, files2) {
                            arr = files2;
                        })
                        obj[file1] = arr;
                        console.log(obj[file1])
                    }
                })
            } )()
            proDir[file] =obj;
        }
        console.log(proDir)

    })
})
app.listen(8002);