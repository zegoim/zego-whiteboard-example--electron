const sdkPathPre = `./sdk/v${require('../package.json').version.replace(/\./g, '')}`;
const sdkList = [
    `${sdkPathPre}/zego-liveroom-whiteboard-electron`,
    `${sdkPathPre}/zego-express-engine-electron`,
    `${sdkPathPre}/zego-express-docsview-electron`
];
console.log('===pack===', sdkList);

module.exports = {
    asarUnpack: sdkList,
    files: ['demo', ...sdkList],
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
