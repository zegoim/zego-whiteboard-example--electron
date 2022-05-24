
let ZegoExpressNodeNativePath = "";
let os = require("os");
if (os.platform() === "win32") {
    if (process.arch === "x64") {
        ZegoExpressNodeNativePath = "./win/x64/ZegoExpressNodeNative";
    }
    else {
        ZegoExpressNodeNativePath = "./win/x86/ZegoExpressNodeNative";
    }
}
else if (os.platform() === "darwin") {
    ZegoExpressNodeNativePath = "./mac/ZegoExpressNodeNative";
}
else {
    throw ("Platform not supported")
}

const EventEmitter = require('events').EventEmitter;
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
     * Create ZegoExpressEngine singleton object and initialize SDK.
     *
     * Available since: 2.14.0
     * Description: Create ZegoExpressEngine singleton object and initialize SDK.
     * When to call: The engine needs to be created before calling other functions.
     * Restrictions: None.
     * Caution: The SDK only supports the creation of one instance of ZegoExpressEngine. Multiple calls to this function return the same object.
     * @param {ZegoEngineProfile} profile - The basic configuration information is used to create the engine.
     */
    createEngine(profile){
        let tsfn = this.callEmit.bind(this);
        const that = this;
        that.debugAssistant = false;
        that.appID = profile.appID;

        // Get electron SDK version
        var electronVersion = PackageJson.version;

        return new Promise(function (resolve, reject) {
            that.ZegoNativeInstance = ZegoNativeSDK.CreateEngine({ profile, tsfn, electronVersion });
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
     * Destroy the ZegoExpressEngine singleton object and deinitialize the SDK.
     *
     * Available since: 1.1.0
     * Description: Destroy the ZegoExpressEngine singleton object and deinitialize the SDK.
     * When to call: When the SDK is no longer used, the resources used by the SDK can be released through this interface
     * Restrictions: None.
     * Caution: After using [createEngine] to create a singleton, if the singleton object has not been created or has been destroyed, you will not receive related callbacks when calling this function.
     */
    destroyEngine(){
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
     * Available since: 1.1.0
     * Description: Used to enable advanced functions.
     * When to call: Different configurations have different call timing requirements. For details, please consult ZEGO technical support.
     * Restrictions: None.
     * @param {ZegoEngineConfig} config - Advanced engine configuration
     */
    setEngineConfig(config){
        ZegoNativeSDK.SetEngineConfig({ config });
    }

    /**
     * Set log configuration.
     *
     * Available since: 2.3.0
     * Description: If you need to customize the log file size and path, please call this function to complete the configuration.
     * When to call: It must be set before calling [createEngine] to take effect. If it is set after [createEngine], it will take effect at the next [createEngine] after [destroyEngine].
     * Restrictions: None.
     * Caution: Once this interface is called, the method of setting log size and path via [setEngineConfig] will be invalid.Therefore, it is not recommended to use [setEngineConfig] to set the log size and path.
     * @param {ZegoLogConfig} config - log configuration.
     */
    setLogConfig(config){
        ZegoNativeSDK.SetLogConfig({ config });
    }

    /**
     * Set room mode.
     *
     * Available since: 2.9.0
     * Description: If you need to use the multi-room feature, please call this function to complete the configuration.
     * When to call: Must be set before calling [createEngine] to take effect, otherwise it will fail.
     * Restrictions: If you need to use the multi-room feature, please contact the instant technical support to configure the server support.
     * Caution: None.
     * @param {ZegoRoomMode} mode - Room mode. Description: Used to set the room mode. Use cases: If you need to enter multiple rooms at the same time for publish-play stream, please turn on the multi-room mode through this interface. Required: True. Default value: ZEGO_ROOM_MODE_SINGLE_ROOM.
     */
    setRoomMode(mode){
        ZegoNativeSDK.SetRoomMode({ mode });
    }

    /**
     * Gets the SDK's version number.
     *
     * Available since: 1.1.0
     * Description: If you encounter an abnormality during the running of the SDK, you can submit the problem, log and other information to the ZEGO technical staff to locate and troubleshoot. Developers can also collect current SDK version information through this API, which is convenient for App operation statistics and related issues.
     * When to call: Any time.
     * Restrictions: None.
     * Caution: None.
     * @return {string} - SDK version.
     */
    getVersion(){
        return ZegoNativeSDK.GetNativeDllVersion({});
    }

    /**
     * Uploads logs to the ZEGO server.
     *
     * Available since: 1.1.0
     * Description: By default, SDK creates and prints log files in the App's default directory. Each log file defaults to a maximum of 5MB. Three log files are written over and over in a circular fashion. When calling this function, SDK will auto package and upload the log files to the ZEGO server.
     * Use cases: Developers can provide a business “feedback” channel in the App. When users feedback problems, they can call this function to upload the local log information of SDK to help locate user problems.
     * When to call: After [createEngine].
     * Restrictions: If you call this interface repeatedly within 10 minutes, only the last call will take effect.
     * Caution: After calling this interface to upload logs, if you call [destroyEngine] or exit the App too quickly, there may be a failure.It is recommended to wait a few seconds, and then call [destroyEngine] or exit the App after receiving the upload success callback.
     */
    uploadLog(){
        this.ZegoNativeInstance.uploadLog({});
    }

    /**
     * Enable the debugg assistant. Note, do not enable this feature in the online version! Use only during development phase!
     *
     * Available since: 2.17.0
     * Description: After enabled, the SDK will print logs to the console, and will pop-up an alert (toast) UI message when there is a problem with calling other SDK functions.
     * Default value: This function is disabled by default.
     * When to call: This function can be called right after [createEngine].
     * Platform differences: The pop-up alert function only supports Android / iOS / macOS / Windows, and the console log function supports all platforms.
     * Caution: Be sure to confirm that this feature is turned off before the app is released to avoid pop-up UI alert when an error occurs in your release version's app. It is recommended to associate the [enable] parameter of this function with the DEBUG variable of the app, that is, only enable the debugg assistant in the DEBUG environment.
     * Restrictions: None.
     * @param {boolean} enable - Whether to enable the debugg assistant.
     */
    enableDebugAssistant(enable){
        this.debugAssistant = enable;
        this.ZegoNativeInstance.enableDebugAssistant({enable});
    }

    /**
     * Call the RTC experimental API.
     *
     * Available since: 2.7.0
     * Description: ZEGO provides some technical previews or special customization functions in RTC business through this API. If you need to get the use of the function or the details, please consult ZEGO technical support.
     * When to call: After [createEngine].
     * @param {string} params - You need to pass in a parameter in the form of a JSON string, please consult ZEGO technical support for details.
     * @return {string} - Returns an argument in the format of a JSON string, please consult ZEGO technical support for details.
     */
    callExperimentalAPI(params){
        return this.ZegoNativeInstance.callExperimentalAPI({params});
    }

    /**
     * Set the path of the static picture would be published when the camera is closed.
     *
     * Available: since 2.9.0
     * Description: Set the path of the static picture would be published when enableCamera(false) is called, it would start to publish static pictures, and when enableCamera(true) is called, it would end publishing static pictures.
     * Use case: The developer wants to display a static picture when the camera is closed. For example, when the anchor exits the background, the camera would be actively closed. At this time, the audience side needs to display the image of the anchor temporarily leaving.
     * When to call: After the engine is initialized, call this API to configure the parameters before closing the camera.
     * Restrictions: 
     *   1. Supported picture types are JPEG/JPG, PNG, BMP, HEIF.
     *   2. The function is only for SDK video capture and does not take effect for custom video capture.
     * Caution: 
     *   1. The static picture cannot be seen in the local preview.
     *   2. External filters, mirroring, watermarks, and snapshots are all invalid.
     *   3. If the picture aspect ratio is inconsistent with the set code aspect ratio, it will be cropped according to the code aspect ratio.
     * Platform differences: 
     *   1. Windows: Fill in the location of the picture directly, such as "D://dir//image.jpg".
     *   2. iOS: If it is a full path, add the prefix "file:", such as @"file:/var/image.png"; If it is a assets picture path, add the prefix "asset:", such as @"asset:watermark".
     *   3. Android: If it is a full path, add the prefix "file:", such as "file:/sdcard/image.png"; If it is a assets directory path, add the prefix "asset:", such as "asset:watermark.png".
     * @param {string} filePath - Picture file path
     * @param {ZegoPublishChannel} channel - Publish channel.
     */
    setDummyCaptureImagePath(filePath, channel){
        this.ZegoNativeInstance.setDummyCaptureImagePath({filePath, channel});
    }

    /**
     * Log in to the room by configuring advanced properties, and return the login result through the callback parameter. You must log in to the room before pushing or pulling the stream.
     *
     * Available since: 2.18.0
     * Description: SDK uses the 'room' to organize users. After users log in to a room, they can use interface such as push stream [startPublishingStream], pull stream [startPlayingStream], send and receive broadcast messages [sendBroadcastMessage], etc. To prevent the app from being impersonated by a malicious user, you can add authentication before logging in to the room, that is, the [token] parameter in the ZegoRoomConfig object passed in by the [config] parameter.
     * Use cases: In the same room, users can conduct live broadcast, audio and video calls, etc.
     * When to call /Trigger: This interface is called after [createEngine] initializes the SDK.
     * Restrictions: For restrictions on the use of this function, please refer to https://docs.zegocloud.com/article/7611 or contact ZEGO technical support.
     * Caution:
     *   1. Apps that use different appIDs cannot intercommunication with each other.
     *   2. SDK supports startPlayingStream audio and video streams from different rooms under the same appID, that is, startPlayingStream audio and video streams across rooms. Since ZegoExpressEngine's room related callback notifications are based on the same room, when developers want to startPlayingStream streams across rooms, developers need to maintain related messages and signaling notifications by themselves.
     *   3. It is strongly recommended that userID corresponds to the user ID of the business APP, that is, a userID and a real user are fixed and unique, and should not be passed to the SDK in a random userID. Because the unique and fixed userID allows ZEGO technicians to quickly locate online problems.
     *   4. After the first login failure due to network reasons or the room is disconnected, the default time of SDK reconnection is 20min.
     *   5. After the user has successfully logged in to the room, if the application exits abnormally, after restarting the application, the developer needs to call the logoutRoom interface to log out of the room, and then call the loginRoom interface to log in to the room again.
     * Privacy reminder: Please do not fill in sensitive user information in this interface, including but not limited to mobile phone number, ID number, passport number, real name, etc.
     * Related callbacks:
     *   1. When the user starts to log in to the room, the room is successfully logged in, or the room fails to log in, the [onRoomStateChanged] (Not supported before 2.18.0, please use [onRoomStateUpdate]) callback will be triggered to notify the developer of the status of the current user connected to the room.
     *   2. Different users who log in to the same room can get room related notifications in the same room (eg [onRoomUserUpdate], [onRoomStreamUpdate], etc.), and users in one room cannot receive room signaling notifications in another room.
     *   3. If the network is temporarily interrupted due to network quality reasons, the SDK will automatically reconnect internally. You can get the current connection status of the local room by listening to the [onRoomStateChanged] (Not supported before 2.18.0, please use [onRoomStateUpdate]) callback method, and other users in the same room will receive [onRoomUserUpdate] callback notification.
     *   4. Messages sent in one room (e.g. [setStreamExtraInfo], [sendBroadcastMessage], [sendBarrageMessage], [sendCustomCommand], etc.) cannot be received callback ((eg [onRoomStreamExtraInfoUpdate], [onIMRecvBroadcastMessage], [onIMRecvBarrageMessage], [onIMRecvCustomCommand], etc) in other rooms. Currently, SDK does not provide the ability to send messages across rooms. Developers can integrate the SDK of third-party IM to achieve.
     * Related APIs:
     *   1. Users can call [logoutRoom] to log out. In the case that a user has successfully logged in and has not logged out, if the login interface is called again, the console will report an error and print the error code 1002001.
     *   2. SDK supports multi-room login, please call [setRoomMode] function to select multi-room mode before engine initialization, and then call [loginRoom] to log in to multi-room.
     *   3. Calling [destroyEngine] will also automatically log out.
     * @param {string} roomID - Room ID, a string of up to 128 bytes in length. Only support numbers, English characters and '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'.
     * @param {ZegoUser} user - User object instance, configure userID, userName. Note that the userID needs to be globally unique with the same appID, otherwise the user who logs in later will kick out the user who logged in first.
     * @param {ZegoRoomConfig} config - Advanced room configuration.
     */
    loginRoom(roomID, user, config = { maxMemberCount:0, isUserStatusNotify: false, token:'' }){
        config = Object.assign({ maxMemberCount:0, isUserStatusNotify: false, token:'' }, config);
        this.ZegoNativeInstance.loginRoom({roomID, user, config});
    }

    /**
     * Logs out of a room.
     *
     * Available since: 1.1.0
     * Description: This API will log out the room named roomID.
     * Use cases: In the same room, users can conduct live broadcast, audio and video calls, etc.
     * When to call /Trigger: After successfully logging in to the room, if the room is no longer used, the user can call the function [logoutRoom].
     * Restrictions: None.
     * Caution: 1. Exiting the room will stop all publishing and playing streams for user, and inner audio and video engine will stop, and then SDK will auto stop local preview UI. If you want to keep the preview ability when switching rooms, please use the [switchRoom] method. 2. If the user logs in to the room, but the incoming 'roomID' is different from the logged-in room name, SDK will return failure.
     * Related callbacks: After calling this function, you will receive [onRoomStateChanged] (Not supported before 2.18.0, please use [onRoomStateUpdate]) callback notification successfully exits the room, while other users in the same room will receive the [onRoomUserUpdate] callback notification(On the premise of enabling isUserStatusNotify configuration).
     * Related APIs: Users can use [loginRoom], [switchRoom] functions to log in or switch rooms.
     * @param {string} roomID - Room ID, a string of up to 128 bytes in length. Only support numbers, English characters and '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'.
     */
    logoutRoom(roomID){
        this.ZegoNativeInstance.logoutRoom({roomID});
    }

    /**
     * Switch the room with advanced room configurations.
     *
     * Available since: 1.15.0
     * Description: Using this interface allows users to quickly switch from one room to another room.
     * Use cases: if you need to quickly switch to the next room, you can call this function.
     * When to call /Trigger: After successfully login room.
     * Restrictions: None.
     * Caution:
     *   1. When this function is called, all streams currently publishing or playing will stop (but the local preview will not stop).
     *   2. To prevent the app from being impersonated by a malicious user, you can add authentication before logging in to the room, that is, the [token] parameter in the ZegoRoomConfig object passed in by the [config] parameter. This parameter configuration affects the room to be switched over. 3. When the function [setRoomMode] is used to set ZegoRoomMode to ZEGO_ROOM_MODE_MULTI_ROOM, this function is not available.
     * Privacy reminder: Please do not fill in sensitive user information in this interface, including but not limited to mobile phone number, ID number, passport number, real name, etc.
     * Related callbacks: When the user call the [switchRoom] function, the [onRoomStateChanged] (Not supported before 2.18.0, please use [onRoomStateUpdate]) callback will be triggered to notify the developer of the status of the current user connected to the room.
     * Related APIs: Users can use the [logoutRoom] function to log out of the room.
     * @param {string} fromRoomID - Current roomID.
     * @param {string} toRoomID - The next roomID.
     * @param {ZegoRoomConfig} config - Advanced room configuration.
     */
    switchRoom(fromRoomID, toRoomID, config = { maxMemberCount:0, isUserStatusNotify: false, token:'' }){
        config = Object.assign({ maxMemberCount:0, isUserStatusNotify: false, token:'' }, config);
        this.ZegoNativeInstance.switchRoom({fromRoomID, toRoomID, config});
    }

    /**
     * Renew token.
     *
     * Available since: 2.8.0
     * Description: After the developer receives [onRoomTokenWillExpire], they can use this API to update the token to ensure that the subsequent RTC functions are normal.
     * Use cases: Used when the token is about to expire.
     * When to call /Trigger: After the developer receives [onRoomTokenWillExpire].
     * Restrictions: None.
     * Caution: The token contains important information such as the user's room permissions, publish stream permissions, and effective time, please refer to https://docs.zegocloud.com/article/11649.
     * Related callbacks: None.
     * Related APIs: None.
     * @param {string} roomID - Room ID.
     * @param {string} token - The token that needs to be renew.
     */
    renewToken(roomID, token){
        this.ZegoNativeInstance.renewToken({roomID, token});
    }

    /**
     * Set room extra information.
     *
     * Available since: 1.13.0
     * Description: The user can call this function to set the extra info of the room.
     * Use cases: You can set some room-related business attributes, such as whether someone is Co-hosting.
     * When to call /Trigger: After logging in the room successful.
     * Restrictions: For restrictions on the use of this function, please refer to https://docs.zegocloud.com/article/7611 or contact ZEGO technical support.
     * Caution: 'key' is non null. The length of key and value is limited, please refer to Restrictions. The newly set key and value will overwrite the old setting.
     * Related callbacks: Other users in the same room will be notified through the [onRoomExtraInfoUpdate] callback function.
     * Related APIs: None.
     * @param {string} roomID - Room ID.
     * @param {string} key - key of the extra info.
     * @param {string} value - value if the extra info.
     * @return {Promise<number>} - Set room extra info execution result notification
     */
    setRoomExtraInfo(roomID, key, value){
        return this.ZegoNativeInstance.setRoomExtraInfo({roomID, key, value});
    }

    /**
     * Starts publishing a stream. Support multi-room mode.
     *
     * Available since: 1.1.0
     * Description: Users push their local audio and video streams to the ZEGO RTC server or CDN, and other users in the same room can pull the audio and video streams to watch through the `streamID` or CDN pull stream address.
     * Use cases: It can be used to publish streams in real-time connecting wheat, live broadcast and other scenarios.
     * When to call: After [loginRoom].
     * Restrictions: None.
     * Caution:
     *   1. Before start to publish the stream, the user can choose to call [setVideoConfig] to set the relevant video parameters, and call [startPreview] to preview the video.
     *   2. Other users in the same room can get the streamID by monitoring the [onRoomStreamUpdate] event callback after the local user publishing stream successfully.
     *   3. In the case of poor network quality, user publish may be interrupted, and the SDK will attempt to reconnect. You can learn about the current state and error information of the stream published by monitoring the [onPublisherStateUpdate] event.
     *   4. To call [SetRoomMode] function to select multiple rooms, the room ID must be specified explicitly.
     * @param {string} streamID - Stream ID, a string of up to 256 characters, needs to be globally unique within the entire AppID. If in the same AppID, different users publish each stream and the stream ID is the same, which will cause the user to publish the stream failure. You cannot include URL keywords, otherwise publishing stream and playing stream will fails. Only support numbers, English characters and '~', '!', '@', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'.
     * @param {ZegoPublisherConfig} config - Advanced publish configuration.
     * @param {ZegoPublishChannel} channel - Publish stream channel.
     */
    startPublishingStream(streamID, config, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.startPublishingStream({streamID, config, channel});
    }

    /**
     * Stops publishing a stream (for the specified channel).
     *
     * Available since: 1.1.0
     * Description: The user stops sending local audio and video streams, and other users in the room will receive a stream deletion notification.
     * Use cases: It can be used to stop publish streams in real-time connecting wheat, live broadcast and other scenarios.
     * When to call: After [startPublishingStream].
     * Restrictions: None.
     * Caution:
     *   1. After stopping the streaming, other users in the same room can receive the delete notification of the stream by listening to the [onRoomStreamUpdate] callback.
     *   2. If the user has initiated publish flow, this function must be called to stop the publish of the current stream before publishing the new stream (new streamID), otherwise the new stream publish will return a failure.
     *   3. After stopping streaming, the developer should stop the local preview based on whether the business situation requires it.
     * @param {ZegoPublishChannel} channel - Publish stream channel.
     */
    stopPublishingStream(channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.stopPublishingStream({channel});
    }

    /**
     * Sets the extra information of the stream being published for the specified publish channel.
     *
     * Available since: 1.1.0
     * Description: Use this function to set the extra info of the stream. The stream extra information is an extra information identifier of the stream ID. Unlike the stream ID, which cannot be modified during the publishing process, the stream extra information can be modified midway through the stream corresponding to the stream ID. Developers can synchronize variable content related to stream IDs based on stream additional information.
     * When to call: After the engine is created [createEngine], Called before and after [startPublishingStream] can both take effect.
     * Restrictions: None.
     * Related callbacks: Users can obtain the execution result of the function through [ZegoPublisherSetStreamExtraInfoCallback] callback.
     * @param {string} extraInfo - Stream extra information, a string of up to 1024 characters.
     * @param {ZegoPublishChannel} channel - Publish stream channel.
     * @return {Promise<number>} - Set stream extra information execution result notification.
     */
    setStreamExtraInfo(extraInfo, channel = ZegoPublishChannel.Main){
        return this.ZegoNativeInstance.setStreamExtraInfo({extraInfo, channel});
    }

    /**
     * Starts/Updates the local video preview (for the specified channel).
     *
     * Available since: 1.1.0
     * Description: The user can see his own local image by calling this function.
     * Use cases: It can be used for local preview in real-time connecting wheat, live broadcast and other scenarios.
     * When to call: After [createEngine].
     * Restrictions: None.
     * Caution: 1. The preview function does not require you to log in to the room or publish the stream first. But after exiting the room, SDK internally actively stops previewing by default. 2. Local view and preview modes can be updated by calling this function again. The user can only preview on one view. If you call [startPreview] again to pass in a new view, the preview screen will only be displayed in the new view. 3. You can set the mirror mode of the preview by calling the [setVideoMirrorMode] function. The default preview setting is image mirrored. 4. When this function is called, the audio and video engine module inside SDK will start really, and it will start to try to collect audio and video..
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
     * Available since: 1.1.0
     * Description: This function can be called to stop previewing when there is no need to see the preview locally.
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
     * Available since: 1.1.0
     * Description: Set the video frame rate, bit rate, video capture resolution, and video encoding output resolution.
     * Default value: The default video capture resolution is 360p, the video encoding output resolution is 360p, the bit rate is 600 kbps, and the frame rate is 15 fps.
     * When to call: After [createEngine].
     * Restrictions: It is necessary to set the relevant video configuration before publishing the stream or startPreview, and only support the modification of the encoding resolution and the bit rate after publishing the stream.
     * Caution: Developers should note that the wide and high resolution of the mobile end is opposite to the wide and high resolution of the PC. For example, in the case of 360p, the resolution of the mobile end is 360x640, and the resolution of the PC end is 640x360.
     * @param {(ZegoVideoConfigPreset|ZegoVideoConfig)} config - Video configuration, the SDK provides a common setting combination of resolution, frame rate and bit rate, they also can be customized.
     * @param {ZegoPublishChannel} channel - Publish stream channel.
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
     * Available since: 1.1.0
     * Description: Set whether the local preview video and the published video have mirror mode enabled. For specific mirroring mode.
     * When to call: After [createEngine].
     * Restrictions: None.
     * @param {ZegoVideoMirrorMode} mirrorMode - Mirror mode for previewing or publishing the stream.
     * @param {ZegoPublishChannel} channel - Publish stream channel.
     */
    setVideoMirrorMode(mirrorMode, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.setVideoMirrorMode({mirrorMode, channel});
    }

    /**
     * Sets up the audio configurations.
     *
     * Available since: 1.3.4
     * Description: You can set the combined value of the audio codec, bit rate, and audio channel through this function. If the preset value cannot meet the developer's scenario, the developer can set the parameters according to the business requirements.
     * Default value: The default audio config refers to the default value of [ZegoAudioConfig]. 
     * When to call: After the engine is created [createEngine], and before publishing [startPublishingStream].
     * Restrictions: None.
     * Caution: Act on the main publish channel ZegoPublishChannel.Main.
     * Related APIs: [getAudioConfig].
     * @param {(ZegoAudioConfigPreset|ZegoAudioConfig)} config - Audio config.
     */
    setAudioConfig(config){
        this.ZegoNativeInstance.setAudioConfig({config});
    }

    /**
     * Gets the current audio configurations.
     *
     * Available since: 1.8.0
     * Description: You can get the current audio codec, bit rate, and audio channel through this function.
     * When to call: After the engine is created [createEngine].
     * Restrictions: None.
     * Caution: Act on the main publish channel ZegoPublishChannel.Main.
     * Related APIs: [setAudioConfig].
     * @return {ZegoAudioConfig} - Audio config.
     */
    getAudioConfig(){
        return this.ZegoNativeInstance.getAudioConfig({});
    }

    /**
     * Take a snapshot of the publishing stream for the specified publish channel.
     *
     * Available since: 1.17.0
     * Description: Take a snapshot of the publishing stream.
     * When to call: Called this function after calling [startPublishingStream] or [startPreview].
     * Restrictions: None.
     * Caution: The resolution of the snapshot is the encoding resolution set in [setVideoConfig]. If you need to change it to capture resolution, please call [setCapturePipelineScaleMode] to change the capture pipeline scale mode to [Post].
     * Related callbacks: The screenshot result will be called back through [ZegoPublisherTakeSnapshotCallback].
     * Related APIs: [takePlayStreamSnapshot].
     * @param {ZegoPublishChannel} channel - Publish stream channel.
     * @return {Promise<number>} - Results of take publish stream snapshot.
     */
    takePublishStreamSnapshot(channel = ZegoPublishChannel.Main){
        return this.ZegoNativeInstance.takePublishStreamSnapshot({channel});
    }

    /**
     * Stops or resumes sending the audio part of a stream for the specified channel.
     *
     * Available since: 1.1.0
     * Description: This function can be called when publishing the stream to realize not publishing the audio data stream. The SDK still collects and processes the audio, but does not send the audio data to the network.
     * When to call: Called after the engine is created [createEngine] can take effect.
     * Restrictions: None.
     * Related callbacks: If you stop sending audio streams, the remote user that play stream of local user publishing stream can receive `Mute` status change notification by monitoring [onRemoteMicStateUpdate] callbacks.
     * Related APIs: [mutePublishStreamVideo].
     * @param {boolean} mute - Whether to stop sending audio streams, true means not to send audio stream, and false means sending audio stream. The default is false.
     * @param {ZegoPublishChannel} channel - Publish stream channel.
     */
    mutePublishStreamAudio(mute, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.mutePublishStreamAudio({mute, channel});
    }

    /**
     * Stops or resumes sending the video part of a stream for the specified channel.
     *
     * Available since: 1.1.0
     * Description: This function can be called when publishing the stream to realize not publishing the video stream. The local camera can still work normally, can capture, preview and process video images normally, but does not send the video data to the network.
     * When to call: Called after the engine is created [createEngine] can take effect.
     * Restrictions: None.
     * Related callbacks: If you stop sending video streams locally, the remote user that play stream of local user publishing stream can receive `Mute` status change notification by monitoring [onRemoteCameraStateUpdate] callbacks.
     * Related APIs: [mutePublishStreamAudio].
     * @param {boolean} mute - Whether to stop sending video streams, true means not to send video stream, and false means sending video stream. The default is false.
     * @param {ZegoPublishChannel} channel - Publish stream channel.
     */
    mutePublishStreamVideo(mute, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.mutePublishStreamVideo({mute, channel});
    }

    /**
     * Enables or disables traffic control.
     *
     * Available since: 1.5.0
     * Description: Enabling traffic control allows the SDK to adjust the audio and video streaming bitrate according to the current upstream network environment conditions, or according to the counterpart's downstream network environment conditions in a one-to-one interactive scenario, to ensure smooth results. At the same time, you can further specify the attributes of traffic control to adjust the corresponding control strategy.
     * Default value: Enable.
     * When to call: After the engine is created [createEngine], Called before [startPublishingStream] can take effect.
     * Restrictions: Only support RTC publish.
     * Caution: Act on the main publish channel ZegoPublishChannel.Main.
     * @param {boolean} enable - Whether to enable traffic control. The default is ture.
     * @param {number} property - Adjustable property of traffic control, bitmask OR format. Should be one or the combinations of [ZegoTrafficControlProperty] enumeration. [AdaptiveFPS] as default.
     */
    enableTrafficControl(enable, property){
        this.ZegoNativeInstance.enableTrafficControl({enable, property});
    }

    /**
     * Set the minimum video bitrate threshold for traffic control.
     *
     * Available since: 1.1.0
     * Description: Set the control strategy when the video bitrate reaches the lowest threshold during flow control. When the bitrate is lower than the minimum threshold, you can choose not to send video data or send it at a very low frame bitrate.
     * Default value: There is no control effect of the lowest threshold of video bitrate.
     * When to call: After the engine is created [createEngine], Called before [startPublishingStream] can take effect.
     * Restrictions: The traffic control must be turned on [enableTrafficControl].
     * Caution: Act on the main publish channel ZegoPublishChannel.Main.
     * Related APIs: [enableTrafficControl].
     * @param {number} bitrate - Minimum video bitrate threshold for traffic control(kbps).
     * @param {ZegoTrafficControlMinVideoBitrateMode} mode - Video sending mode below the minimum bitrate.
     */
    setMinVideoBitrateForTrafficControl(bitrate, mode){
        this.ZegoNativeInstance.setMinVideoBitrateForTrafficControl({bitrate, mode});
    }

    /**
     * Set the factors of concern that trigger traffic control for the specified publish channel.
     *
     * Available since: 2.4.0
     * Description: Use this interface to control whether to start traffic control due to poor remote network conditions.
     * Default value: Default is disable.
     * When to call: After the engine is created [createEngine], Called before [startPublishingStream] can take effect.
     * Restrictions: The traffic control must be turned on [enableTrafficControl].
     * Related APIs: [enableTrafficControl.
     * @param {ZegoTrafficControlFocusOnMode} mode - When LOCAL_ONLY is selected, only the local network status is concerned. When choosing REMOTE, also take into account the remote network.
     * @param {ZegoPublishChannel} channel - Publish stream channel.
     */
    setTrafficControlFocusOn(mode, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.setTrafficControlFocusOn({mode, channel});
    }

    /**
     * Sets the audio recording volume for stream publishing.
     *
     * Available since: 1.13.0
     * Description: This function is used to perform gain processing based on the device's collected volume. The local user can control the sound level of the audio stream sent to the remote end.
     * Default value: Default is 100.
     * When to call: After creating the engine [createEngine].
     * Restrictions: The capture volume can be dynamically set during publishing.
     * Related APIs: Set the playing stream volume [setPlayVolume].
     * @param {number} volume - The volume gain percentage, the range is 0 ~ 200, and the default value is 100, which means 100% of the original collection volume of the device.
     */
    setCaptureVolume(volume){
        this.ZegoNativeInstance.setCaptureVolume({volume});
    }

    /**
     * Set audio capture stereo mode.
     *
     * Available since: 1.15.0 (iOS/Android/Windows); support macOS since 2.16.0
     * Description: This function is used to set the audio capture channel mode. When the developer turns on the stereo capture, using a special stereo capture device, the stereo audio data can be captured and streamed.
     * Use cases: In some professional scenes, users are particularly sensitive to sound effects, such as voice radio and musical instrument performance. At this time, support for stereo and high-quality sound is required.
     * Default value: The default is None, which means mono capture.
     * When to call: It needs to be called after [createEngine]， before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer], [createAudioEffectPlayer] and [createRealTimeSequentialDataManager].
     * Restrictions: If you need to enable stereo capture, you also need to meet the following conditions: For iOS/Android, you need to connect an external audio device that supports stereo capture and be at the media volume. For macOS, it needs to be at the media volume. For Windows, an external audio device that supports stereo capture is required.
     * Related APIs: When streaming, you need to enable the stereo audio encoding function through the [setAudioConfig] interface at the same time.
     * @param {ZegoAudioCaptureStereoMode} mode - Audio stereo capture mode.
     */
    setAudioCaptureStereoMode(mode){
        this.ZegoNativeInstance.setAudioCaptureStereoMode({mode});
    }

    /**
     * Adds a target CDN URL to which the stream will be relayed from ZEGO RTC server.
     *
     * Available since: 1.1.0
     * Description: Forward audio and video streams from ZEGO RTC servers to custom CDN content distribution networks with high latency but support for high concurrent pull streams.
     * Use cases: 1. It is often used in large-scale live broadcast scenes that do not have particularly high requirements for delay. 2. Since ZEGO RTC server itself can be configured to support CDN(content distribution networks), this function is mainly used by developers who have CDN content distribution services themselves. 3. This function supports dynamic relay to the CDN content distribution network, so developers can use this function as a disaster recovery solution for CDN content distribution services.
     * When to call: After calling the [createEngine] function to create the engine.
     * Restrictions: When the [enablePublishDirectToCDN] function is set to true to publish the stream straight to the CDN, then calling this function will have no effect.
     * Caution: Removing URLs retweeted to CDN requires calling [removePublishCdnUrl], calling [stopPublishingStream] will not remove URLs publish to CDN.
     * Related APIs: Remove URLs that are re-pushed to the CDN [removePublishCdnUrl].
     * @param {string} streamID - Stream ID.
     * @param {string} targetURL - CDN relay address, supported address format is rtmp, rtmps.
     * @return {Promise<number>} - The execution result of update the relay CDN operation.
     */
    addPublishCdnUrl(streamID, targetURL){
        return this.ZegoNativeInstance.addPublishCdnUrl({streamID, targetURL});
    }

    /**
     * Deletes the specified CDN URL, which is used for relaying streams from ZEGO RTC server to CDN.
     *
     * Available since: 1.1.0
     * Description: When a CDN forwarding address has been added via [addPublishCdnUrl], this function is called when the stream needs to be stopped.
     * When to call: After calling the [createEngine] function to create the engine, When you don't need to continue publish to the CDN.
     * Restrictions: When the [enablePublishDirectToCDN] function is set to true to publish the stream straight to the CDN, then calling this function will have no effect.
     * Caution: This function does not stop publishing audio and video stream to the ZEGO ZEGO RTC server.
     * Related APIs: Add URLs that are re-pushed to the CDN [addPublishCdnUrl].
     * @param {string} streamID - Stream ID.
     * @param {string} targetURL - CDN relay address, supported address format rtmp.
     * @return {Promise<number>} - The execution result of update the relay CDN operation.
     */
    removePublishCdnUrl(streamID, targetURL){
        return this.ZegoNativeInstance.removePublishCdnUrl({streamID, targetURL});
    }

    /**
     * Whether to directly push to CDN (without going through the ZEGO RTC server), for the specified channel.
     *
     * Available since: 1.5.0
     * Description: Whether to publish streams directly from the client to CDN without passing through Zego RTC server.
     * Use cases: It is often used in large-scale live broadcast scenes that do not have particularly high requirements for delay.
     * Default value: The default is false, and direct push is not enabled.
     * When to call: After creating the engine [createEngine], before starting to push the stream [startPublishingStream].
     * Caution: The Direct Push CDN feature does not pass through the ZEGO Real-Time Audio and Video Cloud during network transmission, so you cannot use ZEGO's ultra-low latency audio and video services.
     * Related APIs: Dynamic re-push to CDN function [addPublishCdnUrl], [removePublishCdnUrl].
     * @param {boolean} enable - Whether to enable direct publish CDN, true: enable direct publish CDN, false: disable direct publish CDN.
     * @param {?ZegoCDNConfig} config - CDN configuration, if null, use Zego's background default configuration.
     * @param {ZegoPublishChannel} channel - Publish stream channel.
     */
    enablePublishDirectToCDN(enable, config, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.enablePublishDirectToCDN({enable, config, channel});
    }

    /**
     * Sets up the stream watermark before stream publishing (for the specified channel).
     *
     * Available since: 1.1.0
     * Description: Set watermark for publish stream screen.
     * Use cases: It is often used to identify the source of the publish.
     * When to call: After creating the engine through [createEngine] function.
     * Caution: The layout of the watermark cannot exceed the video encoding resolution of the stream. It can be set at any time before or during the publishing stream.
     * @param {?ZegoWatermark} watermark - The upper left corner of the watermark layout is the origin of the coordinate system, and the area cannot exceed the size set by the encoding resolution. If it is null, the watermark is cancelled.
     * @param {boolean} isPreviewVisible - the watermark is visible on local preview
     * @param {ZegoPublishChannel} channel - Publish stream channel.
     */
    setPublishWatermark(watermark, isPreviewVisible, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.setPublishWatermark({watermark, isPreviewVisible, channel});
    }

    /**
     * Set the Supplemental Enhancement Information type.
     *
     * Available since: 1.18.0
     * Description: By default, the SDK wraps the data with ZEGO's self-defined SEI type, which is not specified by the SEI standard. When the developer needs to use a third-party decoder to decode the SEI, the correct SEI will not be decoded and the [setSEIConfig] interface needs to be called to change the type of the SEI sent by the SDK to UserUnregister type.
     * Use cases: This function needs to be executed when the developer uses a third-party decoder to decode the SEI.
     * When to call: After creating the engine [createEngine], before starting to push the stream [startPublishingStream].
     * Restrictions: None.
     * @param {ZegoSEIConfig} config - SEI configuration. The SEI defined by ZEGO is used by default.
     */
    setSEIConfig(config){
        this.ZegoNativeInstance.setSEIConfig({config});
    }

    /**
     * Sends Supplemental Enhancement Information.
     *
     * Available since: 1.1.0
     * Description: While pushing the stream to transmit the audio and video stream data, the stream media enhancement supplementary information is sent to synchronize some other additional information.
     * Use cases: Generally used in scenes such as synchronizing music lyrics or precise video layout, you can choose to send SEI.
     * When to call: After starting to push the stream [startPublishingStream].
     * Restrictions: Do not exceed 30 times per second, and the SEI data length is limited to 4096 bytes.
     * Caution: Since the SEI information follows the video frame, there may be frame loss due to network problems, so the SEI information may also be lost. In order to solve this situation, it should be sent several times within the restricted frequency.
     * Related APIs: After the pusher sends the SEI, the puller can obtain the SEI content by monitoring the callback of [onPlayerRecvSEI].
     * @param {Uint8Array} data - SEI data.
     * @param {ZegoPublishChannel} channel - Publish stream channel.
     */
    sendSEI(data, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.sendSEI({data, channel});
    }

    /**
     * Enables or disables hardware encoding.
     *
     * Available since: 1.1.0
     * Description: Whether to use the hardware encoding function when publishing the stream, the GPU is used to encode the stream and to reduce the CPU usage.
     * When to call: The setting can take effect before the stream published. If it is set after the stream published, the stream should be stopped first before it takes effect.
     * Caution: Because hard-coded support is not particularly good for a few models, SDK uses software encoding by default. If the developer finds that the device is hot when publishing a high-resolution audio and video stream during testing of some models, you can consider calling this function to enable hard coding.
     * @param {boolean} enable - Whether to enable hardware encoding, true: enable hardware encoding, false: disable hardware encoding.
     */
    enableHardwareEncoder(enable){
        this.ZegoNativeInstance.enableHardwareEncoder({enable});
    }

    /**
     * Sets the timing of video scaling in the video capture workflow. You can choose to do video scaling right after video capture (the default value) or before encoding.
     *
     * Available since: 1.1.0
     * When to call: This function needs to be set before call [startPreview] or [startPublishingStream].
     * Caution: The main effect is Whether the local preview is affected when the acquisition resolution is different from the encoding resolution.
     * @param {ZegoCapturePipelineScaleMode} mode - The capture scale timing mode.
     */
    setCapturePipelineScaleMode(mode){
        this.ZegoNativeInstance.setCapturePipelineScaleMode({mode});
    }

    /**
     * Starts playing a stream from ZEGO RTC server or from third-party CDN. Support multi-room mode.
     *
     * Available since: 1.1.0
     * Description: Play audio and video streams from the ZEGO RTC server or CDN.
     * Use cases: In real-time or live broadcast scenarios, developers can listen to the [onRoomStreamUpdate] event callback to obtain the new stream information in the room where they are located, and call this interface to pass in streamID for play streams.
     * When to call: After [loginRoom].
     * Restrictions: None.
     * Caution: 1. The developer can update the player canvas by calling this function again (the streamID must be the same). 2. After the first play stream failure due to network reasons or the play stream is interrupted, the default time for SDK reconnection is 20min. 3. In the case of poor network quality, user play may be interrupted, the SDK will try to reconnect, and the current play status and error information can be obtained by listening to the [onPlayerStateUpdate] event. please refer to https://docs.zegocloud.com/faq/reconnect. 4. Playing the stream ID that does not exist, the SDK continues to try to play after calling this function. After the stream ID is successfully published, the audio and video stream can be actually played.
     * @param {string} streamID - Stream ID, a string of up to 256 characters. You cannot include URL keywords, otherwise publishing stream and playing stream will fails. Only support numbers, English characters and '~', '!', '@', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'.
     * @param {ZegoView} view - The view used to display the preview image.
     * @param {ZegoPlayerConfig} config - Advanced player configuration.
     */
    startPlayingStream(streamID, view, config = { cdnConfig: null, videoLayer: ZegoPlayerVideoLayer.Auto, roomID: '' }){
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
     * Available since: 1.1.0
     * Description: Play audio and video streams from the ZEGO RTC server.
     * Use cases: In the real-time scenario, developers can listen to the [onRoomStreamUpdate] event callback to obtain the delete stream information in the room where they are located, and call this interface to pass in streamID for stop play streams.
     * When to call: After [loginRoom].
     * Restrictions: None.
     * Caution: When stopped, the attributes set for this stream previously, such as [setPlayVolume], [mutePlayStreamAudio], [mutePlayStreamVideo], etc., will be invalid and need to be reset when playing the the stream next time.
     * @param {string} streamID - Stream ID.
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
     * Available since: 1.17.0
     * Description: Take a screenshot of the specified stream ID.
     * When to call: after called [startPlayingStream].
     * Restrictions: None.
     * Related callbacks: [onPlayerTakeSnapshotResult] Screenshot data callback.
     * @param {string} streamID - Stream ID to be snapshot.
     * @return {Promise<number>} - Results of take play stream snapshot.
     */
    takePlayStreamSnapshot(streamID){
        return this.ZegoNativeInstance.takePlayStreamSnapshot({streamID});
    }

    /**
     * Sets the stream playback volume.
     *
     * Available since: 1.16.0
     * Description: Set the sound size of the stream, the local user can control the playback volume of the audio stream.
     * When to call: after called [startPlayingStream].
     * Restrictions: None.
     * Related APIs: [setAllPlayStreamVolume] Set all stream volume.
     * Caution: You need to reset after [stopPlayingStream] and [startPlayingStream]. This function and the [setAllPlayStreamVolume] function overwrite each other, and the last call takes effect.
     * @param {string} streamID - Stream ID.
     * @param {number} volume - Volume percentage. The value ranges from 0 to 200, and the default value is 100.
     */
    setPlayVolume(streamID, volume){
        this.ZegoNativeInstance.setPlayVolume({streamID, volume});
    }

    /**
     * Sets the all stream playback volume.
     *
     * Available since: 2.3.0
     * Description: Set the sound size of the stream, the local user can control the playback volume of the audio stream.
     * When to call: after called [startPlayingStream].
     * Restrictions: None.
     * Related APIs: [setPlayVolume] Set the specified streaming volume.
     * Caution: You need to reset after [stopPlayingStream] and [startPlayingStream]. Set the specified streaming volume and [setAllPlayStreamVolume] interface to override each other, and the last call takes effect.
     * @param {number} volume - Volume percentage. The value ranges from 0 to 200, and the default value is 100.
     */
    setAllPlayStreamVolume(volume){
        this.ZegoNativeInstance.setAllPlayStreamVolume({volume});
    }

    /**
     * Set play video stream type.
     *
     * Available since: 2.3.0
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
     * Set the adaptive adjustment interval range of the buffer for playing stream.
     *
     * Available since: 2.1.0
     * Description: Set the range of adaptive adjustment of the internal buffer of the sdk when streaming is 0-4000ms.
     * Use cases: Generally, in the case of a poor network environment, adjusting and increasing the playback buffer of the pull stream will significantly reduce the audio and video freezes, but will increase the delay.
     * When to call: after called [createEngine].
     * Restrictions: None.
     * Caution: When the upper limit of the cache interval set by the developer exceeds 4000ms, the value will be 4000ms. When the upper limit of the cache interval set by the developer is less than the lower limit of the cache interval, the upper limit will be automatically set as the lower limit.
     * @param {string} streamID - Stream ID.
     * @param {number} minBufferInterval - The lower limit of the buffer adaptation interval, in milliseconds. The default value is 0ms.
     * @param {number} maxBufferInterval - The upper limit of the buffer adaptation interval, in milliseconds. The default value is 4000ms.
     */
    setPlayStreamBufferIntervalRange(streamID, minBufferInterval, maxBufferInterval){
        this.ZegoNativeInstance.setPlayStreamBufferIntervalRange({streamID, minBufferInterval, maxBufferInterval});
    }

    /**
     * Whether the pull stream can receive the specified audio data.
     *
     * Available since: 1.1.0
     * Description: In the process of real-time audio and video interaction, local users can use this function to control whether to receive audio data from designated remote users when pulling streams as needed. When the developer does not receive the audio receipt, the hardware and network overhead can be reduced.
     * Use cases: Call this function when developers need to quickly close and restore remote audio. Compared to re-flow, it can greatly reduce the time and improve the interactive experience.
     * When to call: This function can be called after calling [createEngine].
     * Caution: This function is valid only when the [muteAllPlayStreamAudio] function is set to `false`.
     * Related APIs: You can call the [muteAllPlayStreamAudio] function to control whether to receive all audio data. When the two functions [muteAllPlayStreamAudio] and [mutePlayStreamAudio] are set to `false` at the same time, the local user can receive the audio data of the remote user when the stream is pulled: 1. When the [muteAllPlayStreamAudio(true)] function is called, it is globally effective, that is, local users will be prohibited from receiving all remote users' audio data. At this time, the [mutePlayStreamAudio] function will not take effect whether it is called before or after [muteAllPlayStreamAudio].2. When the [muteAllPlayStreamAudio(false)] function is called, the local user can receive the audio data of all remote users. At this time, the [mutePlayStreamAudio] function can be used to control whether to receive a single audio data. Calling the [mutePlayStreamAudio(true, streamID)] function allows the local user to receive audio data other than the `streamID`; calling the [mutePlayStreamAudio(false, streamID)] function allows the local user to receive all audio data.
     * @param {string} streamID - Stream ID.
     * @param {boolean} mute - Whether it can receive the audio data of the specified remote user when streaming, "true" means prohibition, "false" means receiving, the default value is "false".
     */
    mutePlayStreamAudio(streamID, mute){
        this.ZegoNativeInstance.mutePlayStreamAudio({streamID, mute});
    }

    /**
     * Whether the pull stream can receive the specified video data.
     *
     * Available since: 1.1.0
     * Description: In the process of real-time video and video interaction, local users can use this function to control whether to receive video data from designated remote users when pulling streams as needed. When the developer does not receive the audio receipt, the hardware and network overhead can be reduced.
     * Use cases: This function can be called when developers need to quickly close and resume watching remote video. Compared to re-flow, it can greatly reduce the time and improve the interactive experience.
     * When to call: This function can be called after calling [createEngine].
     * Caution: This function is valid only when the [muteAllPlayStreamVideo] function is set to `false`.
     * Related APIs: You can call the [muteAllPlayStreamVideo] function to control whether to receive all video data. When the two functions [muteAllPlayStreamVideo] and [mutePlayStreamVideo] are set to `false` at the same time, the local user can receive the video data of the remote user when the stream is pulled: 1. When the [muteAllPlayStreamVideo(true)] function is called, it will take effect globally, that is, local users will be prohibited from receiving all remote users' video data. At this time, the [mutePlayStreamVideo] function will not take effect whether it is called before or after [muteAllPlayStreamVideo]. 2. When the [muteAllPlayStreamVideo(false)] function is called, the local user can receive the video data of all remote users. At this time, the [mutePlayStreamVideo] function can be used to control whether to receive a single video data. Call the [mutePlayStreamVideo(true, streamID)] function, the local user can receive other video data other than the `streamID`; call the [mutePlayStreamVideo(false, streamID)] function, the local user can receive all the video data.
     * @param {string} streamID - Stream ID.
     * @param {boolean} mute - Whether it is possible to receive the video data of the specified remote user when streaming, "true" means prohibition, "false" means receiving, the default value is "false".
     */
    mutePlayStreamVideo(streamID, mute){
        this.ZegoNativeInstance.mutePlayStreamVideo({streamID, mute});
    }

    /**
     * Can the pull stream receive all video data.
     *
     * Available since: 2.4.0
     * Description: In the process of real-time video and video interaction, local users can use this function to control whether to receive all remote users' video data when pulling the stream (including the video stream pushed by the new user who joins the room after calling this function). By default, users can receive video data pushed by all remote users after joining the room. When the developer does not receive the audio receipt, the hardware and network overhead can be reduced.
     * Use cases: This function can be called when developers need to quickly close and resume watching remote video. Compared to re-flow, it can greatly reduce the time and improve the interactive experience.
     * When to call: This function can be called after calling [createEngine].
     * Related APIs: You can call the [mutePlayStreamVideo] function to control whether to receive a single piece of video data. When the two functions [muteAllPlayStreamVideo] and [mutePlayStreamVideo] are set to `false` at the same time, the local user can receive the video data of the remote user when the stream is pulled: 1. When the [muteAllPlayStreamVideo(true)] function is called, it will take effect globally, that is, the local user will be prohibited from receiving all remote users' video data. At this time, the [mutePlayStreamVideo] function will not take effect whether it is called before or after [muteAllPlayStreamVideo]. 2. When the [muteAllPlayStreamVideo(false)] function is called, the local user can receive the video data of all remote users. At this time, the [mutePlayStreamVideo] function can be used to control whether to receive a single video data. Call the [mutePlayStreamVideo(true, streamID)] function, the local user can receive other video data other than the `streamID`; call the [mutePlayStreamVideo(false, streamID)] function, the local user can receive all the video data.
     * @param {boolean} mute - Whether it is possible to receive all remote users' video data when streaming, "true" means prohibition, "false" means receiving, and the default value is "false".
     */
    muteAllPlayStreamVideo(mute){
        this.ZegoNativeInstance.muteAllPlayStreamVideo({mute});
    }

    /**
     * Enables or disables hardware decoding.
     *
     * Available since: 1.1.0
     * Description: Control whether hardware decoding is used when playing streams, with hardware decoding enabled the SDK will use the GPU for decoding, reducing CPU usage.
     * Use cases: If developers find that the device heats up badly when playing large resolution audio and video streams during testing on some models, consider calling this function to enable hardware decoding.
     * Default value: Hardware decoding is disabled by default when this interface is not called.
     * When to call: This function needs to be called after [createEngine] creates an instance.
     * Restrictions: None.
     * Caution: Need to be called before calling [startPlayingStream], if called after playing the stream, it will only take effect after stopping the stream and re-playing it. Once this configuration has taken effect, it will remain in force until the next call takes effect.
     * @param {boolean} enable - Whether to turn on hardware decoding switch, true: enable hardware decoding, false: disable hardware decoding.
     */
    enableHardwareDecoder(enable){
        this.ZegoNativeInstance.enableHardwareDecoder({enable});
    }

    /**
     * Enables or disables frame order detection.
     *
     * Available since: 1.1.0
     * Description: Control whether to turn on frame order detection, on to not support B frames, off to support B frames.
     * Use cases: Turning on frame order detection when pulling cdn's stream will prevent splash screens.
     * Default value: Turn on frame order detection by default when this interface is not called.
     * When to call: This function needs to be called after [createEngine] creates an instance.
     * Restrictions: None.
     * Caution: Turn off frame order detection during playing stream may result in a brief splash screen.
     * @param {boolean} enable - Whether to turn on frame order detection, true: enable check poc,not support B frames, false: disable check poc, support B frames.
     */
    enableCheckPoc(enable){
        this.ZegoNativeInstance.enableCheckPoc({enable});
    }

    /**
     * Starts a stream mixing task.
     *
     * Available since: 1.2.1
     * Description: Initiate a mixing stream request to the ZEGO RTC server, the server will look for the stream currently being pushed, and mix the layers according to the parameters of the mixing stream task requested by the SDK. When you need to update a mixing task, that is, when the input stream increases or decreases, you need to update the input stream list. At this time, you can update the field of the [ZegoMixerTask] object inputList and call this function again to pass in the same [ZegoMixerTask] object to update the mixing task.
     * Use cases: It is often used when multiple video images are required to synthesize a video using mixed streaming, such as education, live broadcast of teacher and student images.
     * When to call: After calling [loginRoom] to log in to the room.
     * Restrictions: None.
     * Caution: Due to the performance considerations of the client device, the SDK muxing is to start the mixing task on the ZEGO RTC server for mixing. If an exception occurs when the mixing task is requested to start, for example, the most common mixing input stream does not exist, the error code will be given from the callback callback. If a certain input stream does not exist in the middle, the muxing task will automatically retry to pull this input stream for 90 seconds, and will not retry after 90 seconds. If all input streams no longer exist, the server will automatically stop the mixing task after 90 seconds.
     * Related callbacks: [OnMixerRelayCDNStateUpdate] can be used to obtain the CDN status update notification of the mixed stream repost, and the sound update notification of each single stream in the mixed stream can be obtained through [onMixerSoundLevelUpdate].
     * Related APIs: the mixing task can be stopped by the [stopMixerTask] function.
     * @param {ZegoMixerTask} task - Mixing task object. Required: Yes.
     * @return {Promise<number, string>} - Start stream mixing task result
     */
    startMixerTask(task){
        return this.ZegoNativeInstance.startMixerTask({task});
    }

    /**
     * Stops a stream mixing task.
     *
     * Available since: 1.2.1
     * Description: Initiate a request to end the mixing task to the ZEGO RTC server.
     * Use cases: It is often used when multiple video images are required to synthesize a video using mixed streaming, such as education, live broadcast of teacher and student images.
     * When to call: After calling [startMixerTask] to start mixing.
     * Restrictions: None.
     * Caution: If the developer starts the next mixing task without stopping the previous mixing task, the previous mixing task will not automatically stop until the input stream of the previous mixing task does not exist for 90 seconds. Before starting the next mixing task, you should stop the previous mixing task, so that when an anchor has already started the next mixing task to mix with other anchors, the audience is still pulling the output stream of the previous mixing task.
     * Related APIs: You can start mixing by using the [startMixerTask] function.
     * @param {ZegoMixerTask} task - Mixing task object. Required: Yes.
     * @return {Promise<number>} - Stop stream mixing task result
     */
    stopMixerTask(task){
        return this.ZegoNativeInstance.stopMixerTask({task});
    }

    /**
     * Mutes or unmutes the microphone.
     *
     * Available since: 1.1.0
     * Description: This function is used to control whether to use the collected audio data. Mute (turn off the microphone) will use the muted data to replace the audio data collected by the device for streaming. At this time, the microphone device will still be occupied.
     * Default value: The default is `false`, which means no muting.
     * When to call: After creating the engine [createEngine].
     * Restrictions: None.
     * Related APIs: Developers who want to control whether to use microphone on the UI should use this function to avoid unnecessary performance overhead by using the [enableAudioCaptureDevice]. You can use [isMicrophoneMuted] to check if the microphone is muted.
     * @param {boolean} mute - Whether to mute (disable) the microphone, `true`: mute (disable) microphone, `false`: enable microphone.
     */
    muteMicrophone(mute){
        this.ZegoNativeInstance.muteMicrophone({mute});
    }

    /**
     * Checks whether the microphone is muted.
     *
     * Available since: 1.1.0
     * Description: Used to determine whether the microphone is set to mute.
     * When to call: After creating the engine [createEngine].
     * Restrictions: None.
     * Related APIs: [muteMicrophone].
     * @return {boolean} - Whether the microphone is muted; true: the microphone is muted; `false`: the microphone is enable (not muted).
     */
    isMicrophoneMuted(){
        return this.ZegoNativeInstance.isMicrophoneMuted({});
    }

    /**
     * Mutes or unmutes the audio output speaker.
     *
     * Available since: 1.1.0
     * Description: After mute speaker, all the SDK sounds will not play, including playing stream, mediaplayer, etc. But the SDK will still occupy the output device.
     * Default value: The default is `false`, which means no muting.
     * When to call: After creating the engine [createEngine].
     * Restrictions: None.
     * @param {boolean} mute - Whether to mute (disable) speaker audio output, `true`: mute (disable) speaker audio output, `false`: enable speaker audio output.
     */
    muteSpeaker(mute){
        this.ZegoNativeInstance.muteSpeaker({mute});
    }

    /**
     * Checks whether the audio output speaker is muted.
     *
     * Available since: 1.1.0
     * Description: Used to determine whether the audio output is muted.
     * When to call: After creating the engine [createEngine].
     * Restrictions: None.
     * Related APIs: [muteSpeaker].
     * @return {boolean} - Whether the speaker is muted; `true`: the speaker is muted; `false`: the speaker is enable (not muted).
     */
    isSpeakerMuted(){
        return this.ZegoNativeInstance.isSpeakerMuted({});
    }

    /**
     * Gets a list of audio devices.
     *
     * Only supports Windows and Mac.
     * @param {ZegoAudioDeviceType} deviceType - Audio device type
     * @return {ZegoDeviceInfo[]} - Audo device List
     */
    getAudioDeviceList(deviceType){
        return this.ZegoNativeInstance.getAudioDeviceList({deviceType});
    }

    /**
     * Get the device ID of the default audio device.
     *
     * Only supports Windows and Mac.
     * @param {ZegoAudioDeviceType} deviceType - Audio device type
     * @return {string} - Default Audio device ID
     */
    getDefaultAudioDeviceID(deviceType){
        return this.ZegoNativeInstance.getDefaultAudioDeviceID({deviceType});
    }

    /**
     * Chooses to use the specified audio device.
     *
     * Available since: 1.0.0
     * Description: Chooses to use the specified audio device.
     * When to call: After creating the engine [createEngine] and before call [startPublishingStream] or [startPlayingStream].
     * Restrictions: Only supports Windows/macOS.
     * @param {string} deviceID - ID of a device obtained by [getAudioDeviceList]
     * @param {ZegoAudioDeviceType} deviceType - Audio device type
     */
    useAudioDevice(deviceID, deviceType){
        this.ZegoNativeInstance.useAudioDevice({deviceID, deviceType});
    }

    /**
     * Get volume for the specified audio device.
     *
     * Get volume for the specified audio device. Only for Windows/macOS.
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
     * Only for Windows/macOS. The direct operating system device may fail due to system restrictions. Please use [setCaptureVolume] and [setPlayVolume] first to adjust the volume of publish and play streams.
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
     * Available since: 1.1.0
     * Description: This function is used to control whether to use the audio collection device. When the audio collection device is turned off, the SDK will no longer occupy the audio device. Of course, if the stream is being published at this time, there is no audio data.
     * Use cases: When the user never needs to use the audio, you can call this function to close the audio collection.
     * Default value: The default is `true`.
     * When to call: After creating the engine [createEngine].
     * Restrictions: None.
     * Related APIs: Turning off or turning on the microphone on the hardware is a time-consuming operation, and there is a certain performance overhead when the user performs frequent operations. [muteMicrophone] is generally recommended.
     * @param {boolean} enable - Whether to enable the audio capture device, `true`: enable audio capture device, `false`: disable audio capture device.
     */
    enableAudioCaptureDevice(enable){
        this.ZegoNativeInstance.enableAudioCaptureDevice({enable});
    }

    /**
     * Turns on/off the camera (for the specified channel).
     *
     * Available since: 1.1.0
     * Description: This function is used to control whether to start the capture of the camera. After the camera is turned off, the video capture will not be performed. At this time, there will be no video data for local preview and push streaming.
     * Default value: The default is `true` which means the camera is turned on.
     * When to call: After creating the engine [createEngine].
     * Restrictions: None.
     * Caution: In the case of using the custom video capture function [enableCustomVideoCapture], since the developer has taken over the video data capture, the SDK is no longer responsible for the video data capture, but this function still affects whether to encode or not. Therefore, when developers use custom video capture, please ensure that the value of this function is `true`.
     * @param {boolean} enable - Whether to turn on the camera, `true`: turn on camera, `false`: turn off camera
     * @param {ZegoPublishChannel} channel - Publishing stream channel
     */
    enableCamera(enable, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.enableCamera({enable, channel});
    }

    /**
     * Chooses to use the specified video device (for the specified channel).
     *
     * Only for Windows/macOS.
     * @param {string} deviceID - ID of a device obtained by getVideoDeviceList
     * @param {ZegoPublishChannel} channel - Publishing stream channel
     */
    useVideoDevice(deviceID, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.useVideoDevice({deviceID, channel});
    }

    /**
     * Gets a list of video devices.
     *
     * Only for Windows/macOS.
     * @return {ZegoDeviceInfo[]} - Video device List
     */
    getVideoDeviceList(){
        return this.ZegoNativeInstance.getVideoDeviceList({});
    }

    /**
     * Get the deviceID of the default video device.
     *
     * Only for Windows/macOS.
     * @return {string} - Default video device ID
     */
    getDefaultVideoDeviceID(){
        return this.ZegoNativeInstance.getDefaultVideoDeviceID({});
    }

    /**
     * Starts sound level monitoring. Support setting the listening interval.
     *
     * Available since: 1.15.0
     * Description: After starting monitoring, you can receive local audio sound level via [onCapturedSoundLevelUpdate] callback, and receive remote audio sound level via [onRemoteSoundLevelUpdate] callback. Before entering the room, you can call [startPreview] with this function and combine it with [onCapturedSoundLevelUpdate] callback to determine whether the audio device is working properly.
     * Use cases: During the publishing and playing process, determine who is talking on the wheat and do a UI presentation.
     * When to call: After the engine is created [createEngine].
     * Caution:
     *   1. [onCapturedSoundLevelUpdate] and [onRemoteSoundLevelUpdate] callback notification period is the value set by the parameter. If you want to use advanced feature of sound level, please use the function of the same name (the parameter type is ZegoSoundLevelConfig) instead.
     *   2. After the sound monitoring is started, even if the local audio capture is not started, [onCapturedSoundLevelUpdate] will have a callback, and the sound level is 0.
     * @param {number} millisecond - Monitoring time period of the sound level, in milliseconds, has a value range of [100, 3000]. Default is 100 ms.
     */
    startSoundLevelMonitor(millisecond = 100){
        this.ZegoNativeInstance.startSoundLevelMonitor({millisecond});
    }

    /**
     * Starts sound level monitoring. Support enable some advanced feature.
     *
     * Available since: 2.10.0
     * Description: After starting monitoring, you can receive local audio sound level via [onCapturedSoundLevelUpdate] callback, and receive remote audio sound level via [onRemoteSoundLevelUpdate] callback. Before entering the room, you can call [startPreview] with this function and combine it with [onCapturedSoundLevelUpdate] callback to determine whether the audio device is working properly.
     * Use cases: During the publishing and playing process, determine who is talking on the wheat and do a UI presentation.
     * When to call: After the engine is created [createEngine].
     * Caution:
     *   1. [onCapturedSoundLevelUpdate] and [onRemoteSoundLevelUpdate] callback notification period is the value set by the parameter.
     *   2. After the sound monitoring is started, even if the local audio capture is not started, [onCapturedSoundLevelUpdate] will have a callback, and the sound level is 0.
     * @param {ZegoSoundLevelConfig} config - Configuration for starts the sound level monitor.
     */
    startSoundLevelMonitorWithConfig(config){
        this.ZegoNativeInstance.startSoundLevelMonitorWithConfig({config});
    }

    /**
     * Stops sound level monitoring.
     *
     * Available since: 1.1.0
     * Description: After the monitoring is stopped, the callback of the local/remote audio sound level will be stopped.
     * When to call: After the engine is created [createEngine].
     * Related APIs: Soundwave monitoring can be initiated via [startSoundLevelMonitor].
     */
    stopSoundLevelMonitor(){
        this.ZegoNativeInstance.stopSoundLevelMonitor({});
    }

    /**
     * Starts audio spectrum monitoring. Support setting the listening interval.
     *
     * Available since: 1.15.0
     * Description: After starting monitoring, you can receive local audio spectrum via [onCapturedAudioSpectrumUpdate] callback, and receive remote audio spectrum via [onRemoteAudioSpectrumUpdate] callback.
     * Use cases: In the host K song scene, has been published or played under the premise that the host or audience to see the tone and volume change animation.
     * When to call: After the engine is created [createEngine].
     * Caution: [onCapturedAudioSpectrumUpdate] and [onRemoteAudioSpectrumUpdate] callback notification period is the value set by the parameter.
     * @param {number} millisecond - Monitoring time period of the audio spectrum, in milliseconds, has a value range of [100, 3000]. Default is 100 ms.
     */
    startAudioSpectrumMonitor(millisecond = 100){
        this.ZegoNativeInstance.startAudioSpectrumMonitor({millisecond});
    }

    /**
     * Stops audio spectrum monitoring.
     *
     * Available since: 1.1.0
     * Description: After the monitoring is stopped, the callback of the local/remote audio spectrum will be stopped.
     * When to call: After the engine is created [createEngine].
     * Related APIs: Audio spectrum monitoring can be initiated via [startAudioSpectrumMonitor].
     */
    stopAudioSpectrumMonitor(){
        this.ZegoNativeInstance.stopAudioSpectrumMonitor({});
    }

    /**
     * Enables or disables headphone monitoring.
     *
     * Available since: 1.9.0
     * Description: Enable/Disable headphone monitor, and users hear their own voices as they use the microphone to capture sounds.
     * When to call: After the engine is created [createEngine].
     * Default value: Disable.
     * Caution: This setting does not actually take effect until both the headset and microphone are connected.
     * @param {boolean} enable - Whether to use headphone monitor, true: enable, false: disable
     */
    enableHeadphoneMonitor(enable){
        this.ZegoNativeInstance.enableHeadphoneMonitor({enable});
    }

    /**
     * Sets the headphone monitor volume.
     *
     * Available since: 1.9.0
     * Description: set headphone monitor volume.
     * When to call: After the engine is created [createEngine].
     * Caution: This setting does not actually take effect until both the headset and microphone are connected.
     * Related APIs: Enables or disables headphone monitoring via [enableHeadphoneMonitor].
     * @param {number} volume - headphone monitor volume, range from 0 to 200, 60 as default.
     */
    setHeadphoneMonitorVolume(volume){
        this.ZegoNativeInstance.setHeadphoneMonitorVolume({volume});
    }

    /**
     * Enable or disable system audio capture.
     *
     * Available since: 1.9.0
     * Description: Enable sound card capture to mix sounds played by the system into the publishing stream, such as sounds played by the browser, sounds played by the third-party player, etc.
     * Default value: Default is disable.
     * When to call: Called this function after calling [startPublishingStream] or [startPreview].
     * Restrictions: None.
     * Caution: The system sound card sound does not include streaming sound, media player sound and sound effect player sound.
     * Related APIs: [setMixSystemPlayoutVolume] function can set system audio capture volume.
     * Platform differences: Only supports Windows and macOS.
     * @param {boolean} enable - Whether to mix system playout.
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
     * When to call: Called this function after calling [startPublishingStream] or [startPreview].
     * Restrictions: Only supports Windows and macOS.
     * Related APIs: The default audio device ID can be obtained through [getDefaultAudioDeviceID].
     * @param {ZegoAudioDeviceType} deviceType - Audio device type.Required:Yes.
     * @return {ZegoDeviceInfo} - Audio device information.
     */
    getCurrentAudioDevice(deviceType){
        return this.ZegoNativeInstance.getCurrentAudioDevice({deviceType});
    }

    /**
     * Whether to enable acoustic echo cancellation (AEC).
     *
     * Available since: 1.1.0
     * Description: Turning on echo cancellation, the SDK filters the collected audio data to reduce the echo component in the audio.
     * Use case: When you need to reduce the echo to improve the call quality and user experience, you can turn on this feature.
     * Default value: When this function is not called, iOS turns off echo cancellation by default and other platforms turn on echo cancellation by default
     * When to call: It needs to be called after [createEngine], before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer], [createAudioEffectPlayer] and [createRealTimeSequentialDataManager].
     * Caution: The AEC function only supports the processing of sounds playbacked through the SDK, such as sounds played by the playing stream, media player, audio effect player, etc.
     * Restrictions: None.
     * Related APIs: Developers can use [enableHeadphoneAEC] to set whether to enable AEC when using headphones, and use [setAECMode] to set the echo cancellation mode.
     * @param {boolean} enable - Whether to enable echo cancellation, true: enable, false: disable
     */
    enableAEC(enable){
        this.ZegoNativeInstance.enableAEC({enable});
    }

    /**
     * Sets the acoustic echo cancellation (AEC) mode.
     *
     * Available since: 1.1.0
     * Description: When [enableAEC] is used to enable echo cancellation, this function can be used to switch between different echo cancellation modes to control the degree of echo cancellation.
     * Use case: When the default echo cancellation effect does not meet expectations, this function can be used to adjust the echo cancellation mode.
     * Default value: When this function is not called, the default echo cancellation mode is [Aggressive].
     * When to call: It needs to be called after [createEngine], before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer], [createAudioEffectPlayer] and [createRealTimeSequentialDataManager].
     * Restrictions: The value set by this function is valid only after the echo cancellation function is turned on.
     * @param {ZegoAECMode} mode - Echo cancellation mode
     */
    setAECMode(mode){
        this.ZegoNativeInstance.setAECMode({mode});
    }

    /**
     * Enables or disables automatic gain control (AGC).
     *
     * Available since: 1.1.0
     * Description: After turning on this function, the SDK can automatically adjust the microphone volume to adapt to near and far sound pickups and keep the volume stable.
     * Use case: When you need to ensure volume stability to improve call quality and user experience, you can turn on this feature.
     * Default value: When this function is not called, AGC is enabled by default.
     * When to call: It needs to be called after [createEngine] and before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer], [createAudioEffectPlayer] and [createRealTimeSequentialDataManager]. Note that the Mac needs to be called after [startPreview] and before [startPublishingStream].
     * Restrictions: None.
     * @param {boolean} enable - Whether to enable automatic gain control, true: enable, false: disable
     */
    enableAGC(enable){
        this.ZegoNativeInstance.enableAGC({enable});
    }

    /**
     * Enables or disables active noise suppression (ANS, aka ANC).
     *
     * Available since: 1.1.0
     * Description: Enable the noise suppression can reduce the noise in the audio data and make the human voice clearer.
     * Use case: When you need to suppress noise to improve call quality and user experience, you can turn on this feature.
     * Default value: When this function is not called, ANS is enabled by default.
     * When to call: It needs to be called after [createEngine], before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer], [createAudioEffectPlayer] and [createRealTimeSequentialDataManager].
     * Related APIs: This function has a better suppression effect on continuous noise (such as the sound of rain, white noise). If you need to turn on transient noise suppression, please use [enableTransientANS]. And the noise suppression mode can be set by [setANSMode].
     * Restrictions: None.
     * @param {boolean} enable - Whether to enable noise suppression, true: enable, false: disable
     */
    enableANS(enable){
        this.ZegoNativeInstance.enableANS({enable});
    }

    /**
     * Enables or disables transient noise suppression.
     *
     * Available since: 1.17.0
     * Description: Enable the transient noise suppression can suppress the noises such as keyboard and desk knocks.
     * Use case: When you need to suppress transient noise to improve call quality and user experience, you can turn on this feature.
     * Default value: When this function is not called, this is disabled by default.
     * When to call: It needs to be called after [createEngine], before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer], [createAudioEffectPlayer] and [createRealTimeSequentialDataManager].
     * Related APIs: This function will not suppress normal noise after it is turned on. If you need to turn on normal noise suppression, please use [enableANS].
     * Restrictions: None.
     * @param {boolean} enable - Whether to enable transient noise suppression, true: enable, false: disable
     */
    enableTransientANS(enable){
        this.ZegoNativeInstance.enableTransientANS({enable});
    }

    /**
     * Sets the automatic noise suppression (ANS) mode.
     *
     * Available since: 1.1.0
     * Description: When [enableANS] is used to enable noise suppression, this function can be used to switch between different noise suppression modes to control the degree of noise suppression.
     * Use case: When the default noise suppression effect does not meet expectations, this function can be used to adjust the noise suppression mode.
     * Default value: When this function is not called, the default echo cancellation mode is [Medium].
     * When to call: It needs to be called after [createEngine], before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer], [createAudioEffectPlayer] and [createRealTimeSequentialDataManager].
     * Restrictions: The value set by this function is valid only after the noise suppression function is turned on.
     * @param {ZegoANSMode} mode - Audio Noise Suppression mode
     */
    setANSMode(mode){
        this.ZegoNativeInstance.setANSMode({mode});
    }

    /**
     * Set the sound equalizer (EQ).
     *
     * Available since: 1.12.0
     * Description: Call this function to set the sound equalizer adjust the tone.
     * Use cases: Often used in voice chatroom, KTV.
     * When to call: It needs to be called after [createEngine].
     * Restrictions: None.
     * @param {number} bandIndex - Band frequency index, the value range is [0, 9], corresponding to 10 frequency bands, and the center frequencies are [31, 62, 125, 250, 500, 1K, 2K, 4K, 8K, 16K] Hz.
     * @param {number} bandGain - Band gain for the index, the value range is [-15, 15]. Default value is 0, if all gain values in all frequency bands are 0, EQ function will be disabled.
     */
    setAudioEqualizerGain(bandIndex, bandGain){
        this.ZegoNativeInstance.setAudioEqualizerGain({bandIndex, bandGain});
    }

    /**
     * Setting up the voice changer via preset enumeration.
     *
     * Available since: 1.17.0
     * Description: Call this function to use preset voice changer effect.
     * Use cases: Often used in live broadcasting, voice chatroom and KTV.
     * When to call: It needs to be called after [createEngine].
     * Restrictions: Voice changer effect is only effective for SDK captured sound.
     * Related APIs:
     * If you need advanced voice changer effect, please use [setVoiceChangerParam].
     * This function is mutually exclusive with [setReverbPreset]. If used at the same time, it will produce undefined effect.
     * Using ANDROID/ETHEREAL preset voice changer effect will modify reverberation or reverberation echo parameters. Calling [setVoiceChangerParam], [setReverbAdvancedParam], [setReverbEchoParam] may affect the voice changer effect after use these preset voice changer effect.
     * If you need advanced reverb/echo/electronic effects/voice changer effect, please use [setReverbAdvancedParam], [setReverbEchoParam], [setElectronicEffects], [setVoiceChangerParam] together.
     * @param {ZegoVoiceChangerPreset} preset - The voice changer preset enumeration.
     */
    setVoiceChangerPreset(preset){
        this.ZegoNativeInstance.setVoiceChangerPreset({preset});
    }

    /**
     * Setting up the specific voice changer parameters.
     *
     * Available since: 1.10.0
     * Description: Call this function to set custom voice changer effect.
     * Use cases: Often used in live broadcasting, voice chatroom and KTV.
     * When to call: It needs to be called after [createEngine].
     * Restrictions: Voice changer effect is only effective for SDK captured sound.
     * Related APIs:
     * [setVoiceChangerPreset] provide a set of preset voice changer effects.
     * If you need advanced reverb/echo/voice changer effect, please use [setReverbAdvancedParam], [setReverbEchoParam], [setVoiceChangerParam] together.
     * @param {ZegoVoiceChangerParam} param - Voice changer parameters.
     */
    setVoiceChangerParam(param){
        this.ZegoNativeInstance.setVoiceChangerParam({param});
    }

    /**
     * Setting up the reverberation via preset enumeration.
     *
     * Available since: 1.17.0
     * Description: Call this function to set preset reverb effect.
     * Use cases: Often used in live broadcasting, voice chatroom and KTV.
     * When to call: It needs to be called after [createEngine]. Support call this function to change preset reverb effect during publishing stream.
     * Restrictions: Reverb effect is only effective for SDK captured sound.
     * Related APIs:
     * If you need advanced reverb effect, please use [setReverbAdvancedParam].
     * This function is mutually exclusive with [setVoiceChangerPreset]. If used at the same time, it will produce undefined effects.
     * If you need advanced reverb/echo/voice changer effect, please use [setReverbAdvancedParam], [setReverbEchoParam], [setVoiceChangerParam] together.
     * @param {ZegoReverbPreset} preset - The reverberation preset enumeration.
     */
    setReverbPreset(preset){
        this.ZegoNativeInstance.setReverbPreset({preset});
    }

    /**
     * Setting up the specific reverberation parameters.
     *
     * Available since: 1.10.0
     * Description: Call this function to set preset reverb effect.
     * Use cases: Often used in live broadcasting, voice chatroom and KTV.
     * When to call: It needs to be called after [createEngine].
     * Restrictions: Reverb effect is only effective for SDK captured sound.
     * Caution: Different values dynamically set during publishing stream will take effect. When all parameters are set to 0, the reverberation is turned off.
     * Related APIs:
     * [setReverbPreset] provide a set of preset reverb effects.
     * If you need advanced reverb/echo/voice changer effect, please use [setReverbAdvancedParam], [setReverbEchoParam], [setVoiceChangerParam] together.
     * @param {ZegoReverbAdvancedParam} param - Reverb advanced parameter.
     */
    setReverbAdvancedParam(param){
        this.ZegoNativeInstance.setReverbAdvancedParam({param});
    }

    /**
     * Setting up the specific reverberation echo parameters.
     *
     * Available since: 1.17.0
     * Description: Call this function to set reverb echo effect. This function can be used with voice changer and reverb to achieve a variety of custom sound effects.
     * Use cases: Often used in live broadcasting, voice chatroom and KTV.
     * When to call: It needs to be called after [createEngine].
     * Restrictions: Reverb echo effect is only effective for SDK captured sound.
     * Related APIs: If you need advanced reverb/echo/voice changer effect, please use [setReverbAdvancedParam], [setReverbEchoParam], [setVoiceChangerParam] together.
     * @param {ZegoReverbEchoParam} param - The reverberation echo parameter.
     */
    setReverbEchoParam(param){
        this.ZegoNativeInstance.setReverbEchoParam({param});
    }

    /**
     * Enable or disable the virtual stereo effect when publishing stream..
     *
     * Available since: 1.10.0; Note: Starting from 2.15.0, the angle parameter supports setting -1 to present a all round virtual stereo effect.
     * Description: Call this function to enable / disable the virtual stereo effect when publishing stream.
     * Use cases: Often used in live broadcasting, voice chatroom and KTV.
     * When to call: It needs to be called after [createEngine].
     * Restrictions: Virtual stereo effect is only effective for SDK captured sound.
     * Caution: You need to set up a dual channel with [setAudioConfig] for the virtual stereo to take effect.
     * @param {boolean} enable - true to turn on the virtual stereo, false to turn off the virtual stereo.
     * @param {number} angle - The angle of the sound source in virtual stereo in the range of -1 ~ 360, with 90 being directly in front, 0 / 180 / 270 corresponding to the rightmost and leftmost respectively. In particular, when set to -1, it is all round virtual stereo effects.
     */
    enableVirtualStereo(enable, angle){
        this.ZegoNativeInstance.enableVirtualStereo({enable, angle});
    }

    /**
     * Sends a Broadcast Message.
     *
     * Available since: 1.2.1
     * Description: Send a broadcast message to the room, users who have entered the same room can receive the message, and the message is reliable.
     * Use cases: Generally used when the number of people in the live room does not exceed 500.
     * When to call: After calling [loginRoom] to log in to the room.
     * Restrictions: It is not supported when the number of people online in the room exceeds 500. If you need to increase the limit, please contact ZEGO technical support to apply for evaluation. The frequency of sending broadcast messages in the same room cannot be higher than 10 messages/s. The maximum QPS for a single user calling this interface from the client side is 2. For restrictions on the use of this function, please contact ZEGO technical support.
     * Related callbacks: The room broadcast message can be received through [onIMRecvBroadcastMessage].
     * Related APIs: Barrage messages can be sent through the [sendBarrageMessage] function, and custom command can be sent through the [sendCustomCommand] function.
     * @param {string} roomID - Room ID. Required: Yes. Value range: The maximum length is 128 bytes. Caution: The room ID is in string format and only supports numbers, English characters and'~','!','@','#','$','%','^','&', ' *','(',')','_','+','=','-','`',';',''',',','.','<' ,'>','/','\'.
     * @param {string} message - The content of the message. Required: Yes. Value range: The length does not exceed 1024 bytes.
     * @return {Promise<number, number>} - Send broadcast message result callback
     */
    sendBroadcastMessage(roomID, message){
        return this.ZegoNativeInstance.sendBroadcastMessage({roomID, message});
    }

    /**
     * Sends a Barrage Message (bullet screen) to all users in the same room, without guaranteeing the delivery.
     *
     * Available since: 1.5.0
     * Description: Send a barrage message to the room, users who have logged in to the same room can receive the message, the message is unreliable.
     * Use cases: Generally used in scenarios where there is a large number of messages sent and received in the room and the reliability of the messages is not required, such as live barrage.
     * When to call: After calling [loginRoom] to log in to the room.
     * Restrictions: The frequency of sending barrage messages in the same room cannot be higher than 20 messages/s. For restrictions on the use of this function, please contact ZEGO technical support.
     * Related callbacks: The room barrage message can be received through [onIMRecvBarrageMessage].
     * Related APIs: Broadcast messages can be sent through the [sendBroadcastMessage] function, and custom command can be sent through the [sendCustomCommand] function.
     * @param {string} roomID - Room ID. Required: Yes. Value range: The maximum length is 128 bytes. Caution: The room ID is in string format and only supports numbers, English characters and'~','!','@','#','$','%','^','&', ' *','(',')','_','+','=','-','`',';',''',',','.','<' ,'>','/','\'.
     * @param {string} message - The content of the message. Required: Yes. Value range: The length does not exceed 1024 bytes.
     * @return {Promise<number, string>} - Send barrage message result callback.
     */
    sendBarrageMessage(roomID, message){
        return this.ZegoNativeInstance.sendBarrageMessage({roomID, message});
    }

    /**
     * Sends a Custom Command to the specified users in the same room.
     *
     * Available since: 1.2.1
     * Description: After calling this function, users in the same room who have entered the room can receive the message, the message is unreliable.
     * Use cases: Generally used in scenarios where there is a large number of messages sent and received in the room and the reliability of the messages is not required, such as live barrage.
     * When to call: After calling [loginRoom] to log in to the room.
     * Restrictions: Generally used when the number of people in the live room does not exceed 500.The frequency of sending barrage messages in the same room cannot be higher than 20 messages/s. For restrictions on the use of this function, please contact ZEGO technical support.
     * Related callbacks: The room custom command can be received through [onIMRecvCustomCommand].
     * Related APIs: Broadcast messages can be sent through the [sendBroadcastMessage] function, and barrage messages can be sent through the [sendBarrageMessage] function.
     * Privacy reminder: Please do not fill in sensitive user information in this interface, including but not limited to mobile phone number, ID number, passport number, real name, etc.
     * @param {string} roomID - Room ID. Required: Yes. Value range: The maximum length is 128 bytes. Caution: The room ID is in string format and only supports numbers, English characters and'~','!','@','#','$','%','^','&', ' *','(',')','_','+','=','-','`',';',''',',','.','<' ,'>','/','\'.
     * @param {string} command - Custom command content. Required: Yes. Value range: The maximum length is 1024 bytes. Caution: To protect privacy, please do not fill in sensitive user information in this interface, including but not limited to mobile phone number, ID number, passport number, real name, etc.
     * @param {ZegoUser[]} toUserList - List of recipients of signaling. Required: Yes. Value range: user list or [null]. Caution: When it is [null], the SDK will send custom signaling back to all users in the room
     * @return {Promise<number>} - Send command result callback.
     */
    sendCustomCommand(roomID, command, toUserList){
        return this.ZegoNativeInstance.sendCustomCommand({roomID, command, toUserList});
    }

    /**
     * Creates a media player instance.
     *
     * Available since: 2.1.0
     * Description: Creates a media player instance.
     * Use case: It is often used to play media resource scenes, For example, play video files, push the video of media resources in combination with custom video acquisition, and the remote end can pull the stream for viewing.
     * When to call: It can be called after the SDK by [createEngine] has been initialized.
     * Restrictions: Currently, a maximum of 4 instances can be created, after which it will return null.
     * Caution: The more instances of a media player, the greater the performance overhead on the device.
     * Related APIs: User can call [destroyMediaPlayer] function to destroy a media player instance.
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
     * Available since: 2.1.0
     * Description: Destroys a media player instance.
     * Related APIs: User can call [createMediaPlayer] function to create a media player instance.
     * @param {ZegoMediaPlayer} mediaPlayer - The media player instance object to be destroyed.
     */
    destroyMediaPlayer(mediaPlayer){
        let nativeMediaPlayer = mediaPlayer.nativeMediaPlayer;
        let nativeMediaPlayerPtr = mediaPlayer.nativeMediaPlayer.getNativePtr();
        this.ZegoNativeInstance.destroyMediaPlayer({ nativeMediaPlayer});
        this.mediaPlayers[nativeMediaPlayerPtr] = null;
    }

    /**
     * Starts to record and directly save the data to a file.
     *
     * Available since: 1.10.0
     * Description: Starts to record locally captured audio or video and directly save the data to a file, The recorded data will be the same as the data publishing through the specified channel.
     * When to call: This function needs to be called after the success of [startPreview] or [startPublishingStream] to be effective.
     * Restrictions: None.
     * Caution: Developers should not [stopPreview] or [stopPublishingStream] during recording, otherwise the SDK will end the current recording task. The data of the media player needs to be mixed into the publishing stream to be recorded.
     * Related callbacks: Developers will receive the [onCapturedDataRecordStateUpdate] and the [onCapturedDataRecordProgressUpdate] callback after start recording.
     * @param {ZegoDataRecordConfig} config - Record config.
     * @param {ZegoPublishChannel} channel - Publishing stream channel.
     */
    startRecordingCapturedData(config, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.startRecordingCapturedData({config, channel});
    }

    /**
     * Stops recording locally captured audio or video.
     *
     * Available since: 1.10.0
     * Description: Stops recording locally captured audio or video.
     * When to call: After [startRecordingCapturedData].
     * Restrictions: None.
     * @param {ZegoPublishChannel} channel - Publishing stream channel.
     */
    stopRecordingCapturedData(channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.stopRecordingCapturedData({channel});
    }

    /**
     * Start network speed test. Support set speed test interval。
     *
     * Available since: 1.20.0
     * Description: This function supports uplink/downlink network speed test.
     * Use cases: This function can be used to detect whether the network environment is suitable for pushing/pulling streams with specified bitrates.
     * When to call: It needs to be called after [createEngine], and before [startPublishingStream]. If you call [startPublishingStream] while speed testing, the speed test will automatically stop.
     * Restrictions: The maximum allowable test time for a single network speed test is 3 minutes.
     * Caution: Developers can register [onNetworkSpeedTestQualityUpdate] callback to get the speed test result, which will be triggered every 3 seconds. If an error occurs during the speed test process, [onNetworkSpeedTestError] callback will be triggered. If this function is repeatedly called multiple times, the last functioh call's configuration will be used.
     * Related APIs: Call [stopNetworkSpeedTest] to stop network speed test.
     * @param {ZegoNetworkSpeedTestConfig} config - Network speed test configuration.
     * @param {number} interval - Interval of network speed test. In milliseconds, default is 3000 ms.
     */
    startNetworkSpeedTest(config, interval = 3000){
        this.ZegoNativeInstance.startNetworkSpeedTest({config, interval});
    }

    /**
     * Stop network speed test.
     *
     * Available since: 1.20.0
     * Description: Stop network speed test.
     * Use cases: This function can be used to detect whether the network environment is suitable for pushing/pulling streams with specified bitrates.
     * When to call: It needs to be called after [createEngine].
     * Restrictions: None.
     * Caution: After the network speed test stopped, [onNetworkSpeedTestQualityUpdate] callback will not be triggered.
     * Related APIs: Call [startNetworkSpeedTest] to start network speed test.
     */
    stopNetworkSpeedTest(){
        this.ZegoNativeInstance.stopNetworkSpeedTest({});
    }

    /**
     * Enables or disables custom video capture (for the specified channel).
     *
     * Available since: 1.9.0
     * Description: If the value of enable is true, the video collection function is enabled. If the value of enable is false, the video collection function is disabled.
     * Use case: The App developed by the developer uses the beauty SDK of a third-party beauty manufacturer to broadcast non-camera collected data.
     * Default value: When this function is not called, custom video collection is disabled by default.
     * When to call: After [createEngine], call [startPreview], [startPublishingStream], [createRealTimeSequentialDataManager], and call [logoutRoom] to modify the configuration.
     * Caution: Custom video rendering can be used in conjunction with custom video capture, but when both are enabled, the local capture frame callback for custom video rendering will no longer be triggered, and the developer should directly capture the captured video frame from the custom video capture source.
     * Related callbacks: When developers to open a custom collection, by calling [setCustomVideoCaptureHandler] can be set up to receive a custom collection start-stop event notification.
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
     * Set the region of interest (ROI) for encoder of custom video capture (for the specified channel).
     *
     * Available since: 2.16.0.
     * Description: You can set the video encoder's region of interest rectangle areas of custom video capture (for the specified channel) through this function.
     * When to call: After the callback [onStart] is received.
     * Restrictions: Currently, only certain video encoders support this function, please contact ZEGO technical support before using it.
     * Caution: This function is currently an experimental feature, please contact ZEGO technical support before using it.
     * @param {Array<ZegoRoiRect>} rectList - ROI rectangle area list, currently supports up to 6 areas.
     * @param {number} rectCount - Length of the rectangle list (count of rectangle).
     * @param {ZegoPublishChannel} channel - Publish channel
     */
    setCustomVideoCaptureRegionOfInterest(rectList, rectCount, channel){
        this.ZegoNativeInstance.setCustomVideoCaptureRegionOfInterest({rectList, rectCount, channel});
    }

    /**
     * Enables or disables custom video processing.
     *
     * Available since: 2.2.0 (Android/iOS/macOS native), 2.4.0 (Windows/macOS C++).
     * Description: When the developer opens custom pre-processing, by calling [setCustomVideoProcessHandler] you can set the custom video pre-processing callback.
     * Use cases: After the developer collects the video data by himself or obtains the video data collected by the SDK, if the basic beauty and watermark functions of the SDK cannot meet the needs of the developer (for example, the beauty effect cannot meet the expectations), the ZegoEffects SDK can be used to perform the video Some special processing, such as beautifying, adding pendants, etc., this process is the pre-processing of custom video.
     * Default value: Off by default
     * When to call: Must be set before calling [startPreview], [startPublishingStream], [createRealTimeSequentialDataManager]. If you need to modify the configuration, please call [logoutRoom] to log out of the room first, otherwise it will not take effect.
     * Restrictions: None.
     * Related APIs: Call the [setCustomVideoProcessHandler] function to set the callback before custom video processing.
     * @param {boolean} enable - enable or disable. Required: Yes.
     * @param {ZegoPublishChannel} channel - Publishing stream channel.Required: No.Default value: Main publish channel.
     */
    enableCustomVideoProcessing(enable, channel){
        this.ZegoNativeInstance.enableCustomVideoProcessing({enable, channel});
    }

    /**
     * Register custom video process plugin
     *
     * @param {number} plugin - Video process plugin
     * @param {ZegoPublishChannel} channel - Publish channel
     */
    registerCustomVideoProcessPlugin(plugin, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.registerCustomVideoProcessPlugin({plugin, channel});
    }

    /**
     * Set the custom video process crop region
     *
     * @param {number} left - The value at the left of the horizontal axis of the rectangle
     * @param {number} top - The value at the top of the vertical axis of the rectangle
     * @param {number} right - The value at the right of the horizontal axis of the rectangle
     * @param {number} bottom - The value at the bottom of the vertical axis of the rectangle
     * @param {ZegoPublishChannel} channel - Publish channel
     */
    setCustomVideoProcessCutRegion(left, top, right, bottom, channel = ZegoPublishChannel.Main){
        this.ZegoNativeInstance.setCustomVideoProcessCutRegion({left, top, right, bottom, channel});
    }

    /**
     * Enable local collection and custom audio processing(before ear return).
     *
     * Available since: 1.13.0
     * Description: Enable custom audio processing(before ear return), developers can receive locally collected audio frames through [onProcessCapturedAudioData], and can modify the audio data.
     * Use cases: If the developer wants to implement special functions (such as voice change, bel canto, etc.) through custom processing after the audio data is collected or before the remote audio data is drawn for rendering.
     * When to call: It needs to be called before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer], [createAudioEffectPlayer] and [createRealTimeSequentialDataManager] to be effective.
     * Restrictions: None.
     * @param {boolean} enable - Whether to enable local capture custom audio processing.
     * @param {ZegoCustomAudioProcessConfig} config - Custom audio processing configuration.
     */
    enableCustomAudioCaptureProcessing(enable, config){
        this.ZegoNativeInstance.enableCustomAudioCaptureProcessing({enable, config});
    }

    /**
     * Register custom audio processing plugin.
     *
     * @param {Number} plugin - Audio processing plugin.
     * @param {ZegoCustomAudioProcessConfigureType} type - Custom audio process configure type.
     */
    registerCustomAudioProcessPlugin(plugin, type){
        this.ZegoNativeInstance.registerCustomAudioProcessPlugin({plugin, type});
    }

    /**
     * Turn on local collection and custom audio processing (after ear return).
     *
     * Available since: 1.13.0
     * Description: Enable custom audio processing(after ear return), developers can receive locally collected audio frames through [onProcessCapturedAudioData], and can modify the audio data.
     * Use cases: If the developer wants to implement special functions (such as voice change, bel canto, etc.) through custom processing after the audio data is collected or before the remote audio data is drawn for rendering.
     * When to call: It needs to be called before [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer], [createAudioEffectPlayer] and [createRealTimeSequentialDataManager] to be effective.
     * Restrictions: None.
     * @param {boolean} enable - Whether to enable local capture custom audio processing.
     * @param {ZegoCustomAudioProcessConfig} config - Custom audio processing configuration.
     */
    enableCustomAudioCaptureProcessingAfterHeadphoneMonitor(enable, config){
        this.ZegoNativeInstance.enableCustomAudioCaptureProcessingAfterHeadphoneMonitor({enable, config});
    }

    /**
     * [Deprecated] Initializes the Engine. Deprecated since 2.14.0, please use the method [createEngine] instead.
     *
     * The engine needs to be initialized before calling other functions
     * @param {number} appID - Application ID issued by ZEGO for developers, please apply from the ZEGO Admin Console https://console.zegocloud.com The value ranges from 0 to 4294967295.
     * @param {string} appSign - Application signature for each AppID, please apply from the ZEGO Admin Console. Application signature is a 64 character string. Each character has a range of '0' ~ '9', 'a' ~ 'z'. AppSign 2.17.0 and later allows null or no transmission. If the token is passed empty or not passed, the token must be entered in the [ZegoRoomConfig] parameter for authentication when the [loginRoom] interface is called to login to the room.
     * @param {boolean} isTestEnv - Choose to use a test environment or a formal commercial environment, the formal environment needs to submit work order configuration in the ZEGO management console. The test environment is for test development, with a limit of 10 rooms and 50 users. Official environment App is officially launched. ZEGO will provide corresponding server resources according to the configuration records submitted by the developer in the management console. The test environment and the official environment are two sets of environments and cannot be interconnected.
     * @param {ZegoScenario} scenario - The application scenario. Developers can choose one of ZegoScenario based on the scenario of the app they are developing, and the engine will preset a more general setting for specific scenarios based on the set scenario. After setting specific scenarios, developers can still call specific functions to set specific parameters if they have customized parameter settings.
     * @deprecated Deprecated since 2.14.0, please use the method [createEngine] instead.
     */
    init(appID, appSign, isTestEnv, scenario){
        let tsfn = this.callEmit.bind(this);
        const that = this;
        that.debugAssistant = false;
        that.appID = appID;

        // Get electron SDK version
        var electronVersion = PackageJson.version;

        return new Promise(function (resolve, reject) {
            that.ZegoNativeInstance = ZegoNativeSDK.CreateEngine({ appID, appSign, isTestEnv, scenario, tsfn, electronVersion})
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
     * [Deprecated] Turns on/off verbose debugging and sets up the log language. This function is deprecated in version 2.3.0, please use [enableDebugAssistant] to achieve the original function.
     *
     * This feature is disabled by default and the language of debug information is English.
     * @param {boolean} enable - Detailed debugging information switch
     * @param {ZegoLanguage} language - Debugging information language. Note that Chinese is deprecated, if you need Chinese info, please refer to the document https://docs.zegocloud.com/en/5548.html
     * @deprecated This function is deprecated in version 2.3.0, please use [enableDebugAssistant] to achieve the original function.
     */
    setDebugVerbose(enable, language){
        this.ZegoNativeInstance.setDebugVerbose({enable, language});
    }

    /**
     * [Deprecated] Logs in multi room. This method has been deprecated after version 2.9.0 If you want to access the multi-room feature, Please set [setRoomMode] to select multi-room mode before the engine started, and then call [loginRoom] to use multi-room. If you call [loginRoom] function to log in to multiple rooms, please make sure to pass in the same user information.
     *
     * This method has been deprecated after version 2.9.0 If you want to access the multi-room feature, Please set [setRoomMode] to select multi-room mode before the engine started, and then call [loginRoom] to use multi-room. If you call [loginRoom] function to log in to multiple rooms, please make sure to pass in the same user information.
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
     * @param {string} roomID - Room ID, a string of up to 128 bytes in length. Only support numbers, English characters and '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '/', '\'.
     * @param {ZegoRoomConfig} config - Advanced room configuration.
     * @deprecated This method has been deprecated after version 2.9.0 If you want to access the multi-room feature, Please set [setRoomMode] to select multi-room mode before the engine started, and then call [loginRoom] to use multi-room. If you call [loginRoom] function to log in to multiple rooms, please make sure to pass in the same user information.
     */
    loginMultiRoom(roomID, config = { maxMemberCount:0, isUserStatusNotify: false, token:'' }){
        config = Object.assign({ maxMemberCount:0, isUserStatusNotify: false, token:'' }, config);
        this.ZegoNativeInstance.loginRoom({roomID, user, config});
    }

    /**
     * [Deprecated] Set the selected video layer of playing stream. This function has been deprecated since version 2.3.0, Please use [setPlayStreamVideoType] instead.
     *
     * Available: 1.19.0 to 2.3.0, deprecated.
     * This function has been deprecated since version 2.3.0, Please use [setPlayStreamVideoType] instead.
     * When the publisher has set the codecID to SVC through [setVideoConfig], the player can dynamically set whether to use the standard layer or the base layer (the resolution of the base layer is one-half of the standard layer)
     * Under normal circumstances, when the network is weak or the rendered UI form is small, you can choose to use the video that plays the base layer to save bandwidth.
     * It can be set before and after playing stream.
     * @param {string} streamID - Stream ID.
     * @param {ZegoPlayerVideoLayer} videoLayer - Video layer of playing stream. AUTO by default.
     * @deprecated This function has been deprecated since version 2.3.0, Please use [setPlayStreamVideoType] instead.
     */
    setPlayStreamVideoLayer(streamID, videoLayer){
        this.ZegoNativeInstance.setPlayStreamVideoLayer({streamID, videoLayer});
    }

    /**
     * @event ZegoExpressEngine#onDebugError
     * @desc The callback for obtaining debugging error information.
     *
     * Available since: 1.1.0
     * Description: When the SDK functions are not used correctly, the callback prompts for detailed error information.
     * Trigger: Notify the developer when an exception occurs in the SDK.
     * Restrictions: None.
     * Caution: None.
     * @property {object} result - param object
     * @property {number} result.errorCode - Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
     * @property {string} result.funcName - Function name.
     * @property {string} result.info - Detailed error information.
     */

    /**
     * @event ZegoExpressEngine#onEngineStateUpdate
     * @desc The callback triggered when the audio/video engine state changes.
     *
     * Available since: 1.1.0
     * Description: Callback notification of audio/video engine status update. When audio/video functions are enabled, such as preview, push streaming, local media player, audio data observering, etc., the audio/video engine will enter the start state. When you exit the room or disable all audio/video functions , The audio/video engine will enter the stop state.
     * Trigger: The developer called the relevant function to change the state of the audio and video engine. For example: 1. Called ZegoExpressEngine's [startPreview], [stopPreview], [startPublishingStream], [stopPublishingStream], [startPlayingStream], [stopPlayingStream], [startAudioDataObserver], [stopAudioDataObserver] and other functions. 2. The related functions of MediaPlayer are called. 3. The [LogoutRoom] function was called. 4. The related functions of RealTimeSequentialDataManager are called.
     * Restrictions: None.
     * Caution:
     *   1. When the developer calls [destroyEngine], this notification will not be triggered because the resources of the SDK are completely released.
     *   2. If there is no special need, the developer does not need to pay attention to this callback.
     * @property {object} result - param object
     * @property {ZegoEngineState} result.state - The audio/video engine state.
     */

    /**
     * @event ZegoExpressEngine#onRoomStateUpdate
     * @desc The callback triggered when the room connection state changes.
     *
     * Available since: 1.1.0
     * Description: This callback is triggered when the connection status of the room changes, and the reason for the change is notified.For versions 2.18.0 and above, it is recommended to use the onRoomStateChanged callback instead of the onRoomStateUpdate callback to monitor room state changes.
     * Use cases: Developers can use this callback to determine the status of the current user in the room.
     * When to trigger: 
     *  1. The developer will receive this notification when calling the [loginRoom], [logoutRoom], [switchRoom] functions. 
     *  2. This notification may also be received when the network condition of the user's device changes (SDK will automatically log in to the room when disconnected, please refer to [Does ZEGO SDK support a fast reconnection for temporary disconnection] for details](https://docs.zegocloud.com/faq/reconnect?product=ExpressVideo&platform=all).
     * Restrictions: None.
     * Caution: If the connection is being requested for a long time, the general probability is that the user's network is unstable.
     * Related APIs: [loginRoom]、[logoutRoom]、[switchRoom]
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID, a string of up to 128 bytes in length.
     * @property {ZegoRoomState} result.state - Changed room state.
     * @property {number} result.errorCode - Error code, For details, please refer to [Common Error Codes](https://docs.zegocloud.com/article/5548).
     * @property {string} result.extendedData - Extended Information with state updates. When the room login is successful, the key "room_session_id" can be used to obtain the unique RoomSessionID of each audio and video communication, which identifies the continuous communication from the first user in the room to the end of the audio and video communication. It can be used in scenarios such as call quality scoring and call problem diagnosis.
     */

    /**
     * @event ZegoExpressEngine#onRoomUserUpdate
     * @desc The callback triggered when the number of other users in the room increases or decreases.
     *
     * Available since: 1.1.0
     * Description: When other users in the room are online or offline, which causes the user list in the room to change, the developer will be notified through this callback.
     * Use cases: Developers can use this callback to update the user list display in the room in real time.
     * When to trigger: 
     *   1. When the user logs in to the room for the first time, if there are other users in the room, the SDK will trigger a callback notification with `updateType` being [ZegoUpdateTypeAdd], and `userList` is the other users in the room at this time.
     *   2. The user is already in the room. If another user logs in to the room through the [loginRoom] or [switchRoom] functions, the SDK will trigger a callback notification with `updateType` being [ZegoUpdateTypeAdd].
     *   3. If other users log out of this room through the [logoutRoom] or [switchRoom] functions, the SDK will trigger a callback notification with `updateType` being [ZegoUpdateTypeDelete].
     *   4. The user is already in the room. If another user is kicked out of the room from the server, the SDK will trigger a callback notification with `updateType` being [ZegoUpdateTypeDelete].
     * Restrictions: If developers need to use ZEGO room users notifications, please ensure that the [ZegoRoomConfig] sent by each user when logging in to the room has the [isUserStatusNotify] property set to true, otherwise the callback notification will not be received.
     * Related APIs: [loginRoom]、[logoutRoom]、[switchRoom]
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID where the user is logged in, a string of up to 128 bytes in length.
     * @property {ZegoUpdateType} result.updateType - Update type (add/delete).
     * @property {ZegoUser[]} result.userList - List of users changed in the current room.
     */

    /**
     * @event ZegoExpressEngine#onRoomOnlineUserCountUpdate
     * @desc The callback triggered every 30 seconds to report the current number of online users.
     *
     * Available since: 1.7.0
     * Description: This method will notify the user of the current number of online users in the room..
     * Use cases: Developers can use this callback to show the number of user online in the current room.
     * When to call /Trigger: After successfully logging in to the room.
     * Restrictions: None.
     * Caution: 1. This function is called back every 30 seconds. 2. Because of this design, when the number of users in the room exceeds 500, there will be some errors in the statistics of the number of online people in the room.
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID where the user is logged in, a string of up to 128 bytes in length.
     * @property {number} result.count - Count of online users.
     */

    /**
     * @event ZegoExpressEngine#onRoomStreamUpdate
     * @desc The callback triggered when the number of streams published by the other users in the same room increases or decreases.
     *
     * Available since: 1.1.0
     * Description: When other users in the room start streaming or stop streaming, the streaming list in the room changes, and the developer will be notified through this callback.
     * Use cases: This callback is used to monitor stream addition or stream deletion notifications of other users in the room. Developers can use this callback to determine whether other users in the same room start or stop publishing stream, so as to achieve active playing stream [startPlayingStream] or take the initiative to stop the playing stream [stopPlayingStream], and use it to change the UI controls at the same time.
     * When to trigger:
     *   1. When the user logs in to the room for the first time, if there are other users publishing streams in the room, the SDK will trigger a callback notification with `updateType` being [ZegoUpdateTypeAdd], and `streamList` is an existing stream list.
     *   2. The user is already in the room. if another user adds a new push, the SDK will trigger a callback notification with `updateType` being [ZegoUpdateTypeAdd].
     *   3. The user is already in the room. If other users stop streaming, the SDK will trigger a callback notification with `updateType` being [ZegoUpdateTypeDelete].
     *   4. The user is already in the room. If other users leave the room, the SDK will trigger a callback notification with `updateType` being [ZegoUpdateTypeDelete].
     * Restrictions: None.
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID where the user is logged in, a string of up to 128 bytes in length.
     * @property {ZegoUpdateType} result.updateType - Update type (add/delete).
     * @property {ZegoStream[]} result.streamList - Updated stream list.
     * @property {string} result.extendedData - Extended information with stream updates.
     */

    /**
     * @event ZegoExpressEngine#onRoomStreamExtraInfoUpdate
     * @desc The callback triggered when there is an update on the extra information of the streams published by other users in the same room.
     *
     * Available since: 1.1.0
     * Description: All users in the room will be notified by this callback when the extra information of the stream in the room is updated.
     * Use cases: Users can realize some business functions through the characteristics of stream extra information consistent with stream life cycle.
     * When to call /Trigger: When a user publishing the stream update the extra information of the stream in the same room, other users in the same room will receive the callback.
     * Restrictions: None.
     * Caution: Unlike the stream ID, which cannot be modified during the publishing process, the stream extra information can be updated during the life cycle of the corresponding stream ID.
     * Related APIs: Users who publish stream can set extra stream information through [setStreamExtraInfo].
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID where the user is logged in, a string of up to 128 bytes in length.
     * @property {ZegoStream[]} result.streamList - List of streams that the extra info was updated.
     */

    /**
     * @event ZegoExpressEngine#onRoomExtraInfoUpdate
     * @desc The callback triggered when there is an update on the extra information of the room.
     *
     * Available since: 1.1.0
     * Description: After the room extra information is updated, all users in the room will be notified except update the room extra information user.
     * Use cases: Extra information for the room.
     * When to call /Trigger: When a user update the room extra information, other users in the same room will receive the callback.
     * Restrictions: None.
     * Related APIs: Users can update room extra information through [setRoomExtraInfo] function.
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID where the user is logged in, a string of up to 128 bytes in length.
     * @property {ZegoRoomExtraInfo[]} result.roomExtraInfoList - List of the extra info updated.
     */

    /**
     * @event ZegoExpressEngine#onRoomTokenWillExpire
     * @desc Callback notification that room Token authentication is about to expire.
     *
     * Available since: 2.8.0
     * Description: The callback notification that the room Token authentication is about to expire, please use [renewToken] to update the room Token authentication.
     * Use cases: In order to prevent illegal entry into the room, it is necessary to perform authentication control on login room, push streaming, etc., to improve security.
     * When to call /Trigger: 30 seconds before the Token expires, the SDK will call [onRoomTokenWillExpire] to notify developer.
     * Restrictions: None.
     * Caution: The token contains important information such as the user's room permissions, publish stream permissions, and effective time, please refer to https://docs.zegocloud.com/article/11649.
     * Related APIs: When the developer receives this callback, he can use [renewToken] to update the token authentication information.
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID where the user is logged in, a string of up to 128 bytes in length.
     * @property {number} result.remainTimeInSecond - The remaining time before the token expires.
     */

    /**
     * @event ZegoExpressEngine#onPublisherStateUpdate
     * @desc The callback triggered when the state of stream publishing changes.
     *
     * Available since: 1.1.0
     * Description: After calling the [startPublishingStream] successfully, the notification of the publish stream state change can be obtained through the callback function. You can roughly judge the user's uplink network status based on whether the state parameter is in [PUBLISH_REQUESTING].
     * Caution: The parameter [extendedData] is extended information with state updates. If you use ZEGO's CDN content distribution network, after the stream is successfully published, the keys of the content of this parameter are [flv_url_list], [rtmp_url_list], [hls_url_list], these correspond to the publishing stream URLs of the flv, rtmp, and hls protocols.
     * Related callbacks: After calling the [startPlayingStream] successfully, the notification of the play stream state change can be obtained through the callback function [onPlayerStateUpdate]. You can roughly judge the user's downlink network status based on whether the state parameter is in [PLAY_REQUESTING].
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     * @property {ZegoPublisherState} result.state - State of publishing stream.
     * @property {number} result.errorCode - The error code corresponding to the status change of the publish stream, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
     * @property {string} result.extendedData - Extended information with state updates.
     */

    /**
     * @event ZegoExpressEngine#onPublisherQualityUpdate
     * @desc Callback for current stream publishing quality.
     *
     * Available since: 1.1.0
     * Description: After calling the [startPublishingStream] successfully, the callback will be received every 3 seconds default(If you need to change the time, please contact the instant technical support to configure). Through the callback, the collection frame rate, bit rate, RTT, packet loss rate and other quality data of the published audio and video stream can be obtained, and the health of the publish stream can be monitored in real time.You can monitor the health of the published audio and video streams in real time according to the quality parameters of the callback function, in order to show the uplink network status in real time on the device UI.
     * Caution: If you does not know how to use the parameters of this callback function, you can only pay attention to the [level] field of the [quality] parameter, which is a comprehensive value describing the uplink network calculated by SDK based on the quality parameters.
     * Related callbacks: After calling the [startPlayingStream] successfully, the callback [onPlayerQualityUpdate] will be received every 3 seconds. You can monitor the health of play streams in real time based on quality data such as frame rate, code rate, RTT, packet loss rate, etc.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     * @property {ZegoPublishStreamQuality} result.quality - Publishing stream quality, including audio and video framerate, bitrate, RTT, etc.
     */

    /**
     * @event ZegoExpressEngine#onPublisherCapturedAudioFirstFrame
     * @desc The callback triggered when the first audio frame is captured.
     *
     * Available since: 1.1.0
     * Description: After the [startPublishingStream] function is called successfully, this callback will be called when SDK received the first frame of audio data. Developers can use this callback to determine whether SDK has actually collected audio data. If the callback is not received, the audio capture device is occupied or abnormal.
     * Trigger: In the case of no startPublishingStream audio and video stream or preview [startPreview], the first startPublishingStream audio and video stream or first preview, that is, when the engine of the audio and video module inside SDK starts, it will collect audio data of the local device and receive this callback.
     * Related callbacks: After the [startPublishingStream] function is called successfully, determine if the SDK actually collected video data by the callback function [onPublisherCapturedVideoFirstFrame], determine if the SDK has rendered the first frame of video data collected by calling back [onPublisherRenderVideoFirstFrame].
     * @property {object} result - param object
     */

    /**
     * @event ZegoExpressEngine#onPublisherCapturedVideoFirstFrame
     * @desc The callback triggered when the first video frame is captured.
     *
     * Available since: 1.1.0
     * Description: After the [startPublishingStream] function is called successfully, this callback will be called when SDK received the first frame of video data. Developers can use this callback to determine whether SDK has actually collected video data. If the callback is not received, the video capture device is occupied or abnormal.
     * Trigger: In the case of no startPublishingStream video stream or preview, the first startPublishingStream video stream or first preview, that is, when the engine of the audio and video module inside SDK starts, it will collect video data of the local device and receive this callback.
     * Related callbacks: After the [startPublishingStream] function is called successfully, determine if the SDK actually collected audio data by the callback function [onPublisherCapturedAudioFirstFrame], determine if the SDK has rendered the first frame of video data collected by calling back [onPublisherRenderVideoFirstFrame].
     * @property {object} result - param object
     * @property {ZegoPublishChannel} result.channel - Publishing stream channel.If you only publish one audio and video stream, you can ignore this parameter.
     */

    /**
     * @event ZegoExpressEngine#onPublisherVideoSizeChanged
     * @desc The callback triggered when the video capture resolution changes.
     *
     * Available since: 1.1.0
     * Description: When the audio and video stream is not published [startPublishingStream] or previewed [startPreview] for the first time, the publishing stream or preview first time, that is, the engine of the audio and video module inside the SDK is started, the video data of the local device will be collected, and the collection resolution will change at this time.
     * Trigger: After the successful publish [startPublishingStream], the callback will be received if there is a change in the video capture resolution in the process of publishing the stream.
     * Use cases: You can use this callback to remove the cover of the local preview UI and similar operations.You can also dynamically adjust the scale of the preview view based on the resolution of the callback.
     * Caution: What is notified during external collection is the change in encoding resolution, which will be affected by flow control.
     * @property {object} result - param object
     * @property {number} result.width - Video capture resolution width.
     * @property {number} result.height - Video capture resolution height.
     * @property {ZegoPublishChannel} result.channel - Publishing stream channel.If you only publish one audio and video stream, you can ignore this parameter.
     */

    /**
     * @event ZegoExpressEngine#onPublisherRelayCDNStateUpdate
     * @desc The callback triggered when the state of relayed streaming to CDN changes.
     *
     * Available since: 1.1.0
     * Description: Developers can use this callback to determine whether the audio and video streams of the relay CDN are normal. If they are abnormal, further locate the cause of the abnormal audio and video streams of the relay CDN and make corresponding disaster recovery strategies.
     * Trigger: After the ZEGO RTC server relays the audio and video streams to the CDN, this callback will be received if the CDN relay status changes, such as a stop or a retry.
     * Caution: If you do not understand the cause of the abnormality, you can contact ZEGO technicians to analyze the specific cause of the abnormality.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     * @property {ZegoStreamRelayCDNInfo[]} result.infoList - List of information that the current CDN is relaying.
     */

    /**
     * @event ZegoExpressEngine#onPlayerStateUpdate
     * @desc The callback triggered when the state of stream playing changes.
     *
     * Available since: 1.1.0
     * Description: After calling the [startPlayingStream] successfully, the notification of the playing stream state change can be obtained through the callback function. You can roughly judge the user's downlink network status based on whether the state parameter is in [PLAY_REQUESTING].
     * When to trigger:  After calling the [startPublishingStream], this callback is triggered when a playing stream's state changed.
     * Related callbacks: After calling the [startPublishingStream] successfully, the notification of the publish stream state change can be obtained through the callback function [onPublisherStateUpdate]. You can roughly judge the user's uplink network status based on whether the state parameter is in [PUBLISH_REQUESTING].
     * @property {object} result - param object
     * @property {string} result.streamID - stream ID.
     * @property {ZegoPlayerState} result.state - State of playing stream.
     * @property {number} result.errorCode - The error code corresponding to the status change of the playing stream, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
     * @property {string} result.extendedData - Extended Information with state updates. As the standby, only an empty json table is currently returned.
     */

    /**
     * @event ZegoExpressEngine#onPlayerQualityUpdate
     * @desc Callback for current stream playing quality.
     *
     * Available since: 1.1.0
     * Description: After calling the [startPlayingStream] successfully, this callback will be triggered every 3 seconds. The collection frame rate, bit rate, RTT, packet loss rate and other quality data can be obtained, and the health of the played audio and video streams can be monitored in real time.
     * Use cases: You can monitor the health of the played audio and video streams in real time according to the quality parameters of the callback function, in order to show the downlink network status on the device UI in real time.
     * Caution: If you does not know how to use the various parameters of the callback function, you can only focus on the level field of the quality parameter, which is a comprehensive value describing the downlink network calculated by SDK based on the quality parameters.
     * Related callbacks: After calling the [startPublishingStream] successfully, a callback [onPublisherQualityUpdate] will be received every 3 seconds. You can monitor the health of publish streams in real time based on quality data such as frame rate, code rate, RTT, packet loss rate, etc.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     * @property {ZegoPlayStreamQuality} result.quality - Playing stream quality, including audio and video framerate, bitrate, RTT, etc.
     */

    /**
     * @event ZegoExpressEngine#onPlayerMediaEvent
     * @desc The callback triggered when a media event occurs during streaming playing.
     *
     * Available since: 1.1.0
     * Description: This callback is used to receive pull streaming events.
     * Use cases: You can use this callback to make statistics on stutters or to make friendly displays in the UI of the app.
     * When to trigger:  After calling the [startPublishingStream], this callback is triggered when an event such as audio and video jamming and recovery occurs in the playing stream.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     * @property {ZegoPlayerMediaEvent} result.event - Specific events received when playing the stream.
     */

    /**
     * @event ZegoExpressEngine#onPlayerRecvAudioFirstFrame
     * @desc The callback triggered when the first audio frame is received.
     *
     * Available since: 1.1.0
     * Description: After the [startPlayingStream] function is called successfully, this callback will be called when SDK received the first frame of audio data.
     * Use cases: Developer can use this callback to count time consuming that take the first frame time or update the UI for playing stream.
     * Trigger: This callback is triggered when SDK receives the first frame of audio data from the network.
     * Related callbacks: After a successful call to [startPlayingStream], the callback function [onPlayerRecvVideoFirstFrame] determines whether the SDK has received the video data, and the callback [onPlayerRenderVideoFirstFrame] determines whether the SDK has rendered the first frame of the received video data.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     */

    /**
     * @event ZegoExpressEngine#onPlayerRecvVideoFirstFrame
     * @desc The callback triggered when the first video frame is received.
     *
     * Available since: 1.1.0
     * Description: After the [startPlayingStream] function is called successfully, this callback will be called when SDK received the first frame of video data.
     * Use cases: Developer can use this callback to count time consuming that take the first frame time or update the UI for playing stream.
     * Trigger: This callback is triggered when SDK receives the first frame of video data from the network.
     * Related callbacks: After a successful call to [startPlayingStream], the callback function [onPlayerRecvAudioFirstFrame] determines whether the SDK has received the audio data, and the callback [onPlayerRenderVideoFirstFrame] determines whether the SDK has rendered the first frame of the received video data.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     */

    /**
     * @event ZegoExpressEngine#onPlayerRenderVideoFirstFrame
     * @desc The callback triggered when the first video frame is rendered.
     *
     * Available since: 1.1.0
     * Description: After the [startPlayingStream] function is called successfully, this callback will be called when SDK rendered the first frame of video data.
     * Use cases: Developer can use this callback to count time consuming that take the first frame time or update the UI for playing stream.
     * Trigger: This callback is triggered when SDK rendered the first frame of video data from the network.
     * Related callbacks: After a successful call to [startPlayingStream], the callback function [onPlayerRecvAudioFirstFrame] determines whether the SDK has received the audio data, and the callback [onPlayerRecvVideoFirstFrame] determines whether the SDK has received the video data.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     */

    /**
     * @event ZegoExpressEngine#onPlayerVideoSizeChanged
     * @desc The callback triggered when the stream playback resolution changes.
     *
     * Available since: 1.1.0
     * Description: After the [startPlayingStream] function is called successfully, the play resolution will change when the first frame of video data is received, or when the publisher changes the encoding resolution by calling [setVideoConfig], or when the network traffic control strategies work.
     * Use cases: Developers can update or switch the UI components that actually play the stream based on the final resolution of the stream.
     * Trigger: After the [startPlayingStream] function is called successfully, this callback is triggered when the video resolution changes while playing the stream.
     * Caution: If the stream is only audio data, the callback will not be triggered.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     * @property {number} result.width - Video decoding resolution width.
     * @property {number} result.height - Video decoding resolution height.
     */

    /**
     * @event ZegoExpressEngine#onPlayerRecvSEI
     * @desc The callback triggered when Supplemental Enhancement Information is received.
     *
     * Available since: 1.1.0
     * Description: After the [startPlayingStream] function is called successfully, when the remote stream sends SEI (such as directly calling [sendSEI], audio mixing with SEI data, and sending custom video capture encoded data with SEI, etc.), the local end will receive this callback.
     * Trigger: After the [startPlayingStream] function is called successfully, when the remote stream sends SEI, the local end will receive this callback.
     * Caution: 1. Since the video encoder itself generates an SEI with a payload type of 5, or when a video file is used for publishing, such SEI may also exist in the video file. Therefore, if the developer needs to filter out this type of SEI, it can be before [createEngine] Call [ZegoEngineConfig.advancedConfig("unregister_sei_filter", "XXXXX")]. Among them, unregister_sei_filter is the key, and XXXXX is the uuid filter string to be set. 2. When [mutePlayStreamVideo] or [muteAllPlayStreamVideo] is called to set only the audio stream to be pulled, the SEI will not be received.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     * @property {UInt8Array} result.data - SEI content.
     */

    /**
     * @event ZegoExpressEngine#onAudioDeviceStateChanged
     * @desc The callback triggered when there is a change to audio devices (i.e. new device added or existing device deleted).
     *
     * Only supports desktop.
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
     * Available since: 1.0.0
     * Description: By listening to this callback, users can update the video capture using a specific device when necessary.
     * When to trigger: This callback is triggered when a video device is added or removed from the system.
     * Restrictions: None
     * Platform differences: Only supports Windows and macOS.
     * @property {object} result - param object
     * @property {ZegoUpdateType} result.updateType - Update type (add/delete)
     * @property {ZegoDeviceInfo} result.deviceInfo - Audio device information
     */

    /**
     * @event ZegoExpressEngine#onCapturedSoundLevelUpdate
     * @desc The local captured audio sound level callback.
     *
     * Available since: 1.1.0
     * Description: The local captured audio sound level callback.
     * Trigger: After you start the sound level monitor by calling [startSoundLevelMonitor].
     * Caution: 
     *   1. The callback notification period is the parameter value set when the [startSoundLevelMonitor] is called. The callback value is the default value of 0 When you have not called the interface [startPublishingStream] or [startPreview]. 
     *   2. This callback is a high-frequency callback, and it is recommended not to do complex logic processing inside the callback.
     * Related APIs: Start sound level monitoring via [startSoundLevelMonitor]. Monitoring remote played audio sound level by callback [onRemoteSoundLevelUpdate]
     * @property {object} result - param object
     * @property {number} result.soundLevel - Locally captured sound level value, ranging from 0.0 to 100.0.
     */

    /**
     * @event ZegoExpressEngine#onCapturedSoundLevelInfoUpdate
     * @desc The local captured audio sound level callback.
     *
     * Available since: 2.10.0
     * Description: The local captured audio sound level callback.
     * Trigger: After you start the sound level monitor by calling [startSoundLevelMonitor].
     * Caution: 
     *   1. The callback notification period is the parameter value set when the [startSoundLevelMonitor] is called.
     *   2. This callback is a high-frequency callback, and it is recommended not to do complex logic processing inside the callback.
     * Related APIs: Start sound level monitoring via [startSoundLevelMonitor]. Monitoring remote played audio sound level by callback [onRemoteSoundLevelUpdate] or [onRemoteSoundLevelInfoUpdate].
     * @property {object} result - param object
     * @property {ZegoSoundLevelInfo} result.soundLevelInfo - Locally captured sound level value, ranging from 0.0 to 100.0.
     */

    /**
     * @event ZegoExpressEngine#onRemoteSoundLevelUpdate
     * @desc The remote playing streams audio sound level callback.
     *
     * Available since: 1.1.0
     * Description: The remote playing streams audio sound level callback.
     * Trigger: After you start the sound level monitor by calling [startSoundLevelMonitor], you are in the state of playing the stream [startPlayingStream].
     * Caution: The callback notification period is the parameter value set when the [startSoundLevelMonitor] is called.
     * Related APIs: Start sound level monitoring via [startSoundLevelMonitor]. Monitoring local captured audio sound by callback [onCapturedSoundLevelUpdate] or [onCapturedSoundLevelInfoUpdate].
     * @property {object} result - param object
     * @property {Object} result.soundLevels - Remote sound level hash map, key is the streamID, value is the sound level value of the corresponding streamID, value ranging from 0.0 to 100.0.
     */

    /**
     * @event ZegoExpressEngine#onRemoteSoundLevelInfoUpdate
     * @desc The remote playing streams audio sound level callback.
     *
     * Available since: 2.10.0
     * Description: The remote playing streams audio sound level callback.
     * Trigger: After you start the sound level monitor by calling [startSoundLevelMonitor], you are in the state of playing the stream [startPlayingStream].
     * Caution: The callback notification period is the parameter value set when the [startSoundLevelMonitor] is called.
     * Related APIs: Start sound level monitoring via [startSoundLevelMonitor]. Monitoring local captured audio sound by callback [onCapturedSoundLevelUpdate] or [onCapturedSoundLevelInfoUpdate].
     * @property {object} result - param object
     * @property {Map<String, ZegoSoundLevelInfo>} result.soundLevelInfos - Remote sound level hash map, key is the streamID, value is the sound level value of the corresponding streamID, value ranging from 0.0 to 100.0.
     */

    /**
     * @event ZegoExpressEngine#onCapturedAudioSpectrumUpdate
     * @desc The local captured audio spectrum callback.
     *
     * Available since: 1.1.0
     * Description: The local captured audio spectrum callback.
     * Trigger: After you start the audio spectrum monitor by calling [startAudioSpectrumMonitor].
     * Caution: The callback notification period is the parameter value set when the [startAudioSpectrumMonitor] is called. The callback value is the default value of 0 When you have not called the interface [startPublishingStream] or [startPreview].
     * Related APIs: Start audio spectrum monitoring via [startAudioSpectrumMonitor]. Monitoring remote played audio spectrum by callback [onRemoteAudioSpectrumUpdate]
     * @property {object} result - param object
     * @property {number[]} result.audioSpectrum - Locally captured audio spectrum value list. Spectrum value range is [0-2^30].
     */

    /**
     * @event ZegoExpressEngine#onRemoteAudioSpectrumUpdate
     * @desc The remote playing streams audio spectrum callback.
     *
     * Available since: 1.1.0
     * Description: The remote playing streams audio spectrum callback.
     * Trigger: After you start the audio spectrum monitor by calling [startAudioSpectrumMonitor], you are in the state of playing the stream [startPlayingStream].
     * Caution: The callback notification period is the parameter value set when the [startAudioSpectrumMonitor] is called.
     * Related APIs: Start audio spectrum monitoring via [startAudioSpectrumMonitor]. Monitoring local played audio spectrum by callback [onCapturedAudioSpectrumUpdate].
     * @property {object} result - param object
     * @property {object} result.audioSpectrums - Remote audio spectrum hash map, key is the streamID, value is the audio spectrum list of the corresponding streamID. Spectrum value range is [0-2^30]
     */

    /**
     * @event ZegoExpressEngine#onLocalDeviceExceptionOccurred
     * @desc The callback triggered when a local device exception occurred.
     *
     * Available since: 2.15.0
     * Description: The callback triggered when a local device exception occurs.
     * Trigger: This callback is triggered when the function of the local audio or video device is abnormal.
     * @property {object} result - param object
     * @property {ZegoDeviceExceptionType} result.exceptionType - The type of the device exception.
     * @property {ZegoDeviceType} result.deviceType - The type of device where the exception occurred.
     * @property {string} result.deviceID - Device ID. Currently, only desktop devices are supported to distinguish different devices; for mobile devices, this parameter will return an empty string.
     */

    /**
     * @event ZegoExpressEngine#onRemoteCameraStateUpdate
     * @desc The callback triggered when the state of the remote camera changes.
     *
     * Available since: 1.1.0
     * Description: The callback triggered when the state of the remote camera changes.
     * Use cases: Developers of 1v1 education scenarios or education small class scenarios and similar scenarios can use this callback notification to determine whether the camera device of the remote publishing stream device is working normally, and preliminary understand the cause of the device problem according to the corresponding state.
     * Trigger: When the state of the remote camera device changes, such as switching the camera, by monitoring this callback, it is possible to obtain an event related to the far-end camera, which can be used to prompt the user that the video may be abnormal.
     * Caution: This callback will not be called back when the remote stream is play from the CDN, or when custom video acquisition is used at the peer.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     * @property {ZegoRemoteDeviceState} result.state - Remote camera status.
     */

    /**
     * @event ZegoExpressEngine#onRemoteMicStateUpdate
     * @desc The callback triggered when the state of the remote microphone changes.
     *
     * Available since: 1.1.0
     * Description: The callback triggered when the state of the remote microphone changes.
     * Use cases: Developers of 1v1 education scenarios or education small class scenarios and similar scenarios can use this callback notification to determine whether the microphone device of the remote publishing stream device is working normally, and preliminary understand the cause of the device problem according to the corresponding state.
     * Trigger: When the state of the remote microphone device is changed, such as switching a microphone, etc., by listening to the callback, it is possible to obtain an event related to the remote microphone, which can be used to prompt the user that the audio may be abnormal.
     * Caution: This callback will not be called back when the remote stream is play from the CDN, or when custom audio acquisition is used at the peer (But the stream is not published to the ZEGO RTC server.).
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     * @property {ZegoRemoteDeviceState} result.state - Remote microphone status.
     */

    /**
     * @event ZegoExpressEngine#onRemoteSpeakerStateUpdate
     * @desc The callback triggered when the state of the remote speaker changes.
     *
     * Available since: 1.1.0
     * Description: The callback triggered when the state of the remote microphone changes.
     * Use cases: Developers of 1v1 education scenarios or education small class scenarios and similar scenarios can use this callback notification to determine whether the speaker device of the remote publishing stream device is working normally, and preliminary understand the cause of the device problem according to the corresponding state.
     * Trigger: When the state of the remote speaker device changes, such as switching the speaker, by monitoring this callback, you can get events related to the remote speaker.
     * Caution: This callback will not be called back when the remote stream is play from the CDN.
     * @property {object} result - param object
     * @property {string} result.streamID - Stream ID.
     * @property {ZegoRemoteDeviceState} result.state - Remote speaker status.
     */

    /**
     * @event ZegoExpressEngine#onIMRecvBroadcastMessage
     * @desc The callback triggered when Broadcast Messages are received.
     *
     * Available since: 1.2.1
     * Description: This callback is used to receive broadcast messages sent by other users in the same room.
     * Use cases: Generally used when the number of people in the live room does not exceed 500
     * When to trigger: After calling [loginRoom] to log in to the room, if a user in the room sends a broadcast message via [sendBroadcastMessage] function, this callback will be triggered.
     * Restrictions: None
     * Caution: The broadcast message sent by the user will not be notified through this callback.
     * Related callbacks: You can receive room barrage messages through [onIMRecvBarrageMessage], and you can receive room custom signaling through [onIMRecvCustomCommand].
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID. Value range: The maximum length is 128 bytes. Caution: The room ID is in string format and only supports numbers, English characters and'~','!','@','#','$','%','^','&', ' *','(',')','_','+','=','-','`',';',''',',','.','<' ,'>','/','\'.
     * @property {ZegoBroadcastMessageInfo[]} result.messageList - List of received messages. Value range: Up to 50 messages can be received each time.
     */

    /**
     * @event ZegoExpressEngine#onIMRecvBarrageMessage
     * @desc The callback triggered when Barrage Messages are received.
     *
     * Available since: 1.5.0
     * Description: This callback is used to receive barrage messages sent by other users in the same room.
     * Use cases: Generally used in scenarios where there is a large number of messages sent and received in the room and the reliability of the messages is not required, such as live barrage.
     * When to trigger: After calling [loginRoom] to log in to the room, if a user in the room sends a barrage message through the [sendBarrageMessage] function, this callback will be triggered.
     * Restrictions: None
     * Caution: Barrage messages sent by users themselves will not be notified through this callback. When there are a large number of barrage messages in the room, the notification may be delayed, and some barrage messages may be lost.
     * Related callbacks: Develop can receive room broadcast messages through [onIMRecvBroadcastMessage], and can receive room custom signaling through [onIMRecvCustomCommand].
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID. Value range: The maximum length is 128 bytes. Caution: The room ID is in string format and only supports numbers, English characters and'~','!','@','#','$','%','^','&', ' *','(',')','_','+','=','-','`',';',''',',','.','<' ,'>','/','\'.
     * @property {ZegoBarrageMessageInfo[]} result.messageList - List of received messages. Value range: Up to 50 messages can be received each time.
     */

    /**
     * @event ZegoExpressEngine#onIMRecvCustomCommand
     * @desc The callback triggered when a Custom Command is received.
     *
     * Available since: 1.2.1
     * Description: This callback is used to receive custom command sent by other users in the same room.
     * Use cases: Generally used when the number of people in the live room does not exceed 500
     * When to trigger: After calling [loginRoom] to log in to the room, if other users in the room send custom signaling to the developer through the [sendCustomCommand] function, this callback will be triggered.
     * Restrictions: None
     * Caution: The custom command sent by the user himself will not be notified through this callback.
     * Related callbacks: You can receive room broadcast messages through [onIMRecvBroadcastMessage], and you can receive room barrage message through [onIMRecvBarrageMessage].
     * @property {object} result - param object
     * @property {string} result.roomID - Room ID. Value range: The maximum length is 128 bytes. Caution: The room ID is in string format and only supports numbers, English characters and'~','!','@','#','$','%','^','&', ' *','(',')','_','+','=','-','`',';',''',',','.','<' ,'>','/','\'.
     * @property {ZegoUser} result.fromUser - Sender of the command.
     * @property {string} result.command - Command content received.Value range: The maximum length is 1024 bytes.
     */

    /**
     * @event ZegoExpressEngine#onCapturedDataRecordStateUpdate
     * @desc The callback triggered when the state of data recording (to a file) changes.
     *
     * Available since: 1.10.0
     * Description: The callback triggered when the state of data recording (to a file) changes.
     * Use cases: The developer should use this callback to determine the status of the file recording or for UI prompting.
     * When to trigger: After [startRecordingCapturedData] is called, if the state of the recording process changes, this callback will be triggered.
     * Restrictions: None.
     * @property {object} result - param object
     * @property {ZegoDataRecordState} result.state - File recording status.
     * @property {number} result.errorCode - Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
     * @property {ZegoDataRecordConfig} result.config - Record config.
     * @property {ZegoPublishChannel} result.channel - Publishing stream channel.
     */

    /**
     * @event ZegoExpressEngine#onCapturedDataRecordProgressUpdate
     * @desc The callback to report the current recording progress.
     *
     * Available since: 1.10.0
     * Description: Recording progress update callback, triggered at regular intervals during recording.
     * Use cases: Developers can do UI hints for the user interface.
     * When to trigger: After [startRecordingCapturedData] is called, If configured to require a callback, timed trigger during recording.
     * Restrictions: None.
     * @property {object} result - param object
     * @property {ZegoDataRecordProgress} result.progress - File recording progress, which allows developers to hint at the UI, etc.
     * @property {ZegoDataRecordConfig} result.config - Record config.
     * @property {ZegoPublishChannel} result.channel - Publishing stream channel.
     */

    /**
     * @event ZegoExpressEngine#onNetworkModeChanged
     * @desc Network mode changed callback.
     *
     * Available since: 1.20.0
     * Description: Network mode changed callback.
     * When to trigger: This callback will be triggered when the device's network mode changed, such as switched from WiFi to 5G, or when network is disconnected.
     * Restrictions: None.
     * @property {object} result - param object
     * @property {ZegoNetworkMode} result.mode - Current network mode.
     */

    /**
     * @event ZegoExpressEngine#onNetworkSpeedTestError
     * @desc Network speed test error callback.
     *
     * Available since: 1.20.0
     * Description: Network speed test error callback.
     * Use cases: This function can be used to detect whether the network environment is suitable for pushing/pulling streams with specified bitrates.
     * When to Trigger: If an error occurs during the speed test, such as: can not connect to speed test server, this callback will be triggered.
     * Restrictions: None.
     * @property {object} result - param object
     * @property {number} result.errorCode - Network speed test error code. Please refer to error codes document https://docs.zegocloud.com/en/5548.html for details.
     * @property {ZegoNetworkSpeedTestType} result.type - Uplink or downlink.
     */

    /**
     * @event ZegoExpressEngine#onNetworkSpeedTestQualityUpdate
     * @desc Network speed test quality callback.
     *
     * Available since: 1.20.0
     * Description: Network speed test quality callback.
     * Use cases: This function can be used to detect whether the network environment is suitable for pushing/pulling streams with specified bitrates.
     * When to Trigger: After call [startNetworkSpeedTest] start network speed test, this callback will be triggered. The trigger period is determined by the parameter value specified by call [startNetworkSpeedTest], default value is 3 seconds 
     * Restrictions: None.
     * Caution: When error occurred during network speed test or [stopNetworkSpeedTest] called, this callback will not be triggered.
     * @property {object} result - param object
     * @property {ZegoNetworkSpeedTestQuality} result.quality - Network speed test quality.
     * @property {ZegoNetworkSpeedTestType} result.type - Uplink or downlink.
     */

    /**
     * @event ZegoExpressEngine#onRecvExperimentalAPI
     * @desc Receive experiment API JSON content.
     *
     * Available since: 2.7.0
     * Description: Receive experiment API JSON content.
     * When to trigger: This callback will triggered after call LiveRoom experiment API.
     * Restrictions: None.
     * @property {object} result - param object
     * @property {string} result.content - Experiment API JSON content.
     */

    /**
     * @event ZegoExpressEngine#onDeviceError
     * @desc [Deprecated] The callback triggered when a device exception occurs. Deprecated since 2.15.0, please use [onLocalDeviceExceptionOccurred] instead.
     *
     * Available: 1.1.0 ~ 2.14.0, deprecated since 2.15.0
     * Description: The callback triggered when a device exception occurs.
     * Trigger: This callback is triggered when an exception occurs when reading or writing the audio and video device.
     * @property {object} result - param object
     * @property {number} result.errorCode - The error code corresponding to the status change of the playing stream, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
     * @property {string} result.deviceName - device name
     * @deprecated Deprecated since 2.15.0, please use [onLocalDeviceExceptionOccurred] instead.
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
                if (this.debugAssistant) {
                    console.info(arguments[1]["info"]);
                }
            }
            else if (arguments[0] === "onDebugError") {
                if (this.debugAssistant) {
                    console.error(`onDebugError: funcName=${arguments[1]["funcName"]} ErrorCode=${arguments[1]["errorCode"]} ErrorInfo=${arguments[1]["errorInfo"]}`)
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
                if(!highFrequencyCallbacks.includes(arguments[0]) && this.debugAssistant){
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
