# 介绍

ZegoWhiteboardExample 是集成即构[互动白板 SDK](https://doc-zh.zego.im/article/6487)和[文件共享 SDK](https://doc-zh.zego.im/article/6491)的功能示例项目，开发者可通过该项目快速了解即构白板文件的功能和集成方式。
即构互动白板（ZegoWhiteboardView）和即构文件共享（ZegoDocsView），基于即构亿级海量用户的实时信令网络构建，支持在白板画布上实时绘制涂鸦并多端同步，同时提供图形、激光笔等工具，满足不同场景的在线协同需求；同时提供文件转换和点播相关功能，支持将常见文件格式转码为向量、PNG、PDF、HTML5 页面等便于跨平台点播的目标格式。

# 开发准备

## 申请 AppID

请在 [即构管理控制台](https://console.zego.im/acount) 申请 SDK 初始化需要的 AppID 。

# 启动

为了让开发者前期能快速体验功能效果，请先填写 sdk/init.js 文件中相关配置中的 appID 和 appSignStr，然后在当前项目目录下运行以下命令即可启动应用程序。

```JavaScript
// APP 账号
var _openConfig = {
    appID: 0, // 请填写自己申请的 APPID
    appSignStr: '', // 请填写自己申请的 APPSIGN
    sdkPath: {
        express: './sdk/zego-express-engine-electron/ZegoExpressEngine.js',
        expressWb: './sdk/zego-express-engine-electron/ZegoWhiteBoardView.js',
        docs: './sdk/zego-express-docsview-electron'
    }
};
```

```shell
// 本地启动
npm run install // yarn
npm run start // yarn start

// 打包应用
npm run install // yarn
npm run pack:mac // yarn pack:mac  // Mac 安装包
npm run pack:win // yarn pack:win  // Windows 安装包
```

# 更多

请访问 [即构开发者中心](https://doc-zh.zego.im/?fromold=1)
