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

var zegoWhiteboard;
var zegoDocs;

// 初始化 zegoExpressEngine
(
    async function () {
        zegoExpressEngine.setLogConfig &&
            zegoExpressEngine.setLogConfig({
                logPath: logDir,
                logSize: 5 * 1024 * 1024
            });

        await zegoExpressEngine.createEngine({
            appID: zegoConfig.appID,
            scenario: 0
        });

        // 初始化 ZegoWhiteboard
        zegoWhiteboard = new ZegoWhiteBoard();
        // 初始化 ZegoDocs
        zegoDocs = new ZegoExpressDocs({
            appID: zegoConfig.appID,
            dataFolder: logDir,
            cacheFolder: logDir,
            logFolder: logDir,
            token,
            userID: zegoConfig.userid
        });
    }
)()
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

        zegoExpressEngine.on('onRoomTokenWillExpire', (res) => {
            console.warn('onRoomTokenWillExpire', res);
            const newToken = ''
            if (!newToken) {
                console.error('token 即将过期，请更新')
            } else {
                zegoExpressEngine.renewToken(res.roomID, newToken)
                zegoDocs.renewToken(newToken)
            }

        });
        zegoExpressEngine.loginRoom(
            zegoConfig.roomid, {
                userID: zegoConfig.userid,
                userName: zegoConfig.username
            }, {
                maxMemberCount: 10,
                isUserStatusNotify: true,
                token
            }
        );
        resolve();
    });
}

function logoutRoom() {
    zegoExpressEngine.logoutRoom(zegoConfig.roomid);
    localStorage.removeItem('zegoConfig');
}