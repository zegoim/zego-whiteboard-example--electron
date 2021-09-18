module.exports = {
    asarUnpack: ['./sdk'],
    files: ['./lib', './sdk', './biz.js', './index.html', './main.js', './style_login.css', './style.css'],
    asar: true,
    productName: 'zego-whiteboard-electron',
    appId: 'com.edu-sdk-test_index.app',
    copyright: 'zego-frontend',
    directories: {
        output: 'package'
    },
    nsis: {
        perMachine: true,
        differentialPackage: false,
        oneClick: false,
        allowElevation: true,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        deleteAppDataOnUninstall: true
    },
    mac: {
        artifactName: '${productName}.${ext}',
        target: ['dmg'],
        hardenedRuntime: true,
        gatekeeperAssess: false
    },
    win: {
        artifactName: '${productName}.${ext}',
        target: [
            {
                target: 'nsis',
                arch: ['ia32']
            }
        ]
    }
};
