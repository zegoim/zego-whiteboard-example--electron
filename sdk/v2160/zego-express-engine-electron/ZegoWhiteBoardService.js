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

const ZegoNativeSDK = require(ZegoExpressNodeNativePath);
const EventEmitter = require('events').EventEmitter;

/**
 * ZegoWhiteBoardService
 */
class ZegoWhiteBoardService extends EventEmitter {

    callEmit() {
        this.emit(arguments[0], arguments[1]);
    }

    /**
     * 获取用户信息
     * @return {string} - 唯一用户id
     */
    getUserID() {
        return this.zego_white_board_.getUserID();
    }

    /**
     *  上传图片
     * @param {object} option - 参数对象
     * @param {string} option.path - 本地路径
     * @return {number} 0为调用失败，非0为请求序号
     */
    whiteboardUploadFile({
        path
    }) {
        return this.zego_white_board_.zego_whiteboard_upload_file({ path });
    }

    /**
     *  取消上传
     * @param {object} option - 参数对象
     * @param {number} option.seq - whiteboardUploadFile返回的调用序号
     */
    whiteboardCancelUploadFile({
        seq
    }) {
        return this.zego_white_board_.zego_whiteboard_cancel_upload_file({ seq });
    }

    /**
     *  下载图片
     * @param {object} option - 参数对象
     * @param {string} option.url - 网络路径
     * @param {string} option.hash - 文件hash
     * @param {number} option.type - 文件类型 0:图片图元 1:自定义教具图片
     * @return {number} 0为调用失败，非0为请求序号
     */
    whiteboardDownloadFile({
        url,
        hash,
        type
    }) {
        return this.zego_white_board_.zego_whiteboard_download_file({ url, hash, type });
    }

    /**
     *  取消下载
     * @param {object} option - 参数对象
     * @param {number} option.seq - whiteboardDownloadFile返回的调用序号
     */
    whiteboardCancelDownloadFile({
        seq
    }) {
        return this.zego_white_board_.zego_whiteboard_cancel_download_file({ seq });
    }

    /**
     *  设置白板缓存路径
     * @param {object} option - 参数对象
     * @param {string} option.path - 缓存路径
     * @return {number} 返回成功或失败
     */
    whiteboardSetCacheDirectory({
        path
    }) {
        return this.zego_white_board_.zego_whiteboard_set_cache_directory({ path });
    }

    /**
     *  获取当前白板缓存路径
     * @return {string} 返回缓存路径
     */
    whiteboardGetCacheDirectory() {
        return this.zego_white_board_.zego_whiteboard_get_cache_directory();
    }

    /**
     *  清空白板缓存
     */
    whiteboardClearCache() {
        this.zego_white_board_.zego_whiteboard_clear_cache();
    }

    /**
    *  获取用户的对应的图元操作权限（同步阻塞接口）

    * @param {object} option - 参数对象
    * @param {number} operate_type 操作权限类型
    * @param {number} whiteboard_id 对应的白板id
    * @param {string} graphic_id_list ("123456;456787;45454545")  图元id, 以";"分割。(需要则填（编辑，删除，移动），无则空(清空，创建))
    * @return {boolean} 是否有权限
    */
    whiteboardCanvasCanOperated({
        operate_type,
        whiteboard_id,
        graphic_id_list
    }) {
        return this.zego_whiteboard_canvas_can_operated({ operate_type, whiteboard_id, graphic_id_list });
    }

    /**
    *  获取用户的对应的白板操作权限（同步阻塞接口)

    * @param {object} option - 参数对象
    * @param {number} operate_type 操作权限类型
    * @return {boolean} 是否有权限
    */
    whiteboardCanOperated({
        operate_type
    }) {
        return this.zego_whiteboard_can_operated({ operate_type });
    }

    whiteboardInit() {
        let tsfn = this.callEmit.bind(this);
        this.zego_white_board_ = ZegoNativeSDK.CreateWhiteBoard({ tsfn });
    }

    whiteboardUninit() {
        ZegoNativeSDK.CreateWhiteBoard({ tsfn });
        this.removeAllListeners();
        this.zego_white_board_ = null;
    }

    /**
     *  创建互动白板模型, 与whiteboardModelDelete 配对使用
     * @param {object} option - 参数对象
     * @param {number} option.mode - 互动白板模式
     * @return {number} 返回互动白板模型对象
     */
    whiteboardModelMake({
        mode
    }) {
        return this.zego_white_board_.zego_whiteboard_model_make({ mode });
    }
    /**
     *  创建互动白板模型
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_model - 释放由whiteboardModelMake产生的互动白板对象
     */
    whiteboardModelDelete({
        whiteboard_model
    }) {
        this.zego_white_board_.zego_whiteboard_model_delete({ whiteboard_model });
    }

    /**
     * 获取白板唯一标识符
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_model - 白板模型对象
     * @return {number} 返回白板唯一标识符
     */
    whiteboardModelGetId({
        whiteboard_model
    }) {
        return this.zego_white_board_.zego_whiteboard_model_get_id({ whiteboard_model });
    }

    /**
     * 获取白板模式
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_model - 白板模型对象
     * @return {number} 返回白板模式，
     */
    whiteboardModelGetMode({
        whiteboard_model
    }) {
        return this.zego_white_board_.zego_whiteboard_model_get_mode({ whiteboard_model });
    }

    /**
     * 获取白板名字
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_model - 白板模型对象
     * @return {string} 返回白板名字
     */
    whiteboardModelGetName({
        whiteboard_model
    }) {
        return this.zego_white_board_.zego_whiteboard_model_get_name({ whiteboard_model });
    }

    /**
     * 获取白板宽高比
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_model - 白板模型对象
     * @return {object} 返回宽高比对象{width:number, height:number}
     */
    whiteboardModelGetAspectRatio({
        whiteboard_model
    }) {
        return this.zego_white_board_.zego_whiteboard_model_get_aspect_ratio({ whiteboard_model });
    }
    /**
     * 获取白板画布的滚动、滑动百分比
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_model - 白板模型对象
     * @return {float} 返回滚动、滑动水平和数值百分比
     */
    whiteboardModelGetScrollPercent({
        whiteboard_model,
        direction
    }) {
        return this.zego_white_board_.zego_whiteboard_model_get_scroll_percent({ whiteboard_model, direction });
    }
    /**
     * 获取白板画布的水平偏移百分比、垂直偏移百分比、缩放系数
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_model - 白板模型对象
     * @return {object} 返回水平偏移百分比、垂直偏移百分比、缩放系数
     */
     whiteboardModelGetScaleFactor({
        whiteboard_model
    }) {
        return this.zego_white_board_.zego_whiteboard_model_get_scale_factor({ whiteboard_model });
    }
    /**
     * 设置白板名
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_model - 白板模型对象
     * @param {number} option.name - 白板名字
     */
    whiteboardModelSetName({
        whiteboard_model,
        name
    }) {
        this.zego_white_board_.zego_whiteboard_model_set_name({ whiteboard_model, name });
    }
    /**
     * 设置白板长宽比例
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_model - 白板模型对象
     * @param {number} option.width - 宽
     * @param {number} option.height - 高
     * @return {number} 0 - 设置成功
     *
     */
    whiteboardModelSetAspectRatio({
        whiteboard_model,
        width,
        height
    }) {
        this.zego_white_board_.zego_whiteboard_model_set_aspect_ratio({ whiteboard_model, width, height });
    }
    /**
     * 创建白板时，是否更新计数器
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_model - 白板模型对象
     * @param {boolean} option.enable - true - 更新计数器， false - 不更新
     *
     */
    whiteboardModelUpdateCounterWhenCreated({
        whiteboard_model,
        enable
    }) {
        this.zego_white_board_.zego_whiteboard_model_update_counter_when_created({ whiteboard_model, enable });
    }
    /**
     * 设置指定白板对应view的当前实际尺寸，有其他人绘制的图元到达时，将根据设置的当前宽高算出合适坐标再通知UI层更新。
     * 这里的UI宽高 ！不仅仅是 ！可视区域（即视口 viewport）的宽高，而应为包括滚动轴覆盖范围的宽高
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {number} option.width -  白板关联的UI宽
     * @param {number} option.height -  白板关联的UI高
     * @return {number} 0 - 成功
     */
    whiteboardSetSize({
        whiteboard_id,
        width,
        height
    }) {
        return this.zego_white_board_.zego_whiteboard_set_size({ whiteboard_id, width, height });
    }

    /**
     * 指定白板模型，创建互动白板
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_model - 模块模型，可由whiteboardModelMake生成
     * @return {number} 0为调用失败，非0为请求序号
     */
    whiteboardCreate({
        whiteboard_model,
        is_public,
        width,
        height
    }) {
        return this.zego_white_board_.zego_whiteboard_create({ whiteboard_model, is_public, width, height });
    }

    /**
     * 销毁指定互动白板
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @return {number} 0为调用失败，非0为请求序号
     */
    whiteboardDestroy({
        whiteboard_id
    }) {
        return this.zego_white_board_.zego_whiteboard_destroy({ whiteboard_id });
    }


    /**
     * 获取白板列表
     * @return {number} 0为调用失败，非0为请求序号
     */
    whiteboardGetList() {
        return this.zego_white_board_.zego_whiteboard_get_list();
    }

    /**
     * 滑动、翻滚白板画布（仅用于通知界面层）
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {float} option.horizontal_percent -
     * @param {float} option.vertical_percent -
     * @param {float} option.step -
     * @return {number} 0为调用失败，非0为请求序号
     */
    whiteboardScrollCanvas({
        whiteboard_id,
        horizontal_percent,
        vertical_percent,
        step
    }) {
        return this.zego_white_board_.zego_whiteboard_scroll_canvas({ whiteboard_id, horizontal_percent, vertical_percent, step });
    }

    /**
     * 缩放白板画布（仅用于通知界面层）
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {float} option.xoffsetpercent - 水平偏移百分比
     * @param {float} option.yoffsetpercent - 垂直偏移百分比
     * @param {float} option.scalefactor - 缩放系数
     * @return {number} 0为调用失败，非0为请求序号
     */
     whiteboardScaleCanvas({
        whiteboard_id,
        xoffsetpercent,
        yoffsetpercent,
        scalefactor
    }) {
        return this.zego_white_board_.zego_whiteboard_scale_canvas({ whiteboard_id, xoffsetpercent, yoffsetpercent, scalefactor });
    }

    /**
     * 获取图元粗细
     * @param {object} option - 参数对象
     * @param {number} option.graphic_properties - 白板画布上的图元模型
     * @return {number} 图元粗细
     */
    whiteboardGraphicItemGetSize({
        graphic_properties
    }) {
        return this.zego_white_board_.zego_whiteboard_graphic_item_get_size({ graphic_properties });
    }

    /**
     * 获取图元颜色
     * @param {object} option - 参数对象
     * @param {number} option.graphic_properties - 白板画布上的图元模型
     * @return {number} 图元颜色
     */
    whiteboardGraphicItemGetColor({
        graphic_properties
    }) {
        return this.zego_white_board_.zego_whiteboard_graphic_item_get_color({ graphic_properties });
    }

    /**
     * 获取图元坐标
     * @param {object} option - 参数对象
     * @param {number} option.graphic_properties - 白板画布上的图元模型
     * @return {object} 图元坐标 {x:number, y:number}
     */
    whiteboardGraphicItemGetPos({
        graphic_properties
    }) {
        return this.zego_white_board_.zego_whiteboard_graphic_item_get_pos({ graphic_properties });
    }

    /**
     * 获取图元 zOrder
     * @param {object} option - 参数对象
     * @param {number} option.graphic_properties - 白板画布上的图元模型
     * @return {number} 图元的zOrder
     */
    whiteboardGraphicItemGetZOrder({
        graphic_properties
    }) {
        return this.zego_white_board_.zego_whiteboard_graphic_item_get_zorder({ graphic_properties });
    }
    /**
     * 获取图元操作者 ID
     * @param {object} option - 参数对象
     * @param {number} option.graphic_properties - 白板画布上的图元模型
     * @return {string} 操作者 ID
     */
    whiteboardGraphicItemGetOperatorId({
        graphic_properties
    }) {
        return this.zego_white_board_.zego_whiteboard_graphic_item_get_operator_id({ graphic_properties });
    }
    /**
     * 获取图元操作者昵称
     * @param {object} option - 参数对象
     * @param {number} option.graphic_properties - 白板画布上的图元模型
     * @return {string} 操作者昵称
     */
    whiteboardGraphicItemGetOperatorName({
        graphic_properties
    }) {
        return this.zego_white_board_.zego_whiteboard_graphic_item_get_operator_name({ graphic_properties });
    }

    /**
     * 加载指定白板关联画布上的所有图元。
     * 加载完最后一个图元后，将从 onWhiteBoardCanvasLoad 反馈结束。
     * 具体的图元数据，根据加载过程中的实际操作类型，从各通知接口（onWhiteBoardCanvasXXX）通知
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     */
    whiteboardCanvasLoad({
        whiteboard_id
    }) {
        this.zego_white_board_.zego_whiteboard_canvas_load({ whiteboard_id });
    }

    /**
     * 加载指定白板关联画布上，缓存在 SDK 中的所有图元
     * 加载完最后一个图元后，将从 onWhiteBoardCanvasLoad 反馈结束。
     * 具体的图元数据，根据加载过程中的实际操作类型，从各通知接口（onWhiteBoardCanvasXXX）通知
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     */
    whiteboardCanvasLoadCache({
        whiteboard_id
    }) {
        this.zego_white_board_.zego_whiteboard_canvas_load_cache({ whiteboard_id });
    }

    /**
     * 撤销指定白板画布的上一次图元操作，绘制过程中调用无效
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     */
    whiteboardCanvasUndo({
        whiteboard_id
    }) {
        this.zego_white_board_.zego_whiteboard_canvas_undo({ whiteboard_id });
    }
    /**
     * 重做指定白板画布上一次撤销的图元操作，绘制过程中调用无效
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     */
    whiteboardCanvasRedo({
        whiteboard_id
    }) {
        this.zego_white_board_.zego_whiteboard_canvas_redo({ whiteboard_id });
    }
    /**
     * 重做指定白板画布上一次撤销的图元操作，绘制过程中调用无效
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {number} option.graphic_type - 白板画布上简单图元类型
     * @param {number} option.x - 传入起始坐标（UI层原始坐标即可），比如鼠标右键按下、触碰屏幕时的点击坐标。
     * @param {number} option.y - 传入起始坐标（UI层原始坐标即可），比如鼠标右键按下、触碰屏幕时的点击坐标。
     * @return {number} 新图元id
     */
    whiteboardCanvasBeginDraw({
        whiteboard_id,
        graphic_type,
        x,
        y
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_begin_draw({ whiteboard_id, graphic_type, x, y });
    }
    /**
     * 通知指定白板的虚拟画布图元绘制结束, 与whiteboardCanvasBeginDraw配对使用
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     */
    whiteboardCanvasEndDraw({
        whiteboard_id
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_end_draw({ whiteboard_id });
    }

    /**
     * 通知指定白板的虚拟画布图元移动开始, 与whiteboardCanvasEndUpdate配对使用
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     */
    whiteboardCanvasBeginUpdate({
        whiteboard_id
    }) {
        this.zego_white_board_.zego_whiteboard_canvas_begin_update({ whiteboard_id });
    }

    /**
     * 通知指定白板的虚拟画布图元绘制结束, 与whiteboardCanvasBeginDraw配对使用
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     */
    whiteboardCanvasEndUpdate({
        whiteboard_id
    }) {
        this.zego_white_board_.zego_whiteboard_canvas_end_update({ whiteboard_id });
    }


    /**
     *
     * @param {string} name - 事件名称
     * "onWhiteBoardUploadFile" 注册 上传文件 的回调
     * "onWhiteBoardDownloadFile" 注册 下载文件 的回调
     * "onWhiteBoardCreate"  注册 创建白板 的回调
     * "onWhiteBoardAdded"  注册 有白板新增 的通知
     * "onWhiteBoardDestroy"  注册 销毁白板 的回调
     * "onWhiteBoardRemoved"  注册 有白板被销毁 的通知
     * "onWhiteBoardGetList"  注册 互动白板拉取结果 的回调
     * "onWhiteBoardCanvasItemZOrderChanged"   注册 图元 zOrder 发生变化 的通知
     * "onWhiteBoardSetAspectRatio"  注册 设置白板等比宽高 的回调
     * "onWhiteBoardAspectRatioChanged"  注册 白板比例发生变化 的通知
     * "onWhiteBoardScrollCanvas"  注册 滑动、滚动白板画布 的回调
     * "onWhiteBoardCanvasLoad"  注册 所有图元加载结果 的回调
     * "onWhiteBoardCanvasScrolled"  注册 白板画布发生滑动、滚动 的通知
     * "onWhiteBoardCanvasItemMoved"  注册 图元有移动 的通知
     * "onWhiteBoardCanvasItemDeleted"  注册 图元被删除 的通知
     * "onWhiteBoardCanvasPathUpdate"  注册 path图元类型的数据发生变化的 通知
     * "onWhiteBoardCanvasTextUpdate"  注册 text图元类型的数据发生变化的 通知
     * "onWhiteBoardCanvasLineUpdate"  注册 line图元类型的数据发生变化的 通知
     * "onWhiteBoardCanvasRectUpdate"  注册 rect图元类型的数据发生变化的 通知
     * "onWhiteBoardCanvasEllipseUpdate"  注册 ellipse图元类型的数据发生变化的 通知
     * "onWhiteBoardCanvasImageUpdate"  注册 图片图元类型的数据发生变化的 通知
     * "onWhiteBoardCanvasBackgroundUpdate"  注册 背景图类型的数据发生变化的 通知
     * "onWhiteBoardAuthChangeNotify" 注册 白板权限变更 通知
     * "onWhiteBoardGraphicAuthChangeNotify" 注册 白板图元权限变更 通知
     * "onWhiteBoardCanvasClear"  注册 所有图元被清除 的通知
     * "onWhiteBoardScaleCanvas"  注册 缩放白板画布 的回调
     * "onWhiteBoardCanvasScaled"  注册 白板画布缩放 的通知
     * "onWhiteBoardRoomStatusChangedNotify"  注册 房间状态变更 的通知
     * @param {function} func - callback
     */
    onEventHandler(name, func) {
        this.on(name, func);
    }

    /**
     * 向指定白板的虚拟画布绘制涂鸦点
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {number} option.x - 涂鸦点 坐标 x
     * @param {number} option.y - 涂鸦点 坐标 y
     */
    whiteboardCanvasDrawPath({
        whiteboard_id,
        x,
        y
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_draw_path({ whiteboard_id, x, y });
    }

    /**
     * 向指定白板的虚拟画布绘制涂鸦点(x和y均为浮点型参数)
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {number} option.x - 涂鸦点 坐标 x
     * @param {number} option.y - 涂鸦点 坐标 y
     */
     whiteboardCanvasDrawPathFloat({
        whiteboard_id,
        x,
        y
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_draw_path_float({ whiteboard_id, x, y });
    }



    /**
     * 向指定白板的虚拟画布绘制简单文本
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {string} option.text - 简单文本内容
     */
    whiteboardCanvasDrawText({
        whiteboard_id,
        text
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_draw_text({ whiteboard_id, text });
    }
    /**
     * 编辑指定白板虚拟画布上的已存在文本图元，即修改文本内容
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {number} option.graphic_id - 图元id
     * @param {string} option.text - 新的文本内容
     */
    whiteboardCanvasEditText({
        whiteboard_id,
        graphic_id,
        text
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_edit_text({ whiteboard_id, graphic_id, text });
    }
    /**
     * 向指定白板的虚拟画布绘制直线终点
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {number} option.x - 直线终点x坐标
     * @param {number} option.y - 直线终点y坐标
     */
    whiteboardCanvasDrawLine({
        whiteboard_id,
        x,
        y
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_draw_line({ whiteboard_id, x, y });
    }
    /**
     * 向指定白板的虚拟画布绘制矩形的右下角点
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {number} option.x - 矩形右下角点x坐标
     * @param {number} option.y - 矩形右下角点y坐标
     */
    whiteboardCanvasDrawRect({
        whiteboard_id,
        x,
        y
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_draw_rect({ whiteboard_id, x, y });
    }
    /**
     * 向指定白板的虚拟画布绘制椭圆矩形外框的右下角点
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {number} option.x - 椭圆矩形外框右下角点x坐标
     * @param {number} option.y - 椭圆矩形外框右下角点y坐标
     */
    whiteboardCanvasDrawEllipse({
        whiteboard_id,
        x,
        y
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_draw_ellipse({ whiteboard_id, x, y });
    }

    /**
     * 向指定白板的虚拟画布绘制图片图元
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {string} option.path - 图片本地路径或url
     * @param {string} option.hash - 图片hash（可填空）
     * @param {string} option.pos_x - 结束位置 x
     * @param {string} option.pos_y - 结束位置 y
     */
    whiteboardCanvasAddImage({
        whiteboard_id,
        path,
        hash,
        pos_x,
        pos_y
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_add_image({ whiteboard_id, path, hash, pos_x, pos_y });
    }

    /**
     * 编辑图片图元
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {number} option.graphic_id - 图元id
     */
    whiteboardCanvasEditImage({
        whiteboard_id,
        graphic_id,
        pos_x,
        pos_y,
        epos_x,
        epos_y
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_edit_image({ whiteboard_id, graphic_id, pos_x, pos_y, epos_x, epos_y });
    }

    /**
    * 设置当前白板背景图片
    * Note:
    * 1、支持图片类型：png/jpg/jpeg/svg；
    * 2、图片大小限制10M；
    * 3、会同步到其他端；

    * @param {object} option - 参数对象
    * @param {number} whiteboard_id 白板id
    * @param {string} path 图片地址，支持本地图片地址和网络图片地址，本地图片会先上传到cdn存储
    * @param {string} hash 图片hash （和图片一样，有则填，没则空）
    * @param {number} fit_mode 背景图片填充模式
    */
    whiteboardCanvasSetBackground({
        whiteboard_id,
        path,
        hash,
        fit_mode
    }) {
        this.zego_white_board_.zego_whiteboard_canvas_set_background({ whiteboard_id, path, hash, fit_mode });
    }

    /**
    * 清除背景图片接口 （回调会走清除图元的deleteItem）

    * @param {object} option - 参数对象
    * @param {number} whiteboard_id 白板id
    */
    whiteboardCanvasCleanBackground({
        whiteboard_id
    }) {
        this.zego_white_board_.zego_whiteboard_canvas_clean_background({ whiteboard_id });
    }

    whiteboardCanvasMoveItem({
        whiteboard_id,
        graphic_id,
        x,
        y
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_move_item({ whiteboard_id, graphic_id, x, y });
    }

    whiteboardCanvasMoveItems({
        whiteboard_id,
        move_info_list
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_move_items({ whiteboard_id, move_info_list });
    }

    /**
     * 向指定白板的虚拟画布绘制椭圆矩形外框的右下角点
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {number} option.graphic_id - 图元id
     */
    whiteboardCanvasDeleteItem({
        whiteboard_id,
        graphic_id
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_delete_item({ whiteboard_id, graphic_id });
    }

    /**
     * 批量删除图元
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {array} option.delete_list - 图元id列表
     */
    whiteboardCanvasDeleteItems({
        whiteboard_id,
        delete_list
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_delete_items({ whiteboard_id, delete_list });
    }


    /**
     * 清除指定白板关联画布上的所有图元，所有人或白板操作者会收到该指令
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     */
    whiteboardCanvasClear({
        whiteboard_id
    }) {
        return this.zego_white_board_.zego_whiteboard_canvas_clear({ whiteboard_id })
    }

    /**
     *
     * @param {number} whiteboard_model
     * @return {string}
     */
    whiteboardModelGetContent({
        whiteboard_model
    }) {
        return this.zego_white_board_.zego_whiteboard_model_get_content({ whiteboard_model })
    }

    whiteboardModelGetH5Extra({
        whiteboard_model
    }) {
        return this.zego_white_board_.zego_whiteboard_model_get_h5_extra({ whiteboard_model })
    }

    /**
     *
     * @param {number} whiteboard_model
     * @param {string} content
     * @param {number}
     */
    whiteboardModelSetContent({
        whiteboard_model,
        content
    }) {
        return this.zego_white_board_.zego_whiteboard_model_set_content({ whiteboard_model, content })
    }

    /**
     *
     * @param {number} whiteboard_id
     * @param {number} width
     * @param {number} height
     * @return {number}
     */
    whiteboardSetViewportSize({
        whiteboard_id,
        width,
        height
    }) {
        return this.zego_white_board_.zego_whiteboard_set_viewport_size({ whiteboard_id, width, height })
    }

    /**
     *
     * @param {number} whiteboard_id
     * @param {number} horizontal_percent
     * @param {number} vertical_percent
     */
    whiteboardLoadCurrentGraphics({
        whiteboard_id, horizontal_percent, vertical_percent
    }) {
        this.zego_white_board_.zego_whiteboard_load_current_graphics({ whiteboard_id, horizontal_percent, vertical_percent })
    }

    /**
     *
     * @param {number} whiteboard_id
     * @param {string} content
     * @param {number}
     */
    whiteboardSetContent({ whiteboard_id, content }) {
        return this.zego_white_board_.zego_whiteboard_set_content({ whiteboard_id, content })
    }

    /**
     * 设置指定白板的扩展信息
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @param {string} option.extra - 拓展信息内容
     * @return {number} 0为调用失败，非0为请求序号
     */
    whiteboardAppendH5Extra({ whiteboard_id, extra }) {
        return this.zego_white_board_.zego_whiteboard_append_h5_extra({ whiteboard_id, extra })
    }

    /**
     * 获取白板的扩展信息
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @return {number} 0为调用失败，非0为请求序号
     */
     whiteboardGetH5Extra({ whiteboard_id }) {
        return this.zego_white_board_.zego_whiteboard_get_h5_extra({ whiteboard_id })
    }

    /**
     * 获取白板的缩放信息
     * @param {object} option - 参数对象
     * @param {number} option.whiteboard_id - 白板id
     * @return {Object} 返回水平偏移百分比、垂直偏移百分比、缩放系数
     */
     whiteboardGetScaleFactor({ whiteboard_id }) {
        return this.zego_white_board_.zego_whiteboard_get_scale_factor({ whiteboard_id })
    }

    /**
     *
     * @param {number} graphic_type
     * @return {number}
     */
    whiteboardSettingsGetGraphicSize({ graphic_type }) {
        return this.zego_white_board_.zego_whiteboard_settings_get_graphic_size({ graphic_type })
    }

    /**
     *
     * @param {number} graphic_type
     * @param {number} size_level
     * @return {number}
     */
    whiteboardSettingsSetGraphicSize({ graphic_type, size_level }) {
        return this.zego_white_board_.zego_whiteboard_settings_set_graphic_size({ graphic_type, size_level })
    }

    /**
     *
     * @param {number} graphic_type
     * @return {number}
     */
    whiteboardSettingsGetGraphicColor({ graphic_type }) {
        return this.zego_white_board_.zego_whiteboard_settings_get_graphic_color({ graphic_type })
    }
    /**
     *
     * @param {number} graphic_type
     * @return {string}
     */
    whiteboardSettingsGetGraphicColorString({ graphic_type }) {
        return this.zego_white_board_.zego_whiteboard_settings_get_graphic_color_string({ graphic_type })
    }

    /**
     *
     * @param {number} graphic_type
     * @param {number} color
     * @return {number}
     */
    whiteboardSettingsSetGraphicColor({ graphic_type, color }) {
        return this.zego_white_board_.zego_whiteboard_settings_set_graphic_color({ graphic_type, color })
    }

    /**
     *
     * @param {number} graphic_type
     * @return {Boolean}
     */
    whiteboardSettingsGetGraphicBold({ graphic_type }) {
        return this.zego_white_board_.zego_whiteboard_settings_get_graphic_bold({ graphic_type })
    }

    /**
     *
     * @param {number} graphic_type
     * @param {Boolean} is_bold
     * @return {number}
     */
    whiteboardSettingsSetGraphicBold({ graphic_type, is_bold }) {
        return this.zego_white_board_.zego_whiteboard_settings_set_graphic_bold({ graphic_type, is_bold })
    }

    /**
     *
     * @param {number} graphic_type
     * @return {Boolean}
     */
    whiteboardSettingsGetGraphicItalic({ graphic_type }) {
        return this.zego_white_board_.zego_whiteboard_settings_get_graphic_italic({ graphic_type })
    }

    /**
     *
     * @param {number} graphic_type
     * @param {Boolean} is_italic
     * @return {number}
     */
    whiteboardSettingsSetGraphicItalic({ graphic_type, is_italic }) {
        return this.zego_white_board_.zego_whiteboard_settings_set_graphic_italic({ graphic_type, is_italic })
    }


    /**
     *
     * @param {number} graphic_type
     * @return {Boolean}
     */
     whiteboardSettingsGetGraphicStroke({ graphic_type }) {
        return this.zego_white_board_.zego_whiteboard_settings_get_graphic_stroke({ graphic_type })
    }

    /**
     *
     * @param {number} graphic_type
     * @param {Boolean} is_stroke
     * @return {number}
     */
    whiteboardSettingsSetGraphicStroke({ graphic_type, is_stroke }) {
        return this.zego_white_board_.zego_whiteboard_settings_set_graphic_stroke({ graphic_type, is_stroke })
    }
}

/**
 * 文件上传 的回调
 * @callback onWhiteBoardUploadFile
 * @param {object} result - 结果数据对象
 * @param {number} result.error_code - 错误码，0为成功
 * @param {number} result.seq - 调用序号
 * @param {boolean} result.finish - 是否上传完成
 * @param {float} result.rate - 上传进度
 * @param {string} result.file_id - 文件ID
 * @param {string} result.url - 文件url
 * @param {string} result.hash - 文件hash
 *
 */

/**
* 下载上传 的回调
* @callback onWhiteBoardDownloadFile
* @param {object} result - 结果数据对象
* @param {number} result.error_code - 错误码，0为成功
* @param {number} result.seq - 调用序号
* @param {boolean} result.finish - 是否上传完成
* @param {float} result.rate - 上传进度
* @param {string} result.path - 文件本地路径
*
*/

/**
 * 创建白板 的回调
 * @callback onWhiteBoardCreate
 * @param {object} result - 结果数据对象
 * @param {number} result.error_code - 错误码，0为成功
 * @param {number} result.seq - 调用序号
 * @param {number} result.whiteboard_model - 创建的白板模型，如失败则该值为空
 *
 */
/**
 * 有白板新增 的回调
 * @callback onWhiteBoardAdded
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_model - 新增的白板模型
 *
 */
/**
 * 销毁白板 的回调
 * @callback onWhiteBoardDestroy
 * @param {object} result - 结果数据对象
 * @param {number} result.error_code - 错误码，0为成功
 * @param {number} result.seq - 调用序号
 * @param {number} result.whiteboard_id - 被销毁的白板id
 *
 */
/**
 * 有白板被销毁 的通知
 * @callback onWhiteBoardRemoved
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 被销毁的白板id
 *
 */
/**
 * 互动白板拉取结果 的回调
 * @callback onWhiteBoardGetList
 * @param {object} result - 结果数据对象
 * @param {number} result.error_code - 错误码，0为成功
 * @param {number} result.seq - 调用序号
 * @param {object | array} result.whiteboard_model_list - 白板模型对象数组，白板模型对象属性如下：
 * @param {number} result.whiteboard_model_list.whiteboard_model - 白板模型
 *
 */

/**
 * 图元 zOrder 发生变化 的回调
 * @callback onWhiteBoardCanvasItemZOrderChanged
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 图元所在的白板id
 * @param {number} result.graphic_id - 要调整 zorder 的图元id
 * @param {number} result.zorder - 要调整的新 zorder 值
 *
 */
/**
 * 设置白板等比宽高 的回调
 * @callback onWhiteBoardSetAspectRatio
 * @param {object} result - 结果数据对象
 * @param {number} result.error_code - 错误码，0为成功
 * @param {number} result.seq - 调用序号
 * @param {number} result.width - 白板宽高比
 * @param {number} result.height - 白板宽高比
 * @param {number} result.whiteboard_id - 待修改的白板id
 *
 */
/**
 * 白板比例发生变化 的通知
 * @callback onWhiteBoardAspectRatioChanged
 * @param {object} result - 结果数据对象
 * @param {number} result.width - 白板宽高比
 * @param {number} result.height - 白板宽高比
 * @param {number} result.whiteboard_id -  宽高比发生变化的白板id
 *
 */

/**
 * 滑动、滚动白板画布 的回调
 * @callback onWhiteBoardScrollCanvas
 * @param {object} result - 结果数据对象
 * @param {number} result.error_code - 错误码，0为成功
 * @param {number} result.seq - 调用序号
 * @param {number} result.horizontal_scroll_percent - 横向滚动的相对位置百分比（可以理解为滚动条Handle在滚动条Bar中的百分比）
 * @param {number} result.vertical_scroll_percent - 纵向滚动的相对位置百分比
 * @param {number} result.whiteboard_id - 要滚动、滑动的白板id（关联画布）
 * @param {number} result.step - step
 *
 */

/**
 * 白板画布发生滑动、滚动 的通知
 * @callback onWhiteBoardCanvasScrolled
 * @param {object} result - 结果数据对象
 * @param {number} result.horizontal_scroll_percent - 横向滚动的相对位置百分比（可以理解为滚动条Handle在滚动条Bar中的百分比）
 * @param {number} result.vertical_scroll_percent - 纵向滚动的相对位置百分比
 * @param {number} result.whiteboard_id - 滚动、滑动的白板id（关联画布）
 * @param {number} result.step - step
 *
 */

/**
 * 缩放白板画布 的回调
 * @callback onWhiteBoardScaleCanvas
 * @param {object} result - 结果数据对象
 * @param {number} result.error_code - 错误码，0为成功
 * @param {number} result.seq - 调用序号
 * @param {number} result.offset_x_percent - 水平偏移百分比
 * @param {number} result.offset_y_percent - 垂直偏移百分比
 * @param {number} result.whiteboard_id - 要滚动、滑动的白板id（关联画布）
 * @param {number} result.scale_factor - scale_factor
 *
 */

/**
 * 白板画布发生缩放 的通知
 * @callback onWhiteBoardCanvasScaled
 * @param {object} result - 结果数据对象
 * @param {number} result.offset_x_percent - 水平偏移百分比
 * @param {number} result.offset_y_percent - 垂直偏移百分比
 * @param {number} result.whiteboard_id - 滚动、滑动的白板id（关联画布）
 * @param {number} result.scale_factor - scale_factor
 *
 */

/**
 * 所有图元加载结果 的回调
 * @callback onWhiteBoardCanvasLoad
 * @param {object} result - 结果数据对象
 * @param {number} result.error_code - 错误码，0为成功
 * @param {number} result.whiteboard_id - 白板id
 *
 */

/**
 * 图元有移动 的通知
 * @callback onWhiteBoardCanvasItemMoved
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 白板id
 * @param {number} result.graphic_id - 图元id
 * @param {string} result.operator_id - 移动该图元的用户id
 * @param {string} result.operator_name - 移动该图元的用户昵称
 * @param {object} result.dest_pos - 要移动的左上角目标位置，目标位置属性如下：
 * @param {number} result.dest_pos.x - 左上角目标位置x坐标
 * @param {number} result.dest_pos.y - 左上角目标位置y坐标
 *
 */
/**
 * 图元被删除 的通知
 * @callback onWhiteBoardCanvasItemDeleted
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 单个图元被删除的白板id
 * @param {number} result.graphic_id - 被删除的图元id
 * @param {string} result.operator_id - 删除该图元的用户id
 * @param {string} result.operator_name - 删除该图元的用户昵称
 *
 */
/**
 * path图元类型的数据发生变化的 通知
 * @callback onWhiteBoardCanvasPathUpdate
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 图元被清除的白板id
 * @param {number} result.graphic_id - 涂鸦图元id
 * @param {number} result.graphic_properties - 图元属性信息，起始点\粗细\颜色\绘制人等
 * @param {object|array} result.points - 涂鸦线条上所有点的数组, 每个点对象属性如下：
 * @param {number} result.points.x - x 坐标
 * @param {number} result.points.y - y 坐标
 * @param {number} result.graphic_size
 * @param {number} result.graphic_color
 * @param {Boolean}result.is_bold
 * @param {Boolean}result.is_italic
 * @param {number} result.pos_x
 * @param {number} result.pos_y
 *
 */

/**
* 权限发生变化的 通知
* @callback onWhiteBoardAuthChangeNotify
* @param {object} result - 结果数据对象
* @param {string} result.auth - {"sacle": 0, "scroll": 0}
*/

/**
* 权限发生变化的 通知
* @callback onWhiteBoardGraphicAuthChangeNotify
* @param {object} result - 结果数据对象
* @param {string} result.auth - {"clear":1,"create":1,"delete":1,"move":1,"update":1}
*/


/**
*  房间状态变化的 通知
* @callback onWhiteBoardRoomStatusChangedNotify
* @param {object} result - 结果数据对象
* @param {string} result.roomID - 房间id
* @param {number} result.status - 房间状态(RoomOffline = 0, RoomOnline = 1,RoomTempBroken = 2)
*/


/**
 * text图元类型的数据发生变化的 通知
 * @callback onWhiteBoardCanvasTextUpdate
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 白板id
 * @param {number} result.graphic_id - 文本图元id
 * @param {number} result.graphic_properties - 图元属性信息，粗细\颜色\绘制人等
 * @param {string} result.text - 文本内容
 * @param {object} result.point_begin - 文本起始位置，起始点属性如下：
 * @param {number} result.point_begin.x - 起始点坐标x
 * @param {number} result.point_begin.y - 起始点坐标y
 * @param {number} result.graphic_size
 * @param {number} result.graphic_color
 * @param {Boolean}result.is_bold
 * @param {Boolean}result.is_italic
 * @param {number} result.pos_x
 * @param {number} result.pos_y
 *
 */
/**
 * line图元类型的数据发生变化的 通知
 * @callback onWhiteBoardCanvasLineUpdate
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 白板id
 * @param {number} result.graphic_id - 线条图元id
 * @param {number} result.graphic_properties - 图元属性信息，起始点\粗细\颜色\绘制人等
 * @param {object} result.point_begin - 起始点，起始点属性如下：
 * @param {number} result.point_begin.x - 起始点坐标x
 * @param {number} result.point_begin.y - 起始点坐标y
 * @param {object} result.point_end - 结束点，结束点属性如下：
 * @param {number} result.point_end.x - 结束点坐标x
 * @param {number} result.point_end.y - 结束点坐标y
 * @param {number} result.graphic_size
 * @param {number} result.graphic_color
 * @param {Boolean}result.is_bold
 * @param {Boolean}result.is_italic
 * @param {number} result.pos_x
 * @param {number} result.pos_y
 */
/**
 * rect图元类型的数据发生变化的 通知
 * @callback onWhiteBoardCanvasRectUpdate
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 白板id
 * @param {number} result.graphic_id - 矩形图元id
 * @param {number} result.graphic_properties - 图元属性信息，起始点\粗细\颜色\绘制人等
 * @param {object} result.point_begin - 起始点（左上角），起始点属性如下：
 * @param {number} result.point_begin.x - 起始点坐标x
 * @param {number} result.point_begin.y - 起始点坐标y
 * @param {object} result.point_end - 结束点（右下角），结束点属性如下：
 * @param {number} result.point_end.x - 结束点坐标x
 * @param {number} result.point_end.y - 结束点坐标y
 * @param {number} result.graphic_size
 * @param {number} result.graphic_color
 * @param {Boolean}result.is_bold
 * @param {Boolean}result.is_italic
 * @param {number} result.pos_x
 * @param {number} result.pos_y
 *
 */
/**
 * ellipse图元类型的数据发生变化的 通知
 * @callback onWhiteBoardCanvasEllipseUpdate
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 白板id
 * @param {number} result.graphic_id - 园和椭圆的图元id
 * @param {number} result.graphic_properties - 图元属性信息，起始点\粗细\颜色\绘制人等
 * @param {object} result.point_begin - 起始点（左上角），起始点属性如下：
 * @param {number} result.point_begin.x - 起始点坐标x
 * @param {number} result.point_begin.y - 起始点坐标y
 * @param {object} result.point_end - 结束点（右下角），结束点属性如下：
 * @param {number} result.point_end.x - 结束点坐标x
 * @param {number} result.point_end.y - 结束点坐标y
 * @param {number} result.graphic_size
 * @param {number} result.graphic_color
 * @param {Boolean}result.is_bold
 * @param {Boolean}result.is_italic
 * @param {number} result.pos_x
 * @param {number} result.pos_y
 */

/**
* 图片图元类型的发生变化的 通知
* @callback onWhiteBoardCanvasImageUpdate
* @param {object} result - 结果数据对象
* @param {number} result.whiteboard_id - 白板id
* @param {number} result.graphic_id - 图元id
* @param {number} result.graphic_properties - 图元属性信息，起始点\粗细\颜色\绘制人等
* @param {string} result.path - 图元路径
* @param {object} result.point - point点属性如下：
* @param {number} result.point.x - 点坐标x
* @param {number} result.point.y - 点坐标y
* @param {number} result.pos_x - pos 点坐标x
* @param {number} result.pos_y - pos 点坐标y
* @param {boolean} result.is_upload - 是否在上传中
* @param {boolean} result.is_finished - 是否上传完成
* @param {float} result.progress - 上传或者下载进度
*/

/**
* 背景图类型的数据发生变化的 通知
* @callback onWhiteBoardCanvasBackgroundUpdate
* @param {object} result - 结果数据对象
* @param {number} result.whiteboard_id - 白板id
* @param {number} result.graphic_id - 图元id
* @param {number} result.graphic_properties - 图元属性信息，起始点\粗细\颜色\绘制人等
* @param {string} result.path - 图元路径
* @param {object} result.point - point点属性如下：
* @param {number} result.point.x - 点坐标x
* @param {number} result.point.y - 点坐标y
* @param {number} result.pos_x - pos 点坐标x
* @param {number} result.pos_y - pos 点坐标y
* @param {string} result.hash - 文件hash
*/

/**
 * 设置白板扩展字段whiteboardAppendH5Extra的结果回调
 * @callback onWhiteBoardAppendH5ExtraCallback
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 白板id
 * @param {number} result.seq - 调用序号
 * @param {number} result.error_code - 错误码
 *
 */

/**
 * 设置白板扩展字段whiteboardAppendH5Extra的结果回调
 * @callback onWhiteBoardAppendH5ExtraCallback2
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 白板id
 * @param {number} result.seq - 调用序号
 * @param {number} result.error_code - 错误码
 * @param {string} result.extra - 白板扩展字段内容
 *
 */

/**
 * 收到远端白板扩展字段内容发生变化的通知
 * @callback onWhiteBoardH5ExtraAppendedNotify
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 白板id
 * @param {string} result.extra - 白板扩展字段内容
 *
 */

/**
 * 所有图元被清除 的通知
 * @callback onWhiteBoardCanvasClear
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 图元被清除的白板id
 * @param {string} result.operator_id - 清除画布的用户id
 * @param {string} result.operator_name - 清除画布的用户昵称
 *
 */

/**
 * 激光笔图元类型的数据发生变化的 通知
 * @callback onWhiteBoardCanvasLaserUpdate
 * @param {object} result - 结果数据对象
 * @param {number} result.whiteboard_id - 白板id
 * @param {number} result.graphic_id - 图元id
 * @param {number} result.graphic_properties - 图元属性信息，起始点\粗细\颜色\绘制人等
 * @param {object} result.point - point点属性如下：
 * @param {number} result.point.x - 点坐标x
 * @param {number} result.point.y - 点坐标y
 * @param {number} result.pos_x - pos 点坐标x
 * @param {number} result.pos_y - pos 点坐标y
 */

const ZegoExpressWhiteBoardInstance = new ZegoWhiteBoardService;
module.exports = ZegoExpressWhiteBoardInstance;
