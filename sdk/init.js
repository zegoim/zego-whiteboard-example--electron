/*
 * @Description: 开发环境相关配置
{
    roomid: "",
    username: "",
    sdk_type: "express",
    fontFamily: "ZgFont",
    thumbnailMode: "1",
    pptStepMode: "1",
}
*/

// APP 账号
var sdkPathPre = './sdk/v2160';
var _openConfig = {
    appID: 3606078772,
    fileListUrl: '',
    sdkPath: {
        express: sdkPathPre + '/zego-express-engine-electron/ZegoExpressEngine.js',
        expressWb: sdkPathPre + '/zego-express-engine-electron/ZegoWhiteBoardView.js',
        docs: sdkPathPre + '/zego-express-docsview-electron'
    }
};


var token = '04AAAAAGKNDY0AEHB6OHI2Nms1YzR4YXl5MGkAwIxixuPM1AR7ya/ETtt7Jwj4sEeaiwo8/4iAlbF4HIUVJrr4R/dsMbhaQK5n9Ovc3eDrx5TK77OmjGaFXd/N121xHZxT+qe5dzBpKJo6Le5W++0QIVKILIRTvkq4OOA/4i7riKR+Nb4otUlNghtYYodbFF/J85emHIb+psFpyxRihWI5hcqllkPyZ7lxH2cyGyYDPcGEN8rLVdqDGGKrekaN0GQKUzulk3jMyyWDfSyrPx9oubbNhoWUI972n+/FRw=='


$('.web_input_file').css('display', 'none');
$('.ele_btn_file').css('display', 'block');
$('.ele_btns_cache').css('display', 'block');


// 登录
$('#login').click(function () {
    var username = $('#username').val();
    var roomid = $('#roomid').val();
    var userid = $('#userid').val()

    if (!username || !roomid || !userid) {
        alert('请输入用户名、roomID和 userid！');
        return;
    }

    var conf = {
        roomid: roomid,
        username: username,
        userid,
        sdk_type: 'express',
        fontFamily: $('#fontFamily').val(),
        thumbnailMode: $('#thumbnailMode').val(),
        pptStepMode: $('#pptStepMode').val(),
        unloadVideoSrc: $('#unloadVideoSrc').val()
    };
    localStorage.setItem('zegoConfig', JSON.stringify(conf));
    initZegoConfig();
});

function initZegoConfig() {
    zegoConfig = JSON.parse(localStorage.getItem('zegoConfig'));
    if (zegoConfig) {
        Object.assign(zegoConfig, _openConfig, {
            fileFilter: [{
                name: 'All',
                extensions: ['*']
            }],
            logDirs: {
                win32: 'c:/zegowblog/',
                darwin: process.env.HOME + '/zegowblog/'
            }
        });
        loadScript(`./sdk/init_${zegoConfig.sdk_type}.js`)
            .then(() => loadScript('./biz.js'))
            .then(() => loadScript('./sdk/biz.js'));
        $('.login_container').css('display', 'none');
        $('.whiteboard_container').css('display', 'block');
    } else {
        $('.whiteboard_container').css('display', 'none');
        $('.login_container').css('display', 'block');
    }
}



initZegoConfig();