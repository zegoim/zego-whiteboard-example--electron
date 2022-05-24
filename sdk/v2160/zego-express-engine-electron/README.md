# zego-express-engine-electron

## Prerequisites

1. Electron 5.0.8+

## Installation

    npm install zego-express-engine-electron

## Quick Start

Create a ZEGO account and get AppID and AppSign required for SDK initialization at [ZEGO management console](https://doc-en.zego.im/en/1271.html)

    const zgEngine = window.require('zego-express-engine-electron/ZegoExpressEngine');
    const zgDefines = window.require('zego-express-engine-electron/ZegoExpressDefines');
    console.log("zego express engine version: ", zgEngine.getVersion());

    // init sdk
    zgEngine.init(appID=xxx, appSign="xxx", isTestEnv=true, scenario=0);

    // use other API to achieve video communication
    // loginRoom => startPublishingStream => startPlayingStream

    // uninit sdk
    zgEngine.uninit();

## Resources

1. [Doc Center](https://doc-en.zego.im/en/693.html) - See more docs about zego-express-engine
2. [Demo](https://github.com/zegoim/zego-express-example-topics-electron) - A quick start demo base on this repo

## ChangeLog

### 0.25.3-x

**ADD:**

1. Add initWithProfile() to replace the original interface init() for removing test env.
2. Add enableConsolePrintDebugInfo() for printing debug info on console. Make sure disable it on release version.

### 0.25.2-x

**FIX:**

1. Fix some known issues(webgl).

### 0.25.1-x

**FIX:**

1. Fixes an issue where the canvas width cannot be modified when preview mode is 1 or 2.

### 0.25.0-x

**ADD:**

1. add setPlayStreamVideoType(supports setting the type of video stream to play) that replaces the original interface(setPlayStreamVideoLayer).
2. add setTrafficControlFocusOn(supports setting the trigger traffic control concerns for the specified push channel).

### 0.24.3-x

**ADD:**

1. A new rendering mode(canvas render) is added that supports rendering on M1 mac.

### 0.24.2-x

**ADD:**

1. Support notify remote speaker device state when it updated.
2. Support get current audio device info function.

### 0.24.1-x

**FIX:**

-   fix up onAudioDeviceStateChanged return value format error

### 0.23.4-x-whiteboard

**FIX:**

1. Fixed PPT files and dynamic PPT files that use text writing at the edge of the window when zoomed to a certain extent, causing the whiteboard of the opposite file to shift
2. fix known issues

### 0.23.2-x-whiteboard

**ADD:**

1. Added whiteboard pen tip function.


**UPDATE:**

- error code


**FIX:**

1. Fixed the problem that the content of the whiteboard is inconsistent with other members in the room after disconnection and reconnection.
2. Fixed the problem that the background image of the whiteboard after entering the room was abnormally displayed.
3. Fixed the problem of the coordinate deviation of the graphic element after the whiteboard container is adaptive.
4. Fixed the problem that the file content of the scrollable file whiteboard is incorrectly rendered after adapting.
5. Fixed the problem that some primitives were occasionally lost when using the handwriting pad to write.

### 0.23.2-x

-   fix the RGB value error when set backgroundcolor

### 0.23.1-x

**FIX:**

-   fix the webGL resize bug in more than one webglRender

### 0.23.0-x

**ADD:**

-   add callExperimentalAPI
-   add takePublishStreamSnapshot
-   add takePlayStreamSnapshot
-   add takeSnapshot
-   add onRecvExperimentalAPI
-   add enableCustomVideoProcess
-   add registerCustomVideoProcessPlugin

**UPDATE:**

-   update native sdk to 2.8.0

**FIX:**

-   fix the problem that video size is abnormal on the retina screen

### 0.22.5-x-whiteboard

**ADD:**

1. Added the whiteboard synchronization zoom function.

**UPDATE:**

1. The length of the whiteboard name is limited to 128 bytes. If it exceeds the length, the error code 3020004 will be thrown.
2. Create a whiteboard, destroy a whiteboard, and get a whiteboard list to check whether it is logged in or not. If it is not logged in, a related error code is returned.
3. update native sdk

**FIX:**

1. Fixed the problem that the last line of text on the web side was not displayed when editing text primitives on the other side for the second time.

### 0.22.4-x-whiteboard

**ADD:**

1. Added the whiteboard synchronization zoom function.

**UPDATE:**

1. The length of the whiteboard name is limited to 128 bytes. If it exceeds the length, the error code 3020004 will be thrown.
2. Create a whiteboard, destroy a whiteboard, and get a whiteboard list to check whether it is logged in or not. If it is not logged in, a related error code is returned.

**FIX:**

1. Fixed the problem that the last line of text on the web side was not displayed when editing text primitives on the other side for the second time.

### 0.22.3-x-whiteboard

**ADD:**

1. Added whiteboard adaptive parent container size function.
2. Added H5 document whiteboard

### 0.22.3-x

**UPDATE:**

1. update native sdk

**FIX:**

1. fix known issues

### 0.22.2-x-whiteboard

**ADD:**

-   whiteboard Real-time trajectory synchronization
-   Whiteboard permission control
-   setBackgroundImage
-   clearBackgroundImage
-   whiteboardAuthChange
-   whiteboardGraphicAuthChange
-   whiteboardGraphicAuthChange

**UPDATE:**

-   optimize undo and redo
-   optimize element select status
-   error code

**FIX**

-   fix known issues

**DELETE**

-   enable
-   getPage
-   isEnable
-   enableUserOperation

### 0.22.2-x

**Fix:**

-   add rtt/videoCodecID to ZegoPublishStreamQuality
-   add videoDejitterFPS/videoBreakRate/audioDejitterFPS/audioBreakRate/avTimestampDiff/videoCodecID to ZegoPlayStreamQuality

### 0.22.1-x

**FIX:**

-   fix parsing the parameter of startMixerTask and stopMixerTask
-   fix the problem of parameter analysis using enablePublishDirectToCDN

### 0.22.0-x-whiteboard

**ADD:**

-   add whiteboard snapshot
-   add support touch screen device

### 0.22.0-x

**UPDATE:**

-   add advancedConfig to ZegoMixerTask
-   update native sdk to 2.2.0.1027

### 0.21.0-x-whiteboard

**update:**

-   Optimize the interaction process of eraser clearing primitives
-   Optimize the interactive process of selecting primitives

**fix:**

-   Fix the problem that the position of primitives is not synchronized in some scenes of undo and redo

### 0.21.0-x

**UPDATE:**

-   update native sdk to 2.1.0.960

**FIX:**

-   fix the problem that logConfig not working when using setEngineConfig
-   update the render compatible with some illegal video frame

**DELETE:**

-   delete setReverbParam, use setReverbParamAdvance instead
-   delete getVolume in ZegoMediaPlayer, use getPlayVolume and getPublishVolume instead

### 0.20.0-x-whiteboard

**ADD:**

-   add addImage
-   add setWhiteboardOperationMode
-   add setDeferredRenderingTime
-   update setToolType

### 0.20.0-x

**ADD:**

-   add startNetworkSpeedTest
-   add stopNetworkSpeedTest
-   add onNetworkModeChanged callback
-   add onNetworkSpeedTestError callback
-   add onNetworkSpeedTestQualityUpdate callback

### 0.19.0-x-whiteboard

**ADD:**

-   add clearCurrentPage
-   add deleteSelectedGraphics
-   add enable draw
-   add enableUserOperation

### 0.19.0-x

**ADD:**

-   add setPlayStreamVideoLayer
-   add startMixerTask
-   add stopMixerTask

**UPDATE:**

-   add preserveDrawingBuffer key into ZegoView.
-   update native sdk to 1.19.1

### 0.18.5-x-whiteboard

**UPDATE:**

-   update ZegoWhiteBoardView.js
-   delete ZegoWhiteBoard.js
-   ADD ZegoWhiteBoardController.js

### 0.18.4-x-whiteboard

**UPDATE:**

-   update ZegoWhiteBoardView.js
-   update ZegoWhiteBoardService.js
-   update ZegoWhiteBoardView.js

### 0.18.3-x-whiteboard

**ADD:**

-   add whiteboardCanvasMoveItems
-   add whiteboardModelGetH5Extra

**FIX:**

-   fix whiteboardModelGetScrollPercent, ppt_step => step

### 0.18.2

**ADD:**

-   add setSEIConfig
-   add setReverbAdvancedParam
-   add ZegoWhiteboardView.js for whiteboard
-   add whiteboardAppendH5Extra for whiteboard

**UPDATE:**

-   add extendedData into onRoomStreamUpdate callback param
-   ZegoVoiceChangerPreset support [MaleMagnetic FemaleFresh]
-   ZegoReverbPreset support [RecordingStudio Basement KTV Popular Rock VocalConcert]
-   update native sdk to 1.18.1

### 0.18.1

**UPDATE:**

-   add exception catch mechanism for user's callback implementation

**FIX:**

-   fix CustomVideoCapturePlugin print
-   fix setPlayVolume param type check
-   whitebord ppt_step => step

### 0.18.0

**ADD:**

-   add enableCustomVideoCapture
-   add registerCustomVideoCapturePlugin and unregisterCustomVideoCapturePlugin
-   add enablePublishVideo for ZegoMediaPlayer

**FIX:**

-   fix switchRoom param error

### 0.17.1

**FIX:**

-   fix sendCustomCommand command key error

### 0.17.0

**ADD:**

-   add getDefaultAudioDeviceID
-   add getAudioDeviceVolume
-   add setAudioDeviceVolume
-   add switchRoom
-   setReverbPreset
-   setVoiceChangerPreset
-   setReverbEchoParam
-   add setAudioCaptureSereMode
-   add enableTransientANS
-   add getPlayVolume and setPlayVolume for ZegoMediaPlayer
-   add getPublishVolume and setPublishVolume for ZegoMediaPlayer
-   add getAudioTrackCount and setAudioTrackIndex for ZegoMediaPlayer
-   add setVoiceChangerParam for ZegoMediaPlayer

**UPDATE:**

-   add millisecond param for startSoundLevelMonitor
-   add millisecond param for startSoundSpectrumMonitor
-   update native sdk to 1.17.5

### 0.10.0

**ADD:**

-   add createMediaPlayer and destroyMediaPlayer; see ZegoExpressMediaPlayer.js for using ZegoMediaPlayer
-   add loginMultiRoom
-   add setRoomExtraInfo
-   add setAnsMode
-   add setAudioEqualizerGain
-   add setVoiceChangerParam
-   add setReverbParam
-   add enableVirtualStereo
-   add startRecordingCaptureData and stopRecordingCaptureData
-   add onCapturedDataRecordStateUpdate calback
-   add onCapturedDataRecordProgressUpdate callback

**UPDATE:**

-   update native sdk to 1.13.0

### 0.9.0

**ADD:**

-   add isMicrophoneMuted isSpeakerMuted
-   add getVideoConfig getAudioConfig
-   add enableHeadphoneMonitor setHeadphoneMonitorVolume
-   add enableMixSystemPlayout
-   add onEngineStateUpdate

**UPDATE:**

-   update native sdk to 1.9.0

### 0.7.5

**FIX:**

-   fix onRoomOnlineUserCountUpdate callback

**UPDATE:**

-   update native sdk to 1.7.5

### 0.7.0

**FIX:**

-   fix error when load native module when electron arch match ia32

**ADD:**

-   add ZegoExpressErrorCode.js file. When error occurs, please find explanations here
-   add onRoomOnlineUserCountUpdate callback

### 0.6.0

**UPDATE:**

-   onPublisherQualityUpdate event add param [totalSendBytes, audioSendBytes, videoSendBytes]
-   onPlayerQualityUpdate event add param [peerToPeerDelay, peerToPeerPacketLostRate, totalRecvBytes, audioRecvBytes,videoRecvBytes]

**FIX:**

-   fix setVideoMirrorMode param check
-   fix video frame flip mode in webgl
