
const ZegoErrorCode =
{
    /** Execution successful. */
    CommonSuccess                                                          : 0,

    /** Engine not yet created. Please create the engine first before calling non-static functions. */
    CommonEngineNotCreate                                                  : 1000001,

    /** Not yet logged in to any room. Please log in to a room before publishing or playing streams. */
    CommonNotLoginRoom                                                     : 1000002,

    /** Engine not yet started. Please call `startPreviewView`, `startPublishing`, or `startPlayingStream` to get the engine started first. */
    CommonEngineNotStarted                                                 : 1000003,

    /** An API not supported by the current platform is called; for example, an API that sets the Android context is called on a non-Android platform. */
    CommonUnsupportedPlatform                                              : 1000006,

    /** Invalid Android context. */
    CommonInvalidAndroidEnvironment                                        : 1000007,

    /** The event handler has already been set by calling `setEventHandler`. Please do not repeat the setting. If you do need to set up the event handler again, please call `setEventHandler` to set it to null first before applying the new setting. */
    CommonEventHandlerExists                                               : 1000008,

    /** This feature is not included in the SDK. Please contact ZEGO technical support. */
    CommonSdkNoModule                                                      : 1000010,

    /** The input stream ID is too long. The maximum length should be less than 256 bytes. */
    CommonStreamIdTooLong                                                  : 1000014,

    /** The input stream ID is empty. */
    CommonStreamIdNull                                                     : 1000015,

    /** The input stream ID contains invalid characters. */
    CommonStreamIdInvalidCharacter                                         : 1000016,

    /** This AppID has been removed from production. */
    CommonAppOfflineError                                                  : 1000037,

    /** There is an error in the backend configurations. Please check the configuration items of the app. */
    CommonAppFlexiableConfigError                                          : 1000038,

    /** Incorrect CDN address. Please check the supported protocol and format. */
    CommonCdnUrlInvalid                                                    : 1000055,

    /** DNS resolution failed. Please check network configurations. */
    CommonDnsResolveError                                                  : 1000060,

    /** Server dispatching exception. Please contact ZEGO technical support to solve the problem. */
    CommonDispatchError                                                    : 1000065,

    /** Internal null pointer error. Please contact ZEGO technical support to solve the problem. */
    CommonInnerNullptr                                                     : 1000090,

    /** AppID cannot be 0. Please check if the AppID is correct. */
    EngineAppidZero                                                        : 1001000,

    /** The length of the input AppSign must be 64 bytes. */
    EngineAppsignInvalidLength                                             : 1001001,

    /** The input AppSign contains invalid characters. Only '0'-'9', 'a'-'f', 'A'-'F' are valid. */
    EngineAppsignInvalidCharacter                                          : 1001002,

    /** The input AppSign is empty. */
    EngineAppsignNull                                                      : 1001003,

    /** Authentication failed. Please check if the AppID is correct, or whether the production environment was selected for SDK initialization without prior go-live process. */
    EngineAppidIncorrectOrNotOnline                                        : 1001004,

    /** AppSign authentication failed. Please check if the AppSign is correct. */
    EngineAppsignIncorrect                                                 : 1001005,

    /** No write permission to the log file. */
    EngineLogNoWritePermission                                             : 1001014,

    /** The log file path is too long. */
    EngineLogPathTooLong                                                   : 1001015,

    /** The number of rooms the user attempted to log into simultaneously exceeds the maximum number allowed. Currently, a user can only be logged in to one main room and one multi room at the same time. */
    RoomCountExceed                                                        : 1002001,

    /** The input room ID is incorrect, please check if this room ID is currently logged in. */
    RoomRoomidIncorrect                                                    : 1002002,

    /** The input user ID is empty. */
    RoomUserIdNull                                                         : 1002005,

    /** The input user ID contains invalid characters. */
    RoomUserIdInvalidCharacter                                             : 1002006,

    /** The input user ID is too long. The maximum length should be less than 64 bytes. */
    RoomUserIdTooLong                                                      : 1002007,

    /** The input user name is empty. */
    RoomUserNameNull                                                       : 1002008,

    /** The input user name contains invalid characters. */
    RoomUserNameInvalidCharacter                                           : 1002009,

    /** The input user name is too long. The maximum length should be less than 256 bytes. */
    RoomUserNameTooLong                                                    : 1002010,

    /** The input room ID is empty. */
    RoomRoomidNull                                                         : 1002011,

    /** The input room ID contains invalid characters. */
    RoomRoomidInvalidCharacter                                             : 1002012,

    /** The input room ID is too long. The maximum length should be less than 128 bytes. */
    RoomRoomidTooLong                                                      : 1002013,

    /** The key for room extra info is empty. */
    RoomRoomExtraInfoKeyEmpty                                              : 1002014,

    /** The key for room extra info is too long. The maximum length should be less than 128 bytes. */
    RoomRoomExtraInfoKeyTooLong                                            : 1002015,

    /** The value for room extra info is too long. The maximum length should be less than 4096 bytes. */
    RoomRoomExtraInfoValueTooLong                                          : 1002016,

    /** The set key of the room extra info exceeds the maximum number supported. If you need to modify the number of setting keys, please contact ZEGO technical support. */
    RoomRoomExtraInfoExceedKeys                                            : 1002017,

    /** Login failed, possibly due to network problems. */
    RoomErrorConnectFailed                                                 : 1002030,

    /** Login timed out, possibly due to network problems. */
    RoomErrorLoginTimeout                                                  : 1002031,

    /** Room login authentication failed. */
    RoomErrorAuthenticationFailed                                          : 1002033,

    /** The number of users logging into the room exceeds the maximum number of concurrent users configured for the room. (In the test environment, the default maximum number of users in the room is 50) */
    RoomErrorExceedMaximumMember                                           : 1002034,

    /** The total number of rooms logged in at the same time exceeds the limit. (In the test environment, the maximum number of concurrent rooms is 10) */
    RoomErrorExceedMaximumRoomCount                                        : 1002035,

    /** The user is kicked out of the room, possibly because the same user ID is logged in on another device. */
    RoomKickedOut                                                          : 1002050,

    /** Room connection is temporarily interrupted, possibly due to network problems. Retrying... */
    RoomConnectTemporaryBroken                                             : 1002051,

    /** Room disconnected, possibly due to network problems. */
    RoomDisconnect                                                         : 1002052,

    /** Room login retry has exceeded the maximum retry time. */
    RoomRetryTimeout                                                       : 1002053,

    /** The business server has sent a signal to kick the user out of the room. Please check the reason for the kick-out. */
    RoomManualKickedOut                                                    : 1002055,

    /** You must log in to the main room with `loginRoom` before logging in to multi room */
    RoomWrongLoginSequence                                                 : 1002061,

    /** You must log out of the multi room before logging out of the main room */
    RoomWrongLogoutSequence                                                : 1002062,

    /** No multi-room permission, please contact ZEGO technical support to enable it. */
    RoomNoMultiRoomPermission                                              : 1002063,

    /** Room ID has been used by other login room interface */
    RoomRoomIdHasBeenUsed                                                  : 1002064,

    /** Room login failed due to internal system exceptions. */
    RoomInnerError                                                         : 1002099,

    /** Stream publishing failed, possibly due to no data in the stream. */
    PublisherPublishStreamFailed                                           : 1003001,

    /** Incorrect bitrate setting. Please check if the bitrate value is in the correct unit (kbps). */
    PublisherBitrateInvalid                                                : 1003002,

    /** Incorrect setting of stream publishing traffic control parameters. */
    PublisherTrafficModeInvalid                                            : 1003005,

    /** Stream publishing is temporarily interrupted. Retrying... */
    PublisherErrorNetworkInterrupt                                         : 1003020,

    /** Stream publish retry has exceeds the maximum retry time. */
    PublisherErrorRetryTimeout                                             : 1003021,

    /** Failed to publish the stream. The user is already publishing streams. */
    PublisherErrorAlreadyDoPublish                                         : 1003023,

    /** Failed to publish the stream. Publishing of this stream is prohibited by backend configuration. */
    PublisherErrorServerForbid                                             : 1003025,

    /** Failed to publish the stream. The same stream already exists in the room. */
    PublisherErrorRepetitivePublishStream                                  : 1003028,

    /** The connection to the RTMP server is interrupted. Please check whether there is any problem with the network connection or the stream publishing URL. */
    PublisherRtmpServerDisconnect                                          : 1003029,

    /** Failed to take publish stream snapshot, please check whether the state of the publish channel to be snapshot is normal. */
    PublisherTakePublishStreamSnapshotFailed                               : 1003030,

    /** Failed to get status updates of relayed streaming to CDN. Please check whether the URL is valid. */
    PublisherUpdateCdnTargetError                                          : 1003040,

    /** Failed to send SEI. The SEI data is null. */
    PublisherSeiDataNull                                                   : 1003043,

    /** Failed to send SEI because the SEI data is too long. The maximum length should be less than 4096 bytes. */
    PublisherSeiDataTooLong                                                : 1003044,

    /** The extra info of the stream is null. */
    PublisherExtraInfoNull                                                 : 1003050,

    /** The extra info of the stream is too long. The maximum length should be less than 1024 bytes. */
    PublisherExtraInfoTooLong                                              : 1003051,

    /** Failed to update the extra info of the stream. Please check the network connection. */
    PublisherUpdateExtraInfoFailed                                         : 1003053,

    /** The watermark URL is null. */
    PublisherWatermarkUrlNull                                              : 1003055,

    /** The watermark URL is too long. The maximum length should be less than 1024 bytes. */
    PublisherWatermarkUrlTooLong                                           : 1003056,

    /** Invalid watermark format. The supported formats are `jpg` and `png`. */
    PublisherWatermarkUrlInvalid                                           : 1003057,

    /** Incorrect watermark layout. The layout area cannot exceed the encoding resolution. */
    PublisherWatermarkLayoutInvalid                                        : 1003058,

    /** The publish stream encryption key is invalid, the key length only supports 16/24/32 bytes. */
    PublisherEncryptionKeyInvalid                                          : 1003060,

    /** Stream publishing failed due to system internal exceptions. */
    PublisherInnerError                                                    : 1003099,

    /** Stream playing failed, possibly due to no data in the stream. */
    PlayerPlayStreamFailed                                                 : 1004001,

    /** Stream playing failed because the stream does not exist. Please check whether the remote end publish is indeed successful, or whether the publish and play environment are inconsistent */
    PlayerPlayStreamNotExist                                               : 1004002,

    /** The number of streams the user attempted to play simultaneously exceeds the maximum number allowed. Currently, up to 12 steams can be played at the same time. Please contact ZEGO technical support to increase the capacity if necessary. */
    PlayerCountExceed                                                      : 1004010,

    /** Stream playing is temporarily interrupted. Retrying... */
    PlayerErrorNetworkInterrupt                                            : 1004020,

    /** Failed to take play stream snapshot, please check whether the state of the stream to be snapshot is normal. */
    PlayerTakePlayStreamSnapshotFailed                                     : 1004030,

    /** The play stream decryption key is invalid, the key length only supports 16/24/32 bytes. */
    PlayerDecryptionKeyInvalid                                             : 1004060,

    /** Decrypt the play stream failed, please check whether the decryption key is correct */
    PlayerDecryptionFailed                                                 : 1004061,

    /** Stream playing failed due to system internal exceptions. */
    PlayerInnerError                                                       : 1004099,

    /** Stream mixing service not yet enabled. Please contact ZEGO technical support to enable the service. */
    MixerNoServices                                                        : 1005000,

    /** The stream mixing task ID is null. */
    MixerTaskIdNull                                                        : 1005001,

    /** The stream mixing task ID is too long. The maximum length should be less than 256 bytes. */
    MixerTaskIdTooLong                                                     : 1005002,

    /** The stream mixing task ID contains invalid characters. */
    MixerTaskIdInvalidCharacter                                            : 1005003,

    /** No output is specified in the configuration of the stream mixing task. */
    MixerNoOutputTarget                                                    : 1005005,

    /** Incorrect stream mixing output. Please check if the streamID of the output target contains invalid characters. */
    MixerOutputTargetInvalid                                               : 1005006,

    /** Failed to start the stream mixing task, possibly due to network problems. */
    MixerStartRequestError                                                 : 1005010,

    /** Failed to stop the stream mixing task, possibly due to network problems. */
    MixerStopRequestError                                                  : 1005011,

    /** The stream mixing task must be stopped by the user who started the task. */
    MixerNotOwnerStopMixer                                                 : 1005012,

    /** Starts stream mixing tasks too frequently. */
    MixerStartQpsOverload                                                  : 1005015,

    /** Stops stream mixing tasks too frequently. */
    MixerStopQpsOverload                                                   : 1005016,

    /** The input stream list of the stream mixing task is null. */
    MixerInputListInvalid                                                  : 1005020,

    /** The output stream list of the stream mixing task is null. */
    MixerOutputListInvalid                                                 : 1005021,

    /** The video configuration of the stream mixing task is invalid. */
    MixerVideoConfigInvalid                                                : 1005023,

    /** The audio configuration of the stream mixing task is invalid. Please check if an unsupported codec is used. */
    MixerAudioConfigInvalid                                                : 1005024,

    /** The number of input streams exceeds the maximum number allowed. Up to 9 input streams can be specified. */
    MixerExceedMaxInputCount                                               : 1005025,

    /** The input stream does not exist. */
    MixerInputStreamNotExists                                              : 1005026,

    /** Invalid stream mixing input parameters. It may be that the layout of the input streams exceeds the canvas. */
    MixerInputParametersError                                              : 1005027,

    /** The number of output streams exceeds the maximum number allowed. Up to 3 output streams can be specified. */
    MixerExceedMaxOutputCount                                              : 1005030,

    /** Stream mixing authentication failed. */
    MixerAuthenticationFailed                                              : 1005050,

    /** The input watermark is null. */
    MixerWatermarkNull                                                     : 1005061,

    /** Invalid watermark parameter. It may be that the layout of the watermark exceeds the canvas. */
    MixerWatermarkParametersError                                          : 1005062,

    /** Invalid watermark URL. The URL must start with `preset-id://`, and must end with `.jpg` or `.png`. */
    MixerWatermarkUrlInvalid                                               : 1005063,

    /** Invalid background image URL. The URL must start with `preset-id://`, and must end with `.jpg` or `.png`. */
    MixerBackgroundImageUrlInvalid                                         : 1005067,

    /** The server for auto stream mixing is not found. Please contact ZEGO technical support to enable it. */
    MixerAutoMixStreamServerNotFound                                       : 1005070,

    /** Stream mixing internal error. */
    MixerInnerError                                                        : 1005099,

    /** Generic device error. */
    DeviceErrorTypeGeneric                                                 : 1006001,

    /** The device ID does not exist. */
    DeviceErrorTypeInvalidId                                               : 1006002,

    /** No permission to access the device. Please check the permissions of the camera or microphone. */
    DeviceErrorTypeNoAuthorization                                         : 1006003,

    /** The frame rate of the capture device is 0. */
    DeviceErrorTypeZeroFps                                                 : 1006004,

    /** The device is occupied. */
    DeviceErrorTypeInUseByOther                                            : 1006005,

    /** The device is unplugged. */
    DeviceErrorTypeUnplugged                                               : 1006006,

    /** The device needs to be restarted. */
    DeviceErrorTypeRebootRequired                                          : 1006007,

    /** The device media is lost. */
    DeviceErrorMediaServicesLost                                           : 1006008,

    /** The device list cannot be empty when trying to release devices. */
    DeviceFreeDeviceListNull                                               : 1006020,

    /** The set sound level monitoring interval is out of range. */
    DeviceSouldLevelIntervalInvalid                                        : 1006031,

    /** The set audio spectrum monitoring interval is out of range. */
    DeviceAudioSpectrumIntervalInvalid                                     : 1006032,

    /** The set camera zoom factor is out of range. */
    DeviceZoomFactorInvalid                                                : 1006040,

    /** Device internal error. */
    DeviceInnerError                                                       : 1006099,

    /** Unknown error in the preprocessing module. Please contact ZEGO technical support. */
    PreprocessPreprocessUnknownError                                       : 1007001,

    /** Invalid beauty option. Please check the input parameters. */
    PreprocessBeautifyOptionInvalid                                        : 1007005,

    /** The reverberation parameter is null. Please check the input parameter. */
    PreprocessReverbParamNull                                              : 1007006,

    /** The voice changer parameter is null. Please check the input parameter. */
    PreprocessVoiceChangerParamNull                                        : 1007007,

    /** The room size value of the reverberation parameters is invalid. The value should be in the range of 0.0 ~ 1.0. */
    PreprocessReverbParamRoomSizeInvalid                                   : 1007011,

    /** The reverberance value of the reverberation parameters is invalid. The value should be in the range of 0.0 ~ 0.5. */
    PreprocessReverbParamReverberanceInvalid                               : 1007012,

    /** The damping value of the reverberation parameters is invalid. The value should be in the range of 0.0 ~ 2.0. */
    PreprocessReverbParamDampingInvalid                                    : 1007013,

    /** The dry_wet_ratio value of the reverberation parameters is invalid. The value should be greater than 0.0. */
    PreprocessReverbParamDryWetRatioInvalid                                : 1007014,

    /** The angle value of the virtual stereo parameters is invalid. The value should be in the range of 0 ~ 180. */
    PreprocessVirtualStereoAngleInvalid                                    : 1007015,

    /** The voice changer param is invalid. The value should be in the range of -8.0 ~ 8.0. */
    PreprocessVoiceChangerParamInvalid                                     : 1007016,

    /** The reverberation echo parameters is null. Please check the input parameter. */
    PreprocessReverbEchoParamNull                                          : 1007017,

    /** The reverberation echo parameters is invalid. */
    PreprocessReverbEchoParamInvalid                                       : 1007018,

    /** The MediaPlayer instance is not created. */
    MediaPlayerNoInstance                                                  : 1008001,

    /** The MediaPlayer failed to play the media. The resource file is not loaded. */
    MediaPlayerNoFilePath                                                  : 1008003,

    /** The MediaPlayer failed to load the file. The file format is not supported. */
    MediaPlayerFileFormatError                                             : 1008005,

    /** The MediaPlayer failed to load the file. The file path does not exist. */
    MediaPlayerFilePathNotExists                                           : 1008006,

    /** The MediaPlayer failed to load the file due to decoding errors. */
    MediaPlayerFileDecodeError                                             : 1008007,

    /** The MediaPlayer failed to load files. No supported audio/video stream exists. */
    MediaPlayerFileNoSupportedStream                                       : 1008008,

    /** The MediaPlayer failed to play the file due to demuxing errors. */
    MediaPlayerDemuxError                                                  : 1008010,

    /** The MediaPlayer failed to seek, possibly because the file hasn't been loaded yet. */
    MediaPlayerSeekError                                                   : 1008016,

    /** The MediaPlayer is configured with a video data format not supported by the platform (e.g., CVPixelBuffer on iOS does not support NV21). */
    MediaPlayerPlatformFormatNotSupported                                  : 1008020,

    /** The number of MediaPlayer instances exceeds the maximum number allowed. Up to 4 instances can be created. */
    MediaPlayerExceedMaxCount                                              : 1008030,

    /** The media player failed to specify the audio track index */
    MediaPlayerSetAudioTrackIndexError                                     : 1008040,

    /** Invalid voice changing parameters set by media player */
    MediaPlayerSetVoiceChangerParamInvalid                                 : 1008041,

    /** MediaPlayer internal error. */
    MediaPlayerInnerError                                                  : 1008099,

    /** The input message content is empty. */
    IMContentNull                                                          : 1009001,

    /** The input message content is too long. The maximum length should be less than 1024 bytes. */
    IMContentTooLong                                                       : 1009002,

    /** The room where the message is sent is different from the room currently logged in */
    IMInconsistentRoomId                                                   : 1009005,

    /** Failed to send the message, possibly due to network problems. */
    IMSendFailed                                                           : 1009010,

    /** Failed to send broadcast message, QPS exceeds the limit, the maximum QPS is 2 */
    IMBroadcastMessageQpsOverload                                          : 1009015,

    /** The file name suffix is not supported. Only .mp4 and .flv are supported currently. Depending on file name suffix, SDK sets the specified recording format accordingly. */
    RecorderFileSuffixNameFormatNotSupport                                 : 1010002,

    /** Generic error of recording API, generally due to invalid input parameters. */
    RecorderCommonLiveroomApiError                                         : 1010003,

    /** The specified recorded file path is too long. The maximum length should be less than 1024 bytes. */
    RecorderFilePathTooLong                                                : 1010011,

    /** SDK internal VE error. Please contact ZEGO technical support to solve the problem. */
    RecorderInnerVeError                                                   : 1010012,

    /** Failed to open the file. Invalid file path or no permissions to the file. */
    RecorderOpenFileFailed                                                 : 1010013,

    /** Failed to write to the file, possibly due to no write permission to the file. */
    RecorderWriteFileError                                                 : 1010014,

    /** Not enough spare capacity. */
    RecorderNoEnoughSpareCapacity                                          : 1010017,

    /** File handle exceptions. */
    RecorderFileHandleExceptions                                           : 1010018,

    /** I/O exceptions. */
    RecorderIoExceptions                                                   : 1010019,

    /** The custom video capturer is not created. Please make sure to use it only after the `onStart` callback is received. */
    CustomVideoIOCapturerNotCreated                                        : 1011001,

    /** The custom video capture module is not enabled. Please make sure it is enabled in the initialization configurations. */
    CustomVideoIONoCustomVideoCapture                                      : 1011002,

    /** Failed to enable/disable custom video capture/rendering. Please make sure to enable/disable it before the engine is started (i.e., before calling `startPreview`, `startPublishingStream` or `startPlayingStream`). */
    CustomVideoIOEnableCustomIoFailed                                      : 1011003,

    /** The custom video capturer is not created. */
    CustomVideoIOProcessModuleNotCreated                                   : 1011004,

    /** The custom video process module is not enabled. Please make sure that is called [enableCustomVideoProcessing]. */
    CustomVideoIONoCustomVideoProcessing                                   : 1011005,

    /** The currently configured custom video capture format does not support this API. */
    CustomVideoIONotSupportedFormat                                        : 1011010,

    /** Custom video rendering does not support the currently set video buffer type. */
    CustomVideoIONotSupportedBufferType                                    : 1011011,

    /** Unsupported custom audio source type. */
    CustomAudioIOUnsupportedAudioSourceType                                : 1012001,

    /** The custom audio capture feature is not enabled. Please make sure that the custom audio IO module is enabled for the specified stream publishing channel. */
    CustomAudioIOCapturerNotCreated                                        : 1012002,

    /** The custom audio rendering feature is not enabled. Please make sure that the custom audio IO module is enabled. */
    CustomAudioIORendererNotCreated                                        : 1012003,

    /** Failed to enable/disable custom audio IO. Please make sure to enable/disable it before the engine is started (i.e., before calling `startPreview`, `startPublishingStream` or `startPlayingStream`). */
    CustomAudioIOEnableCustomAudioIoFailed                                 : 1012004,

    /** The sample rate parameter is illegal, please confirm whether the sample rate parameter value allowed by the interface is legal */
    CustomAudioIOAudioDataCallbackSampleRateNoSupport                      : 1012010,

    /** The MediaDataPublisher instance is not created. */
    MediaDataPublisherNoInstance                                           : 1013000,

    /** File error, failed to open */
    MediaDataPublisherFileParseError                                       : 1013001,

    /** File path error */
    MediaDataPublisherFilePathError                                        : 1013002,

    /** File decoding exception */
    MediaDataPublisherFileCodecError                                       : 1013003,

    /** Timestamp error (the later frame timestamp is smaller than the previous frame timestamp) */
    MediaDataPublisherTimestampGoBackError                                 : 1013004,

    /** The AudioEffectPlayer instance is not created. */
    AudioEffectPlayerNoInstance                                            : 1014000,

    /** loadResource failed */
    AudioEffectPlayerLoadFailed                                            : 1014001,

    /** play audio effect failed */
    AudioEffectPlayerPlayFailed                                            : 1014002,

    /** seekTo failed */
    AudioEffectPlayerSeekFailed                                            : 1014003,

    /** The number of AudioEffectPlayer instances exceeds the maximum number allowed. */
    AudioEffectPlayerExceedMaxCount                                        : 1014004,

    /** Network connectivity test failed. */
    UtilitiesNetworkConnectivityTestFailed                                 : 1015001,

    /** Network speed test connection failure. */
    UtilitiesNetworkToolConnectServerFailed                                : 1015002,

    /** RTP timeout, please check whether the network is normal. */
    UtilitiesNetworkToolRtpTimeoutError                                    : 1015003,

    /** engine denied to continue testing network. */
    UtilitiesNetworkToolEngineDenied                                       : 1015004,

    /** Actively stop network test when starting to publish the stream. */
    UtilitiesNetworkToolStoppedByPublishingStream                          : 1015005,

    /** Actively stop network test when starting to play the stream. */
    UtilitiesNetworkToolStoppedByPlayingStream                             : 1015006,

    /** Network test internal error. */
    UtilitiesNetworkToolInnerError                                         : 1015009,

    /** The set system performance monitoring interval is out of range. */
    UtilitiesPerformanceMonitorIntervalInvalid                             : 1015031,


}

module.exports = ZegoErrorCode;
