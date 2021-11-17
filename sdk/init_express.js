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
        zegoExpressEngine.setEngineConfig &&
            zegoExpressEngine.setEngineConfig({
                logConfig: {
                    logPath: logDir,
                    logSize: 5 * 1024 * 1024
                }
            });

        await zegoExpressEngine.initWithProfile({
            appID: zegoConfig.appID,
            appSign: zegoConfig.appSignStr,
            scenario: 0
        });

        // 初始化 ZegoWhiteboard
        zegoWhiteboard = new ZegoWhiteBoard();
        // 初始化 ZegoDocs
        zegoDocs = new ZegoExpressDocs({
            appID: zegoConfig.appID,
            appSign: zegoConfig.appSign,
            dataFolder: logDir,
            cacheFolder: logDir,
            logFolder: logDir
        });
        switch (zegoConfig.docs_env) {
            case 'beta':
            case 'alpha':
                zegoDocs.setConfig('set_alpha_env', true);
                break;
        }
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
        zegoExpressEngine.loginRoom(
            zegoConfig.roomid, {
                userID: zegoConfig.userid,
                userName: zegoConfig.username
            }, {
                maxMemberCount: 10,
                isUserStatusNotify: true
            }
        );
        resolve();
    });
}

function logoutRoom() {
    zegoExpressEngine.logoutRoom(zegoConfig.roomid);
    localStorage.removeItem('zegoConfig');
}