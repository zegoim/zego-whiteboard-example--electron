function WebGLRender() {
    this.gl = null
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
            if (!isSame) {
                console.log(w, h, canvasW, canvasH)
            }
            
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
                const offsetX = -(newW - canvasW) / 2
                const offsetY = -(newH - canvasH) / 2
                Object.assign(prevViewPort, { w, h, canvasW, canvasH, offsetX, offsetY, newW, newH })
    
                if (offsetX, offsetY, newW, newH) {
                    //this.gl = this.canvas.getContext('webgl')
                    this.gl.viewport(offsetX, offsetY, newW, newH)
                }
            } else {
                Object.assign(prevViewPort, { w, h, canvasW, canvasH, offsetX: 0, offsetY: 0, newW: canvasW, newH: canvasH })
    
                if (canvasW, canvasH) {
                    //this.gl = this.canvas.getContext('webgl')
                    this.gl.viewport(0, 0, canvasW, canvasH)
                }
            }
        }
    },

    initGLfromCanvas (canvas) {
        if (canvas) {
            
            this.canvas = canvas
        
            let ret = false
            do {
                ret = this.initGL(canvas); if (!ret) { console.log('initGL failed'); break }
                ret = this.initShaders(); if (!ret) { console.log('initShaders failed'); break }
                ret = this.initUniforms(); if (!ret) { console.log('initUniforms failed'); break }

            } while (false)
            if (ret) {
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
        this.bkRed = this.bkColor  >> 16 & 0xff / 255.0
        this.bkGreen = this.bkColor  >> 8 & 0xff / 255.0
        this.bkBlue = this.bkColor & 0xff  / 255.0;
        this.setbkColor = true
    },

    initGL (canvas) {
        try {
            this.gl = canvas.getContext('webgl', {preserveDrawingBuffer: this.preserveDrawingBuffer})
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
        // Lookup the size the browser is displaying the canvas.
        const displayWidth = canvas.clientWidth
        const displayHeight = canvas.clientHeight

        // Check if the canvas is not the same size.
        if (canvas.width != displayWidth ||
            canvas.height != displayHeight) {

            // Make the canvas the same size
            canvas.width = displayWidth
            canvas.height = displayHeight
        }
    },

    drawVideoFrame(videoFrame){
        let width = videoFrame["videoFrameParam"]["width"];
        let height = videoFrame["videoFrameParam"]["height"];
        this.setFlipMode(videoFrame["videoFrameParam"]["flipMode"]);
        this.draw(videoFrame["videoFrameBuffer"], width, height);
    },

    draw (rgbaBuf, w, h) {
        this.w = w
        this.h = h
        if (!this.haveInit) {
            //console.log('not init gl. can not draw')
            return
        }

        //console.log("window.devicePixelRatio",window.devicePixelRatio);
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
