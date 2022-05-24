/**
 * @file ZegoDocsView.js
 * @copyright Zego @ 2020
 */
function ZegoDocsView() {

    const path = require('path');

    const ZegoAddon = require(path.join(__dirname, './ZegoDocsView.node'));

    let view_list_ = [];

    let zego_docs_ = null;

    let docsview_events_ = {};

    let cur_rate_ = 1

    let cur_parent_width_ = 0

    let cur_parent_height_ = 0;

    let current_page_number_ = 1;

    const PDF_RENDER_MODE = 0;

    const PPT_RENDER_MODE = 1;

    let cur_draw_mode_ = 0; // 0 - 等宽模式、1 - ppt 模式

    let cur_file_type_ = 0;

    let this_obj_ = null;

    let ZegoDocsViewConstants = {
        FileType: {
            ZegoDocsViewFileTypePPT: 1,
            ZegoDocsViewFileTypeDOC: 2,
            ZegoDocsViewFileTypeELS: 4,
            ZegoDocsViewFileTypePDF: 8,
            ZegoDocsViewFileTypeIMG: 16,
            ZegoDocsViewFileTypeTXT: 32,
			ZegoDocsViewFileTypeH5 : 0x40,			  ///< H5
			ZegoDocsViewFileTypeH5PDF : 0x80,         ///< H5 PDF
			ZegoDocsViewFileTypeIMGAndPDF : 0x100,    ///< PPT 2 images
			ZegoDocsViewFileTypeDynamicPPTH5 : 0x200, ///< 动态ppt
            ZegoDocsViewFileTypeCustomH5 : 0x1000,    ///< 自定义 H5 课件
			ZegoDocsViewFileTypeFolder : 0x10000000
        },
        ErrorCode: {
            ZegoDocsViewSuccess: 0,
            ZegoDocsViewErrorInternal: 2000001,
            ZegoDocsViewErrorParamInvalid: 2000002,
            ZegoDocsViewErrorNetworkTimeout: 2000003,
            ZegoDocsViewErrorFileNotExist: 2010001,
            ZegoDocsViewErrorUploadFailed: 2010002,
            ZegoDocsViewErrorFileEncrypt: 2020001,
            ZegoDocsViewErrorFileSizeLimit: 2020002,
            ZegoDocsViewErrorFileSheetLimit: 2020003,
            ZegoDocsViewErrorConvertFail: 2020004,
            ZegoDocsViewErrorConvertCancel: 2020005,
            ZegoDocsViewErrorAuthParamInvalid: 2030001,
            ZegoDocsViewErrorFilePathNotAccess: 2030002,
            ZegoDocsViewErrorInitFailed: 2030003,
            ZegoDocsViewErrorSizeInvalid: 2030004,
            ZegoDocsViewErrorFreeSpaceLimit: 2030005,
            ZegoDocsViewErrorUploadNotSupported: 2030006,
            ZegoDocsViewErrorUploadDuplicated: 2030007,
            ZegoDocsViewErrorUnsupportRenderType:2010003,
            ZegoDocsViewErrorServerCacheNotSupported:2030014
        },
    }

    let virtual_page_img_info_cache_ = {}

    var publicErrorCode = new Map([
        [0, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewSuccess],
        [-999999, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorParamInvalid],
        [-102, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorNetworkTimeout],
        [-105, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorFileNotExist],
        [-109, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorUploadFailed],
        [128, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorFileEncrypt],
        [-117, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorFileSizeLimit],
        [512, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorFileSheetLimit],
        [32, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorConvertFail],
        [64, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorConvertCancel],
        [-120, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorUnsupportRenderType],
        //[, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorAuthParamInvalid],
        [-110, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorFilePathNotAccess],
        [-116, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorInitFailed],
        [-999998, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorSizeInvalid],
        [-115, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorFreeSpaceLimit],
        [-118, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorUploadNotSupported],
        [-119, ZegoDocsViewConstants.ErrorCode.ZegoDocsViewErrorUploadDuplicated]
    ]);

    try {
        zego_docs_ = new ZegoAddon.ZegoDocs()

    } catch (err) {
        //console.log(err)
    }

    let kPrintLog = false;

    let log = kPrintLog == true ? console.log : function () {};

    function getParentClientWidth(doc_view_index) {
        return document.getElementById(view_list_[doc_view_index].parent).clientWidth;
    }

    function getParentClientHeight(doc_view_index) {
        return document.getElementById(view_list_[doc_view_index].parent).clientHeight;
    }

    // 渲染base64数据到canvas 上
    function drawImg(src_x, src_y, dst_x, dst_y, w, h, dst_w, dst_h, png_base64_data, canvas_obj) {
        return new Promise((resolve, reject) => {
            let context = canvas_obj.getContext("2d");
            let cimg = new Image();
            cimg.src = "data:image/png;base64," + png_base64_data;
            cimg.onload = function () {
                log('drawImg: (', src_x, ',', src_y, ')', '->  (', dst_x, ',', dst_y, ')', 'w:', w, ',', 'h', h);
                context.drawImage(cimg, src_x, src_y, w, h, dst_x, dst_y, dst_w, dst_h);
                resolve()
            }
        })
    }

    function createDocsViewParentIfNeeded(doc_view_index, process_scroll_event) {

        if (!document.getElementById('docsview_parent' + doc_view_index)) {

            var parent = document.getElementById(view_list_[doc_view_index].parent);
            parent.style['position'] = 'relative';
            var docsview_parent = document.createElement("div");
            docsview_parent.id = 'docsview_parent' + doc_view_index;
            docsview_parent.style['overflow'] = 'auto';
            docsview_parent.style['position'] = 'absolute';
            //docsview_parent.style['background'] = '#00ff00'
            parent.appendChild(docsview_parent);

            if(process_scroll_event){
                docsview_parent.addEventListener('scroll', () => {

                    let docsview_parent = document.getElementById('docsview_parent' + doc_view_index)
    
                    execScrollFileAndDraw(doc_view_index, view_list_[doc_view_index].file_info.file_list[0].page_list, docsview_parent.scrollTop, cur_parent_height_, function(){
    
                    });
    
                });
            }
        }
    }

    function updateDocsViewParentLayout(doc_view_index, x, y, w, h) {
        var parent = document.getElementById('docsview_parent' + doc_view_index);
        if (parent) {
            parent.style['width'] = (w | 0) + 'px';
            parent.style['height'] = (h | 0) + 'px';
            parent.style['left'] = x + 'px';
            parent.style['top'] = y + 'px';
            parent['per_page_height'] = h;
            log('updateDocsViewParentLayout', doc_view_index, x, y, w, h)
        }
    }

    function updateAddCanvasHeight(canvas, h) {
        canvas.height = canvas.height + h;
    }

    function hideOtherDocsViewParent(index) {
        for (let i = 0; i < view_list_.length; ++i) {
            if (i == index && document.getElementById('docsview_parent' + i)) {
                document.getElementById('docsview_parent' + i).style['visibility'] = 'visible';
            } else {
                if (document.getElementById('docsview_parent' + i)) {
                    document.getElementById('docsview_parent' + i).style['visibility'] = 'hidden';
                    log('hide canvas :', 'docsview_parent' + i, i);
                }
            }
        }
    }

    function drawImgByPath(img_path, canvas_obj, begin_y) {
        return new Promise((resolve, reject) => {
            let context = canvas_obj.getContext('2d');
            let img = new Image();
            img.src = img_path;
            log('drawImgByPath', img_path)
            img.onload = function () {
                const min_w = 640;
                const min_h = 400;
                if (img.width < min_w && img.height < min_h) {
                    log('draw small img');

                    let rate_w = min_w / img.width;
                    let rate_h = min_h / img.height;

                    let cur_rate = Math.min(rate_w, rate_h);

                    let draw_h = img.height * cur_rate;
                    let draw_w = img.width * cur_rate;

                    let pos_x = (canvas_obj.width - draw_w) / 2;
                    let pos_y = (canvas_obj.height - draw_h) / 2;

                    canvas_obj.width = draw_w;
                    canvas_obj.height = draw_h;

                    log('drawImage: (', pos_x, ',', pos_y, ')', 'w:', draw_w, ',', 'h', draw_h);

                    context.drawImage(img, 0, 0, img.width, img.height, 0, 0, draw_w, draw_h);

                    let content_w = draw_w;
                    let content_h = draw_h;

                    resolve({
                        x: pos_x,
                        y: pos_y,
                        w: content_w,
                        h: content_h
                    });

                } else if (img.width > 1440) {
                    log('draw img like pdf')
                    cur_draw_mode_ = PDF_RENDER_MODE;
                    let pos_x = 0;
                    let pos_y = begin_y;

                    let src_w = img.width;
                    let src_h = img.height;

                    let dst_x = 0;
                    let dst_y = 0;

                    let dst_w = img.width * cur_rate_;
                    let dst_h = img.height * cur_rate_;

                    canvas_obj.height = dst_h - dst_y

                    context.drawImage(img, pos_x, pos_y, src_w, src_h, dst_x, dst_y, dst_w, dst_h);

                    resolve({
                        x: 0,
                        y: 0,
                        w: cur_parent_width_,
                        h: cur_parent_height_
                    });

                } else if (img.height / img.width <= 2.2) {

                    log('居中布局绘制')

                    let rate_w = cur_parent_width_ / img.width;
                    let rate_h = cur_parent_height_ / img.height;

                    let cur_rate = Math.min(rate_w, rate_h);

                    let draw_h = img.height * cur_rate;
                    let draw_w = img.width * cur_rate;

                    let pos_x = (cur_parent_width_ - draw_w) / 2;
                    let pos_y = (cur_parent_height_ - draw_h) / 2;

                    canvas_obj.width = draw_w;
                    canvas_obj.height = draw_h;

                    context.drawImage(img, 0, 0, img.width, img.height, 0, 0, draw_w, draw_h);

                    let content_w = draw_w;
                    let content_h = draw_h;

                    resolve({
                        x: pos_x,
                        y: pos_y,
                        w: content_w,
                        h: content_h
                    });

                } else {

                    log('draw all img')

                    let pos_x = 0;
                    let pos_y = begin_y;

                    let src_w = img.width;
                    let src_h = img.height;

                    let dst_x = 0;
                    let dst_y = 0;

                    let dst_w = img.width * cur_rate_;
                    let dst_h = img.height * cur_rate_;

                    context.drawImage(img, pos_x, pos_y, src_w, src_h, dst_x, dst_y, dst_w, dst_h);

                    let content_w = dst_w;
                    let content_h = dst_h;

                    resolve({
                        x: pos_x,
                        y: pos_y,
                        w: content_w,
                        h: content_h
                    });
                }
                resolve();
            }
        })
    }

    // 所有渲染调用都通过该函数入口调用实现
    // 通过虚拟页图像信息数组，渲染到创建好的docview
    function drawImgByVPageList(src_x, src_y, doc_view_index, vlist, cb) {
        let begin_x = src_x;
        let begin_y = src_y;
        let dst_x = 0;
        let dst_y = src_y;

        log('drawImgByVPageList: src_x', src_x, 'src_y', src_y, "vlist", vlist);

        let is_img_type = (vlist[0].image_path != "");

        let process_scroll_event = true;

        if(is_img_type){
            process_scroll_event = false;
        }

        createDocsViewParentIfNeeded(doc_view_index, process_scroll_event);

        hideOtherDocsViewParent(doc_view_index);

        let tmp_buffer_canvas = null;

        if (document.getElementById('ZegoDocsViewCanvas' + doc_view_index)) {
            
            tmp_buffer_canvas = document.getElementById('ZegoDocsViewCanvas' + doc_view_index);

        } else {

            tmp_buffer_canvas = document.createElement("canvas");
            
            tmp_buffer_canvas.id = 'ZegoDocsViewCanvas' + doc_view_index;
            tmp_buffer_canvas.width = cur_parent_width_;

            if (view_list_[doc_view_index].file_info.document_type == ZegoDocsViewConstants.FileType.ZegoDocsViewFileTypePPT) {

                let rate_w = cur_parent_width_ / vlist[0].width;
                let rate_h = cur_parent_height_ / vlist[0].height;
                let cur_rate = Math.min(rate_w, rate_h);

                let draw_h = vlist[0].height * cur_rate;

                tmp_buffer_canvas.height = draw_h * view_list_[doc_view_index].file_info.file_list[0].page_list.length;

                log('page count', view_list_[doc_view_index].file_info.file_list[0].page_list.length)

            } else if (view_list_[doc_view_index].file_info.document_type == ZegoDocsViewConstants.FileType.ZegoDocsViewFileTypeIMG) {
                tmp_buffer_canvas.height = cur_parent_height_;

            } else if (view_list_[doc_view_index].file_info.document_type == ZegoDocsViewConstants.FileType.ZegoDocsViewFileTypePDF) {
                updateDocsViewParentLayout(doc_view_index, 0, 0, cur_parent_width_, cur_parent_height_);
                tmp_buffer_canvas.height = view_list_[doc_view_index].file_info.file_list[0].page_list.length * view_list_[doc_view_index].file_info.file_list[0].page_list[0].height * cur_rate_;
            }
            log('create ZegoDocsViewCanvas,', 'w', tmp_buffer_canvas.width, 'h', tmp_buffer_canvas.height)
        }

        let ctx = tmp_buffer_canvas.getContext("2d");

        // ctx.fillStyle = "#ff0000";
        // ctx.fillRect(0, 0, cur_parent_width_, tmp_buffer_canvas.height);

        let draw_task = []

        for (let i = 0; i < vlist.length; ++i) {

            if (vlist[i].image_data != "") {
                if (cur_draw_mode_ == PPT_RENDER_MODE) {
                    // ppt mode
                    log("ppt mode render")
                    let rate_w = cur_parent_width_ / vlist[i].width;
                    let rate_h = cur_parent_height_ / vlist[i].height;
                    //log('rate_w', rate_w, 'rate_h', rate_h)
                    let cur_rate = Math.min(rate_w, rate_h);

                    let draw_h = vlist[i].height * cur_rate;
                    let draw_w = vlist[i].width * cur_rate;

                    dst_x = (cur_parent_width_ - draw_w) / 2;

                    updateDocsViewParentLayout(doc_view_index, (cur_parent_width_ - draw_w) / 2, (cur_parent_height_ - draw_h) / 2, draw_w, draw_h);

                    //updateAddCanvasHeight(tmp_buffer_canvas, draw_h);

                    let task = drawImg(0, 0, 0, dst_y, vlist[i].width, vlist[i].height, draw_w, draw_h, vlist[i].image_data, tmp_buffer_canvas)

                    dst_y = dst_y + draw_h;

                    draw_task.push(task)

                } else {

                    log("pdf mode")

                    begin_x = 0

                    let dst_x = 0

                    // begin_y 为原实际大小值
                    begin_y = 0

                    // 图像宽高已按比例load时缩放过
                    let dst_w = vlist[i].width;

                    let dst_h = vlist[i].height;

                    let task = drawImg(begin_x, begin_y, dst_x, dst_y, vlist[i].width, vlist[i].height - begin_y, dst_w, dst_h, vlist[i].image_data, tmp_buffer_canvas)

                    dst_y = dst_y + dst_h
                    begin_y = 0;
                    draw_task.push(task)
                }
            } else if (vlist[i].image_path != "") {
                log("img mode")
                let task = drawImgByPath(vlist[i].image_path, tmp_buffer_canvas, begin_y)
                draw_task.push(task)
            }
        }

        Promise.all(draw_task).then(function (content_info) {

            log("draw task end.", content_info)
            if (content_info && content_info.length > 0 && content_info[0]) {
                updateDocsViewParentLayout(doc_view_index, content_info[0].x, content_info[0].y, content_info[0].w, content_info[0].h);
            }
            view_list_[doc_view_index].file_info.file_list[0].max_width = tmp_buffer_canvas.width;
            view_list_[doc_view_index].file_info.file_list[0].total_height = tmp_buffer_canvas.height;

            document.getElementById('docsview_parent' + doc_view_index).appendChild(tmp_buffer_canvas);

            cb();
        });
    }

    function loadNextPreLoadPage(doc_view_index) {

    }

    // 通过Y轴坐标，查询当前在哪个虚拟页
    function getVirtualPageNumberByYPos(page_list, start_pos_y) {
        let cur_height = 0;
        let last_virtual_page_num = 0;
        for (let i = 0; i < page_list.length; ++i) {
            for (let j = 0; j < page_list[i].virtual_page_list.length; ++j) {
                if (page_list[i].virtual_page_list[j].height + cur_height >= start_pos_y) {
                    log("getVirtualPageNumberByYPos: page list:", page_list, 'start_pos_y', start_pos_y, "->", page_list[i].virtual_page_list[j].virtual_page_number);
                    return page_list[i].virtual_page_list[j].virtual_page_number;
                } else {
                    cur_height = cur_height + page_list[i].virtual_page_list[j].height;

                    last_virtual_page_num = page_list[i].virtual_page_list[j].virtual_page_number;
                }
            }
        }
        log("getVirtualPageNumberByYPos: page list:", page_list, 'start_pos_y', start_pos_y, "->", "not found", 'return last_virtual_page_num', last_virtual_page_num);

        return last_virtual_page_num;
    }

    // 通过虚拟页码区间，获取虚拟页数组
    function getVirtualPageListByVirtualPageNum(page_list, start_virtual_page_num, end_virtual_page_num) {
        let ret = []
        for (let i = 0; i < page_list.length; ++i) {
            for (let j = 0; j < page_list[i].virtual_page_list.length; ++j) {
                if (page_list[i].virtual_page_list[j].virtual_page_number >= start_virtual_page_num && page_list[i].virtual_page_list[j].virtual_page_number <= end_virtual_page_num) {
                    ret.push(page_list[i].virtual_page_list[j].virtual_page_number);
                }
            }
        }
        log('getVirtualPageListByVirtualPageNum', 'page list', page_list, 'start_virtual_page_num', start_virtual_page_num, 'end_virtual_page_num', end_virtual_page_num, '->', ret);
        return ret;
    }

    // 通过页数组信息和起始y坐标，获取虚拟页
    function getVirtualPageNumByStartPosY(page_list, start_pos_y, canvas_height) {
        let need_draw_height = canvas_height;
        let end_pos_y = start_pos_y + need_draw_height;
        let start_virtual_page_number = getVirtualPageNumberByYPos(page_list, start_pos_y);
        if (start_virtual_page_number == -1) {
            start_virtual_page_number = 1;
        }
        let end_virtual_page_number = getVirtualPageNumberByYPos(page_list, end_pos_y);
        if (end_virtual_page_number == -1) {
            end_virtual_page_number = start_virtual_page_number;
        }
        let vpage_list = getVirtualPageListByVirtualPageNum(page_list, start_virtual_page_number, end_virtual_page_number);
        log('getVirtualPageNumByStartPosY:', 'page_list', page_list, 'start_pos_y', start_pos_y, 'canvas_height', canvas_height, '->', vpage_list)
        return vpage_list;
    }

    function getAllVirtualPageNum(page_list, page_count) {
        log('getAllVirtualPageNum', page_list)
        let ret = []
        for (let i = 0; i < page_list.length; ++i) {
            if (i >= page_count) {
                break;
            }
            for (let j = 0; j < page_list[i].virtual_page_list.length; ++j) {
                ret.push(page_list[i].virtual_page_list[j].virtual_page_number);
            }
        }
        log('getAllVirtualPageNum:', 'page list', page_list, '->', ret);
        return ret;
    }

    function getAllVirtualInPageRange(page_list, start_page_index, end_page_index) {
        log('getAllVirtualInPageRange', page_list, start_page_index, end_page_index)
        let ret = []
        for (let i = 0; i < page_list.length; ++i) {
            if (i >= start_page_index && i < end_page_index) {
                for (let j = 0; j < page_list[i].virtual_page_list.length; ++j) {
                    ret.push(page_list[i].virtual_page_list[j].virtual_page_number);
                }
            }
        }
        log('getAllVirtualPageNum:', 'page list', page_list, '->', ret);
        return ret;
    }

    function getRealPageStartYPos(view_item_info, real_page_index) {
        let cur_height = 0;
        if (!view_item_info || real_page_index < 0 || view_item_info.file_info.file_list[0].page_list.length <= real_page_index) {
            return cur_height;
        }

        for (let i = 0; i < view_item_info.file_info.file_list[0].page_list.length; ++i) {
            if (real_page_index == i) {
                log('getRealPageStartYPos', 'view_item_info', view_item_info, 'real_page_index', real_page_index, '-> YPos', cur_height)
                return cur_height;
            }
            cur_height = cur_height + view_item_info.file_info.file_list[0].page_list[i].height;
        }
        log('getRealPageStartYPos', 'view_item_info', view_item_info, 'real_page_index', real_page_index, '-> YPos not found', cur_height)
        return cur_height;
    }

    // 获取实际页的所有虚拟页码信息，得到虚拟页页码数组
    function getVirtualPageList(view_item_info, real_page_index) {
        let ret = [];
        if (!view_item_info || real_page_index < 0 || view_item_info.file_info.file_list[0].page_list.length <= real_page_index) {
            return ret;
        }
        for (let i = 0; i < view_item_info.file_info.file_list[0].page_list[real_page_index].virtual_page_list.length; ++i) {
            ret.push(view_item_info.file_info.file_list[0].page_list[real_page_index].virtual_page_list[i].virtual_page_number)
        }
        log('getVirtualPageList', 'view_item_info', view_item_info, 'real_page_index', real_page_index, '->', ret)
        return ret;
    }

    // 通过实际页获取到所有虚拟页信息数组
    this.getImageByPage = function (doc_view_index, real_page_index, rate, call_back) {
        let vpage_list = getVirtualPageList(view_list_[doc_view_index], real_page_index)
        if (vpage_list.length == 0) {
            call_back([]);
            log('getImageByPage', 'not found')
            return;
        }
        log('getImageByPage', 'real_page_index', real_page_index, 'rate', rate)
        this.startGetImageByVirtualPageList(view_list_[doc_view_index].file_id, vpage_list, rate, call_back)
    }

    // 启动函数，通过虚拟页码数组，获取虚拟页图像信息数组
    this.startGetImageByVirtualPageList = function (file_id, virtual_page_list, rate, call_back) {
        log("startGetImageByVirtualPageList: begin ,", virtual_page_list, 'virtual_page_img_info_cache_', virtual_page_img_info_cache_)
        let ret_virtual_page_list = []
        for (let i = 0; i < virtual_page_list.length;) {
            if (virtual_page_img_info_cache_.hasOwnProperty(virtual_page_list[i])) {
                log('got cache .', i, virtual_page_img_info_cache_[virtual_page_list[i]])
                ret_virtual_page_list.push(virtual_page_img_info_cache_[virtual_page_list[i]])
                virtual_page_list.splice(i, 1)
            } else {
                i++;
            }
        }
        log('startGetImageByVirtualPageList: fetch from sdk', 'file_id', file_id, 'virtual_page_list', virtual_page_list, 'rate', rate)
        this.getImageByVirtualPageList(ret_virtual_page_list, file_id, virtual_page_list, rate, call_back);
    }

    function sortVirtualPageListRule(a, b) {
        return a.virtual_page_number - b.virtual_page_number;
    }

    // 通过虚拟页码数组，获取虚拟页图像信息数组
    this.getImageByVirtualPageList = function (ret_virtual_page_list, file_id, virtual_page_list, rate, call_back) {
        if (virtual_page_list.length <= 0) {

            log('getImageByVirtualPageList', 'got all virtual page list', ret_virtual_page_list)

            ret_virtual_page_list.sort(sortVirtualPageListRule);
            log("sort v page list", ret_virtual_page_list)
            call_back(ret_virtual_page_list)
            return;
        }

        zego_docs_.registerEventHandler("onDocsGetPDFPageImage", (function (fid, vlist, r, ret_list, cb, result) {
            for (let i = 0; i < vlist.length; ++i) {
                if (vlist[i] == result.virtual_page_number) {
                    vlist.splice(i, 1)
                    break;
                }
            }

            virtual_page_img_info_cache_[result.virtual_page_number] = result;

            let have_got = false;
            for (let i = 0; i < ret_list.length; ++i) {
                if (ret_list[i].virtual_page_number == result.virtual_page_number) {
                    ret_list[i] = result;
                    log("haved got it ,update it");
                    have_got = true;
                }
            }
            if (!have_got) {
                ret_list.push(result)
            }
            this.getImageByVirtualPageList(ret_list, fid, vlist, r, cb)

        }).bind(this, file_id, virtual_page_list, rate, ret_virtual_page_list, call_back))

        this.docsGetPageImage({
            file_id: file_id,
            virtual_page_number: virtual_page_list[0],
            rate: rate,
            rotation: 0
        })
    }

    this.docsViewOnEvent = function (event_name, callback) {
        if (event_name) {
            docsview_events_[event_name] = callback
        }
    }

    /**
     * 设置鉴权token
     * @param {string} token 字符串, token 由开发者服务端生成
     */
    this.docsViewSetToken = function({token})
    {
        this.docsSetToken(token);
    }

    /**
     * 初始化sdk
     * @param {object} config 
     * @param {boolean} config.is_test_env
     * @param {number} config.app_id app id ，需要向zego申请获取
     * @param {(number|Array)} config.app_sign 十六进制数组, app sign 需要向zego申请获取
     * @param {string} config.data_folder 数据目录
     * @param {string} config.cache_folder 缓存目录
     */
    this.docsViewInit = function ({
        app_id,
        app_sign,
        data_folder,
        cache_folder,
        is_test_env
    }) {

        this_obj_ = this;

        this.docsSetTestEnv({
            is_test_env: is_test_env
        })

        this.docsSetCacheDirectory({
            directory: cache_folder
        })

        this.docsSetLogFolder({
            log_path: data_folder,
            log_level: 3
        })

        let seq = this.docsInit({
            app_id: app_id,
            app_sign: app_sign,
            app_data_folder: data_folder
        })

        zego_docs_.registerEventHandler("onDocsInit", function (result) {
            log('onDocsInit', result)
            if (docsview_events_.hasOwnProperty("onDocsViewInit")) {
                docsview_events_.onDocsViewInit({
                    seq: result.seq,
                    error_code: publicErrorCode.get(result.error_code)
                })
            }
        })

        zego_docs_.registerEventHandler("onDocsTokenWillExpired", function (result) {
            log('onDocsTokenWillExpired', result)
            if (docsview_events_.hasOwnProperty("onDocsViewTokenWillExpired")) {
                docsview_events_.onDocsViewTokenWillExpired({
                    remain_time: result.remain_time
                })
            }
        })

        zego_docs_.registerEventHandler("onDocsUploading", function (result) {
            console.log("onDocsUploading", result)
            if (result.error_code == 0) {
                if (docsview_events_.hasOwnProperty("onDocsViewUploadProgress")) {
                    docsview_events_.onDocsViewUploadProgress({
                        seq: result.seq,
                        percent: result.rate
                    })
                }
            } else {
                if (docsview_events_.hasOwnProperty("onDocsViewUploadFinished")) {
                    docsview_events_.onDocsViewUploadFinished({
                        seq: result.seq,
                        error_code: publicErrorCode.get(result.error_code),
                        file_id: result.file_id
                    })
                }
            }
        })

        zego_docs_.registerEventHandler("onDocsConvertStatus", function (result) {
            //console.log("onDocsConvertStatus", result)
            // convert end
            if (result.convert_status == 16 && docsview_events_.hasOwnProperty("onDocsViewUploadFinished")) {
                docsview_events_.onDocsViewUploadFinished({
                    seq: result.seq,
                    error_code: publicErrorCode.get(result.error_code),
                    file_id: result.file_id
                })
            }
        })

        zego_docs_.registerEventHandler("onDocsCancelUpload", function (result) {
            //console.log("onDocsCancelUpload", result)
            if (docsview_events_.hasOwnProperty("onDocsViewCancelUpload")) {
                docsview_events_.onDocsViewCancelUpload({
                    seq: result.seq,
                    error_code: publicErrorCode.get(result.error_code)
                })
            }
        })

        zego_docs_.registerEventHandler("onDocsQueryFileInfo", function (result) {
            //console.log("onDocsQueryFileInfo", result)
        })

        zego_docs_.registerEventHandler("onDocsDownloadCache", function (result) {
            //console.log("onDocsDownloadCache", result)
        })

        zego_docs_.registerEventHandler("onDocsCancelCache", function (result) {
            //console.log("onDocsCancelCache", result)
        })

        zego_docs_.registerEventHandler("onDocsDownloading", function (result) {
            //console.log("onDocsDownloading", result)
        })

        zego_docs_.registerEventHandler("onDocsLoadPdf", (function (result) {
            //console.log("publicErrorCode", publicErrorCode.get(-999999), publicErrorCode.get(1), publicErrorCode.get(-102));
            log("onDocsLoadPdf", result);

            for (let i = 0; i < result.file_list.length; ++i) {

                let file_width = 0;
                let file_height = 0;

                for (let j = 0; j < result.file_list[i].page_list.length; ++j) {

                    if (result.file_list[i].page_list[j].width > file_width) {
                        file_width = result.file_list[i].page_list[j].width;
                    }
                    file_height = file_height + result.file_list[i].page_list[j].height
                }

                result.file_list[i].max_width = file_width;
                result.file_list[i].total_height = file_height;
                result.file_list[i].page_count = result.file_list[i].page_list.length;

                for (let k = 0; k < view_list_.length; ++k) {
                    if (view_list_[k].file_id == result.user_data) {

                        // save result info
                        view_list_[k].file_info = result;
                        let rate = getParentClientWidth(k) / file_width;
                        cur_parent_width_ = getParentClientWidth(k);
                        cur_parent_height_ = getParentClientHeight(k);

                        cur_rate_ = rate;
                        log('cur_parent_width_', cur_parent_width_, 'cur_parent_height_', cur_parent_height_, 'cur_rate_', cur_rate_)

                        cur_file_type_ = result.document_type;

                        // ppt type
                        if (result.document_type == ZegoDocsViewConstants.FileType.ZegoDocsViewFileTypePPT) {
                            cur_draw_mode_ = PPT_RENDER_MODE;
                        } else {
                            cur_draw_mode_ = 0;
                        }
						if(result.document_type != ZegoDocsViewConstants.FileType.ZegoDocsViewFileTypeDynamicPPTH5)
						{
							execScrollFileAndDraw(k, view_list_[k].file_info.file_list[0].page_list, 0, cur_parent_height_, function(){

								if (docsview_events_.hasOwnProperty("onDocsViewLoad")) {
									docsview_events_.onDocsViewLoad({
										seq: result.seq,
										error_code: publicErrorCode.get(result.error_code),
										file_id: result.user_data,
										page_count: result.file_list.length,
										file_type: result.document_type
									});
								}
							});							
						}

                        break;
                    }
                }


            }
        }).bind(this))

        zego_docs_.registerEventHandler("onDocsCachExist", function (result) {
            //console.log("onDocsCachExist", result)
        })

        zego_docs_.registerEventHandler("onDocsFileSaveAs", function (result) {
            //console.log("onDocsFileSaveAs", result)
        })

        /*zego_docs_.registerEventHandler("onDocsPreLoadInfo", function (result) {
            //console.log("onDocsPreLoadInfo", result)
        })*/

        return seq;
    }

    function docsViewExist(file_id) {
        for (let k = 0; k < view_list_.length; ++k) {
            if (view_list_[k].file_id == file_id) {
                return k;
            }
        }
        return -1;
    }
    /**
     * 创建文件view
     * @param {object} config 
     * @param {string} config.file_id 文件id
     * @param {string} config.auth_key 权限key
     * @param {string} config.parent 父容器div的id
     * @return {number} 创建的view 索引 doc_view_index
     */
    this.docsViewCreate = function ({
        file_id,
        auth_key,
        parent
    }) {
        let index = docsViewExist(file_id);
        if (index >= 0) {
            view_list_[index] = {}
        }
        let view_obj = {
            file_id: file_id,
            auth_key: auth_key,
            parent: parent
        }
        view_list_.push(view_obj)
        return view_list_.length - 1
    }

    /**
     * 上传文件
     * @param {object} config 
     * @param {string} config.file_path 文件本地路径
     * @param {string} config.password  文件密码
     * @return {number} 返回序列号
     */
    this.docsViewUploadFile = function ({
        file_path,
        password,
        render_type
    }) {
        return this.docsUpload({
            file_path: file_path,
            pwd: password,
            render_type: render_type
        })
    }

    /**
     * 上传自定义H5文件
     * @param {object} config 
     * @param {string} config.file_path 文件本地路径
     * @param {number} config.width  文件宽
     * @param {number} config.height  文件高
     * @param {number} config.pageCount  文件页数
     * @param {(string|Array)} config.thumbnails  缩略图数组
     * @return {number} 返回序列号
     */
     this.docsViewUploadH5File = function ({
        file_path,
        width,
        height,
        pageCount,
        thumbnails
    }) {
        return this.docsUploadH5({
            file_path: file_path,
            width: width,
            height: height,
            pageCount: pageCount,
            thumbnails: thumbnails

        })
    }








    /**
     * 取消上传文件
     * @param {object} config 
     * @param {number} config.seq 序列号
     * @return {number} 返回序列号
     */
    this.docsViewCancelUploadFile = function ({
        seq
    }) {
        return this.docsCancelUpload({
            seq: seq
        })
    }

    this.docsViewFileSaveAs = function ({
        file_id,
        saved_path
    }) {
        return this.docsDownloadFile({
            file_id: file_id,
            file_path: saved_path,
            creator_id: ""
        })
    }
    /**
     * 加载文件
     * @param {object} config 
     * @param {number} config.doc_view_index 文件索引
     * @return {number} 返回序列号
     */
    this.docsViewLoadFile = function ({
        doc_view_index
    }) {
        if (doc_view_index >= view_list_.length) {
            return -1
        }
        virtual_page_img_info_cache_ = {}
        log("clear cache", virtual_page_img_info_cache_)
        return this.docsLoad({
            file_id: view_list_[doc_view_index].file_id,
            auth_key: view_list_[doc_view_index].auth_key
        });
    }

    /**
     * 卸载指定文件
     * @param {object} config
     * @param {number} config.doc_view_index 文件索引
     * @return {number} 返回序列号
     */
    this.docsViewUnLoadFile = function ({
        doc_view_index
    }) {
        if (doc_view_index >= view_list_.length) {
            return -1
        }
        this.docsUnload({
            file_id: view_list_[doc_view_index].file_id
        })
    }

    this.docsViewFileCached = function ({
        file_id
    }) {
        return this.docsDownLoadCache({
            file_id: file_id,
            creator_id: ""
        })
    }

    this.docsViewCacheExist = function ({
        file_id
    }) {
        return this.docsCacheExist({
            file_id: file_id,
            creator_id: ""
        })
    }

    this.docsViewFileCancelCached = function ({
        file_id
    }) {
        return this.docsCancelDownloadCache({
            file_id: file_id
        })
    }
    /**
     * 销毁文件view
     * @param {object} config
     * @param {number} config.doc_view_index 文件索引
     * @return {number} 返回序列号
     */
    this.docsViewDestroy = function ({
        doc_view_index
    }) {
        if (doc_view_index >= view_list_.length) {
            return -1
        }
        view_list_[doc_view_index] = {}
    }
    /**
     * 获取指定文件页数
     * @param {object} config
     * @param {number} config.doc_view_index 文件索引
     * @return {number} 返回序列号
     */
    this.docsViewGetPageCount = function ({
        doc_view_index
    }) {
        if (doc_view_index >= view_list_.length) {
            return 0
        }
        log(view_list_[doc_view_index])
        if (view_list_[doc_view_index].hasOwnProperty('file_info') && view_list_[doc_view_index].file_info.file_list[0].hasOwnProperty('page_list')) {
            return view_list_[doc_view_index].file_info.file_list[0].page_list.length;
        } else {
            return 0;
        }
    }

    // 
    this.docsViewClearCache = function ({}) {

    }
    /**
     * 获取当前页码
     * @param {object} config
     * @param {number} config.doc_view_index 文件索引
     * @return {number} 返回序列号
     */
    this.docsViewGetCurrentPage = function ({
        doc_view_index
    }) {
        return current_page_number_;
    }
    /**
     * 跳转页码
     * @param {object} config
     * @param {number} config.doc_view_index 文件索引
     * @param {number} config.page_num 页码
     * @return {boolean} true - 成功， false - 失败
     */
    this.docsViewFlipPage = function ({
        doc_view_index,
        page_num
    }) {
        if (doc_view_index >= view_list_.length) {
            return false
        }
        current_page_number_ = page_num;
        log("docsViewFlipPage", 'doc parent index', doc_view_index, 'page_num', page_num)
        log(view_list_[doc_view_index])
        if (view_list_[doc_view_index].file_info.document_type == ZegoDocsViewConstants.FileType.ZegoDocsViewFileTypePPT) {
            if (document.getElementById('docsview_parent' + doc_view_index) && document.getElementById('docsview_parent' + doc_view_index)['per_page_height']) {
                document.getElementById('docsview_parent' + doc_view_index).scrollTop = current_page_number_ * document.getElementById('docsview_parent' + doc_view_index)['per_page_height'];
                return true;
            }
            return false;
        } else if (view_list_[doc_view_index].file_info.document_type == ZegoDocsViewConstants.FileType.ZegoDocsViewFileTypeIMG) {
            return false;
        } else if (view_list_[doc_view_index].file_info.document_type == ZegoDocsViewConstants.FileType.ZegoDocsViewFileTypePDF) {

            let start_y_pos = getRealPageStartYPos(view_list_[doc_view_index], page_num);
            if (document.getElementById('docsview_parent' + doc_view_index)) {
                document.getElementById('docsview_parent' + doc_view_index).scrollTop = start_y_pos * cur_rate_;
                log("pdf scroll", start_y_pos * cur_rate_)
                return true;
            }

            // if (document.getElementById('ZegoDocsViewCanvas')) {
            //     log('change scroll to:', start_y_pos * cur_rate_)
            //     document.getElementById(view_list_[doc_view_index].parent).scrollTop = start_y_pos * cur_rate_;
            // }
            return false;
        }
    }

    // TODO:
    this.docsViewFileCancelSaveAs = function ({
        file_id,
        seq
    }) {

    }

    function getFirstVirtualPageBeginDrawYPos(start_pos_y, page_list) {
        let cur_height = 0;
        for (let i = 0; i < page_list.length; ++i) {
            for (let j = 0; j < page_list[i].virtual_page_list.length; ++j) {
                if (page_list[i].virtual_page_list[j].height + cur_height >= start_pos_y) {
                    log("getFirstVirtualPageBeginDrawYPos:", 'start_pos_y', start_pos_y, 'page_list', page_list, '--->', start_pos_y - cur_height)
                    return start_pos_y - cur_height;
                } else {
                    cur_height = cur_height + page_list[i].virtual_page_list[j].height;
                }
            }
        }
        return 0;
    }

    function getCurrentPageFromYPos(start_pos_y, page_list, canvas_height) {
        let cur_height = 0;
        let mid_line_y_pos = start_pos_y + canvas_height / 2;
        for (let i = 0; i < page_list.length; ++i) {
            for (let j = 0; j < page_list[i].virtual_page_list.length; ++j) {
                cur_height = cur_height + page_list[i].virtual_page_list[j].height;
            }
            if (cur_height >= mid_line_y_pos) {
                log("getCurrentPageFromYPos", 'start_pos_y', start_pos_y, 'page_list', page_list, 'canvas_height', canvas_height, '->', i);
                return i;
            }
        }

        log("getCurrentPageFromYPos", 'start_pos_y', start_pos_y, 'page_list', page_list, 'canvas_height', canvas_height, '-> not found', 0);
        return 0;
    }

    // 通过Y轴坐标，查询当前在哪个页
    function getPageNumberByYPos(page_list, start_pos_y) {
        let cur_height = 0;
        let last_page = 0;
        for (let i = 0; i < page_list.length; ++i) {
            for (let j = 0; j < page_list[i].virtual_page_list.length; ++j) {
                if ((page_list[i].virtual_page_list[j].height + cur_height) * cur_rate_ >= start_pos_y) {
                    return i;
                } else {
                    cur_height = cur_height + page_list[i].virtual_page_list[j].height;
                    last_page = i;
                }
            }
        }
        log("getPageNumberByYPos: page list:", page_list, 'start_pos_y', start_pos_y, "->", "not found", 'return page', last_page);

        return last_page;
    }

    function getHeightByPage(page_list, page_index) {
        let cur_height = 0;
        for (let i = 0; i < page_list.length; ++i) {
            if (i >= page_index) {
                break;
            }
            for (let j = 0; j < page_list[i].virtual_page_list.length; ++j) {
                cur_height = cur_height + page_list[i].virtual_page_list[j].height;
            }
        }

        return cur_height;
    }

    this.loadSomePageImgToCanvas = function (doc_view_index, page_count, cb) {

        let vpage_list = getAllVirtualPageNum(view_list_[doc_view_index].file_info.file_list[0].page_list, page_count);

        let begin_draw_y_pos = 0;
        this.startGetImageByVirtualPageList(view_list_[doc_view_index].file_id, vpage_list, cur_rate_, (function (d_index, y_pos, page_img_list) {
            drawImgByVPageList(0, y_pos, d_index, page_img_list, function () {
                if (document.getElementById('docsview_parent' + doc_view_index)) {
                    document.getElementById('docsview_parent' + doc_view_index)['loaded_page_count'] = page_count;
                }
                cb();
            });
        }).bind(this, doc_view_index, begin_draw_y_pos));
    }

    function execScrollFileAndDraw(doc_view_index, page_list, scroll_top, cur_parent_height, cb){

        let cur_pos_page_index = getPageNumberByYPos(page_list, scroll_top); //

        let end_pos_page_index = getPageNumberByYPos(page_list, scroll_top + cur_parent_height); //

        end_pos_page_index = end_pos_page_index + 3;

        let vpage_list = getAllVirtualInPageRange(page_list, cur_pos_page_index, end_pos_page_index);

        let begin_draw_y_pos = getHeightByPage(page_list, cur_pos_page_index) * cur_rate_; 

        log("begin_draw_y_pos", cur_pos_page_index, end_pos_page_index, begin_draw_y_pos, cur_parent_height);

        this_obj_.startGetImageByVirtualPageList(view_list_[doc_view_index].file_id, vpage_list, cur_rate_, (function (d_index, y_pos, page_img_list) {
            drawImgByVPageList(0, y_pos, d_index, page_img_list, function () {
                cb();
            });
        }).bind(this_obj_, doc_view_index, begin_draw_y_pos));
    }

    /**
     * 滚动文件
     * @param {object} config
     * @param {number} config.doc_view_index 文件索引
     * @param {number} config.vertical_percent 垂直方向滚动百分比 范围 0 ～ 1
     * @return {boolean} true - 成功， false - 失败
     */
    this.docsViewScroll = function ({
        doc_view_index,
        vertical_percent
    }) {
        
        if (doc_view_index >= view_list_.length) {
            return false;
        }

        if (cur_file_type_ == ZegoDocsViewConstants.FileType.ZegoDocsViewFileTypePPT) {
            return false;
        } else if (cur_file_type_ == ZegoDocsViewConstants.FileType.ZegoDocsViewFileTypeIMG) {
            if (cur_draw_mode_ == PDF_RENDER_MODE) {
                if (document.getElementById('docsview_parent' + doc_view_index)) {
                    document.getElementById('docsview_parent' + doc_view_index).scrollTop = vertical_percent * (document.getElementById('ZegoDocsViewCanvas' + doc_view_index).height - cur_parent_height_);
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else if (cur_file_type_ == ZegoDocsViewConstants.FileType.ZegoDocsViewFileTypePDF) {


            if (document.getElementById('docsview_parent' + doc_view_index)) {
                document.getElementById('docsview_parent' + doc_view_index).scrollTop = vertical_percent * (document.getElementById('ZegoDocsViewCanvas' + doc_view_index).height - cur_parent_height_);
                return true;
            } 

            // let docsview_parent = document.getElementById('docsview_parent' + doc_view_index)

            // if(docsview_parent){

            //     execScrollFileAndDraw(doc_view_index, view_list_[doc_view_index].file_info.file_list[0].page_list,  docsview_parent.scrollTop, cur_parent_height_, function(){

            //     });
            // }

            return true;
        }
        if (docsview_events_.hasOwnProperty("onDocsViewScrollChanged")) {
            docsview_events_.onDocsViewScrollChanged({
                doc_view_index: doc_view_index,
                vertical_percent: vertical_percent
            })
        }
    }
    /**
     * 获取文件内容大小
     * @return {object} {width, height}
     */
    this.docsViewGetContentSize = function ({
        doc_view_index
    }) {
        let content_size = {
            width: 0,
            height: 0
        }
        if (doc_view_index >= view_list_.length) {
            return content_size;
        }
        content_size.width = view_list_[doc_view_index].file_info.file_list[0].max_width;
        content_size.height = view_list_[doc_view_index].file_info.file_list[0].total_height;
        return content_size;
    }

    // TODO:
    this.docsViewGetPPTNotes = function () {

    }

    // docs api
    this.docsSetTestConfig = function ({
        config
    }) {
        return zego_docs_.zego_docs_set_test_config(config);
    }

    this.docsSetTestEnv = function ({
        is_test_env
    }) {
        return zego_docs_.zego_docs_set_test_env(is_test_env);
    }
    this.docsSetLogFolder = function ({
        log_path,
        log_level
    }) {
        return zego_docs_.zego_docs_set_log_folder(log_path, log_level);
    }
    this.docsSetExternVersion = function ({
        room_version,
        engine_version
    }) {
        return zego_docs_.zego_docs_set_extern_version(room_version, engine_version);
    }
    this.docsSetDeviceId = function ({
        device_id
    }) {
        return zego_docs_.zego_docs_set_device_id(device_id);
    }
    this.docsSetCertificateUrl = function ({
        cert_url
    }) {
        return zego_docs_.zego_docs_set_certificate_url(cert_url);
    }
    this.docsSetCustomConfig = function ({
        key,
        value
    }) {
        return zego_docs_.zego_docs_set_custom_config(key, value);
    }
    this.docsGetCustomConfig = function ({
        key
    }) {
        return zego_docs_.zego_docs_get_custom_config(key);
    }
    this.docsSetToken = function(token)
    {
        return zego_docs_.zego_docs_set_token(token);
    }
    this.docsInit = function ({
        app_id,
        app_sign,
        app_data_folder
    }) {
        return zego_docs_.zego_docs_init(app_id, app_sign, app_data_folder);
    }
    this.docsInitWithToken = function ({
        token,
        app_data_folder
    }) {
        return zego_docs_.zego_docs_init_with_token(token, app_data_folder);
    }
    this.docsUinit = function () {
        return zego_docs_.zego_docs_uninit();
    }

    this.docsSetSplitSize = function ({
        width,
        height
    }) {
        return zego_docs_.zego_docs_set_split_size(width, height);
    }

    this.docsUpload = function ({
        file_path,
        pwd,
        render_type
    }) {
        return zego_docs_.zego_docs_upload(file_path, pwd, render_type);
    }

    this.docsUploadH5 = function ({
        file_path,
        width,
        height,
        pageCount,
        thumbnails
    }) {
        return zego_docs_.zego_docs_upload_h5_file(file_path, width, height, pageCount, thumbnails);
    }

    this.docsCancelUpload = function ({
        seq
    }) {
        return zego_docs_.zego_docs_cancel_upload(seq);
    }

    this.docsSetCacheDirectory = function ({
        directory
    }) {
        return zego_docs_.zego_docs_set_cache_directory(directory);
    }

    this.docsLoad = function ({
        file_id,
        auth_key
    }) {
        return zego_docs_.zego_docs_load(file_id, auth_key, file_id);
    }

    this.docsGetPageImage = function ({
        file_id,
        virtual_page_number,
        rate,
        rotation
    }) {
        return zego_docs_.zego_docs_get_page_image(file_id, virtual_page_number, rate, rotation, "");
    }

    this.docsUnload = function ({
        file_id
    }) {
        return zego_docs_.zego_docs_unload(file_id);
    }

    this.docsQueryFileInfo = function ({
        file_id
    }) {
        return zego_docs_.zego_docs_query_file_info(file_id);
    }

    this.docsSetUserId = function ({
        user_id
    }) {
        return zego_docs_.zego_docs_set_user_id(user_id);
    }

    this.docsSetDisplayType = function ({
        type
    }) {
        return zego_docs_.zego_docs_set_display_type(type);
    }

    this.docsDownloadFile = function ({
        file_id,
        file_path,
        creator_id
    }) {
        return zego_docs_.zego_docs_download_file(file_id, file_path, creator_id);
    }

    this.docsCancelDownloadCache = function ({
        file_id
    }) {
        return zego_docs_.zego_docs_cancel_download_cache(file_id)
    }

    this.docsCacheExist = function ({
        file_id,
        creator_id
    }) {
        return zego_docs_.zego_docs_cache_exist(file_id, creator_id)
    }

    this.onEventHandler = function (event_name, cb) {
        return zego_docs_.registerEventHandler(event_name, cb)
    }

    this.docsDownLoadCache = function ({
        file_id,
        creator_id
    }) {
        return zego_docs_.zego_docs_download_cache(file_id, creator_id)
    }
}

/**
 * 初始化回调
 * @callback onDocsViewInit
 * @param {object} result - 结果数据对象
 * @param {number} result.seq - 序列号
 * @param {number} result.error_code - 错误码
 */

/**
 * 加载文件回调
 * @callback onDocsViewLoad
 * @param {object} result - 结果数据对象
 * @param {number} result.seq - 序列号
 * @param {number} result.error_code - 错误码
 * @param {string} result.file_id - 文件id
 * @param {number} result.page_count - 文件页数
 * @param {number} result.file_type - 文件类型
 */


/**
 * 上传文件进度回调
 * @callback onDocsViewUploadProgress
 * @param {object} result - 结果数据对象
 * @param {number} result.seq - 序列号
 * @param {number} result.percent - 上传百分比
 */

/**
 * 上传文件结束回调
 * @callback onDocsViewInit
 * @param {object} result - 结果数据对象
 * @param {number} result.seq - 序列号
 * @param {number} result.error_code - 错误码
 * @param {number} result.file_id - 文件id
 */

/**
 * 取消上传回调
 * @callback onDocsViewCancelUpload
 * @param {object} result - 结果数据对象
 * @param {number} result.seq - 序列号
 * @param {number} result.error_code - 错误码
 */


/**
 * 滚动位置变化回调
 * @callback onDocsViewScrollChanged
 * @param {object} result - 结果数据对象
 * @param {number} result.doc_view_index - docsViewCreate 创建返回的view索引
 * @param {number} result.vertical_percent - 垂直滚动百分比
 */




module.exports = exports = ZegoDocsView
