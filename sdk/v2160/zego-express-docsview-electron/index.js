var os = require('os');
var platform = os.platform();
var path = '';

if (platform === 'win32') {
    if (process.arch === 'x64') {
        path = `./x64`;
    } else {
        path = `./x86`;
    }
} else if (platform === 'darwin') {
    path = `./mac`;
}

var DocsViewBin = require(path + '/ZegoDocsView.bin');
var ExpressDocs = require('./ZegoDocsView.js').ZegoExpressDocs;

class ZegoExpressDocs {
    instance = null;
    constructor(config = {}) {
        return this.instance || (this.instance = new ExpressDocs(config, new DocsViewBin()));
    }
}

module.exports = ZegoExpressDocs;
