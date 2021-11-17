const ZegoWhiteBoardService = require('./ZegoWhiteBoardService.js');
const ZegoWhiteBoardController = require('./ZegoWhiteBoardController.js').default;


class ZegoWhiteBoardView {
  instance = null;
  constructor() {
    //const opt = {};
    return this.instance || (this.instance = new ZegoWhiteBoardController(ZegoWhiteBoardService));
  }
}

module.exports = ZegoWhiteBoardView;
