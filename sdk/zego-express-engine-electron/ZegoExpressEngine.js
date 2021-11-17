
let ZegoExpressNodeNativePath = "";
let os = require("os");
if (os.platform() === "win32") {
    if (process.arch === 'x64') {
        ZegoExpressNodeNativePath = `./x64/ZegoExpressNodeNative`;
    }
    else {
        ZegoExpressNodeNativePath = `./x86/ZegoExpressNodeNative`;
    }
}
else if (os.platform() === "darwin") {
    ZegoExpressNodeNativePath = "./mac/ZegoExpressNodeNative";
}
else {
    throw ("Platform not supported")
}

const EventEmitter = require('events').EventEmitter;
const {dialog} = require('electron').remote;
const ZegoNativeSDK = require(ZegoExpressNodeNativePath);
const PackageJson = require('./package.json');
const WebGLRender = require('./ZegoExpressWebgl');
const ZegoMediaPlayer = require('./ZegoExpressMediaPlayer');
const {ZegoPublishChannel, ZegoViewMode, ZegoPlayerVideoLayer, ZegoCapturePipelineScaleMode} = require('./ZegoExpressDefines');

/**
 * ZegoExpressEngine
 */
class ZegoExpressEngine extends EventEmitter {

    /**
     * Initializes the Engine.
     *
     * The engine needs to be initialized before calling other functions
     * @param {ZegoEngineProfile} profile - The basic configuration information is used to create the engine.
     */
     initWithProfile(profile){
        let tsfn = this.callEmit.bind(this);
        const that = this;
        that.appID = profile.appID;

        //get electron sdk version
        var SdkVersion = this.getVersion();

        return new Promise(function (resolve, reject) {
            that.ZegoNativeInstance = ZegoNativeSDK.CreateEngineWithProfile({ profile, tsfn, SdkVersion });
            if (that.ZegoNativeInstance === undefined) {
                reject("Zego Express init failed");
            }
            else {
                that.VideoViewManager = {
                    localGLRenders: [],
                    remoteGLRenders: []
                };
                that.mediaPlayers = [];
                console.log("Zego Express init succeed");
                resolve();
            };
        });
    }

    /**
     * Uninitializes the Engine.
     *
     * uninitialize engine to release the resources
     */
    uninit(){
        const that = this;
        return new Promise(function(resolve, reject){
            ZegoNativeSDK.DestroyEngine();
            that.ZegoNativeInstance = null;
            that.VideoViewManager = null;
            that.mediaPlayers = null;
            that.removeAllListeners();
            console.log("Zego Express uninited");
            resolve();
        });
    }

    /**
     * Set advanced engine configuration.
     *
     * Developers need to call this function to set advanced function configuration when they need advanced functions of the engine.
     * @param {ZegoEngineConfig} config - Advanced engine configuration
     */
    setEngineConfig(config){
        ZegoNativeSDK.SetEngineConfig({ config });
    }

    /**
     * Gets the SDK's version number.
     *
     * When the SDK is running, the developer finds that it does not match the expected situation and submits the problem and related logs to the ZEGO technical staff for locating. The ZEGO technical staff may need the information of the engine version to assist in locating the problem.
     * Developers can also collect this information as the version information of the engine used by the app, so that the SDK corresponding to each version of the app on the line.
     * @return {string} - SDK version
     */
    getVersion(){
        return PackageJson.version;
    }

    /**
     * Uploads logs to the ZEGO server.
     *
     * By default, SDK creates and prints log files in the app's default directory. Each log file defaults to a maximum of 5MB. Three log files are written over and over in a circular fashion. When calling this function, SDK will auto package and upload the log files to the ZEGO server.
     * Developers can provide a business “feedback” channel in the app. When users feedback problems, they can call this function to upload the local log information of SDK to help locate user problems.
     * The function is valid for the entire life cycle of the SDK.
     */
    uploadLog(){
        this.ZegoNativeInstance.uploadLog({});
    }

    /**
     * Turns on/off verbose debugging and sets up the log language.
     *
     * The debug switch is set to on and the language is English by default.
     * @param {boolean} enable - Detailed debugging information switch
     * @param {ZegoLanguage} language - Debugging information language
     * @deprecated This method has been deprecated after version 2.3.0, please use the [setEngineConfig] function to set the advanced configuration property advancedConfig to achieve the original function.
     */
    setDebugVerbose(enable, language){
        this.ZegoNativeInstance.setDebugVerbose({enable, language});
    }

    isConsolePrintDebugInfo = false;
    /**
     * Turns on/off print debugging info on the console
     * 
     * @param {boolean} enable - Detailed debugging information switch
     */
     enableConsolePrintDebugInfo(enable) {
         this.isConsolePrintDebugInfo = enable;
     }

    /**
     * Call the RTC experimental API
     *
     * ZEGO provides some technical previews or special customization functions in RTC business through this API. If you need to get the use of the function or the details, please consult ZEGO technical support
     * @param {string} params - You need to pass in a parameter in the form of a JSON string
     * @return {string} - Returns an argument in the format of a JSON string
     */
    callExperimentalAPI(params){
        return this.ZegoNativeInstance.callExperimentalAPI({params});
    }

    /**
     * Logs in to a room with advanced room configurations. You must log in to a room before publishing or playing streams.
     *
     * Please do not fill in sensitive user information in this interface, including but not limited to mobile phone number, ID number, passport number, real name, etc.
     * To prevent the app from being impersonated by a malicious user, you can add authentication before logging in to the room, that is, the [token] parameter in the ZegoRoomConfig object passed in by the [config] parameter.
     * Different users who log in to the same room can get room related notifications in the same room (eg [onRoomUserUpdate], [onRoomStreamUpdate], etc.), and users in one room cannot receive room signaling notifications in another room.
     * Messages sent in one room (e.g. [setStreamExtraInfo], [sendBroadcastMessage], [sendBarrageMessage], [sendCustomCommand], etc.) cannot be received callback ((eg [onRoomStreamExtraInfoUpdate], [onIMRecvBroadcastMessage], [onIMRecvBarrageMessage], [onIMRecvCustomCommand], etc) in other rooms. Currently, SDK does not provide the ability to send messages across rooms. Developers can integrate the SDK of third-party IM to achieve.
     * SDK supports startPlayingStream audio and video streams from different rooms under the same appID, that is, startPlayingStream audio and video streams across rooms. Since ZegoExpressEngine's room related callback notifications are based on the same room, when developers want to startPlayingStream streams across rooms, developers need to maintain related messages and signaling notifications by themselves.
     * If the network is temporarily interrupted due to network quality reasons, the SDK will automatically reconnect internally. You can get the current connection status of the local room by listening to the [onRoomStateUpdate] callback method, and other users in the same room will receive [onRoomUserUpdate] callback notification.
     * It is strongly recommended that userID corresponds to the user ID of the business APP, that is, a userID and a real user are fixed and unique, and should not be passed to the SDK in a random userID. Because the unique and fixed userID allows ZEGO technicians to quickly locate online problems.
     * After the first login failure due to network reasons or the room is disconnected, the default time of SDK reconnection is 20min.
     * For restrictions on the use of this function, please refer to https://doc-en.zego.im/article/7611  or contact ZEGO technical support.
     * @param {string} roomID - Room ID, a string of up to 128 bytes in length. Only support numbers, English characters and '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'
     * @param {ZegoUser} user - User object instance, configure userID, userName. Note that the userID needs to be globally unique with the same appID, otherwise the user who logs in later will kick out the user who logged in first.
     * @param {ZegoRoomConfig} config - Advanced room configuration
     */
    loginRoom(roomID, user, config = { maxMemberCount:0, isUserStatusNotify: false, token:'' }){
        config = Object.assign({ maxMemberCount:0, isUserStatusNotify: false, token:'' }, config);
        this.ZegoNativeInstance.loginRoom({roomID, user, config});
    }

    /**
     * Logs in multi room.
     *
     * You must log in the main room with [loginRoom] before invoke this function to logging in to multi room.
     * Currently supports logging into 1 main room and 1 multi room at the same time.
     * When logging out, you must log out of the multi room before logging out of the main room.
     * User can only publish the stream in the main room, but can play the stream in the main room and multi room at the same time, and can receive the signaling and callback in each room.
     * The advantage of multi room is that you can login another room without leaving the current room, receive signaling and callback from another room, and play streams from another room.
     * To prevent the app from being impersonated by a malicious user, you can add authentication before logging in to the room, that is, the [token] parameter in the ZegoRoomConfig object passed in by the [config] parameter.
     * Different users who log in to the same room can get room related notifications in the same room (eg [onRoomUserUpdate], [onRoomStreamUpdate], etc.), and users in one room cannot receive room signaling notifications in another room.
     * Messages sent in one room (e.g. [setStreamExtraInfo], [sendBroadcastMessage], [sendBarrageMessage], [sendCustomCommand], etc.) cannot be received callback ((eg [onRoomStreamExtraInfoUpdate], [onIMRecvBroadcastMessage], [onIMRecvBarrageMessage], [onIMRecvCustomCommand], etc) in other rooms. Currently, SDK does not provide the ability to send messages across rooms. Developers can integrate the SDK of third-party IM to achieve.
     * SDK supports startPlayingStream audio and video streams from different rooms under the same appID, that is, startPlayingStream audio and video streams across rooms. Since ZegoExpressEngine's room related callback notifications are based on the same room, when developers want to startPlayingStream streams across rooms, developers need to maintain related messages and signaling notifications by themselves.
     * If the network is temporarily interrupted due to network quality reasons, the SDK will automatically reconnect internally. You can get the current connection status of the local room by listening to the [onRoomStateUpdate] callback method, and other users in the same room will receive [onRoomUserUpdate] callback notification.
     * It is strongly recommended that userID corresponds to the user ID of the business APP, that is, a userID and a real user are fixed and unique, and should not be passed to the SDK in a random userID. Because the unique and fixed userID allows ZEGO technicians to quickly locate online problems.
     * @param {string} roomID - Room ID, a string of up to 128 bytes in length. Only support numbers, English characters and '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'
     * @param {ZegoRoomConfig} config - Advanced room configuration
     */
    loginMultiRoom(roomID, config = { maxMemberCount:0, isUserStatusNotify: false, token:'' }){
        config = Object.assign({ maxMemberCount:0, isUserStatusNotify: false, token:'' }, config);
        this.ZegoNativeInstance.loginRoom({roomID, user, config});
    }

    /**
     * Logs out of a room.
     *
     * Exiting the room will stop all publishing and playing streams for user, and inner audio and video engine will stop, and then SDK will auto stop local preview UI. If you want to keep the preview ability when switching rooms, please use the [switchRoom] method.
     * After calling this function, you will receive [onRoomStateUpdate] callback notification successfully exits the room, while other users in the same room will receive the [onRoomUserUpdate] callback notification(On the premise of enabling isUserStatusNotify configuration).'
     * @param {string} roomID - Room ID, a string of up to 128 bytes in length. Only support numbers, English characters and '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'
     */
    logoutRoom(roomID){
        this.ZegoNativeInstance.logoutRoom({roomID});
    }

    /**
     * Switch the room with advanced room configurations.
     *
     * After successfully login room, if you need to quickly switch to the next room, you can call this function.
     * Calling this function is faster and easier to use than calling [logoutRoom] and then [loginRoom].
     * When this function is called, all streams currently publishing or playing will stop (but the local preview will not stop).
     * To prevent the app from being impersonated by a malicious user, you can add authentication before logging in to the room, that is, the [token] parameter in the ZegoRoomConfig object passed in by the [config] parameter. This parameter configuration affects the room to be switched over.
     * @param {string} fromRoomID - Current roomID
     * @param {string} toRoomID - The next roomID
     * @param {ZegoRoomConfig} config - Advanced room configuration
     */
    switchRoom(fromRoomID, toRoomID, config = { maxMemberCount:0, isUserStatusNotify: false, token:'' }){
        config = Object.assign({ maxMemberCount:0, isUserStatusNotify: false, token:'' }, config);
        this.ZegoNativeInstance.switchRoom({fromRoomID, toRoomID, config});
    }

    /**
     * Set room extra information.
     *
     * After the user in the room calls this function to set the extra info of the room, other users in the same room will be notified through the [onRoomExtraInfoUpdate] callback function.
     * For restrictions on the use of this function, please refer to https://doc-en.zego.im/article/7611.html or contact ZEGO technical support.
     * @param {string} roomID - Room ID.
     * @param {string} key - key of the extra info.
     * @param {string} value - value if the extra info.
     * @return {Promise<number>} - Set room extra info execution result notification
     */
    setRoomExtraInfo(roomID, key, value){
        return this.ZegoNativeInstance.setRoomExtraInfo({roomID, key, value});
    }

    /**
     * Starts publishing a stream (for the specified channel). You can call this function to publish a second stream.
     *
     * This function allows users to publish their local audio and video streams to the ZEGO RTC server. Other users in the same room can use the streamID to play the audio and video streams for intercommunication.
     * Before you start to publish the stream, you need to join the room first by calling [loginRoom]. Other users in the same room can get the streamID by monitoring the [onRoomStreamUpdate] event callback after the local user publishing stream successfully.
     * In the case of poor network quality, user publish may be interrupted, and the SDK will attempt to reconnect. You can learn about the current state and error information of the stream published by monitoring the [onPublisherStateUpdate] event.
     * After the first publish stream failure due to network reasons or the publish stream is interrupted, the default time for SDK reconnection is 20min.
     * @param {string} streamID - Stream ID, a string of up to 256 characters, needs to be globally unique within the entire AppID. If in the same AppID, different users publish each stream and the stream ID is the same, which will cause the user to publish the stream failure. You cannot include URL keywords, otherwise publishing stream and playing stream will fails. Only support numbers, English characters and '~', '!', '@', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'.
     * @param {ZegoPublishChannel} channel - Publish stream channel
     */
    startPublishingStream(streamID, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.startPublishingStream({streamID, channel});
    }

    /**
     * Stops publishing a stream (for the specified channel).
     *
     * This function allows the user to stop sending local audio and video streams and end the call.
     * If the user has initiated publish flow, this function must be called to stop the publish of the current stream before publishing the new stream (new streamID), otherwise the new stream publish will return a failure.
     * After stopping streaming, the developer should stop the local preview based on whether the business situation requires it.
     * Use this function to stop publishing stream of aux channel.
     * @param {ZegoPublishChannel} channel - Publish stream channel
     */
    stopPublishingStream(channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.stopPublishingStream({channel});
    }

    /**
     * Sets the extra information of the stream being published (for the specified channel).
     *
     * Use this function to set the extra info of the stream, the result will be notified via the [ZegoPublisherSetStreamExtraInfoCallback].
     * The stream extra information is an extra information identifier of the stream ID. Unlike the stream ID, which cannot be modified during the publishing process, the stream extra information can be modified midway through the stream corresponding to the stream ID.
     * Developers can synchronize variable content related to stream IDs based on stream additional information.
     * @param {string} extraInfo - Stream extra information, a string of up to 1024 characters.
     * @param {ZegoPublishChannel} channel - Publish stream channel
     * @return {Promise<number>} - Set stream extra information execution result notification
     */
    setStreamExtraInfo(extraInfo, channel = ZegoPublishChannel.Main){
        return this.ZegoNativeInstance.setStreamExtraInfo({extraInfo, channel});
    }

    /**
     * Starts/Updates the local video preview (for the specified channel).
     *
     * The user can see his own local image by calling this function. The preview function does not require you to log in to the room or publish the stream first. But after exiting the room, SDK internally actively stops previewing by default.
     * Local view and preview modes can be updated by calling this function again.
     * You can set the mirror mode of the preview by calling the [setVideoMirrorMode] function. The default preview setting is image mirrored.
     * When this function is called, the audio and video engine module inside SDK will start really, and it will start to try to collect audio and video. In addition to calling this function normally to preview the local screen, developers can also pass [null] to the canvas parameter, in conjunction with ZegoExpressEngine's sound wave function, in order to achieve the purpose of detecting whether the audio equipment is working properly before logging in to the room.
     * @param {ZegoView} view - The view used to display the preview image.
     * @param {ZegoPublishChannel} channel - Publish stream channel
     */
    startPreview(view, channel = ZegoPublishChannel.Main){
        view = Object.assign({ viewMode: ZegoViewMode.AspectFit, backgroundColor: 0x000000, preserveDrawingBuffer:false }, view);
        
        this.VideoViewManager.localGLRenders[channel] = new WebGLRender();
        this.VideoViewManager.localGLRenders[channel].setViewMode(view.viewMode);
        this.VideoViewManager.localGLRenders[channel].enablePreserveDrawingBuffer(view.preserveDrawingBuffer);
        this.VideoViewManager.localGLRenders[channel].initBkColor(view.backgroundColor);
        this.VideoViewManager.localGLRenders[channel].initGLfromCanvas(view.canvas); 
        
        this.ZegoNativeInstance.startPreview({ channel });
    }

    /**
     * Stops the local video preview (for the specified channel).
     *
     * This function can be called to stop previewing when there is no need to see the preview locally.
     * @param {ZegoPublishChannel} channel - Publish stream channel
     */
    stopPreview(channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.stopPreview({ channel });
        if(this.VideoViewManager.localGLRenders[channel])
        {
            this.VideoViewManager.localGLRenders[channel].uninit2d();
            this.VideoViewManager.localGLRenders[channel] = null;
        }

    }

    /**
     * Sets up the video configurations (for the specified channel).
     *
     * This function can be used to set the video frame rate, bit rate, video capture resolution, and video encoding output resolution. If you do not call this function, the default resolution is 360p, the bit rate is 600 kbps, and the frame rate is 15 fps.
     * It is necessary to set the relevant video configuration before publishing the stream, and only support the modification of the encoding resolution and the bit rate after publishing the stream.
     * Developers should note that the wide and high resolution of the mobile end is opposite to the wide and high resolution of the PC. For example, in the case of 360p, the resolution of the mobile end is 360x640, and the resolution of the PC end is 640x360.
     * @param {(ZegoVideoConfigPreset|ZegoVideoConfig)} config - Video configuration, the SDK provides a common setting combination of resolution, frame rate and bit rate, they also can be customized.
     * @param {ZegoPublishChannel} channel - Publish stream channel
     */
    setVideoConfig(config, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.setVideoConfig({config, channel});
    }

    /**
     * Gets the current video configurations (for the specified channel).
     *
     * This function can be used to get the specified publish channel's current video frame rate, bit rate, video capture resolution, and video encoding output resolution.
     * @param {ZegoPublishChannel} channel - Publish stream channel
     * @return {ZegoVideoConfig} - Video configuration object
     */
    getVideoConfig(channel = ZegoPublishChannel.Main){
        return this.ZegoNativeInstance.getVideoConfig({channel});
    }

    /**
     * Sets the video mirroring mode (for the specified channel).
     *
     * This function can be called to set whether the local preview video and the published video have mirror mode enabled.
     * @param {ZegoVideoMirrorMode} mirrorMode - Mirror mode for previewing or publishing the stream
     * @param {ZegoPublishChannel} channel - Publish stream channel
     */
    setVideoMirrorMode(mirrorMode, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.setVideoMirrorMode({mirrorMode, channel});
    }

    /**
     * Sets up the audio configurations.
     *
     * You can set the combined value of the audio codec, bit rate, and audio channel through this function. If this function is not called, the default is standard quality mode. Should be used before publishing.
     * If the preset value cannot meet the developer's scenario, the developer can set the parameters according to the business requirements.
     * @param {(ZegoAudioConfigPreset|ZegoAudioConfig)} config - Audio config
     */
    setAudioConfig(config){
        this.ZegoNativeInstance.setAudioConfig({config});
    }

    /**
     * Gets the current audio configurations.
     *
     * You can get the current audio codec, bit rate, and audio channel through this function.
     * @return {ZegoAudioConfig} - Audio config
     */
    getAudioConfig(){
        return this.ZegoNativeInstance.getAudioConfig({});
    }

    /**
     * Take a snapshot of the publishing stream (for the specified channel).
     *
     * Please call this function after calling [startPublishingStream] or [startPreview]
     * The resolution of the snapshot is the encoding resolution set in [setVideoConfig]. If you need to change it to capture resolution, please call [setCapturePipelineScaleMode] to change the capture pipeline scale mode to [Post]
     * @param {ZegoPublishChannel} channel - Publish stream channel
     * @return {Promise<number, string>} - snapshot error code(errorCode) and base64 string of the image in jpg format(image)
     */
    takePublishStreamSnapshot(channel = ZegoPublishChannel.Main){
        return this.ZegoNativeInstance.takePublishStreamSnapshot({channel});
    }

    /**
     * Stops or resumes sending the audio part of a stream (for the specified channel).
     *
     * This function can be called when publishing the stream to realize not publishing the audio data stream. The SDK still collects and processes the audio, but does not send the audio data to the network. It can be set before and after publishing.
     * If you stop sending audio streams, the remote user that play stream of local user publishing stream can receive `Mute` status change notification by monitoring [onRemoteMicStateUpdate] callbacks,
     * @param {boolean} mute - Whether to stop sending audio streams, true means not to send audio stream, and false means sending audio stream. The default is false.
     * @param {ZegoPublishChannel} channel - Publish stream channel
     */
    mutePublishStreamAudio(mute, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.mutePublishStreamAudio({mute, channel});
    }

    /**
     * Stops or resumes sending the video part of a stream (for the specified channel).
     *
     * This function can be called when publishing the stream to realize not publishing the video stream. The local camera can still work normally, can capture, preview and process video images normally, but does not send the video data to the network. It can be set before and after publishing.
     * If you stop sending video streams locally, the remote user that play stream of local user publishing stream can receive `Mute` status change notification by monitoring [onRemoteCameraStateUpdate] callbacks,
     * @param {boolean} mute - Whether to stop sending video streams, true means not to send video stream, and false means sending video stream. The default is false.
     * @param {ZegoPublishChannel} channel - Publish stream channel
     */
    mutePublishStreamVideo(mute, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.mutePublishStreamVideo({mute, channel});
    }

    /**
     * Enables or disables traffic control.
     *
     * Traffic control enables SDK to dynamically adjust the bitrate of audio and video streaming according to its own and peer current network environment status.
     * Automatically adapt to the current network environment and fluctuations, so as to ensure the smooth publishing of stream.
     * @param {boolean} enable - Whether to enable traffic control. The default is ture.
     * @param {number} property - Adjustable property of traffic control, bitmask format. Should be one or the combinations of [ZegoTrafficControlProperty] enumeration. [AdaptiveFPS] as default.
     */
    enableTrafficControl(enable, property){
        this.ZegoNativeInstance.enableTrafficControl({enable, property});
    }

    /**
     * Sets the minimum video bitrate for traffic control.
     *
     * Set how should SDK send video data when the network conditions are poor and the minimum video bitrate cannot be met.
     * When this function is not called, the SDK will automatically adjust the sent video data frames according to the current network uplink conditions by default.
     * @param {number} bitrate - Minimum video bitrate (kbps)
     * @param {ZegoTrafficControlMinVideoBitrateMode} mode - Video sending mode below the minimum bitrate.
     */
    setMinVideoBitrateForTrafficControl(bitrate, mode){
        this.ZegoNativeInstance.setMinVideoBitrateForTrafficControl({bitrate, mode});
    }

    /**
     * Sets the audio recording volume for stream publishing.
     *
     * This function is used to set the audio collection volume. The local user can control the volume of the audio stream sent to the far end. It can be set before publishing.
     * @param {number} volume - Volume percentage. The range is 0 to 200. Default value is 100.
     */
    setCaptureVolume(volume){
        this.ZegoNativeInstance.setCaptureVolume({volume});
    }

    /**
     * Set audio capture stereo mode.
     *
     * This function is used to set the audio stereo capture mode. The default is mono, that is, dual channel collection is not enabled.
     * It needs to be invoked before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer] and [createAudioEffectPlayer] to take effect.
     * @param {ZegoAudioCaptureStereoMode} mode - Audio stereo capture mode
     */
    setAudioCaptureStereoMode(mode){
        this.ZegoNativeInstance.setAudioCaptureStereoMode({mode});
    }

    /**
     * Adds a target CDN URL to which the stream will be relayed from ZEGO RTC server.
     *
     * Developers can call this function to publish the audio and video streams that have been published to the ZEGO RTC server to a custom CDN content distribution network that has high latency but supports high concurrent playing stream.
     * Because this called function is essentially a dynamic relay of the audio and video streams published to the ZEGO RTC server to different CDNs, this function needs to be called after the audio and video stream is published to ZEGO RTC server successfully.
     * Since ZEGO RTC server itself can be configured to support CDN(content distribution networks), this function is mainly used by developers who have CDN content distribution services themselves.
     * You can use ZEGO's CDN audio and video streaming content distribution service at the same time by calling this function and then use the developer who owns the CDN content distribution service.
     * This function supports dynamic relay to the CDN content distribution network, so developers can use this function as a disaster recovery solution for CDN content distribution services.
     * When the [enablePublishDirectToCDN] function is set to true to publish the stream straight to the CDN, then calling this function will have no effect.
     * @param {string} streamID - Stream ID
     * @param {string} targetURL - CDN relay address, supported address format is rtmp.
     * @return {Promise<number>} - The execution result of update the relay CDN operation
     */
    addPublishCdnUrl(streamID, targetURL){
        return this.ZegoNativeInstance.addPublishCdnUrl({streamID, targetURL});
    }

    /**
     * Deletes the specified CDN URL, which is used for relaying streams from ZEGO RTC server to CDN.
     *
     * This function is called when a CDN relayed address has been added and needs to stop propagating the stream to the CDN.
     * This function does not stop publishing audio and video stream to the ZEGO ZEGO RTC server.
     * @param {string} streamID - Stream ID
     * @param {string} targetURL - CDN relay address, supported address format rtmp.
     * @return {Promise<number>} - The execution result of update the relay CDN operation
     */
    removePublishCdnUrl(streamID, targetURL){
        return this.ZegoNativeInstance.removePublishCdnUrl({streamID, targetURL});
    }

    /**
     * Whether to publish streams directly from the client to CDN without passing through Zego RTC server (for the specified channel).
     *
     * This function needs to be set before [startPublishingStream].
     * After calling this function to publish the audio and video stream directly to the CDN, calling [addPublishCdnUrl] and [removePublishCdnUrl] to dynamically relay to the CDN no longer takes effect,
     * because these two functions are to relay or stop relaying the audio and video stream from ZEGO RTC server to CDN,
     * if you enable the direct publish of audio and video streams to CDN, you will not be able to dynamically relay the audio and video streams to the CDN through the ZEGO RTC server.
     * @param {boolean} enable - Whether to enable direct publish CDN, true: enable direct publish CDN, false: disable direct publish CDN
     * @param {?ZegoCDNConfig} config - CDN configuration, if null, use Zego's background default configuration
     * @param {ZegoPublishChannel} channel - Publish stream channel
     */
    enablePublishDirectToCDN(enable, config, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.enablePublishDirectToCDN({enable, config, channel});
    }

    /**
     * Sets up the stream watermark before stream publishing (for the specified channel).
     *
     * The layout of the watermark cannot exceed the video encoding resolution of the stream. It can be set at any time before or during the publishing stream.
     * @param {?ZegoWatermark} watermark - The upper left corner of the watermark layout is the origin of the coordinate system, and the area cannot exceed the size set by the encoding resolution. If it is null, the watermark is cancelled.
     * @param {boolean} isPreviewVisible - the watermark is visible on local preview
     * @param {ZegoPublishChannel} channel - Publish stream channel
     */
    setPublishWatermark(watermark, isPreviewVisible, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.setPublishWatermark({watermark, isPreviewVisible, channel});
    }

    /**
     * Set the Supplemental Enhancement Information type
     *
     * It must be set before [startPublishingStream].
     * @param {ZegoSEIConfig} config - SEI configuration. The SEI defined by ZEGO is used by default.
     */
    setSEIConfig(config){
        this.ZegoNativeInstance.setSEIConfig({config});
    }

    /**
     * Sends Supplemental Enhancement Information.
     *
     * This function can synchronize some other additional information while the developer publishes streaming audio and video streaming data while sending streaming media enhancement supplementary information.
     * Generally, for scenarios such as synchronizing music lyrics or precise layout of video canvas, you can choose to use this function.
     * After the anchor sends the SEI, the audience can obtain the SEI content by monitoring the callback of [onPlayerRecvSEI].
     * Since SEI information follows video frames, and because of network problems, frames may be dropped, so SEI information may also be dropped. To solve this situation, it should be sent several times within the limited frequency.
     * After calling [startPublishingStream] to publish the stream successfully, you can call this function.
     * Limit frequency: Do not exceed 30 times per second.
     * The SEI data length is limited to 4096 bytes.
     * @param {Uint8Array} data - SEI data
     * @param {ZegoPublishChannel} channel - Publish stream channel
     */
    sendSEI(data, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.sendSEI({data, channel});
    }

    /**
     * Enables or disables hardware encoding.
     *
     * Whether to use the hardware encoding function when publishing the stream, the GPU is used to encode the stream and to reduce the CPU usage. The setting can take effect before the stream published. If it is set after the stream published, the stream should be stopped first before it takes effect.
     * Because hard-coded support is not particularly good for a few models, SDK uses software encoding by default. If the developer finds that the device is hot when publishing a high-resolution audio and video stream during testing of some models, you can consider calling this function to enable hard coding.
     * @param {boolean} enable - Whether to enable hardware encoding, true: enable hardware encoding, false: disable hardware encoding
     */
    enableHardwareEncoder(enable){
        this.ZegoNativeInstance.enableHardwareEncoder({enable});
    }

    /**
     * Sets the timing of video scaling in the video capture workflow. You can choose to do video scaling right after video capture (the default value) or before encoding.
     *
     * This function needs to be set before previewing or streaming.
     * The main effect is whether the local preview is affected when the acquisition resolution is different from the encoding resolution.
     * @param {ZegoCapturePipelineScaleMode} mode - The capture scale timing mode
     */
    setCapturePipelineScaleMode(mode){
        this.ZegoNativeInstance.setCapturePipelineScaleMode({mode});
    }

    /**
     * Starts playing a stream from ZEGO RTC server or from third-party CDN.
     *
     * This function allows users to play audio and video streams both from the ZEGO RTC server or from third-party cdn.
     * Before starting to play the stream, you need to join the room first, you can get the new streamID in the room by listening to the [onRoomStreamUpdate] event callback.
     * In the case of poor network quality, user play may be interrupted, the SDK will try to reconnect, and the current play status and error information can be obtained by listening to the [onPlayerStateUpdate] event.
     * Playing the stream ID that does not exist, the SDK continues to try to play after calling this function. After the stream ID is successfully published, the audio and video stream can be actually played.
     * The developer can update the player canvas by calling this function again (the streamID must be the same).
     * After the first play stream failure due to network reasons or the play stream is interrupted, the default time for SDK reconnection is 20min.
     * @param {string} streamID - Stream ID, a string of up to 256 characters. You cannot include URL keywords, otherwise publishing stream and playing stream will fails. Only support numbers, English characters and '~', '!', '@', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'.
     * @param {ZegoView} view - The view used to display the preview image.
     * @param {ZegoPlayerConfig} config - Advanced player configuration
     */
    startPlayingStream(streamID, view, config = { cdnConfig: null, videoLayer: ZegoPlayerVideoLayer.Auto }){
        view = Object.assign({ viewMode: ZegoViewMode.AspectFit, backgroundColor: 0x000000, preserveDrawingBuffer:false }, view);
        config = Object.assign({ cdnConfig: null, videoLayer: ZegoPlayerVideoLayer.Auto }, config);
    
        this.VideoViewManager.remoteGLRenders[streamID] = new WebGLRender();
        this.VideoViewManager.remoteGLRenders[streamID].setViewMode(view.viewMode);
        this.VideoViewManager.remoteGLRenders[streamID].enablePreserveDrawingBuffer(view.preserveDrawingBuffer);
        this.VideoViewManager.remoteGLRenders[streamID].initBkColor(view.backgroundColor);
        this.VideoViewManager.remoteGLRenders[streamID].initGLfromCanvas(view.canvas);
        this.ZegoNativeInstance.startPlayingStream({ streamID, config });
    }

    /**
     * Stops playing a stream.
     *
     * This function allows the user to stop playing the stream. When stopped, the attributes set for this stream previously, such as [setPlayVolume], [mutePlayStreamAudio], [mutePlayStreamVideo], etc., will be invalid and need to be reset when playing the the stream next time.
     * @param {string} streamID - Stream ID
     */
    stopPlayingStream(streamID){
        this.ZegoNativeInstance.stopPlayingStream({ streamID });
        if(this.VideoViewManager.remoteGLRenders[streamID])
        {
            this.VideoViewManager.remoteGLRenders[streamID].uninit2d();
            this.VideoViewManager.remoteGLRenders[streamID] = null;
        }
    }

    /**
     * Take a snapshot of the playing stream.
     *
     * Please call this function after calling [startPlayingStream]
     * @param {string} streamID - Stream ID to be snapshot
     * @return {Promise<number, string>} - snapshot error code(errorCode) and base64 string of the image in jpg format(image)
     */
    takePlayStreamSnapshot(streamID){
        return this.ZegoNativeInstance.takePlayStreamSnapshot({streamID});
    }

    /**
     * Sets the stream playback volume.
     *
     * This function is used to set the playback volume of the stream. Need to be called after calling startPlayingStream.
     * You need to reset after [stopPlayingStream] and [startPlayingStream].
     * @param {string} streamID - Stream ID. Set volume for all streams playing by set streamID as null or empty.
     * @param {number} volume - Volume percentage. The value ranges from 0 to 200, and the default value is 100.
     */
    setPlayVolume(streamID, volume){
        this.ZegoNativeInstance.setPlayVolume({streamID, volume});
    }

    /**
     * Set the selected video layer of playing stream.
     *
     * When the publisher has set the codecID to SVC through [setVideoConfig], the player can dynamically set whether to use the standard layer or the base layer (the resolution of the base layer is one-half of the standard layer)
     * Under normal circumstances, when the network is weak or the rendered UI form is small, you can choose to use the video that plays the base layer to save bandwidth.
     * It can be set before and after playing stream.
     * @param {string} streamID - Stream ID.
     * @param {ZegoPlayerVideoLayer} videoLayer - Video layer of playing stream. AUTO by default.
     * @deprecated This function has been deprecated since version 2.3.0. Please use [setPlayStreamVideoType] instead.
     */
    setPlayStreamVideoLayer(streamID, videoLayer){
        this.ZegoNativeInstance.setPlayStreamVideoLayer({streamID, videoLayer});
    }

    /**
     * Stops or resumes playing the audio part of a stream.
     *
     * This function can be used to stop playing/retrieving the audio data of the stream. It can be called before and after playing the stream.
     * @param {string} streamID - Stream ID
     * @param {boolean} mute - Mute flag, true: mute play stream audio, false: resume play stream audio
     */
    mutePlayStreamAudio(streamID, mute){
        this.ZegoNativeInstance.mutePlayStreamAudio({streamID, mute});
    }

    /**
     * Stops or resumes playing the video part of a stream.
     *
     * This function can be used to stop playing/retrieving the video data of the stream. It can be called before and after playing the stream.
     * @param {string} streamID - Stream ID
     * @param {boolean} mute - mute flag, true: mute play stream video, false: resume play stream video
     */
    mutePlayStreamVideo(streamID, mute){
        this.ZegoNativeInstance.mutePlayStreamVideo({streamID, mute});
    }

    /**
     * Stop or resume pulling all video streams.
     *
     * This function can be called when the stream is pulled, so that the video data of all remote users is not pulled, and it can be called before and after the stream is pulled.
     * This function does not affect the life cycle of the `mutePlayStreamVideo` interface. This means that neither this function nor the `mutePlayStreamVideo` function prohibits video data before receiving video data.
     * @param {boolean} mute - mute flag, true: mute play stream video, false: resume play stream video
     */
    muteAllPlayStreamVideo(mute){
        this.ZegoNativeInstance.muteAllPlayStreamVideo({mute});
    }

    /**
     * Enables or disables hardware decoding.
     *
     * Turn on hardware decoding and use hardware to improve decoding efficiency. Need to be called before calling startPlayingStream.
     * Because hard-decoded support is not particularly good for a few models, SDK uses software decoding by default. If the developer finds that the device is hot when playing a high-resolution audio and video stream during testing of some models, you can consider calling this function to enable hard decoding.
     * @param {boolean} enable - Whether to turn on hardware decoding switch, true: enable hardware decoding, false: disable hardware decoding. The default is false
     */
    enableHardwareDecoder(enable){
        this.ZegoNativeInstance.enableHardwareDecoder({enable});
    }

    /**
     * Enables or disables frame order detection.
     *
     * @param {boolean} enable - Whether to turn on frame order detection, true: enable check poc,not support B frames, false: disable check poc, support B frames but the screen may temporary splash. The default is true
     */
    enableCheckPoc(enable){
        this.ZegoNativeInstance.enableCheckPoc({enable});
    }

    /**
     * Starts a stream mixing task.
     *
     * Due to the performance considerations of the client device, ZegoExpressEngine's mix stream is to start the mixing stream task on the server side of the ZEGO RTC server for mixing stream.
     * After calling this function, SDK initiates a mixing stream request to the ZEGO RTC server. The server will find the current publishing stream and perform video layer blending according to the parameters of the mixing stream task requested by SDK.
     * When you need to update the mixing stream task, that is, the input stream list needs to be updated when the input stream increases or decreases, you can update the field of the [ZegoMixerTask] object inputList and call this function again to pass the same [ZegoMixerTask] object to update the mixing stream task.
     * If an exception occurs when requesting to start the mixing stream task, for example, the most common mix input stream does not exist, it will be given from the callback error code. For specific error codes, please refer to the error codes document https://doc-en.zego.im/en/5548.html for details.
     * If an input stream does not exist in the middle, the mixing stream task will automatically retry playing the input stream for 90 seconds, and will not retry after 90 seconds.
     * @param {ZegoMixerTask} task - Stream mixing task object
     * @return {Promise<number, string>} - Start stream mixing task result
     */
    startMixerTask(task){
        return this.ZegoNativeInstance.startMixerTask({task});
    }

    /**
     * Stops a stream mixing task.
     *
     * Similar to [startMixerTask], after calling this function, SDK initiates a request to end the mixing stream task to the ZEGO RTC server.
     * If you starts the next mixing stream task without stopping the previous mixing stream task, the previous mixing stream task will not stop automatically. The previous mixing stream task will not be stopped automatically until 90 seconds after the input stream of the previous mixing stream task does not exist.
     * Developers should pay attention when using the stream mixing function that, before starting the next mixer task, they should stop the previous mixer task, so as avoid that when an anchor has start the next mixer task to mix stream with other anchors, and the audience is still playing the previous mixer task's output stream.
     * @param {ZegoMixerTask} task - Stream mixing task object
     * @return {Promise<number>} - Stop stream mixing task result
     */
    stopMixerTask(task){
        return this.ZegoNativeInstance.stopMixerTask({task});
    }

    /**
     * Mutes or unmutes the microphone.
     *
     * This function is used to control whether the collected audio data is used. When the microphone is muted (disabled), the data is collected and discarded, and the microphone is still occupied.
     * The microphone is still occupied because closing or opening the microphone on the hardware is a relatively heavy operation, and real users may have frequent operations. For trade-off reasons, this function simply discards the collected data.
     * If you really want SDK to give up occupy the microphone, you can call the [enableAudioCaptureDevice] function.
     * Developers who want to control whether to use microphone on the UI should use this function to avoid unnecessary performance overhead by using the [enableAudioCaptureDevice].
     * @param {boolean} mute - Whether to mute (disable) the microphone, true: mute (disable) microphone, false: enable microphone. The default is false.
     */
    muteMicrophone(mute){
        this.ZegoNativeInstance.muteMicrophone({mute});
    }

    /**
     * Checks whether the microphone is muted.
     *
     * Can be used with [muteMicrophone], determine whether the microphone is muted.
     * @return {boolean} - Whether the microphone is muted; true: the microphone is muted; false: the microphone is enable (not muted)
     */
    isMicrophoneMuted(){
        return this.ZegoNativeInstance.isMicrophoneMuted({});
    }

    /**
     * Mutes or unmutes the audio output speaker.
     *
     * After mute speaker, all the SDK sounds will not play, including playing stream, mediaplayer, etc. But the SDK will still occupy the output device.
     * @param {boolean} mute - Whether to mute (disable) speaker audio output, true: mute (disable) speaker audio output, false: enable speaker audio output. The default value is false
     */
    muteSpeaker(mute){
        this.ZegoNativeInstance.muteSpeaker({mute});
    }

    /**
     * Checks whether the audio output speaker is muted.
     *
     * Can be used with [muteSpeaker], determine whether the speaker audio output is muted.
     * @return {boolean} - Whether the speaker is muted; true: the speaker is muted; false: the speaker is enable (not muted)
     */
    isSpeakerMuted(){
        return this.ZegoNativeInstance.isSpeakerMuted({});
    }

    /**
     * Gets a list of audio devices.
     *
     * @param {ZegoAudioDeviceType} deviceType - Audio device type
     * @return {ZegoDeviceInfo[]} - Audo device List
     */
    getAudioDeviceList(deviceType){
        return this.ZegoNativeInstance.getAudioDeviceList({deviceType});
    }

    /**
     * Get the device ID of the default audio device.
     *
     * @param {ZegoAudioDeviceType} deviceType - Audio device type
     * @return {string} - Default Audio device ID
     */
    getDefaultAudioDeviceID(deviceType){
        return this.ZegoNativeInstance.getDefaultAudioDeviceID({deviceType});
    }

    /**
     * Chooses to use the specified audio device.
     *
     * @param {string} deviceID - ID of a device obtained by [getAudioDeviceList]
     * @param {ZegoAudioDeviceType} deviceType - Audio device type
     */
    useAudioDevice(deviceID, deviceType){
        this.ZegoNativeInstance.useAudioDevice({deviceID, deviceType});
    }

    /**
     * Get volume for the specified audio device.
     *
     * @param {ZegoAudioDeviceType} deviceType - Audio device type
     * @param {string} deviceID - ID of a device obtained by [getAudioDeviceList]
     * @return {number} - Device volume
     */
    getAudioDeviceVolume(deviceType, deviceID){
        return this.ZegoNativeInstance.getAudioDeviceVolume({deviceType, deviceID});
    }

    /**
     * Set volume for the specified audio device.
     *
     * The direct operating system device may fail due to system restrictions. Please use [setCaptureVolume] and [setPlayVolume] first to adjust the volume of publish and play streams.
     * @param {ZegoAudioDeviceType} deviceType - Audio device type
     * @param {string} deviceID - ID of a device obtained by [getAudioDeviceList]
     * @param {number} volume - Device volume
     */
    setAudioDeviceVolume(deviceType, deviceID, volume){
        this.ZegoNativeInstance.setAudioDeviceVolume({deviceType, deviceID, volume});
    }

    /**
     * Enables or disables the audio capture device.
     *
     * This function is used to control whether to release the audio collection device. When the audio collection device is turned off, the SDK will no longer occupy the audio device. Of course, if the stream is being published at this time, there is no audio data.
     * Occupying the audio capture device and giving up Occupying the audio device is a relatively heavy operation, and the [muteMicrophone] function is generally recommended.
     * @param {boolean} enable - Whether to enable the audio capture device, true: disable audio capture device, false: enable audio capture device
     */
    enableAudioCaptureDevice(enable){
        this.ZegoNativeInstance.enableAudioCaptureDevice({enable});
    }

    /**
     * Turns on/off the camera (for the specified channel).
     *
     * This function is used to control whether to start the camera acquisition. After the camera is turned off, video capture will not be performed. At this time, the publish stream will also have no video data.
     * In the case of using a custom video capture function, because the developer has taken over the video data capturing, the SDK is no longer responsible for the video data capturing, this function is no longer valid.
     * @param {boolean} enable - Whether to turn on the camera, true: turn on camera, false: turn off camera
     * @param {ZegoPublishChannel} channel - Publishing stream channel
     */
    enableCamera(enable, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.enableCamera({enable, channel});
    }

    /**
     * Chooses to use the specified video device (for the specified channel).
     *
     * @param {string} deviceID - ID of a device obtained by getVideoDeviceList
     * @param {ZegoPublishChannel} channel - Publishing stream channel
     */
    useVideoDevice(deviceID, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.useVideoDevice({deviceID, channel});
    }

    /**
     * Gets a list of video devices.
     *
     * @return {ZegoDeviceInfo[]} - Video device List
     */
    getVideoDeviceList(){
        return this.ZegoNativeInstance.getVideoDeviceList({});
    }

    /**
     * Get the deviceID of the default video device.
     *
     * @return {string} - Default video device ID
     */
    getDefaultVideoDeviceID(){
        return this.ZegoNativeInstance.getDefaultVideoDeviceID({});
    }

    /**
     * Starts sound level monitoring. Support setting the listening interval.
     *
     * After starting monitoring, you can receive local audio sound level via [onCapturedSoundLevelUpdate] callback, and receive remote audio sound level via [onRemoteSoundLevelUpdate] callback.
     * Before entering the room, you can call [startPreview] with this function and combine it with [onCapturedSoundLevelUpdate] callback to determine whether the audio device is working properly.
     * [onCapturedSoundLevelUpdate] and [onRemoteSoundLevelUpdate] callback notification period is the value set by the parameter.
     * @param {number} millisecond - Monitoring time period of the sound level, in milliseconds, has a value range of [100, 3000]. Default is 100 ms.
     */
    startSoundLevelMonitor(millisecond = 100){
        this.ZegoNativeInstance.startSoundLevelMonitor({millisecond});
    }

    /**
     * Stops sound level monitoring.
     *
     * After the monitoring is stopped, the callback of the local/remote audio sound level will be stopped.
     */
    stopSoundLevelMonitor(){
        this.ZegoNativeInstance.stopSoundLevelMonitor({});
    }

    /**
     * Starts audio spectrum monitoring. Support setting the listening interval.
     *
     * After starting monitoring, you can receive local audio spectrum via [onCapturedAudioSpectrumUpdate] callback, and receive remote audio spectrum via [onRemoteAudioSpectrumUpdate] callback.
     * [onCapturedAudioSpectrumUpdate] and [onRemoteAudioSpectrumUpdate] callback notification period is the value set by the parameter.
     * @param {number} millisecond - Monitoring time period of the audio spectrum, in milliseconds, has a value range of [100, 3000]. Default is 100 ms.
     */
    startAudioSpectrumMonitor(millisecond = 100){
        this.ZegoNativeInstance.startAudioSpectrumMonitor({millisecond});
    }

    /**
     * Stops audio spectrum monitoring.
     *
     * After the monitoring is stopped, the callback of the local/remote audio spectrum will be stopped.
     */
    stopAudioSpectrumMonitor(){
        this.ZegoNativeInstance.stopAudioSpectrumMonitor({});
    }

    /**
     * Enables or disables headphone monitoring.
     *
     * enable/disable headphone monitor, this setting takes effect when the headset is connected.
     * @param {boolean} enable - Whether to use headphone monitor, true: enable, false: disable
     */
    enableHeadphoneMonitor(enable){
        this.ZegoNativeInstance.enableHeadphoneMonitor({enable});
    }

    /**
     * Sets the headphone monitor volume.
     *
     * set headphone monitor volume, this setting takes effect when the headset is connected.
     * @param {number} volume - headphone monitor volume, range from 0 to 200, 100 as default
     */
    setHeadphoneMonitorVolume(volume){
        this.ZegoNativeInstance.setHeadphoneMonitorVolume({volume});
    }

    /**
     * Enables or disables system audio capture.
     *
     * Enable sound card capture to mix sounds played by the system into the publishing stream, such as sounds played by the browser, sounds played by other software, etc.
     * @param {boolean} enable - Whether to mix system playout
     */
    enableMixSystemPlayout(enable){
        this.ZegoNativeInstance.enableMixSystemPlayout({enable});
    }

    /**
     * Get the audio device information currently in use.
     *
     * Available since: 2.12.0
     * Description: Get the audio device information currently in use.
     * Use cases: Used for scenes that need to manually switch between multiple audio devices.
     * When to call: After creating the engine.
     * Restrictions: Only supports desktop.
     * Related APIs: The default audio device ID can be obtained through [getDefaultAudioDeviceID].
     * @param {ZegoAudioDeviceType} deviceType - Audio device type.Required:Yes.
     * @return {ZegoDeviceInfo} - Audio device information.
     */
    getCurrentAudioDevice(deviceType){
        return this.ZegoNativeInstance.getCurrentAudioDevice({deviceType});
    }

    /**
     * Enables or disables acoustic echo cancellation (AEC).
     *
     * Turning on echo cancellation, the SDK filters the collected audio data to reduce the echo component in the audio.
     * It needs to be invoked before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer] and [createAudioEffectPlayer] to take effect.
     * @param {boolean} enable - Whether to enable echo cancellation, true: enable, false: disable
     */
    enableAEC(enable){
        this.ZegoNativeInstance.enableAEC({enable});
    }

    /**
     * Sets the acoustic echo cancellation (AEC) mode.
     *
     * Switch different echo cancellation modes to control the extent to which echo data is eliminated.
     * It needs to be invoked before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer] and [createAudioEffectPlayer] to take effect.
     * @param {ZegoAECMode} mode - Echo cancellation mode
     */
    setAECMode(mode){
        this.ZegoNativeInstance.setAECMode({mode});
    }

    /**
     * Enables or disables automatic gain control (AGC).
     *
     * When the auto gain is turned on, the sound will be amplified, but it will affect the sound quality to some extent.
     * It needs to be invoked before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer] and [createAudioEffectPlayer] to take effect.
     * @param {boolean} enable - Whether to enable automatic gain control, true: enable, false: disable
     */
    enableAGC(enable){
        this.ZegoNativeInstance.enableAGC({enable});
    }

    /**
     * Enables or disables active noise suppression (ANS, aka ANC).
     *
     * Turning on the noise suppression switch can reduce the noise in the audio data and make the human voice clearer.
     * It needs to be invoked before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer] and [createAudioEffectPlayer] to take effect.
     * @param {boolean} enable - Whether to enable noise suppression, true: enable, false: disable
     */
    enableANS(enable){
        this.ZegoNativeInstance.enableANS({enable});
    }

    /**
     * Enables or disables transient noise suppression.
     *
     * Suppress transient noises such as keyboard and desk knocks
     * It needs to be invoked before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer] and [createAudioEffectPlayer] to take effect.
     * @param {boolean} enable - Whether to enable transient noise suppression, true: enable, false: disable
     */
    enableTransientANS(enable){
        this.ZegoNativeInstance.enableTransientANS({enable});
    }

    /**
     * Sets the automatic noise suppression (ANS) mode.
     *
     * Default is medium mode
     * It needs to be invoked before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer] and [createAudioEffectPlayer] to take effect.
     * @param {ZegoANSMode} mode - Audio Noise Suppression mode
     */
    setANSMode(mode){
        this.ZegoNativeInstance.setANSMode({mode});
    }

    /**
     * Set the sound equalizer (EQ).
     *
     * @param {number} bandIndex - Band frequency index, the value range is [0, 9], corresponding to 10 frequency bands, and the center frequencies are [31, 62, 125, 250, 500, 1K, 2K, 4K, 8K, 16K] Hz.
     * @param {number} bandGain - Band gain for the index, the value range is [-15, 15]. Default value is 0, if all gain values in all frequency bands are 0, EQ function will be disabled.
     */
    setAudioEqualizerGain(bandIndex, bandGain){
        this.ZegoNativeInstance.setAudioEqualizerGain({bandIndex, bandGain});
    }

    /**
     * Setting up the voice changer via preset enumeration.
     *
     * Voice changer effect is only effective for the captured sound.
     * This function is an encapsulated version of [setVoiceChangerParam], which provides some preset values. If you need to configure the voice changer effects, please use [setVoiceChangerParam]
     * This function is mutually exclusive with [setReverbPreset]. If used at the same time, it will produce undefined effects.
     * Some enumerated preset will modify the parameters of reverberation or reverberation echo, so after calling this function, calling [setVoiceChangerParam], [setReverbAdvancedParam], [setReverbEchoParam] may affect the voice changer effect.
     * If you need to configure the reverb/echo/voice changer effect, please use [setReverbAdvancedParam], [setReverbEchoParam], [setVoiceChangerParam] together.
     * @param {ZegoVoiceChangerPreset} preset - The voice changer preset enumeration
     */
    setVoiceChangerPreset(preset){
        this.ZegoNativeInstance.setVoiceChangerPreset({preset});
    }

    /**
     * Setting up the specific voice changer parameters.
     *
     * Voice changer effect is only effective for the captured sound.
     * This function is an advanced version of [setVoiceChangerPreset], you can configure the voice changer effect by yourself.
     * If you need to configure the reverb/echo/voice changer effect, please use [setReverbAdvancedParam], [setReverbEchoParam], [setVoiceChangerParam] together.
     * @param {ZegoVoiceChangerParam} param - Voice changer parameters
     */
    setVoiceChangerParam(param){
        this.ZegoNativeInstance.setVoiceChangerParam({param});
    }

    /**
     * Setting up the reverberation via preset enumeration.
     *
     * Support dynamic settings when publishing stream.
     * This function is a encapsulated version of [setReverbAdvancedParam], which provides some preset values. If you need to configure the reverb, please use [setReverbAdvancedParam]
     * This function is mutually exclusive with [setVoiceChangerPreset]. If used at the same time, it will produce undefined effects.
     * If you need to configure the reverb/echo/voice changer effect, please use [setReverbAdvancedParam], [setReverbEchoParam], [setVoiceChangerParam] together.
     * @param {ZegoReverbPreset} preset - The reverberation preset enumeration
     */
    setReverbPreset(preset){
        this.ZegoNativeInstance.setReverbPreset({preset});
    }

    /**
     * Setting up the specific reverberation parameters.
     *
     * Different values dynamically set during publishing stream will take effect. When all parameters are set to 0, the reverberation is turned off.
     * This function is an advanced version of [setReverbPreset], you can configure the reverb effect by yourself.
     * If you need to configure the reverb/echo/voice changer effect, please use [setReverbAdvancedParam], [setReverbEchoParam], [setVoiceChangerParam] together.
     * @param {ZegoReverbAdvancedParam} param - Reverb advanced parameter
     */
    setReverbAdvancedParam(param){
        this.ZegoNativeInstance.setReverbAdvancedParam({param});
    }

    /**
     * Setting up the specific reverberation echo parameters.
     *
     * This function can be used with voice changer and reverb to achieve a variety of custom sound effects
     * If you need to configure the reverb/echo/voice changer effect, please use [setReverbAdvancedParam], [setReverbEchoParam], [setVoiceChangerParam] together.
     * @param {ZegoReverbEchoParam} param - The reverberation echo parameter
     */
    setReverbEchoParam(param){
        this.ZegoNativeInstance.setReverbEchoParam({param});
    }

    /**
     * Enables the virtual stereo feature.
     *
     * Note: You need to set up a dual channel setAudioConfig for the virtual stereo to take effect!
     * @param {boolean} enable - true to turn on the virtual stereo, false to turn off the virtual stereo
     * @param {number} angle - angle of the sound source in the virtual stereo, ranging from 0 to 180, with 90 being the front, and 0 and 180 being respectively Corresponds to rightmost and leftmost, usually use 90.
     */
    enableVirtualStereo(enable, angle){
        this.ZegoNativeInstance.enableVirtualStereo({enable, angle});
    }

    /**
     * Sends a Broadcast Message.
     *
     * The sending frequency of broadcast messages in the same room cannot be higher than 10 messages/s.
     * A certain number of users in the same room who entered the room earlier can receive this callback. The message is reliable. It is generally used when the number of people in the live room is less than a certain number. The specific number is determined by the configuration of the ZEGO server.
     * @param {string} roomID - Room ID, a string of up to 128 bytes in length. Only support numbers, English characters and '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'
     * @param {string} message - Message content, no longer than 1024 bytes
     * @return {Promise<number, number>} - Send broadcast message result callback
     */
    sendBroadcastMessage(roomID, message){
        return this.ZegoNativeInstance.sendBroadcastMessage({roomID, message});
    }

    /**
     * Sends a Barrage Message (bullet screen) to all users in the same room, without guaranteeing the delivery.
     *
     * The frequency of sending barrage messages in the same room cannot be higher than 20 messages/s.
     * The message is unreliable. When the frequency of sending barrage messages in the entire room is greater than 20 messages/s, the recipient may not receive the message. It is generally used in scenarios where there is a large number of messages sent and received in the room and the reliability of the messages is not required, such as live broadcast barrage.
     * @param {string} roomID - Room ID, a string of up to 128 bytes in length. Only support numbers, English characters and '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'
     * @param {string} message - Message content, no longer than 1024 bytes
     * @return {Promise<number, string>} - Send barrage message result callback
     */
    sendBarrageMessage(roomID, message){
        return this.ZegoNativeInstance.sendBarrageMessage({roomID, message});
    }

    /**
     * Sends a Custom Command to the specified users in the same room.
     *
     * Please do not fill in sensitive user information in this interface, including but not limited to mobile phone number, ID number, passport number, real name, etc.
     * The frequency of custom messages sent to a single user in the same room cannot be higher than 200 messages/s, and the frequency of custom messages sent to multiple users cannot be higher than 10 messages/s.
     * The point-to-point signaling type in the same room is generally used for remote control signaling or for sending messages between users. The messages are reliable.
     * @param {string} roomID - Room ID, a string of up to 128 bytes in length. Only support numbers, English characters and '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'
     * @param {string} command - Custom command content, no longer than 1024 bytes
     * @param {ZegoUser[]} toUserList - The users who will receive the command
     * @return {Promise<number>} - Send command result callback
     */
    sendCustomCommand(roomID, command, toUserList){
        return this.ZegoNativeInstance.sendCustomCommand({roomID, command, toUserList});
    }

    /**
     * Creates a media player instance.
     *
     * Currently, a maximum of 4 instances can be created, after which it will return null. The more instances of a media player, the greater the performance overhead on the device.
     * @return {ZegoMediaPlayer} - Media player instance, null will be returned when the maximum number is exceeded.
     */
    createMediaPlayer(){
        let mediaPlayer = null;
        let nativeMediaPlayer = this.ZegoNativeInstance.createMediaPlayer();
        if(nativeMediaPlayer){
            mediaPlayer = new ZegoMediaPlayer()
            mediaPlayer.nativeMediaPlayer = nativeMediaPlayer;
            let nativeMediaPlayerPtr = mediaPlayer.nativeMediaPlayer.getNativePtr();
            this.mediaPlayers[nativeMediaPlayerPtr] = mediaPlayer
        }
        return mediaPlayer;
    }

    /**
     * Destroys a media player instance.
     *
     * @param {ZegoMediaPlayer} mediaPlayer - The media player instance object to be destroyed
     */
    destroyMediaPlayer(mediaPlayer){
        let nativeMediaPlayer = mediaPlayer.nativeMediaPlayer;
        let nativeMediaPlayerPtr = mediaPlayer.nativeMediaPlayer.getNativePtr();
        this.ZegoNativeInstance.destroyMediaPlayer({ nativeMediaPlayer});
        this.mediaPlayers[nativeMediaPlayerPtr] = null;
    }

    /**
     * Starts to record locally captured audio or video and directly save the data to a file.
     *
     * Currently only one task can be recorded simultaneously.
     * This function needs to be called after the success of [startPreview] or [startPublishingStream] to be effective.
     * Developers should not [stopPreview] or [stopPublishingStream] during recording, otherwise the SDK will end the current recording task.
     * Developers will receive the [onCapturedDataRecordStateUpdate] and the [onCapturedDataRecordProgressUpdate] callback after start recording.
     * @param {ZegoDataRecordConfig} config - Record config
     * @param {ZegoPublishChannel} channel - Publishing stream channel
     */
    startRecordingCapturedData(config, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.startRecordingCapturedData({config, channel});
    }

    /**
     * Stops recording locally captured audio or video.
     *
     * @param {ZegoPublishChannel} channel - Publishing stream channel
     */
    stopRecordingCapturedData(channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.stopRecordingCapturedData({channel});
    }

    /**
     * Start network speed test.
     *
     * This function cannot be called together with [startPublishingStream], otherwise the network probe will automatically stop.
     * Developers can listen to the [onNetworkSpeedTestQualityUpdate] callback to get the speed test result, which will be called back every 3 seconds.
     * If an error occurs during the speed measurement process, [onNetworkSpeedTestError] callback will be triggered.
     * If this function is repeatedly called multiple times, the last invoke's configuration will be used.
     * @param {ZegoNetworkSpeedTestConfig} config - Network speed test configuration.
     */
    startNetworkSpeedTest(config){
        this.ZegoNativeInstance.startNetworkSpeedTest({config});
    }

    /**
     * Stop network speed test.
     *
     * After stopping the speed test, [onNetworkSpeedTestQualityUpdate] will no longer call back.
     */
    stopNetworkSpeedTest(){
        this.ZegoNativeInstance.stopNetworkSpeedTest({});
    }

    /**
     * Enables or disables custom video capture (for the specified channel).
     *
     * It must be set before the engine starts, that is, before calling [startPreview], [startPublishingStream]; and the configuration can be modified after the engine is stopped, that is, after calling [logoutRoom].
     * When the developer starts the custom capture, it can be set to receive notification of the start and stop of the custom capture by calling [setCustomVideoCaptureHandler].
     * @param {boolean} enable - enable or disable
     * @param {ZegoPublishChannel} channel - publish channel
     */
    enableCustomVideoCapture(enable, channel){
        this.ZegoNativeInstance.enableCustomVideoCapture({enable, channel});
    }

    /**
     * register custom video capture plugin
     *
     * @param {Number} plugin - video capture plugin
     * @param {ZegoPublishChannel} channel - publish channel
     */
    registerCustomVideoCapturePlugin(plugin, channel){
        this.ZegoNativeInstance.registerCustomVideoCapturePlugin({plugin, channel});
    }

    /**
     * unregister custom video capture plugin
     *
     * @param {Number} plugin - video capture plugin
     */
    unregisterCustomVideoCapturePlugin(plugin){
        this.ZegoNativeInstance.unregisterCustomVideoCapturePlugin({plugin});
    }

    /**
     * Initializes the Engine.
     *
     * The engine needs to be initialized before calling other functions
     * @param {number} appID - Application ID issued by ZEGO for developers, please apply from the ZEGO Admin Console https://console-express.zego.im The value ranges from 0 to 4294967295.
     * @param {string} appSign - Application signature for each AppID, please apply from the ZEGO Admin Console. Application signature is a 64 character string. Each character has a range of '0' ~ '9', 'a' ~ 'z'.
     * @param {boolean} isTestEnv - Choose to use a test environment or a formal commercial environment, the formal environment needs to submit work order configuration in the ZEGO management console. The test environment is for test development, with a limit of 10 rooms and 50 users. Official environment App is officially launched. ZEGO will provide corresponding server resources according to the configuration records submitted by the developer in the management console. The test environment and the official environment are two sets of environments and cannot be interconnected.
     * @param {ZegoScenario} scenario - The application scenario. Developers can choose one of ZegoScenario based on the scenario of the app they are developing, and the engine will preset a more general setting for specific scenarios based on the set scenario. After setting specific scenarios, developers can still call specific functions to set specific parameters if they have customized parameter settings.
     * @deprecated This method has been deprecated after version 0.25.3, please use the [initWithProfile] function to replace.
     */
     init(appID, appSign, isTestEnv, scenario){
        let tsfn = this.callEmit.bind(this);
        const that = this;
        that.isConsolePrintDebugInfo = isTestEnv;
        that.appID = appID;

        //get electron sdk version
        var SdkVersion = this.getVersion();

        return new Promise(function (resolve, reject) {
            that.ZegoNativeInstance = ZegoNativeSDK.CreateEngine({ appID, appSign, isTestEnv, scenario, tsfn, SdkVersion})
            if (that.ZegoNativeInstance === undefined) {
                reject("Zego Express init failed");
            }
            else {
                that.VideoViewManager = {
                    localGLRenders: [],
                    remoteGLRenders: []
                };
                that.mediaPlayers = [];
                console.log("Zego Express init succeed");
                resolve();
            };
        });
    }

    /**
     * Enables or disables custom video processing.
     *
     * When developers to open before the custom processing, by calling [setCustomVideoCaptureHandler] can be set up to receive a custom video processing of the original video data
     * Precondition： Call [CreateEngine] to initialize the Zego SDK
     * Call timing： must be set before calling [startPreview], [startPublishingStream]; The configuration cannot be changed again until the [logoutRoom] is called, otherwise the call will not take effect
     * Supported version： 2.2.0
     * @param {boolean} enable - enable or disable. disable by default
     * @param {ZegoPublishChannel} channel - Publishing stream channel
     */
    enableCustomVideoProcess(enable, channel){
        this.ZegoNativeInstance.enableCustomVideoProcess({enable, channel});
    }

	/**
     * register custom video process plugin
     *
     * @param {Number} plugin - video process plugin
     * @param {ZegoPublishChannel} channel - publish channel
     */
    registerCustomVideoProcessPlugin(plugin, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.registerCustomVideoProcessPlugin({plugin, channel});
    }

    /**
     * set custom video process cut region
     *
     * @param {Number} left - left cutting length (px)
     * @param {Number} top - top cutting length (px)
     * @param {Number} right - right cutting length (px)
     * @param {Number} bottom - bottom cutting length (px)
     * @param {ZegoPublishChannel} channel - Publishing stream channel
     */
    setCustomVideoProcessCutRegion(left, top, right, bottom, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.setCustomVideoProcessCutRegion({left, top, right, bottom, channel});
    }

    /**
     * Set play video stream type.
     *
     * Description: When the publish stream sets the codecID to SVC through [setVideoConfig], the puller can dynamically set and select different stream types (small resolution is one-half of the standard layer).
     * Use cases: In general, when the network is weak or the rendered UI window is small, you can choose to pull videos with small resolutions to save bandwidth.
     * When to call: before or after called [startPlayingStream].
     * Restrictions: None.
     * @param {string} streamID - Stream ID.
     * @param {ZegoVideoStreamType} streamType - Video stream type.
     */
     setPlayStreamVideoType(streamID, streamType){
        this.ZegoNativeInstance.setPlayStreamVideoType({streamID, streamType});
    }

    /**
     * Set the factors of concern that trigger traffic control.
     *
     * Description: Use this interface to control whether to start traffic control due to poor remote network conditions.
     * Default value: Default is disable.
     * When to call: After the engine is created [createEngine], Called before [startPublishingStream] can take effect.
     * Restrictions: The traffic control must be turned on [enableTrafficControl].
     * Related APIs: [enableTrafficControl.
     * @param {ZegoTrafficControlFocusOnMode} mode - When LOCAL_ONLY is selected, only the local network status is concerned. When choosing REMOTE, also take into account the remote network.
     * @param {ZegoPublishChannel} channel - When LOCAL_ONLY is selected, only the local network status is concerned. When choosing REMOTE, also take into account the remote network.
     */
     setTrafficControlFocusOn(mode, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.setTrafficControlFocusOn({mode, channel});
    }

    /**
     * @event ZegoExpressEngine#onDebugError
     * @desc The callback for obtaining debugging error information.
     *
     * When the SDK functions are not used correctly, the callback prompts for detailed error information, which is controlled by the [setDebugVerbose] function
     * @property {object} result - param object
     * @property {number} result.errorCode - Error code, please refer to the error codes document https://doc-en.zego.im/en/5548.html for details.
     * @property {string} result.funcName - Function name
     * @property {string} result.info - Detailed error information
     */

    /**
     * @event ZegoExpressEngine#onEngineStateUpdate
     * @desc The callback triggered when the audio/video engine state changes.
     *
     * When the developer calls the function that enables audio and video related functions, such as calling [startPreview], [startPublishingStream], [startPlayingStream] and MediaPlayer related function, the audio/video engine will start; when all audio and video functions are stopped, the engine state will become stopped.
     * When the developer has been [loginRoom], once [logoutRoom] is called, the audio/video engine will stop (preview, publishing/playing stream, MediaPlayer and other audio and video related functions will also stop).
     * @property {object} result - param object
     * @property {ZegoEngineState} result.state - The audio/video engine state
     */

    /**
     * @event ZegoExpressEngine#onRoomStateUpdate
     * @desc The callback triggered when the room connection state changes.
     *
     * This callback is triggered when the connection status of the room changes, and the reason for the change is notified. Developers can use this callback to determine the status of the current user in the room. If the connection is being requested for a long time, the general probability is that the user's network is unstable.
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID, a string of up to 128 bytes in length.
     * @property {ZegoRoomState} result.state - Changed room state
     * @property {number} result.errorCode - Error code, please refer to the error codes document https://doc-en.zego.im/en/5548.html for details.
     * @property {string} result.extendedData - Extended Information with state updates. When the room login is successful, the key "room_session_id" can be used to obtain the unique RoomSessionID of each audio and video communication, which identifies the continuous communication from the first user in the room to the end of the audio and video communication. It can be used in scenarios such as call quality scoring and call problem diagnosis.
     */

    /**
     * @event ZegoExpressEngine#onRoomUserUpdate
     * @desc The callback triggered when the number of other users in the room increases or decreases.
     *
     * Note that the callback is only triggered when the isUserStatusNotify parameter in the ZegoRoomConfig passed loginRoom function is true. Developers can use this callback to determine the situation of users in the room.
     * If developers need to use ZEGO room users notifications, please make sure that each login user sets isUserStatusNotify to true
     * When a user logs in to a room for the first time, other users already exist in this room, and a user list of the type of addition is received.
     * When the user is already in the room, other users in this room will trigger this callback to notify the changed users when they enter or exit the room.
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID where the user is logged in, a string of up to 128 bytes in length.
     * @property {ZegoUpdateType} result.updateType - Update type (add/delete)
     * @property {ZegoUser[]} result.userList - List of users changed in the current room
     */

    /**
     * @event ZegoExpressEngine#onRoomOnlineUserCountUpdate
     * @desc The callback triggered every 30 seconds to report the current number of online users.
     *
     * This function is called back every 30 seconds.
     * Developers can use this callback to show the number of user online in the current room.
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID where the user is logged in, a string of up to 128 bytes in length.
     * @property {number} result.count - Count of online users
     */

    /**
     * @event ZegoExpressEngine#onRoomStreamUpdate
     * @desc The callback triggered when the number of streams published by the other users in the same room increases or decreases.
     *
     * When a user logs in to a room for the first time, there are other users in the room who are publishing streams, and will receive a stream list of the added type.
     * When the user is already in the room, other users in this room will trigger this callback to notify the changed stream list when adding or deleting streams.
     * Developers can use this callback to determine if there are other users in the same room who have added or stopped streaming, in order to implement active play stream [startPlayingStream] or active stop playing stream [stopPlayingStream], and use simultaneous Changes to Streaming render UI widget;
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID where the user is logged in, a string of up to 128 bytes in length.
     * @property {ZegoUpdateType} result.updateType - Update type (add/delete)
     * @property {ZegoStream[]} result.streamList - Updated stream list
     * @property {string} result.extendedData - Extended information with stream updates.
     */

    /**
     * @event ZegoExpressEngine#onRoomStreamExtraInfoUpdate
     * @desc The callback triggered when there is an update on the extra information of the streams published by other users in the same room.
     *
     * When a user publishing the stream update the extra information of the stream in the same room, other users in the same room will receive the callback.
     * The stream extra information is an extra information identifier of the stream ID. Unlike the stream ID, which cannot be modified during the publishing process, the stream extra information can be modified midway through the stream corresponding to the stream ID.
     * Developers can synchronize variable content related to stream IDs based on stream additional information.
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID where the user is logged in, a string of up to 128 bytes in length.
     * @property {ZegoStream[]} result.streamList - List of streams that the extra info was updated.
     */

    /**
     * @event ZegoExpressEngine#onRoomExtraInfoUpdate
     * @desc The callback triggered when there is an update on the extra information of the room.
     *
     * When a user update the room extra information, other users in the same room will receive the callback.
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID where the user is logged in, a string of up to 128 bytes in length.
     * @property {ZegoRoomExtraInfo[]} result.roomExtraInfoList - List of the extra info updated.
     */

    /**
     * @event ZegoExpressEngine#onPublisherStateUpdate
     * @desc The callback triggered when the state of stream publishing changes.
     *
     * After publishing the stream successfully, the notification of the publish stream state change can be obtained through the callback function.
     * You can roughly judge the user's uplink network status based on whether the state parameter is in [PUBLISH_REQUESTING].
     * The parameter [extendedData] is extended information with state updates. If you use ZEGO's CDN content distribution network, after the stream is successfully published, the keys of the content of this parameter are [flv_url_list], [rtmp_url_list], [hls_url_list]. These correspond to the publishing stream URLs of the flv, rtmp, and hls protocols.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     * @property {ZegoPublisherState} result.state - State of publishing stream
     * @property {number} result.errorCode - The error code corresponding to the status change of the publish stream, please refer to the error codes document https://doc-en.zego.im/en/5548.html for details.
     * @property {string} result.extendedData - Extended information with state updates.
     */

    /**
     * @event ZegoExpressEngine#onPublisherQualityUpdate
     * @desc Callback for current stream publishing quality.
     *
     * After calling the [startPublishingStream] successfully, the callback will be received every 3 seconds. Through the callback, the collection frame rate, bit rate, RTT, packet loss rate and other quality data of the published audio and video stream can be obtained, and the health of the publish stream can be monitored in real time.
     * You can monitor the health of the published audio and video streams in real time according to the quality parameters of the callback function, in order to show the uplink network status in real time on the device UI.
     * If you does not know how to use the parameters of this callback function, you can only pay attention to the [level] field of the [quality] parameter, which is a comprehensive value describing the uplink network calculated by SDK based on the quality parameters.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     * @property {ZegoPublishStreamQuality} result.quality - Publishing stream quality, including audio and video framerate, bitrate, RTT, etc.
     */

    /**
     * @event ZegoExpressEngine#onPublisherCapturedAudioFirstFrame
     * @desc The callback triggered when the first audio frame is captured.
     *
     * After the [startPublishingStream] function is called successfully, this callback will be called when SDK received the first frame of audio data.
     * In the case of no startPublishingStream audio and video stream or preview, the first startPublishingStream audio and video stream or first preview, that is, when the engine of the audio and video module inside SDK starts, it will collect audio data of the local device and receive this callback.
     * Developers can use this callback to determine whether SDK has actually collected audio data. If the callback is not received, the audio capture device is occupied or abnormal.
     * @property {object} result - param object
     */

    /**
     * @event ZegoExpressEngine#onPublisherCapturedVideoFirstFrame
     * @desc The callback triggered when the first video frame is captured.
     *
     * After the [startPublishingStream] function is called successfully, this callback will be called when SDK received the first frame of video data.
     * In the case of no startPublishingStream video stream or preview, the first startPublishingStream video stream or first preview, that is, when the engine of the audio and video module inside SDK starts, it will collect video data of the local device and receive this callback.
     * Developers can use this callback to determine whether SDK has actually collected video data. If the callback is not received, the video capture device is occupied or abnormal.
     * @property {object} result - param object
     * @property {ZegoPublishChannel} result.channel - Publishing stream channel.If you only publish one audio and video stream, you can ignore this parameter.
     */

    /**
     * @event ZegoExpressEngine#onPublisherVideoSizeChanged
     * @desc The callback triggered when the video capture resolution changes.
     *
     * After the successful publish, the callback will be received if there is a change in the video capture resolution in the process of publishing the stream.
     * When the audio and video stream is not published or previewed for the first time, the publishing stream or preview first time, that is, the engine of the audio and video module inside the SDK is started, the video data of the local device will be collected, and the collection resolution will change at this time.
     * You can use this callback to remove the cover of the local preview UI and similar operations.You can also dynamically adjust the scale of the preview view based on the resolution of the callback.
     * @property {object} result - param object
     * @property {number} result.width - Video capture resolution width
     * @property {number} result.height - Video capture resolution height
     * @property {ZegoPublishChannel} result.channel - Publishing stream channel.If you only publish one audio and video stream, you can ignore this parameter.
     */

    /**
     * @event ZegoExpressEngine#onPublisherRelayCDNStateUpdate
     * @desc The callback triggered when the state of relayed streaming to CDN changes.
     *
     * After the ZEGO RTC server relays the audio and video streams to the CDN, this callback will be received if the CDN relay status changes, such as a stop or a retry.
     * Developers can use this callback to determine whether the audio and video streams of the relay CDN are normal. If they are abnormal, further locate the cause of the abnormal audio and video streams of the relay CDN and make corresponding disaster recovery strategies.
     * If you do not understand the cause of the abnormality, you can contact ZEGO technicians to analyze the specific cause of the abnormality.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     * @property {ZegoStreamRelayCDNInfo[]} result.infoList - List of information that the current CDN is relaying
     */

    /**
     * @event ZegoExpressEngine#onPlayerStateUpdate
     * @desc The callback triggered when the state of stream playing changes.
     *
     * After publishing the stream successfully, the notification of the publish stream state change can be obtained through the callback function.
     * You can roughly judge the user's downlink network status based on whether the state parameter is in [PLAY_REQUESTING].
     * @property {object} result - param object
     * @property {string} result.streamID - stream ID
     * @property {ZegoPlayerState} result.state - State of playing stream
     * @property {number} result.errorCode - The error code corresponding to the status change of the playing stream, please refer to the error codes document https://doc-en.zego.im/en/5548.html for details.
     * @property {string} result.extendedData - Extended Information with state updates. As the standby, only an empty json table is currently returned
     */

    /**
     * @event ZegoExpressEngine#onPlayerQualityUpdate
     * @desc Callback for current stream playing quality.
     *
     * After calling the [startPlayingStream] successfully, this callback will be triggered every 3 seconds. The collection frame rate, bit rate, RTT, packet loss rate and other quality data can be obtained, such the health of the publish stream can be monitored in real time.
     * You can monitor the health of the played audio and video streams in real time according to the quality parameters of the callback function, in order to show the downlink network status on the device UI in real time.
     * If you does not know how to use the various parameters of the callback function, you can only focus on the level field of the quality parameter, which is a comprehensive value describing the downlink network calculated by SDK based on the quality parameters.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     * @property {ZegoPlayStreamQuality} result.quality - Playing stream quality, including audio and video framerate, bitrate, RTT, etc.
     */

    /**
     * @event ZegoExpressEngine#onPlayerMediaEvent
     * @desc The callback triggered when a media event occurs during streaming playing.
     *
     * This callback is triggered when an event such as audio and video jamming and recovery occurs in the playing stream.
     * You can use this callback to make statistics on stutters or to make friendly displays in the UI of the app.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     * @property {ZegoPlayerMediaEvent} result.event - Specific events received when playing the stream.
     */

    /**
     * @event ZegoExpressEngine#onPlayerRecvAudioFirstFrame
     * @desc The callback triggered when the first audio frame is received.
     *
     * After the [startPlayingStream] function is called successfully, this callback will be called when SDK received the first frame of audio data.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     */

    /**
     * @event ZegoExpressEngine#onPlayerRecvVideoFirstFrame
     * @desc The callback triggered when the first video frame is received.
     *
     * After the [startPlayingStream] function is called successfully, this callback will be called when SDK received the first frame of video data.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     */

    /**
     * @event ZegoExpressEngine#onPlayerRenderVideoFirstFrame
     * @desc The callback triggered when the first video frame is rendered.
     *
     * After the [startPlayingStream] function is called successfully, this callback will be called when SDK rendered the first frame of video data.
     * Developer can use this callback to count time consuming that take the first frame time or update the UI for playing stream.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     */

    /**
     * @event ZegoExpressEngine#onPlayerVideoSizeChanged
     * @desc The callback triggered when the stream playback resolution changes.
     *
     * If there is a change in the video resolution of the playing stream, the callback will be triggered, and the user can adjust the display for that stream dynamically.
     * If the publishing stream end triggers the internal stream flow control of SDK due to a network problem, the encoding resolution of the streaming end may be dynamically reduced, and this callback will also be received at this time.
     * If the stream is only audio data, the callback will not be received.
     * This callback will be triggered when the played audio and video stream is actually rendered to the set UI play canvas. You can use this callback notification to update or switch UI components that actually play the stream.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     * @property {number} result.width - Video decoding resolution width
     * @property {number} result.height - Video decoding resolution height
     */

    /**
     * @event ZegoExpressEngine#onPlayerRecvSEI
     * @desc The callback triggered when Supplemental Enhancement Information is received.
     *
     * After the remote stream is successfully played, when the remote stream sends SEI (such as directly calling [sendSEI], audio mixing with SEI data, and sending custom video capture encoded data with SEI, etc.), the local end will receive this callback.
     * Since the video encoder itself generates an SEI with a payload type of 5, or when a video file is used for publishing, such SEI may also exist in the video file. Therefore, if the developer needs to filter out this type of SEI, it can be before [createEngine] Call [ZegoEngineConfig.advancedConfig("unregister_sei_filter", "XXXXX")]. Among them, unregister_sei_filter is the key, and XXXXX is the uuid filter string to be set.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     * @property {UInt8Array} result.data - SEI content
     */

    /**
     * @event ZegoExpressEngine#onAudioDeviceStateChanged
     * @desc The callback triggered when there is a change to audio devices (i.e. new device added or existing device deleted).
     *
     * This callback is triggered when an audio device is added or removed from the system. By listening to this callback, users can update the sound collection or output using a specific device when necessary.
     * @property {object} result - param object
     * @property {ZegoUpdateType} result.updateType - Update type (add/delete)
     * @property {ZegoAudioDeviceType} result.deviceType - Audio device type
     * @property {ZegoDeviceInfo} result.deviceInfo - Audio device information
     */

    /**
     * @event ZegoExpressEngine#onVideoDeviceStateChanged
     * @desc The callback triggered when there is a change to video devices (i.e. new device added or existing device deleted).
     *
     * This callback is triggered when a video device is added or removed from the system. By listening to this callback, users can update the video capture using a specific device when necessary.
     * @property {object} result - param object
     * @property {ZegoUpdateType} result.updateType - Update type (add/delete)
     * @property {ZegoDeviceInfo} result.deviceInfo - Audio device information
     */

    /**
     * @event ZegoExpressEngine#onCapturedSoundLevelUpdate
     * @desc The local captured audio sound level callback.
     *
     * To trigger this callback function, the [startSoundLevelMonitor] function must be called to start the sound level monitor and you must be in a state where it is publishing the audio and video stream or be in [startPreview] state.
     * The callback notification period is the setting parameter of [startSoundLevelMonitor].
     * @property {object} result - param object
     * @property {number} result.soundLevel - Locally captured sound level value, ranging from 0.0 to 100.0
     */

    /**
     * @event ZegoExpressEngine#onRemoteSoundLevelUpdate
     * @desc The remote playing streams audio sound level callback.
     *
     * To trigger this callback function, the [startSoundLevelMonitor] function must be called to start the sound level monitor and you must be in a state where it is playing the audio and video stream.
     * The callback notification period is the setting parameter of [startSoundLevelMonitor].
     * @property {object} result - param object
     * @property {Object} result.soundLevels - Remote sound level hash map, key is the streamID, value is the sound level value of the corresponding streamID, value ranging from 0.0 to 100.0
     */

    /**
     * @event ZegoExpressEngine#onCapturedAudioSpectrumUpdate
     * @desc The local captured audio spectrum callback.
     *
     * To trigger this callback function, the [startAudioSpectrumMonitor] function must be called to start the audio spectrum monitor and you must be in a state where it is publishing the audio and video stream or be in [startPreview] state.
     * The callback notification period is the setting parameter of [startAudioSpectrumMonitor].
     * @property {object} result - param object
     * @property {number[]} result.audioSpectrum - Locally captured audio spectrum value list. Spectrum value range is [0-2^30]
     */

    /**
     * @event ZegoExpressEngine#onRemoteAudioSpectrumUpdate
     * @desc The remote playing streams audio spectrum callback.
     *
     * To trigger this callback function, the [startAudioSpectrumMonitor] function must be called to start the audio spectrum monitor and you must be in a state where it is playing the audio and video stream.
     * The callback notification period is the setting parameter of [startAudioSpectrumMonitor].
     * @property {object} result - param object
     * @property {object} result.audioSpectrums - Remote audio spectrum hash map, key is the streamID, value is the audio spectrum list of the corresponding streamID. Spectrum value range is [0-2^30]
     */

    /**
     * @event ZegoExpressEngine#onDeviceError
     * @desc The callback triggered when a device exception occurs.
     *
     * This callback is triggered when an exception occurs when reading or writing the audio and video device.
     * @property {object} result - param object
     * @property {number} result.errorCode - The error code corresponding to the status change of the playing stream, please refer to the error codes document https://doc-en.zego.im/en/5548.html for details.
     * @property {string} result.deviceName - device name
     */

    /**
     * @event ZegoExpressEngine#onRemoteCameraStateUpdate
     * @desc The callback triggered when the state of the remote camera changes.
     *
     * When the state of the remote camera device changes, such as switching the camera, by monitoring this callback, it is possible to obtain an event related to the far-end camera, which can be used to prompt the user that the video may be abnormal.
     * Developers of 1v1 education scenarios or education small class scenarios and similar scenarios can use this callback notification to determine whether the camera device of the remote publishing stream device is working normally, and preliminary understand the cause of the device problem according to the corresponding state.
     * This callback will not be called back when the remote stream is play from the CDN, and will not be called back if the remote stream end user has enabled custom video capture function.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     * @property {ZegoRemoteDeviceState} result.state - Remote camera status
     */

    /**
     * @event ZegoExpressEngine#onRemoteMicStateUpdate
     * @desc The callback triggered when the state of the remote microphone changes.
     *
     * When the state of the remote microphone device is changed, such as switching a microphone, etc., by listening to the callback, it is possible to obtain an event related to the remote microphone, which can be used to prompt the user that the audio may be abnormal.
     * Developers of 1v1 education scenarios or education small class scenarios and similar scenarios can use this callback notification to determine whether the microphone device of the remote publishing stream device is working normally, and preliminary understand the cause of the device problem according to the corresponding state.
     * This callback will not be called back when the remote stream is play from the CDN, and will not be called back if the remote stream end user has enabled custom audio capture function.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     * @property {ZegoRemoteDeviceState} result.state - Remote microphone status
     */

    /**
     * @event ZegoExpressEngine#onRemoteSpeakerStateUpdate
     * @desc The callback triggered when the state of the remote speaker changes.
     *
     * When the state of the remote speaker device is changed, by listening to the callback, it is possible to obtain an event related to the remote speaker, which can be used to prompt the user that the audio may be abnormal.
     * Developers of 1v1 education scenarios or education small class scenarios and similar scenarios can use this callback notification to determine whether the speaker device of the remote publishing stream device is working normally, and preliminary understand the cause of the device problem according to the corresponding state.
     * This callback will not be called back when the remote stream is play from the CDN.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID
     * @property {ZegoRemoteDeviceState} result.state - Remote speaker status
     */

    /**
     * @event ZegoExpressEngine#onIMRecvBroadcastMessage
     * @desc The callback triggered when Broadcast Messages are received.
     *
     * This callback is used to receive broadcast messages sent by other users, and barrage messages sent by users themselves will not be notified through this callback.
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID
     * @property {ZegoBroadcastMessageInfo[]} result.messageList - list of received messages.
     */

    /**
     * @event ZegoExpressEngine#onIMRecvBarrageMessage
     * @desc The callback triggered when Barrage Messages are received.
     *
     * This callback is used to receive barrage messages sent by other users, and barrage messages sent by users themselves will not be notified through this callback.
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID
     * @property {ZegoBarrageMessageInfo[]} result.messageList - list of received messages.
     */

    /**
     * @event ZegoExpressEngine#onIMRecvCustomCommand
     * @desc The callback triggered when a Custom Command is received.
     *
     * This callback is used to receive custom signaling sent by other users, and barrage messages sent by users themselves will not be notified through this callback.
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID
     * @property {ZegoUser} result.fromUser - Sender of the command
     * @property {string} result.command - Command content received
     */

    /**
     * @event ZegoExpressEngine#onCapturedDataRecordStateUpdate
     * @desc The callback triggered when the state of data recording (to a file) changes.
     *
     * @property {object} result - param object
     * @property {ZegoDataRecordState} result.state - File recording status, according to which you should determine the state of the file recording or the prompt of the UI.
     * @property {number} result.errorCode - Error code, please refer to the error codes document https://doc-en.zego.im/en/5548.html for details.
     * @property {ZegoDataRecordConfig} result.config - Record config
     * @property {ZegoPublishChannel} result.channel - Publishing stream channel
     */

    /**
     * @event ZegoExpressEngine#onCapturedDataRecordProgressUpdate
     * @desc The callback to report the current recording progress.
     *
     * @property {object} result - param object
     * @property {ZegoDataRecordProgress} result.progress - File recording progress, which allows developers to hint at the UI, etc.
     * @property {ZegoDataRecordConfig} result.config - Record config
     * @property {ZegoPublishChannel} result.channel - Publishing stream channel
     */

    /**
     * @event ZegoExpressEngine#onNetworkModeChanged
     * @desc Callback for network mode changed.
     *
     * This callback will be called when the device's network mode changes, such as switching from WiFi to 5G, or when the network is disconnected.
     * @property {object} result - param object
     * @property {ZegoNetworkMode} result.mode - Current network mode.
     */

    /**
     * @event ZegoExpressEngine#onNetworkSpeedTestError
     * @desc The callback triggered when error occurred when testing network speed.
     *
     * @property {object} result - param object
     * @property {number} result.errorCode - The error code corresponding to the network speed test, please refer to the error codes document https://doc-en.zego.im/en/5548.html for details.
     * @property {ZegoNetworkSpeedTestType} result.type - Uplink or downlink
     */

    /**
     * @event ZegoExpressEngine#onNetworkSpeedTestQualityUpdate
     * @desc The callback triggered when quality updated when testing network speed.
     *
     * When error occurs or called stopNetworkSpeedTest, this callback will be stopped.
     * @property {object} result - param object
     * @property {ZegoNetworkSpeedTestQuality} result.quality - Network speed quality
     * @property {ZegoNetworkSpeedTestType} result.type - Uplink or downlink
     */

    /**
     * @event ZegoExpressEngine#onRecvExperimentalAPI
     * @desc Receive custom JSON content
     *
     * @property {object} result - param object
     * @property {string} result.content - JSON string content
     */


    callEmit() {
        try {
            if (arguments[0] === "onCapturedVideoFrameRawData") {
                let channel = arguments[1]["channel"];
                let videoFrame = {
                    "channel": channel,
                    "videoFrameParam": arguments[1]["videoFrameParam"],
                    "videoFrameBuffer": Buffer.from(arguments[1]["videoFrameBuffer"])
                }
                this.VideoViewManager.localGLRenders[channel].drawVideoFrame(videoFrame);
            }
            else if (arguments[0] === "onRemoteVideoFrameRawData") {
                let streamID = arguments[1]["streamID"];
                let videoFrame = {
                    "streamID": streamID,
                    "videoFrameParam": arguments[1]["videoFrameParam"],
                    "videoFrameBuffer": Buffer.from(arguments[1]["videoFrameBuffer"])
                }
                this.VideoViewManager.remoteGLRenders[streamID].drawVideoFrame(videoFrame);
            }
            else if (arguments[0] === "onDebugInfo") {
                if (this.isConsolePrintDebugInfo) {
                    console.info(arguments[1]["info"]);
                }
            }
            else if (arguments[0] === "onDebugError") {
                if (this.isConsolePrintDebugInfo) {
                    console.error(`onDebugError: funcName=${arguments[1]["funcName"]} ErrorCode=${arguments[1]["errorCode"]} ErrorInfo=${arguments[1]["errorInfo"]}`)
                    // dialog.showErrorBox(arguments[1]["alertTitle"], arguments[1]["alertBody"]);
                }
            }
            else if(arguments[0].startsWith("MEDIAPLAYER_")){
                let mediaPlayer = this.mediaPlayers[arguments[1]["nativeMediaPlayerPtr"]];
                if(mediaPlayer){
                    mediaPlayer.callEmit(arguments[0].replace("MEDIAPLAYER_", ""), arguments[1])
                }
            }
            else {
                const highFrequencyCallbacks = ["onPublisherQualityUpdate",
                "onPlayerQualityUpdate", "onMixerSoundLevelUpdate",
                "onCapturedSoundLevelUpdate", "onRemoteSoundLevelUpdate",
                "onCapturedAudioSpectrumUpdate", "onRemoteAudioSpectrumUpdate",
                "MEDIAPLAYER_onMediaPlayerPlayingProgress", "onRoomOnlineUserCountUpdate"];
                if(!highFrequencyCallbacks.includes(arguments[0]) && this.isConsolePrintDebugInfo){
                    console.log(arguments[0], arguments[1]);
                }
            }
        } catch (error) {
            // console.log("callEmit: ", error);
        }
        try {
            this.emit(arguments[0], arguments[1]);
        } catch (error) {
            console.log(`error catched in your callback ${arguments[0]} : ${error}`)
        }
    }
}

const ZegoExpressEngineInstance = new ZegoExpressEngine;
module.exports = ZegoExpressEngineInstance;
