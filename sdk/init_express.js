/**
 * 开源时注意修改SDK引用路径（相对index.html的路径）
 */

// 引入 SDK
var zegoExpressEngine = require(zegoConfig.sdkPath.express);
var ZegoWhiteBoard = require(zegoConfig.sdkPath.expressWb);
var ZegoExpressDocs = require(zegoConfig.sdkPath.docs);

/**
 * Express 版本 SDK 初始化
 */

var logDir = zegoConfig.logDirs[require('os').platform()];

// 初始化 zegoExpressEngine
zegoExpressEngine.init(zegoConfig.appID, zegoConfig.appSignStr, !!zegoConfig.whiteboard_env, 0);
zegoExpressEngine.setEngineConfig &&
    zegoExpressEngine.setEngineConfig({
        logConfig: { logPath: logDir }
    });

// 初始化 ZegoWhiteboard
var zegoWhiteboard = new ZegoWhiteBoard();

// 初始化 ZegoDocs
var zegoDocs = new ZegoExpressDocs({
    appID: zegoConfig.appID,
    appSign: zegoConfig.appSign,
    dataFolder: logDir,
    cacheFolder: logDir,
    logFolder: logDir,
    isTestEnv: !!zegoConfig.docs_env
});

// 业务数据
var userIDList = [];

function loginRoom() {
    return new Promise((resolve) => {
        zegoExpressEngine.on('onRoomStateUpdate', (res) => {
            console.warn('onRoomStateUpdate', res);
            if (res.state == 2 && res.errorCode == 0) {
                userIDList.unshift(zegoConfig.userid);
                $('#roomidtext').text(zegoConfig.roomid);
                $('#idNames').html('房间所有用户ID：' + userIDList.toString());
            }
        });
        zegoExpressEngine.loginRoom(
            zegoConfig.roomid,
            { userID: zegoConfig.userid, userName: zegoConfig.username },
            { maxMemberCount: 10, isUserStatusNotify: true }
        );
        resolve();
    });
}

function logoutRoom() {
    zegoExpressEngine.logoutRoom(zegoConfig.roomid);
    localStorage.removeItem('zegoConfig');
}
