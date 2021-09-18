/*
 * @Description: 开发环境相关配置
{
    roomid: "",
    username: "",

    whiteboard_env: "-test",
    docs_env: "test",
    fontFamily: "ZgFont",
    thumbnailMode: "1",
    pptStepMode: "1",
}
*/

// APP 账号
var _openConfig = {
    appID: YOUR_appID, // 请填写自己申请的 APPID
    appSignStr: YOUR_appSignStr, // 请填写自己申请的 APPSIGN
    sdkPath: {
        express: './sdk/zego-express-engine-electron/ZegoExpressEngine.js',
        expressWb: './sdk/zego-express-engine-electron/ZegoWhiteBoardView.js',
        docs: './sdk/zego-express-docsview-electron'
    }
};

$('.web_input_file').css('display', 'none');
$('.ele_btn_file').css('display', 'block');
$('.ele_btns_cache').css('display', 'block');

// 环境设置
$('#env-btn').click(function() {
    $('#reg-log').prop('checked', false);
});
// 登录
$('#login').click(function() {
    var username = $('#username').val();
    var roomid = $('#roomid').val();

    if (!username || !roomid) {
        alert('请输入用户名和roomID');
        return;
    }

    var conf = {
        roomid: roomid,
        username: username,
        whiteboard_env: $('#whiteboard_env').val(),
        docs_env: $('#docs_env').val(),
        fontFamily: $('#fontFamily').val(),
        thumbnailMode: $('#thumbnailMode').val(),
        pptStepMode: $('#pptStepMode').val()
    };
    localStorage.setItem('zegoConfig', JSON.stringify(conf));
    initZegoConfig();
});

function initZegoConfig() {
    zegoConfig = JSON.parse(localStorage.getItem('zegoConfig'));
    if (zegoConfig) {
        if (!_openConfig.appID || !_openConfig.appSignStr) {
            alert('请填写 appID 和 appSign');
            return;
        }
        Object.assign(zegoConfig, _openConfig, {
            appSign: getAppSignArray(_openConfig.appSignStr),
            userid: createUserID(),
            fileFilter: [
                {
                    name: 'All',
                    extensions: ['*']
                }
            ],
            logDirs: {
                win32: 'c:/zegowblog/',
                darwin: process.env.HOME + '/zegowblog/'
            }
        });
        loadScript('./sdk/init_express.js')
            .then(() => loadScript('./biz.js'))
            .then(() => loadScript('./sdk/biz.js'));
        $('.login_container').css('display', 'none');
        $('.whiteboard_container').css('display', 'block');
    } else {
        $('.whiteboard_container').css('display', 'none');
        $('.login_container').css('display', 'block');
    }
}

function getAppSignArray(str) {
    var arr = [];
    for (var i = 0; i < str.length; ) {
        arr.push(`0x${str[i]}${str[i + 1]}`);
        i += 2;
    }
    return arr;
}

function createUserID() {
    var userID = localStorage.getItem('zegouid') || 'ele' + new Date().getTime();
    localStorage.setItem('zegouid', userID);
    return userID;
}

initZegoConfig();
