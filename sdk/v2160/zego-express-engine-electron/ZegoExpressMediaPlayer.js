

const EventEmitter = require('events').EventEmitter;
const WebGLRender = require('./ZegoExpressWebgl');
const {ZegoViewMode} = require('./ZegoExpressDefines');

/**
 * ZegoMediaPlayer
 */
class ZegoMediaPlayer extends EventEmitter {

    /**
     * Start playing.
     *
     * You need to load resources before playing
     */
    start(){
        this.nativeMediaPlayer.start({});
    }

    /**
     * Stop playing.
     */
    stop(){
        this.nativeMediaPlayer.stop({});
    }

    /**
     * Pause playing.
     */
    pause(){
        this.nativeMediaPlayer.pause({});
    }

    /**
     * Resume playing.
     */
    resume(){
        this.nativeMediaPlayer.resume({});
    }

    /**
     * Load media resource.
     *
     * Yon can pass the absolute path of the local resource or the URL of the network resource
     * @param {string} path - The absolute resource path or the URL of the network resource and cannot be null or "".
     * @return {Promise<number>} - load resource result
     */
    loadResource(path){
        return this.nativeMediaPlayer.loadResource({path});
    }

    /**
     * Get the current playback status.
     *
     * @return {ZegoMediaPlayerState} - current state
     */
    getCurrentState(){
        return this.nativeMediaPlayer.getCurrentState({});
    }

    /**
     * Set the specified playback progress.
     *
     * Unit is millisecond
     * @param {number} millisecond - Point in time of specified playback progress
     * @return {Promise<number>} - seek result
     */
    seekTo(millisecond){
        return this.nativeMediaPlayer.seekTo({millisecond});
    }

    /**
     * Set mediaplayer volume. Both the local play volume and the publish volume are set.
     *
     * @param {number} volume - The range is 0 ~ 200. The default is 60.
     */
    setVolume(volume){
        this.nativeMediaPlayer.setVolume({volume});
    }

    /**
     * Set mediaplayer local playback volume.
     *
     * @param {number} volume - The range is 0 ~ 200. The default is 60.
     */
    setPlayVolume(volume){
        this.nativeMediaPlayer.setPlayVolume({volume});
    }

    /**
     * Set mediaplayer publish volume.
     *
     * @param {number} volume - The range is 0 ~ 200. The default is 60.
     */
    setPublishVolume(volume){
        this.nativeMediaPlayer.setPublishVolume({volume});
    }

    /**
     * Gets the current local playback volume of the mediaplayer, the range is 0 ~ 200, with the default value of 60.
     *
     * @return {number} - current volume
     */
    getPlayVolume(){
        return this.nativeMediaPlayer.getPlayVolume({});
    }

    /**
     * Gets the current publish volume of the mediaplayer, the range is 0 ~ 200, with the default value of 60.
     *
     * @return {number} - current volume
     */
    getPublishVolume(){
        return this.nativeMediaPlayer.getPublishVolume({});
    }

    /**
     * Get the total progress of your media resources.
     *
     * You should load resource before invoking this function, otherwise the return value is 0
     * @return {number} - Unit is millisecond
     */
    getTotalDuration(){
        return this.nativeMediaPlayer.getTotalDuration({});
    }

    /**
     * Get current playing progress.
     *
     * You should load resource before invoking this function, otherwise the return value is 0
     * @return {number} - current progress
     */
    getCurrentProgress(){
        return this.nativeMediaPlayer.getCurrentProgress({});
    }

    /**
     * Whether to play locally silently.
     *
     * If [enableAux] switch is turned on, there is still sound in the publishing stream. The default is false.
     * @param {boolean} mute - Mute local audio flag, The default is false.
     */
    muteLocal(mute){
        this.nativeMediaPlayer.muteLocal({mute});
    }

    /**
     * Set the view of the player playing video.
     *
     * @param {ZegoView} view - Video rendered view object
     */
    setPlayerView(view){
        if(view == null){
            this.localGLRender = null;
        }
        else{
            view = Object.assign({ viewMode: ZegoViewMode.AspectFit, backgroundColor: 0x000000, preserveDrawingBuffer: false}, view);
            this.localGLRender = new WebGLRender();
            this.localGLRender.setViewMode(view.viewMode);
            this.localGLRender.enablePreserveDrawingBuffer(view.preserveDrawingBuffer);
            this.localGLRender.initBkColor(view.backgroundColor);
            this.localGLRender.initGLfromCanvas(view.canvas);
            this.nativeMediaPlayer.setPlayerCanvas({});
        }
    }

    /**
     * Whether to mix the player's sound into the stream being published.
     *
     * This interface will only mix the media player sound into the main channel
     * @param {boolean} enable - Aux audio flag. The default is false.
     */
    enableAux(enable){
        this.nativeMediaPlayer.enableAux({enable});
    }

    /**
     * Whether to mix the player's video into the stream being published.
     *
     * @param {boolean} enable - enable publish video
     * @param {number} channel - channel
     */
    enablePublishVideo(enable, channel){
        this.nativeMediaPlayer.enablePublishVideo({enable, channel});
    }

    /**
     * Whether to repeat playback.
     *
     * @param {boolean} enable - repeat playback flag. The default is false.
     */
    enableRepeat(enable){
        this.nativeMediaPlayer.enableRepeat({enable});
    }

    /**
     * Set playback progress callback interval.
     *
     * This function can control the callback frequency of [onMediaPlayerPlayingProgress]. When the callback interval is set to 0, the callback is stopped. The default callback interval is 1s
     * This callback are not returned exactly at the set callback interval, but rather at the frequency at which the audio or video frames are processed to determine whether the callback is needed to call
     * @param {number} millisecond - Interval of playback progress callback in milliseconds
     */
    setProgressInterval(millisecond){
        this.nativeMediaPlayer.setProgressInterval({millisecond});
    }

    /**
     * Get the number of audio tracks of the playback file.
     *
     * @return {number} - Number of audio tracks
     */
    getAudioTrackCount(){
        return this.nativeMediaPlayer.getAudioTrackCount({});
    }

    /**
     * Set the audio track of the playback file.
     *
     * @param {number} index - Audio track index, the number of audio tracks can be obtained through the [getAudioTrackCount] function.
     */
    setAudioTrackIndex(index){
        this.nativeMediaPlayer.setAudioTrackIndex({index});
    }

    /**
     * Setting up the specific voice changer parameters.
     *
     * @param {ZegoMediaPlayerAudioChannel} audioChannel - The audio channel to be voice changed
     * @param {ZegoVoiceChangerParam} param - Voice changer parameters
     */
    setVoiceChangerParam(audioChannel, param){
        this.nativeMediaPlayer.setVoiceChangerParam({audioChannel, param});
    }

    /**
     * Take a screenshot of the current playing screen of the media player.
     *
     * Only in the case of calling `setPlayerCanvas` to set the display controls and the playback state, can the screenshot be taken normally
     * @return {Promise<number, string>} - snapshot error code(errorCode) and base64 string of the image in jpg format(image)
     */
    takeSnapshot(){
        return this.nativeMediaPlayer.takeSnapshot({});
    }

    /**
     * Get the custom video capture plugin of the media player
     *
     * @return {number} - The plugin ID
     */
    getCustomVideoCapturePlugin(){
        return this.nativeMediaPlayer.getCustomVideoCapturePlugin({});
    }

    /**
     * @event ZegoMediaPlayer#onMediaPlayerStateUpdate
     * @desc MediaPlayer playback status callback.
     *
     * Available since: 1.3.4
     * Description: MediaPlayer playback status callback.
     * Trigger: The callback triggered when the state of the media player changes.
     * Restrictions: None.
     * @property {object} result - param object
     * @property {ZegoMediaPlayerState} result.state - Media player status.
     * @property {number} result.errorCode - Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
     */

    /**
     * @event ZegoMediaPlayer#onMediaPlayerNetworkEvent
     * @desc The callback triggered when the network status of the media player changes.
     *
     * Available since: 1.3.4
     * Description: The callback triggered when the network status of the media player changes.
     * Trigger: When the media player is playing network resources, this callback will be triggered when the status change of the cached data.
     * Restrictions: The callback will only be triggered when the network resource is played.
     * Related APIs: [setNetWorkBufferThreshold].
     * @property {object} result - param object
     * @property {ZegoMediaPlayerNetworkEvent} result.networkEvent - Network status event.
     */

    /**
     * @event ZegoMediaPlayer#onMediaPlayerPlayingProgress
     * @desc The callback to report the current playback progress of the media player.
     *
     * Available since: 1.3.4
     * Description: The callback triggered when the network status of the media player changes. Set the callback interval by calling [setProgressInterval]. When the callback interval is set to 0, the callback is stopped. The default callback interval is 1 second.
     * Trigger: When the media player is playing network resources, this callback will be triggered when the status change of the cached data.
     * Restrictions: None.
     * Related APIs: [setProgressInterval].
     * @property {object} result - param object
     * @property {number} result.millisecond - Progress in milliseconds.
     */


    callEmit() {
        try {
            if (arguments[0] === "onVideoData") {
                if(this.localGLRender){
                    let videoFrame = {
                        "videoFrameParam": arguments[1]["videoFrameParam"],
                        "videoFrameBuffer": Buffer.from(arguments[1]["videoFrameBuffer"])
                        }
                        this.localGLRender.drawVideoFrame(videoFrame);
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

module.exports = ZegoMediaPlayer;
