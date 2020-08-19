const Koa = require("koa");
const cors = require('koa2-cors');
// 注意require('koa-router')返回的是函数:
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser')
// const fs = require("fs");
// var path = require('path');
var app = new Koa();
app.proxy = true;
// const xlsx = require('node-xlsx');      // 读写xlsx的插件
// app.all('/*', function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
//     res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//     res.header("access-control-allow-credentials", "true")
//     res.header("X-Powered-By", '3.2.1');
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });
app.use(cors());
app.use(router.routes());
app.use(bodyParser());
// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});
// add url-route:
app.use(async (ctx, next) => {
    const start = new Date().getTime(); // 当前时间
    await next(); // 调用下一个middleware
    const ms = new Date().getTime() - start; // 耗费时间
    console.log(`Time: ${ms}ms`); // 打印耗费时间
});

router.post('/', async (ctx,next)=>{
    console.log("request.url:"+ctx.request.url);
    await next();
    ctx.response.type = 'text/html';
    ctx.response.body = '<h1>Hello, koa2!</h1>';
})
router.post('/test/:name', async (ctx, next) => {
    var name = ctx.params.name;
    ctx.response.body = `<h1>Hello, ${name}!</h1>`;
});


// let newObj = {}
// app.post('/Excel', function (req, res) {
//     var postData = '';
//     req.on('data', function (chunk) {
//         // chunk 默认是一个二进制数据，和 data 拼接会自动 toString
//         postData += chunk;
//     });
//     req.on('end', function () {
//         //对url进行解码（url会对中文进行编码）
//         postData = decodeURI(postData);
//         console.log(postData)
//         let extname = path.extname(postData);
//         if (extname === ".xlsx") {  //.xlsx文件
//             var list = xlsx.parse("../data/dataExcel/" + postData);
//             res.send(list);
//             res.end();
//         } else {
//             var list = fs.readFileSync("../data/dataExcel/" + postData);
//             let ndata = list.toString();
//             let data = ndata.split("\r\n").slice(1)
//             let newArr = [];
//             for (let i = 0; i < 5000; i++) {
//                 newArr.push(data[i].split("  "));
//             }
//             let obj = {
//                 type: ".csv",
//                 data: newArr
//             }
//             res.send(obj);
//             res.end();
//         }

//     });

// })

app.listen(8003);