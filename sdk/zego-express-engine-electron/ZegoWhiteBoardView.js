const ZegoWhiteBoardService = require('./ZegoWhiteBoardService.js');
const ZegoWhiteBoardController = require('./ZegoWhiteBoardController.js').default;


class ZegoWhiteBoardView {
  constructor() {
    return new ZegoWhiteBoardController(ZegoWhiteBoardService);
  }
}

module.exports = ZegoWhiteBoardView;