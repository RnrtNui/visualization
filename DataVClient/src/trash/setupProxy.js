const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function (app) {
    app.use(
        createProxyMiddleware("/data", {
            target: "http://192.168.2.134:8002",
            changeOrigin: true,
            pathRewrite: {
                "^/data": ""
            }
        })
    )
}