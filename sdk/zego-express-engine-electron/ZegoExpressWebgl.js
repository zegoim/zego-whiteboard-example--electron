function Canvas2dRender(){
    this.canvas = null             //view
    this.localCanvasConfig={}      //the local rendering configuration
    this.flipMode = 0
    this.imageData = null
    this.render = null             //draw context
    this.viewMode = 0
    this.w = void 0
    this.h = void 0

    //save view port data
    this.prevViewPort = { w: 0, h: 0, canvasW: 0, canvasH: 0 }

    //current view port
    this.CurrentViewPort = { start_x: 0, start_y: 0, dataWidth: 0, dataHeight: 0 }
}

Canvas2dRender.prototype={
    setViewMode(mode)
    {
        this.viewMode = mode;
    },

    setCurrentViewPort(start_x, start_y, dataWidth, dataHeight)
    {
        this.CurrentViewPort.start_x = start_x
        this.CurrentViewPort.start_y = start_y
        this.CurrentViewPort.dataWidth = dataWidth
        this.CurrentViewPort.dataHeight = dataHeight
    },

    bindCanvas(canvas) {
        this.canvas = canvas;
        //create canvas context
        this.render = this.canvas.getContext('2d');
        return null != this.render

    },
    unbindCanvas() {
        this.observer && this.observer.unobserve && this.observer.disconnect();
        this.render = null;
        this.canvas = null;
    },

    calcViewPortMode1() {
        const { w, h, prevViewPort } = this

        if (w && h && this.canvas && this.render) {
            const rect = this.canvas.getBoundingClientRect()
            const canvasH = rect.height
            const canvasW = rect.width
            if (!(canvasW && canvasH)) return
            const isSame = w === prevViewPort.w
                && h === prevViewPort.h
                && canvasW === prevViewPort.canvasW
                && canvasH === prevViewPort.canvasH
            
            let newW
            let newH
            const ratioW = w / canvasW
            const ratioH = h / canvasH
            
            if (this.viewMode === 1) {
                if (ratioW > ratioH) {
                    newH = canvasH
                    newW = w * canvasH / h
                } else {
                    newW = canvasW
                    newH = h * canvasW / w
                }
                const dpr = window.devicePixelRatio;
                var offsetX = -(newW - canvasW)/2
                var offsetY = -(newH - canvasH)/2
                if (dpr !== 1) {                    
                    newW = newW*dpr
                    newH = newH*dpr
                    offsetX = offsetX*dpr
                    offsetY = offsetY*dpr
                }
                Object.assign(prevViewPort, { w, h, canvasW, canvasH, offsetX, offsetY, newW, newH })
    
                if (offsetX, offsetY, newW, newH) {
                    var start_x = offsetX
                    var start_y = offsetY
                    var dataWidth = newW
                    var dataHeight = newH

                    this.setCurrentViewPort(start_x, start_y, dataWidth, dataHeight)
                }
            } else {
                const dpr = window.devicePixelRatio
                var realCanvasH = canvasH
                var realCanvasW = canvasW
                if (dpr !== 1) {                    
                    realCanvasW = realCanvasW*dpr
                    realCanvasH = realCanvasH*dpr
                }
                Object.assign(prevViewPort, { w, h, realCanvasW, realCanvasH, offsetX: 0, offsetY: 0, newW: realCanvasW, newH: realCanvasH })
                if (realCanvasW, realCanvasH) {
                    var start_x = 0
                    var start_y = 0
                    var dataWidth = realCanvasW
                    var dataHeight = realCanvasH
                    this.setCurrentViewPort(start_x, start_y, dataWidth, dataHeight)
                }
            }
        }
    },

    calcViewPortMode2(canvas_w, canvas_h)
    {
        const {w, h} = this;
        let dataWidth = 0, dataHeight = 0
        if (w < canvas_w && h < canvas_h) {
            const scale_w = (canvas_w - w) / canvas_w * 1.0
            const scale_h = (canvas_h - h) / canvas_h * 1.0
            if (scale_w < scale_h) {
                dataWidth = canvas_w
                dataHeight = (canvas_w - w) / w * 1.0 * h + h
                var start_x = 0
                var start_Y = (canvas_h - dataHeight) / 2.0
                this.setCurrentViewPort(start_x, start_Y, dataWidth, dataHeight);
            } else {
                dataHeight = canvas_h
                dataWidth = (canvas_h - h) / h * 1.0 * w + w
                var start_x = canvas_w / 2.0 - dataWidth / 2.0
                var start_Y = 0
                this.setCurrentViewPort(start_x, start_Y, dataWidth, dataHeight);
            }
        } else {
            const scale_w = (w - canvas_w) / w * 1.0
            const scale_h = (h - canvas_h) / h * 1.0
            if (scale_w < scale_h) {
                dataHeight = canvas_h
                dataWidth = w - (h - canvas_h) / h * 1.0 * w
                var start_x = canvas_w / 2.0 - dataWidth / 2.0
                var start_Y = 0
                this.setCurrentViewPort(start_x, start_Y, dataWidth, dataHeight);
            }
            else {
                dataWidth = canvas_w
                dataHeight = h - (w - canvas_w) / w * 1.0 * h
                var start_x = 0
                var start_Y = canvas_h / 2.0 - dataHeight / 2.0
                this.setCurrentViewPort(start_x, start_Y, dataWidth, dataHeight);
            }
        }
    },

    setFlipMode(flipMode){
        if(this.flipMode === flipMode){
            return;
        }
        this.flipMode = flipMode;
    },

    updataSize(canvas) {
        const dpr = window.devicePixelRatio;
		
		const {width, height} = canvas.getBoundingClientRect();
        const displayWidth  = Math.round(width * dpr);
        const displayHeight = Math.round(height * dpr);

        // Check if the canvas is not the same size.
        const needResize = canvas.width  != displayWidth ||
        canvas.height != displayHeight;

        if (needResize) {
            // Make the canvas the same size
            canvas.width  = displayWidth;
            canvas.height = displayHeight;
        }
    },

    updateCanvas(config = {
        width: 0,
        height: 0,
        rotation: 0,
        mirrorView: false,
        clientWidth: 0,
        clientHeight: 0,
        contentWidth,
        contentHeight,
    }, isUseLocal = true) {
        // check if display options changed
        /*if (isUseLocal && IsEqual(config, this.localCanvasConfig)) {
            return;
        }*/
        this.localCanvasConfig = config;

        let transformItems = [];
        transformItems.push(`rotateZ(${config.rotation}deg)`);
        
        // check for mirror
        if (config.mirrorView) {
            transformItems.push('rotateY(180deg)');
        }
        if (transformItems.length > 0) {
            let transform = `${transformItems.join(' ')}`;
            this.canvas.style.transform = transform;
        }
    },
    drawFrame(imageData = { databuffer, width, height}) {
        this.w = imageData.width
        this.h = imageData.height

        //Adapt to the width and height of the dpr canvas
        this.updataSize(this.canvas)

        //Because the data is flipped as it passes, it needs to be corrected
        let mirror = false;
        let rotation = 180
        if(this.flipMode ==0)
        {
            mirror = true
        }
        else{
            //custom data
        }

        let contentWidth = imageData.width      
        let contentHeight = imageData.height
        this.updateCanvas({
            width: this.canvas.width, 
            height: this.canvas.height, 
            rotation,
            mirrorView: mirror,
            clientWidth: this.canvas.width,
            clientHeight: this.canvas.height,
            contentWidth,
            contentHeight
        });

        //Calc viewport
        if(this.viewMode !=0)
        {
            this.calcViewPortMode1();
        }
        else
        {
            const canvas_w = this.canvas.width
            const canvas_h = this.canvas.height
            this.calcViewPortMode2(canvas_w, canvas_h);
        }

        //draw
        let buffer = {
            data: imageData.databuffer,
            width: imageData.width,
            height: imageData.height,
            displayWidth: this.canvas.width,
            displayHeight: this.canvas.height
        }

        /*if (this.canvas.width != buffer.displayWidth || this.canvas.height != buffer.displayHeight) {
            // Keep the canvas at the right size...
            
            this.canvas.width = buffer.displayWidth;
            this.canvas.height = buffer.displayHeight;
        }*/

        //set background color
        this.canvas.style.backgroundColor = "black";

        if (this.imageData === null ||
            this.imageData.width != buffer.width ||
            this.imageData.height != buffer.height)
        {
            this.imageData = this.render.createImageData(buffer.width, buffer.height);
        }

		for (var i = 0; i < this.imageData.data.length; i += 4) {
			this.imageData.data[i + 0] = buffer.data[i+0];
            this.imageData.data[i + 1] = buffer.data[i+1];
            this.imageData.data[i + 2] = buffer.data[i+2];
            this.imageData.data[i + 3] = buffer.data[i+3];
		}

        //temp canvas: put data to this temp canvas
        var resampleCanvas = document.createElement('canvas');
		resampleCanvas.width = buffer.width;
		resampleCanvas.height = buffer.height;
		var resampleContext = resampleCanvas.getContext('2d');

         //the width and height of the view port 
         let new_w = this.CurrentViewPort.dataWidth
         let new_h = this.CurrentViewPort.dataHeight
         //the start point of the view port
         let viewportx = this.CurrentViewPort.start_x
         let viewporty = this.CurrentViewPort.start_y

        resampleContext.putImageData(this.imageData, 0, 0, 0, 0, buffer.width, buffer.height);

        this.render.drawImage(resampleCanvas, 0, 0, buffer.width, buffer.height, viewportx, viewporty, new_w, new_h);

    }
}


function WebGLRender() {
    this.gl = null
    this.render2d = null
    this.glProgram = null
    this.vertexBuffer = null
    this.vertexIndiceBuffer = null
    this.samplerUniform = null
    this.vShader = null
    this.fShader = null
    this.haveInit = false
    this.texture = null
    this.canvas = null
    this.pbo = null
    this.cur_width = 0
    this.cur_height = 0
    this.w = void 0
    this.h = void 0
    this.viewMode = 0
    this.flipMode = null
    this.bkColor = null
    this.setbkColor = false
    this.bkAlpha = 0.0
    this.bkRed = 0.0
    this.bkGreen = 0.0
    this.bkBlue = 0.0
    this.preserveDrawingBuffer = false
    
    this.vertex = [
        -1, -1, 0,
        1, -1, 0.0,
        1, 1, 0.0,
        -1, 1, 0.0]

    this.vertexIndice = [
        0, 1, 2,
        0, 2, 3
    ]

    this.prevViewPort = { w: 0, h: 0, canvasW: 0, canvasH: 0 }
}

WebGLRender.prototype = {
    setViewMode (mode) {
        this.viewMode = mode
    },
    enablePreserveDrawingBuffer(enable) {
        this.preserveDrawingBuffer = enable
    },
    setWebGLView() {
        const { w, h, prevViewPort } = this

        if (w && h && this.canvas && this.gl) {
            const rect = this.canvas.getBoundingClientRect()
            const canvasH = rect.height
            const canvasW = rect.width
            if (!(canvasW && canvasH)) return
            const isSame = w === prevViewPort.w
                && h === prevViewPort.h
                && canvasW === prevViewPort.canvasW
                && canvasH === prevViewPort.canvasH
            // if (!isSame) {
            //     console.log(w, h, canvasW, canvasH)
            // }
            let newW
            let newH
            const ratioW = w / canvasW
            const ratioH = h / canvasH
            
            if (this.viewMode === 1) 
            {
                if (ratioW > ratioH) 
                {
                    newH = canvasH
                    newW = w * canvasH / h
                } else {
                    newW = canvasW
                    newH = h * canvasW / w
                }
                const dpr = window.devicePixelRatio;
                var offsetX = -(newW - canvasW)/2
                var offsetY = -(newH - canvasH)/2
                if (dpr !== 1) {                    
                    newW = newW*dpr
                    newH = newH*dpr
                    //offsetX = 0
                    //offsetY = 0
                    //修复画面裁剪比例的问题
                    offsetX = offsetX*dpr;
                    offsetY = offsetY*dpr;
                }
                Object.assign(prevViewPort, { w, h, canvasW, canvasH, offsetX, offsetY, newW, newH })
    
                if (offsetX, offsetY, newW, newH) 
                {
                    this.gl.viewport(offsetX, offsetY, newW, newH)
                }
            } 
            else 
            {
                const dpr = window.devicePixelRatio;
                var realCanvasH = canvasH;
                var realCanvasW = canvasW;
                if (dpr !== 1) {                    
                    realCanvasW = realCanvasW*dpr
                    realCanvasH = realCanvasH*dpr
                }
                Object.assign(prevViewPort, { w, h, realCanvasW, realCanvasH, offsetX: 0, offsetY: 0, newW: realCanvasW, newH: realCanvasH })
                if (realCanvasW, realCanvasH) 
                {
                    this.gl.viewport(0, 0, realCanvasW, realCanvasH)
                }
            }
        }
    },

    initGLfromCanvas (canvas) {
        if (canvas) {
            
            this.canvas = canvas
        
            let ret = false
            let use2dRender = false

            do {
                ret = this.initGL(canvas); if (!ret) { /*console.log('initGL failed');*/ break }
                ret = this.initShaders(); if (!ret) { /*console.log('initShaders failed');*/ break }
                ret = this.initUniforms(); if (!ret) { /*console.log('initUniforms failed');*/ break }

            } while (false)

            //Webgl is not available, to switch canvas rendering
            if(!this.gl)
            {
                do
                {
                    this.render2d = new Canvas2dRender();
                    if(this.render2d)
                    {
                        ret = this.render2d.bindCanvas(canvas); if (!ret) { console.log('init2d failed'); break }
                        use2dRender = true
                    } 
                } while(false)
            }

            if (ret && !use2dRender) {
                this.initTextureAttr()
                this.initTexture()
            }
            this.haveInit = ret
            return ret
        }
        return false
    },
    
    initBkColor(bkColor) {
        // this.bkAlpha = this.bkColor >> 24 & 0xff / 255.0
        this.bkAlpha = 1;
        this.bkColor = bkColor
        this.bkRed = (this.bkColor  >> 16 & 0xff) / 255.0
        this.bkGreen = (this.bkColor  >> 8 & 0xff) / 255.0
        this.bkBlue = (this.bkColor & 0xff)  / 255.0;
        this.setbkColor = true
    },

    initGL (canvas) {
        try {
            this.gl = canvas.getContext('webgl', {preserveDrawingBuffer: this.preserveDrawingBuffer})|| canvas.getContext('experimental-webgl', {preserveDrawingBuffer: this.preserveDrawingBuffer})
            || canvas.getContext('webgl2', {preserveDrawingBuffer: this.preserveDrawingBuffer})
        } catch (e) {
            //console.log('gl init failed', e)
            return false
        }
        if (this.gl) {
            return true
        }else{
            return false
        }
    },
    initShaders () {

        const VSHADER_SOURCE =
            'attribute vec3 aPos;                    ' +
            'attribute vec2 aVertexTextureCoord;     ' +
            'varying highp vec2 vTextureCoord;       ' +
            'void main(void){                        ' +
            '    gl_Position = vec4(aPos, 1);        ' +
            '    vTextureCoord = aVertexTextureCoord;' +
            '}'

        const FSHADER_SOURCE =
            'varying highp vec2 vTextureCoord;                                               ' +
            'uniform sampler2D uSampler;                                                     ' +
            'void main(void) {                                                               ' +
            '    gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)); ' +
            '}'

        // compile shaders
        const vertexShader = this.makeShader(VSHADER_SOURCE, this.gl.VERTEX_SHADER)
        const fragmentShader = this.makeShader(FSHADER_SOURCE, this.gl.FRAGMENT_SHADER)
        this.vShader = vertexShader
        this.fShader = fragmentShader
        if (!vertexShader || !fragmentShader) {
            return false
        }

        // create program
        this.glProgram = this.gl.createProgram()

        // attach and link shaders to the program
        this.gl.attachShader(this.glProgram, vertexShader)
        this.gl.attachShader(this.glProgram, fragmentShader)
        this.gl.linkProgram(this.glProgram)

        if (!this.gl.getProgramParameter(this.glProgram, this.gl.LINK_STATUS)) {
            console.log('Unable to initialize the shader program.')
            return false
        } else {
            // use program
            this.gl.useProgram(this.glProgram)
            return true
        }
    },
    makeShader (src, type) {
        //compile the vertex shader
        const shader = this.gl.createShader(type)
        this.gl.shaderSource(shader, src)
        this.gl.compileShader(shader)

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log(`Error compiling shader: ${  this.gl.getShaderInfoLog(shader)}`)
            return null
        }
        return shader
    },

    initUniforms () {
        this.samplerUniform = this.gl.getUniformLocation(this.glProgram, 'uSampler')
        //console.log("this.samplerUniform = ", this.samplerUniform)
        return true
    },
    initTexture () {
        this.texture = this.gl.createTexture()
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
        //this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
    },

    initTextureAttr () {
        // vertex data
        const vertexBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertex), this.gl.STATIC_DRAW)

        // indice data
        const vertexIndiceBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, vertexIndiceBuffer)
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.vertexIndice), this.gl.STATIC_DRAW)

        // set position attribute
        const aVertexPosition = this.gl.getAttribLocation(this.glProgram, 'aPos')
        this.gl.vertexAttribPointer(aVertexPosition, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(aVertexPosition)
    },

    uninit2d(){
        if(this.render2d)
        {
            this.render2d.unbindCanvas();
            this.render2d = null;
        }
    },

    setFlipMode(flipMode){
        if(this.flipMode === flipMode){
            return;
        }
        this.flipMode = flipMode;

        // default flip-None
        let triangleTexCoords = [
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ]
        // flip-X
        if(flipMode === 1){
            triangleTexCoords = [
                1.0, 0.0,
                0.0, 0.0,
                0.0, 1.0,
                1.0, 1.0
            ]
        }

        // texture coordinate data
        const trianglesTexCoordBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, trianglesTexCoordBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(triangleTexCoords), this.gl.STATIC_DRAW)
        const vertexTexCoordAttribute = this.gl.getAttribLocation(this.glProgram, 'aVertexTextureCoord')
        this.gl.enableVertexAttribArray(vertexTexCoordAttribute)
        this.gl.vertexAttribPointer(vertexTexCoordAttribute, 2, this.gl.FLOAT, false, 0, 0)
    },

    updateImgData (buf, w, h) {
        this.w = w
        this.h = h
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, w, h, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, buf)
    },
    resize (canvas) {
        const dpr = window.devicePixelRatio;
		
		const {width, height} = canvas.getBoundingClientRect();

        const displayWidth  = Math.round(width * dpr);
        const displayHeight = Math.round(height * dpr);

        // Check if the canvas is not the same size.
        const needResize = canvas.width  != displayWidth ||
        canvas.height != displayHeight;

        if (needResize) {
            // Make the canvas the same size
            canvas.width  = displayWidth;
            canvas.height = displayHeight;
        }
    },

    drawVideoFrame(videoFrame){
        //webgl render
        let width = videoFrame["videoFrameParam"]["width"];
        let height = videoFrame["videoFrameParam"]["height"];
        if(this.gl)
        {
            this.setFlipMode(videoFrame["videoFrameParam"]["flipMode"]);
            this.draw(videoFrame["videoFrameBuffer"], width, height);
        }
        //canvas render
        else
        {
            if(this.render2d)
            {
                this.render2d.setFlipMode(videoFrame["videoFrameParam"]["flipMode"]);
                this.render2d.setViewMode(this.viewMode);
                var databuffer = videoFrame["videoFrameBuffer"];
                this.render2d.drawFrame({databuffer, width, height});
            }
        }
    },

    draw (rgbaBuf, w, h) {
        this.w = w
        this.h = h
        if (!this.haveInit) {
            //console.log('not init gl. can not draw')
            return
        }

        //console.log("window.devicePixelRatio",window.devicePixelRatio);
        // 视网膜屏幕分辨率矫正
        this.resize(this.canvas)

        const canvas_w = this.canvas.width
        const canvas_h = this.canvas.height

        let new_w = 0, new_h = 0

        if (this.viewMode !== 0) {
            this.setWebGLView()
        } else {
            if (w < canvas_w && h < canvas_h) {
                const scale_w = (canvas_w - w) / canvas_w * 1.0
                const scale_h = (canvas_h - h) / canvas_h * 1.0
                if (scale_w < scale_h) {
                    new_w = canvas_w
                    new_h = (canvas_w - w) / w * 1.0 * h + h
                    const view_port_x = 0
                    const view_port_y = (canvas_h - new_h) / 2.0
                    this.gl.viewport(view_port_x, view_port_y, new_w, new_h)
                    //console.log("view_port_x, view_port_y, new_w, new_h", view_port_x, view_port_y, new_w, new_h);
                } else {
                    new_h = canvas_h
                    new_w = (canvas_h - h) / h * 1.0 * w + w
                    const view_port_x = canvas_w / 2.0 - new_w / 2.0
                    const view_port_y = 0
                    this.gl.viewport(view_port_x, view_port_y, new_w, new_h)
                    //console.log("view_port_x, view_port_y, new_w, new_h", view_port_x, view_port_y, new_w, new_h);
                }
            } else {
                const scale_w = (w - canvas_w) / w * 1.0
                const scale_h = (h - canvas_h) / h * 1.0
                if (scale_w < scale_h) {
                    new_h = canvas_h
                    new_w = w - (h - canvas_h) / h * 1.0 * w
                    const view_port_x = canvas_w / 2.0 - new_w / 2.0
                    const view_port_y = 0
                    this.gl.viewport(view_port_x, view_port_y, new_w, new_h)
                    //console.log("view_port_x, view_port_y, new_w, new_h, canvas_w, canvas_h", view_port_x, view_port_y, w, h, new_w, new_h, canvas_w,canvas_h);
                }
                else {
                    new_w = canvas_w
                    new_h = h - (w - canvas_w) / w * 1.0 * h
                    const view_port_x = 0
                    const view_port_y = canvas_h / 2.0 - new_h / 2.0
                    this.gl.viewport(view_port_x, view_port_y, new_w, new_h)
                }
            }
        }
        
        if(this.setbkColor)
        {
            this.gl.clearColor(this.bkRed, this.bkGreen, this.bkBlue, this.bkAlpha)
            this.gl.clear(this.gl.COLOR_BUFFER_BIT)
        }

        this.updateImgData(rgbaBuf, w, h)

        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0)
    }

}

module.exports = exports = WebGLRender
