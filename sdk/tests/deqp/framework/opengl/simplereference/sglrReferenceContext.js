/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES Utilities
 * ------------------------------------------------
 *
 * Copyright 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

define(['framework/referencerenderer/rrMultisamplePixelBufferAccess', 'framework/common/tcuTexture', 'framework/delibs/debase/deMath', 'framework/opengl/gluTextureUtil', 'framework/common/tcuTextureUtil' ],
 function(rrMultisamplePixelBufferAccess, tcuTexture, deMath, gluTextureUtil, tcuTextureUtil) {

var rrMPBA = rrMultisamplePixelBufferAccess;

/** TODO: Remove */
/** @type {WebGLRenderingContext} */ var gl;

var GLU_EXPECT_NO_ERROR = function(error, message) {
    assertMsgOptions(error === gl.NONE, message, false, true);
};

var MAX_TEXTURE_SIZE_LOG2       = 14;
var MAX_TEXTURE_SIZE            = 1<<MAX_TEXTURE_SIZE_LOG2;

var isEmpty = function(/*const tcu::ConstPixelBufferAccess&*/ access) {
    return access.getWidth() == 0 || access.getHeight() == 0 || access.getDepth() == 0;
};

var getNumMipLevels2D = function(width, height) {
    return Math.floor(Math.log2(Math.max(width, height))+1);
};

var getMipLevelSize = function(baseLevelSize, levelNdx) {
    return Math.max(baseLevelSize >> levelNdx, 1);
};

var isMipmapFilter = function(/*const tcu::Sampler::FilterMode*/ mode) {
    return mode != tcuTexture.FilterMode.NEAREST && mode != tcuTexture.FilterMode.LINEAR;
};


/* TODO: This belongs to refrast. Where to move it? */
/**
 * @enum
 */
var FaceType = {
    FACETYPE_FRONT: 0,
    FACETYPE_BACK: 1
};

/**
 * @constructor
 * @param {number=} a
 * @param {number=} b
 * @param {number=} c
 * @param {number=} d
 */
var GenericVec4 = function(a, b, c, d) {
    this.data = [a || 0, b || 0, c || 0, d || 0];
};

/**
 * @constructor
 */
var ReferenceContextLimits = function(gl) {
    this.maxTextureImageUnits = 16;
    this.maxTexture2DSize = 2048;
    this.maxTextureCubeSize = 2048;
    this.maxTexture2DArrayLayers = 256;
    this.maxTexture3DSize = 256;
    this.maxRenderbufferSize = 2048;
    this.maxVertexAttribs = 16;

    if (gl) {
        this.maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this.maxTexture2DSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        this.maxTextureCubeSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
        this.maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        this.maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        this.maxTexture2DArrayLayers = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
        this.maxTexture3DSize = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE);

        // Limit texture sizes to supported values
        this.maxTexture2DSize    = Math.min(this.maxTexture2DSize,   MAX_TEXTURE_SIZE);
        this.maxTextureCubeSize  = Math.min(this.maxTextureCubeSize, MAX_TEXTURE_SIZE);
        this.maxTexture3DSize    = Math.min(this.maxTexture3DSize,   MAX_TEXTURE_SIZE);

        GLU_EXPECT_NO_ERROR(gl.getError(), gl.NO_ERROR);
    }

    /* TODO: Port 
    // \todo [pyry] Figure out following things:
    // + supported fbo configurations
    // ...

    // \todo [2013-08-01 pyry] Do we want to make these conditional based on renderCtx?
    addExtension("gl.EXT_color_buffer_half_float");
    addExtension("gl.EXT_color_buffer_float");
    */
};

// /**
//  * @constructor
//  */
// var NamedObject = function(name) {
//     this.m_name = name;
//     this.m_refCount = 1;
// };

// NamedObject.prototype.getName = function() { return this.m_name; };
// NamedObject.prototype.getRefCount = function() { return this.m_refCount; };
// NamedObject.prototype.incRefCount = function() { this.m_refCount += 1; };
// NamedObject.prototype.decRefCount = function() {
//     if (this.m_refCount == 0)
//         throw new Error("Refcount is already 0");
//     this.m_refCount -= 1;
// };

/**
 * @enum
 */
var TextureType = {
    TYPE_2D: 0,
    TYPE_CUBE_MAP: 1,
    TYPE_2D_ARRAY: 2,
    TYPE_3D: 3,
    TYPE_CUBE_MAP_ARRAY: 4
};

/**
 * @constructor
 * @param {TextureType} type
 */
var Texture = function(type) {
    // NamedObject.call(this, name);
    this.m_type = type;
    this.m_immutable = false;
    this.m_baseLevel = 0;
    this.m_maxLevel = 1000;
    this.m_sampler = new tcuTexture.Sampler(tcuTexture.WrapMode.REPEAT_GL,
                                            tcuTexture.WrapMode.REPEAT_GL,
                                            tcuTexture.WrapMode.REPEAT_GL,
                                            tcuTexture.FilterMode.NEAREST_MIPMAP_LINEAR,
                                            tcuTexture.FilterMode.LINEAR,
                                            0,
                                            true,
                                            tcuTexture.CompareMode.COMPAREMODE_NONE,
                                            0,
                                            [0, 0, 0, 0],
                                            true);
};

// Texture.prototype = Object.create(NamedObject.prototype);
// Texture.prototype.constructor = Texture;

Texture.prototype.getType = function() { return this.m_type; };
Texture.prototype.getBaseLevel = function()  { return this.m_baseLevel;       };
Texture.prototype.getMaxLevel  = function()  { return this.m_maxLevel;        };
Texture.prototype.isImmutable  = function()  { return this.m_immutable;       };
Texture.prototype.setBaseLevel = function(baseLevel)  { this.m_baseLevel = baseLevel;  };
Texture.prototype.setMaxLevel  = function(maxLevel)   { this.m_maxLevel = maxLevel;    };
Texture.prototype.setImmutable = function()     { this.m_immutable = true;       };

Texture.prototype.getSampler  = function() { return this.m_sampler;         };

/**
 * @constructor
 */
var TextureLevelArray = function() {
    this.m_data = [];
    this.m_access = [];
};

TextureLevelArray.prototype.hasLevel = function(level) { return this.m_data[level] != null; };
TextureLevelArray.prototype.getLevel = function(level) {
    if (!this.hasLevel(level))
        throw new Error("Level: " + level + " is not defined.");

    return this.m_access[level];
};

TextureLevelArray.prototype.getLevels = function() { return this.m_access; };

TextureLevelArray.prototype.allocLevel = function(level, format, width, height, depth) {
    var   dataSize    = format.getPixelSize()*width*height*depth;
    if (this.hasLevel(level))
        this.clearLevel(level);

    this.m_data[level]   = new ArrayBuffer(dataSize);
    this.m_access[level] = new tcuTexture.PixelBufferAccess({
        format: format,
        width: width,
        height: height,
        depth: depth,
        data: this.m_data[level]});
};

TextureLevelArray.prototype.clearLevel = function(level) {
    delete this.m_data[level];
    delete this.m_access[level];
};

TextureLevelArray.prototype.clear = function() {
    for (var key in this.m_data)
        delete this.m_data[key];

    for (var key in this.m_access)
        delete this.m_access[key];
};

/**
 * @constructor
 * @extends {Texture}
 */
var Texture2D = function() {
    Texture.call(this, TextureType.TYPE_2D);
    this.m_view = new tcuTexture.Texture2DView();
    this.m_levels = new TextureLevelArray();
};

Texture2D.prototype = Object.create(Texture.prototype);
Texture2D.prototype.constructor = Texture2D;

Texture2D.prototype.clearLevels = function() { this.m_levels.clear(); };
Texture2D.prototype.hasLevel = function(level) { return this.m_levels.hasLevel(level);  };
Texture2D.prototype.getLevel = function(level) { return this.m_levels.getLevel(level);  };
Texture2D.prototype.allocLevel = function(level, format, width, height) { this.m_levels.allocLevel(level, format, width, height, 1); };
Texture2D.prototype.isComplete = function() {
    var  baseLevel   = this.getBaseLevel();

    if (this.hasLevel(baseLevel))
    {
        var  level0      = this.getLevel(baseLevel);
        /** @type {boolean} */ var                          mipmap      = isMipmapFilter(this.getSampler().minFilter);

        if (mipmap)
        {
            var    format      = level0.getFormat();
            var               w           = level0.getWidth();
            var               h           = level0.getHeight();
            var               numLevels   = Math.min(this.getMaxLevel()-baseLevel+1, getNumMipLevels2D(w, h));

            for (var levelNdx = 1; levelNdx < numLevels; levelNdx++)
            {
                if (this.hasLevel(baseLevel+levelNdx))
                {
                    var  level       = this.getLevel(baseLevel+levelNdx);
                    var                           expectedW   = getMipLevelSize(w, levelNdx);
                    var                           expectedH   = getMipLevelSize(h, levelNdx);

                    if (level.getWidth()    != expectedW    ||
                        level.getHeight()   != expectedH    ||
                        level.getFormat()   != format)
                        return false;
                }
                else
                    return false;
            }
        }

        return true;
    }
    else
        return false;
};

Texture2D.prototype.updateView = function() {
    var baseLevel = this.getBaseLevel();

    if (this.hasLevel(baseLevel) && !isEmpty(this.getLevel(baseLevel))) {
        // Update number of levels in mipmap pyramid.
        var   width       = this.getLevel(baseLevel).getWidth();
        var   height      = this.getLevel(baseLevel).getHeight();
        var   isMipmap    = isMipmapFilter(this.getSampler().minFilter);
        var   numLevels   = isMipmap ? Math.min(this.getMaxLevel()-baseLevel+1, getNumMipLevels2D(width, height)) : 1;

        this.m_view = new tcuTexture.Texture2DView(numLevels, this.m_levels.getLevels().slice(baseLevel));
    } else
        this.m_view = new tcuTexture.Texture2DView();
};

Texture2D.prototype.sample  = function(s, t, lod) { return this.m_view.sample(this.getSampler(), [s, t], lod) };

/**
 * @param {Array<Array<number>>} packetTexcoords 4 vec2 coordinates
 * @return {Array<Array<number>>} 4 vec4 samples
 */
Texture2D.prototype.sample4 = function(packetTexcoords, lodBias_) {
    var lodBias = lodBias_ || 0;
    var texWidth  = this.m_view.getWidth();
    var texHeight = this.m_view.getHeight();
    var output = [];

    var dFdx0 = deMath.subtract(packetTexcoords[1], packetTexcoords[0]);
    var dFdx1 = deMath.subtract(packetTexcoords[3], packetTexcoords[2]);
    var dFdy0 = deMath.subtract(packetTexcoords[2], packetTexcoords[0]);
    var dFdy1 = deMath.subtract(packetTexcoords[3], packetTexcoords[1]);

    for (var fragNdx = 0; fragNdx < 4; ++fragNdx)
    {
        var dFdx = (fragNdx & 2) ? dFdx1 : dFdx0;
        var dFdy = (fragNdx & 1) ? dFdy1 : dFdy0;

        var mu = Math.max(Math.abs(dFdx[0]), Math.abs(dFdy[0]));
        var mv = Math.max(Math.abs(dFdx[1]), Math.abs(dFdy[1]));
        var p = Math.max(mu * texWidth, mv * texHeight);

        var lod = Math.log2(p) + lodBias;

        output.push(this.sample(packetTexcoords[fragNdx][0], packetTexcoords[fragNdx][1], lod));
    }

    return output;
};

/**
 * A container object for storing one of texture types;
 * @constructor
 */
var TextureContainer = function() {
    this.texture = null;
    this.textureType = undefined;
};

 TextureContainer.prototype.init = function(target) {
    switch(target) {
        case gl.TEXTURE_2D:
            this.texture = new Texture2D();
            this.textureType = TextureType.TYPE_2D;
            break;
        /* TODO: Implement other types */
        // case gl.TEXTURE_CUBE_MAP:
        //     his.textureType = TextureType.TYPE_CUBE_MAP;
        //     break;
        // case gl.TEXTURE_2D_ARRAY:
        //     this.textureType = TextureType.TYPE_2D_ARRAY;
        //     break;
        // case gl.TEXTURE_3D:
        //     this.textureType = TextureType.TYPE_3D;
        //     break;
        // case gl.TEXTURE_CUBE_MAP_ARRAY:
        //     this.textureType = TextureType.TYPE_CUBE_MAP_ARRAY;
        //     break;
        default: throw new Error("Unrecognized target: " + target);
    };
};

/**
 * @enum
 */
var AttachmentPoint = {
    ATTACHMENTPOINT_COLOR0: 0,
    ATTACHMENTPOINT_DEPTH: 1,
    ATTACHMENTPOINT_STENCIL: 2
};

/**
 * @enum
 */
var AttachmentType = {
    ATTACHMENTTYPE_RENDERBUFFER: 0,
    ATTACHMENTTYPE_TEXTURE: 1
};

/**
 * @enum
 */
var TexTarget = {
    TEXTARGET_2D: 0,
    TEXTARGET_CUBE_MAP_POSITIVE_X: 1,
    TEXTARGET_CUBE_MAP_POSITIVE_Y: 2,
    TEXTARGET_CUBE_MAP_POSITIVE_Z: 3,
    TEXTARGET_CUBE_MAP_NEGATIVE_X: 4,
    TEXTARGET_CUBE_MAP_NEGATIVE_Y: 5,
    TEXTARGET_CUBE_MAP_NEGATIVE_Z: 6,
    TEXTARGET_2D_ARRAY: 7,
    TEXTARGET_3D: 8,
    TEXTARGET_CUBE_MAP_ARRAY: 9

};

/**
 * @constructor
 */
var Attachment = function() {
    /** @type {AttachmentType} */ this.type = undefined;
    this.object = null;
    /** @type {TexTarget} */ this.texTarget = undefined;
    this.level = 0;
    this.layer = 0;
};

/**
 * @constructor
 */
var Framebuffer = function() {
    this.m_attachments = [];
    for (var point in AttachmentType)
        this.m_attachments[point] = new Attachment();
};

Framebuffer.prototype.getAttachment = function(point) { return this.m_attachments[point]; };

/**
 * @constructor
 */
var Renderbuffer = function() {
    /* TODO: implement */
};


/**
 * @constructor
 */
var VertexArray = function(maxVertexAttribs) {
    /** @constructor */
    var VertexAttribArray = function() {
        this.enabled = false;
        this.size = 4;
        this.stride = 0;
        this.type = gl.FLOAT;

        this.normalized = false;
        this.integer = false;
        this.divisor = 0;
        this.offset = 0;
        this.bufferBinding = null;
    };

    this.m_elementArrayBufferBinding = null;

    this.m_arrays = [];
    for (var i = 0; i < maxVertexAttribs; i++)
        this.m_arrays.push(new VertexAttribArray());
};

/**
 * @constructor
 */
var DataBuffer = function() {
    this.m_data = null;
};

DataBuffer.prototype.setStorage = function(size) {this.m_data = new ArrayBuffer(size); };
DataBuffer.prototype.getSize = function() {
    var size = 0;
    if (this.m_data)
        size = this.m_data.byteLength;
    return size;
};
DataBuffer.prototype.getData = function() { return this.m_data; };

DataBuffer.prototype.setData = function(data) {
    var buffer;
    var offset = 0;
    var byteLength = data.byteLength;
    if (data instanceof ArrayBuffer)
        buffer = data;
    else {
        buffer = data.buffer;
        offset = data.byteOffset;
    }

    if (!buffer)
        throw new Error("Invalid buffer");

    this.m_data = buffer.slice(offset, offset + byteLength);
};

DataBuffer.prototype.setSubData = function(offset, data) {
    var buffer;
    var srcOffset = 0;
    var byteLength = data.byteLength;
    if (data instanceof ArrayBuffer)
        buffer = data;
    else {
        buffer = data.buffer;
        srcOffset = data.byteOffset;
    }

    if (!buffer)
        throw new Error("Invalid buffer");

    var src = new Uint8Array(buffer, srcOffset, byteLength);
    var dst = new Uint8Array(this.m_data, offset, byteLength);
    dst.set(src);
};


// /**
//  * @constructor
//  */
// var ObjectManager = function() {
//     this.m_objects = {};
// };

// ObjectManager.prototype.insert = function(obj) {
//     var name = obj.getName();
//     if (!name)
//         throw new Error("Cannot insert unnamed object");
//     this.m_objects[name] = obj;
// };

// ObjectManager.prototype.find = function(name) { return this.m_objects[name]; };

// ObjectManager.prototype.acquireReference = function(obj) {
//     if (this.find(obj.getName()) !== obj)
//         throw new Error("Object is not in the object manager");
//     obj.incRefCount();
// };

// ObjectManager.prototype.releaseReference = function(obj) {
//     if (this.find(obj.getName()) !== obj)
//         throw new Error("Object is not in the object manager");
    
//     obj.decRefCount();

//     if (obj.getRefCount() == 0)
//         delete this.m_objects[obj.getName()];
// };

// ObjectManager.prototype.getAll = function() { return this.m_objects; };

/**
 * @constructor
 */
var TextureUnit = function() {
    this.tex2DBinding        = null;
    this.texCubeBinding      = null;
    this.tex2DArrayBinding   = null;
    this.tex3DBinding        = null;
    this.texCubeArrayBinding = null;
    this.default2DTex        = 0;
    this.defaultCubeTex      = 0;
    this.default2DArrayTex   = 0;
    this.default3DTex        = 0;
    this.defaultCubeArrayTex = 0;
};

/**
 * @constructor
 */
var StencilState = function() {
    this.func = 0;
    this.ref = 0;
    this.opMask = 0;
    this.opStencilFail = 0;
    this.opDepthFail = 0;
    this.opDepthPass = 0;
    this.writeMask = 0;
};

/**
 * @param {ReferenceContextLimits} limits
 * @param {rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess} colorbuffer
 * @param {rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess} depthbuffer
 * @param {rrMultisamplePixelBufferAcces.MultisamplePixelBufferAccess} stencilbuffer
 * @constructor
 */
var ReferenceContext = function(limits, colorbuffer, depthbuffer, stencilbuffer) {
    this.m_limits = limits;
    this.m_defaultColorbuffer = colorbuffer;
    this.m_defaultDepthbuffer = depthbuffer;
    this.m_defaultStencilbuffer = stencilbuffer;
    this.m_viewport = [0, 0, colorbuffer.raw().getHeight(), colorbuffer.raw().getWidth()];
    this.m_textureUnits = [];
    for (var i = 0; i < this.m_limits.maxTextureImageUnits; i++)
        this.m_textureUnits.push(new TextureUnit());
    this.m_lastError = gl.NO_ERROR;
    // this.m_textures = new ObjectManager();
    this.m_pixelUnpackRowLength   = 0;
    this.m_pixelUnpackSkipRows    = 0;
    this.m_pixelUnpackSkipPixels  = 0;
    this.m_pixelUnpackImageHeight = 0;
    this.m_pixelUnpackSkipImages  = 0;
    this.m_pixelUnpackAlignment   = 4;
    this.m_pixelPackAlignment     = 4;
    this.m_clearColor    = [0, 0, 0, 0];
    this.m_clearDepth    = 1;
    this.m_clearStencil  = 0;
    this.m_scissorBox = this.m_viewport;
    this.m_blendEnabled              = false;
    this.m_scissorEnabled            = false;
    this.m_depthTestEnabled          = false;
    this.m_stencilTestEnabled        = false;
    this.m_polygonOffsetFillEnabled  = false;
    this.m_primitiveRestartFixedIndex    = true; //always on
    this.m_primitiveRestartSettableIndex = true; //always on
    this.m_stencil = [];
    for (var type in FaceType)
        this.m_stencil[type] = new StencilState();
    this.m_depthFunc = gl.LESS;
    this.m_depthRangeNear      = 0;
    this.m_depthRangeFar       = 1;
    this.m_polygonOffsetFactor = 0;
    this.m_polygonOffsetUnits  = 0;
    this.m_blendModeRGB        = gl.FUNC_ADD;
    this.m_blendModeAlpha      = gl.FUNC_ADD;
    this.m_blendFactorSrcRGB   = gl.ONE;
    this.m_blendFactorDstRGB   = gl.ZERO;
    this.m_blendFactorSrcAlpha = gl.ONE;
    this.m_blendFactorDstAlpha = gl.ZERO;
    this.m_blendColor          = [0, 0, 0, 0];
    this.m_colorMask = [true, true, true, true];
    this.m_depthMask = true;
    this.m_defaultVAO = new VertexArray(this.m_limits.maxVertexAttribs);
    this.m_vertexArrayBinding = this.m_defaultVAO;
    this.m_arrayBufferBinding = null;
    this.m_copyReadBufferBinding = null;
    this.m_copyWriteBufferBinding = null;
    this.m_drawIndirectBufferBinding = null;
    this.m_pixelPackBufferBinding = null;
    this.m_pixelUnpackBufferBinding = null;
    this.m_transformFeedbackBufferBinding = null;
    this.m_uniformBufferBinding = null;
    this.m_readFramebufferBinding = null;
    this.m_drawFramebufferBinding = null;
    this.m_renderbufferBinding    = null;
    this.m_currentProgram         = null;
    this.m_currentAttribs = [];
    for (var i = 0; i < this.m_limits.maxVertexAttribs; i++)
        this.m_currentAttribs.push(new GenericVec4());
};

ReferenceContext.prototype.getWidth = function() { return this.m_defaultColorbuffer.raw().getHeight(); };
ReferenceContext.prototype.getHeight = function() { return  this.m_defaultColorbuffer.raw().getDepth(); };
ReferenceContext.prototype.viewport = function(x, y, width, height) { this.m_viewport = [x, y, width, height]; };
ReferenceContext.prototype.activeTexture = function(texture) {
    if (deMath.deInBounds32(texture, gl.TEXTURE0, gl.TEXTURE0 + this.m_textureUnits.length))
        this.m_activeTexture = texture - gl.TEXTURE0;
    else
        this.setError(gl.INVALID_ENUM);
};

ReferenceContext.prototype.setError = function(error) {
    if (this.m_lastError == gl.NO_ERROR)
        this.m_lastError = error;
};

ReferenceContext.prototype.condtionalSetError = function(condition, error) {
    if (condition)
        this.setError(error)
    return condition;
};

/**
 * @param {TextureContainer} texture
 */
ReferenceContext.prototype.bindTexture = function(target, texture) {
    var unitNdx = this.m_activeTexture;

    if (this.condtionalSetError((target != gl.TEXTURE_1D             &&
                target != gl.TEXTURE_2D             &&
                target != gl.TEXTURE_CUBE_MAP       &&
                target != gl.TEXTURE_2D_ARRAY       &&
                target != gl.TEXTURE_3D             &&
                target != gl.TEXTURE_CUBE_MAP_ARRAY),
                gl.INVALID_ENUM))
        return;

    if (!texture) {
        // Clear binding.
        switch (target) {
            case gl.TEXTURE_2D:             setTex2DBinding         (unitNdx, null); break;
            case gl.TEXTURE_CUBE_MAP:       setTexCubeBinding       (unitNdx, null); break;
            case gl.TEXTURE_2D_ARRAY:       setTex2DArrayBinding    (unitNdx, null); break;
            case gl.TEXTURE_3D:             setTex3DBinding         (unitNdx, null); break;
            case gl.TEXTURE_CUBE_MAP_ARRAY: setTexCubeArrayBinding  (unitNdx, null); break;
            default:
                throw new Error("Unrecognized target: " + target);
        }
    } else {
        if (!texture.textureType) {
            texture.init(target);
        } else {
            // Validate type.
            var expectedType;
            switch(target) {
                case gl.TEXTURE_2D: expectedType = TextureType.TYPE_2D; break;
                case gl.TEXTURE_CUBE_MAP: expectedType = TextureType.TYPE_CUBE_MAP; break;
                case gl.TEXTURE_2D_ARRAY: expectedType = TextureType.TYPE_2D_ARRAY; break;
                case gl.TEXTURE_3D: expectedType = TextureType.TYPE_3D; break;
                case gl.TEXTURE_CUBE_MAP_ARRAY: expectedType = TextureType.TYPE_CUBE_MAP_ARRAY; break;
                default: throw new Error("Unrecognized target: " + target);
            };
            if (this.condtionalSetError((texture.textureType != expectedType), gl.INVALID_OPERATION))
                 return;
        }
        switch (target)
        {
            case gl.TEXTURE_2D:             setTex2DBinding         (unitNdx, texture);  break;
            case gl.TEXTURE_CUBE_MAP:       setTexCubeBinding       (unitNdx, texture);  break;
            case gl.TEXTURE_2D_ARRAY:       setTex2DArrayBinding    (unitNdx, texture);  break;
            case gl.TEXTURE_3D:             setTex3DBinding         (unitNdx, texture);  break;
            case gl.TEXTURE_CUBE_MAP_ARRAY: setTexCubeArrayBinding  (unitNdx, texture);  break;
            default:
                throw new Error("Unrecognized target: " + target);
        }
    }
};

ReferenceContext.prototype.setTex2DBinding = function(unitNdx, texture) {
    if (this.m_textureUnits[unitNdx].tex2DBinding)
    {
        // this.m_textures.releaseReference(this.m_textureUnits[unitNdx].tex2DBinding);
        this.m_textureUnits[unitNdx].tex2DBinding = null;
    }

    if (texture)
    {
        // this.m_textures.acquireReference(texture);
        this.m_textureUnits[unitNdx].tex2DBinding = texture;
    }
};

ReferenceContext.prototype.createTexture = function() { return new TextureContainer(); };

ReferenceContext.prototype.bindFramebuffer = function(target, fbo) {
    if (this.condtionalSetError((target != gl.FRAMEBUFFER        &&
                target != gl.DRAW_FRAMEBUFFER   &&
                target != gl.READ_FRAMEBUFFER), gl.INVALID_ENUM))
                return;
    for (var ndx = 0; ndx < 2; ndx++)
    {
        var            bindingTarget   = ndx ? gl.DRAW_FRAMEBUFFER         : gl.READ_FRAMEBUFFER;

        if (target != gl.FRAMEBUFFER && target != bindingTarget)
            continue; // Doesn't match this target.

        if (ndx)
            this.m_drawFramebufferBinding = fbo;
        else
            this.m_readFramebufferBinding = fbo;
    }
};

ReferenceContext.prototype.createFramebuffer = function() { return new Framebuffer(); };

ReferenceContext.prototype.bindRenderbuffer = function(target, rbo) {
    if (this.condtionalSetError(target != gl.RENDERBUFFER, gl.INVALID_ENUM))
        return;

    this.m_renderbufferBinding = rbo;
};

ReferenceContext.prototype.createRenderbuffer = function() { return new Renderbuffer(); };

ReferenceContext.prototype.pixelStorei = function(pname, param) {
    switch (pname)    {
        case gl.UNPACK_ALIGNMENT:
            if (this.condtionalSetError((param != 1 && param != 2 && param != 4 && param != 8), gl.INVALID_VALUE)) return;
            this.m_pixelUnpackAlignment = param;
            break;

        case gl.PACK_ALIGNMENT:
            if (this.condtionalSetError((param != 1 && param != 2 && param != 4 && param != 8), gl.INVALID_VALUE)) return;
            this.m_pixelPackAlignment = param;
            break;

        case gl.UNPACK_ROW_LENGTH:
            if (this.condtionalSetError(param < 0, gl.INVALID_VALUE)) return;
            this.m_pixelUnpackRowLength = param;
            break;

        case gl.UNPACK_SKIP_ROWS:
            if (this.condtionalSetError(param < 0, gl.INVALID_VALUE)) return;
            this.m_pixelUnpackSkipRows = param;
            break;

        case gl.UNPACK_SKIP_PIXELS:
            if (this.condtionalSetError(param < 0, gl.INVALID_VALUE)) return;
            this.m_pixelUnpackSkipPixels = param;
            break;

        case gl.UNPACK_IMAGE_HEIGHT:
            if (this.condtionalSetError(param < 0, gl.INVALID_VALUE)) return;
            this.m_pixelUnpackImageHeight = param;
            break;

        case gl.UNPACK_SKIP_IMAGES:
            if (this.condtionalSetError(param < 0, gl.INVALID_VALUE)) return;
            this.m_pixelUnpackSkipImages = param;
            break;

        default:
            this.setError(gl.INVALID_ENUM);
    }
};

ReferenceContext.prototype.clearColor = function(red, green, blue, alpha) {
    this.m_clearColor = [deMath.clamp(red,  0, 1),
                        deMath.clamp(green,    0, 1),
                        deMath.clamp(blue, 0, 1),
                        deMath.clamp(alpha,    0, 1)];
};

ReferenceContext.prototype.clearDepthf = function(depth) {
    this.m_clearDepth = deMath.clamp(depth, 0, 1);
}

ReferenceContext.prototype.clearStencil = function(stencil) {
    this.m_clearStencil = stencil;
};

ReferenceContext.prototype.scissor = function(x, y, width, height) {
    if (this.condtionalSetError(width < 0 || height < 0, gl.INVALID_VALUE))
        return;
    this.m_scissorBox = [x, y, width, height];
};

ReferenceContext.prototype.enable = function(cap) {
    switch (cap) {
        case gl.BLEND:                  this.m_blendEnabled              = true; break;
        case gl.SCISSOR_TEST:           this.m_scissorEnabled            = true; break;
        case gl.DEPTH_TEST:             this.m_depthTestEnabled          = true; break;
        case gl.STENCIL_TEST:           this.m_stencilTestEnabled        = true; break;
        case gl.POLYGON_OFFSET_FILL:    this.m_polygonOffsetFillEnabled  = true; break;

        case gl.DITHER:
            // Not implemented - just ignored.
            break;

        default:
            this.setError(gl.INVALID_ENUM);
            break;
    }
};

ReferenceContext.prototype.disable = function(cap) {
    switch (cap) {
        case gl.BLEND:                  this.m_blendEnabled              = false; break;
        case gl.SCISSOR_TEST:           this.m_scissorEnabled            = false; break;
        case gl.DEPTH_TEST:             this.m_depthTestEnabled          = false; break;
        case gl.STENCIL_TEST:           this.m_stencilTestEnabled        = false; break;
        case gl.POLYGON_OFFSET_FILL:    this.m_polygonOffsetFillEnabled  = false; break;

        case gl.DITHER:
            // Not implemented - just ignored.
            break;

        default:
            this.setError(gl.INVALID_ENUM);
            break;
    }
};

ReferenceContext.prototype.stencilFunc = function(func, ref, mask) {
    this.stencilFuncSeparate(gl.FRONT_AND_BACK, func, ref, mask);
}

ReferenceContext.prototype.stencilFuncSeparate = function(face, func, ref, mask)
{
    var  setFront    = face == gl.FRONT || face == gl.FRONT_AND_BACK;
    var  setBack     = face == gl.BACK || face == gl.FRONT_AND_BACK;

    if (this.condtionalSetError(!isValidCompareFunc(func), gl.INVALID_ENUM))
        return;
    if (this.condtionalSetError(!setFront && !setBack, gl.INVALID_ENUM))
        return;

    for (var type in FaceType) {
        if ((type == FaceType.FACETYPE_FRONT && setFront) ||
            (type == FaceType.FACETYPE_BACK && setBack))
        {
            this.m_stencil[type].func    = func;
            this.m_stencil[type].ref     = ref;
            this.m_stencil[type].opMask  = mask;
        }
    }
};

var isValidCompareFunc = function(func) {
    switch (func)
    {
        case gl.NEVER:
        case gl.LESS:
        case gl.LEQUAL:
        case gl.GREATER:
        case gl.GEQUAL:
        case gl.EQUAL:
        case gl.NOTEQUAL:
        case gl.ALWAYS:
            return true;

        default:
            return false;
    }
};

var isValidStencilOp = function(op) {
    switch (op)
    {
        case gl.KEEP:
        case gl.ZERO:
        case gl.REPLACE:
        case gl.INCR:
        case gl.INCR_WRAP:
        case gl.DECR:
        case gl.DECR_WRAP:
        case gl.INVERT:
            return true;

        default:
            return false;
    }
};

ReferenceContext.prototype.stencilOp = function(sfail, dpfail, dppass) {
    this.stencilOpSeparate(gl.FRONT_AND_BACK, sfail, dpfail, dppass);
}

ReferenceContext.prototype.stencilOpSeparate = function(face, sfail, dpfail, dppass) {
    var  setFront    = face == gl.FRONT || face == gl.FRONT_AND_BACK;
    var  setBack     = face == gl.BACK || face == gl.FRONT_AND_BACK;

    if (this.condtionalSetError((!isValidStencilOp(sfail)    ||
                !isValidStencilOp(dpfail)   ||
                !isValidStencilOp(dppass)),
                gl.INVALID_ENUM))
        return;

    if (this.condtionalSetError(!setFront && !setBack, gl.INVALID_ENUM))
        return;

   for (var type in FaceType) {
        if ((type == FaceType.FACETYPE_FRONT && setFront) ||
            (type == FaceType.FACETYPE_BACK && setBack))
        {
            this.m_stencil[type].opStencilFail   = sfail;
            this.m_stencil[type].opDepthFail     = dpfail;
            this.m_stencil[type].opDepthPass     = dppass;
        }
    }
};

ReferenceContext.prototype.depthFunc = function(func) {
    if (this.condtionalSetError(!isValidCompareFunc(func), gl.INVALID_ENUM))
        return;
    this.m_depthFunc = func;
};

ReferenceContext.prototype.depthRange = function(n, f) {
    this.m_depthRangeNear = deMath.clamp(n, 0, 1);
    this.m_depthRangeFar = deMath.clamp(f, 0, 1);
};

ReferenceContext.prototype.polygonOffset = function(factor, units) {
    this.m_polygonOffsetFactor = factor;
    this.m_polygonOffsetUnits = units;
};

var isValidBlendEquation = function(mode) {
    return mode == gl.FUNC_ADD              ||
           mode == gl.FUNC_SUBTRACT         ||
           mode == gl.FUNC_REVERSE_SUBTRACT ||
           mode == gl.MIN                   ||
           mode == gl.MAX;
};

var isValidBlendFactor = function(factor) {
    switch (factor)
    {
        case gl.ZERO:
        case gl.ONE:
        case gl.SRC_COLOR:
        case gl.ONE_MINUS_SRC_COLOR:
        case gl.DST_COLOR:
        case gl.ONE_MINUS_DST_COLOR:
        case gl.SRC_ALPHA:
        case gl.ONE_MINUS_SRC_ALPHA:
        case gl.DST_ALPHA:
        case gl.ONE_MINUS_DST_ALPHA:
        case gl.CONSTANT_COLOR:
        case gl.ONE_MINUS_CONSTANT_COLOR:
        case gl.CONSTANT_ALPHA:
        case gl.ONE_MINUS_CONSTANT_ALPHA:
        case gl.SRC_ALPHA_SATURATE:
            return true;

        default:
            return false;
    }
};

ReferenceContext.prototype.blendEquation = function(mode) {
    if (this.condtionalSetError(!isValidBlendEquation(mode), gl.INVALID_ENUM))
        return;
    this.m_blendModeRGB      = mode;
    this.m_blendModeAlpha    = mode;
};

ReferenceContext.prototype.blendEquationSeparate = function(modeRGB, modeAlpha) {
    if (this.condtionalSetError(!isValidBlendEquation(modeRGB) ||
                !isValidBlendEquation(modeAlpha),
                gl.INVALID_ENUM))
        return;

    this.m_blendModeRGB      = modeRGB;
    this.m_blendModeAlpha    = modeAlpha;
};

ReferenceContext.prototype.blendFunc = function(src, dst) {
    if (this.condtionalSetError(!isValidBlendFactor(src) ||
                !isValidBlendFactor(dst),
                gl.INVALID_ENUM))
        return;

    this.m_blendFactorSrcRGB     = src;
    this.m_blendFactorSrcAlpha   = src;
    this.m_blendFactorDstRGB     = dst;
    this.m_blendFactorDstAlpha   = dst;
};

ReferenceContext.prototype.blendFuncSeparate = function(srcRGB, dstRGB, srcAlpha, dstAlpha) {
    if (this.condtionalSetError(!isValidBlendFactor(srcRGB)     ||
                !isValidBlendFactor(dstRGB)     ||
                !isValidBlendFactor(srcAlpha)   ||
                !isValidBlendFactor(dstAlpha),
                gl.INVALID_ENUM))
        return;

    this.m_blendFactorSrcRGB     = srcRGB;
    this.m_blendFactorSrcAlpha   = srcAlpha;
    this.m_blendFactorDstRGB     = dstRGB;
    this.m_blendFactorDstAlpha   = dstAlpha;
};

ReferenceContext.prototype.blendColor = function(red, green, blue, alpha){
    this.m_blendColor = [deMath.clamp(red,  0, 1),
                        deMath.clamp(green,    0, 1),
                        deMath.clamp(blue, 0, 1),
                        deMath.clamp(alpha,    0, 1)];
};

ReferenceContext.prototype.colorMask = function(r, g, b, a) {
    this.m_colorMask = [r, g, b, a];
};

ReferenceContext.prototype.depthMask = function(mask) {
    this.m_depthMask = mask;
};

ReferenceContext.prototype.stencilMask = function(mask) {
    this.stencilMaskSeparate(gl.FRONT_AND_BACK, mask);
};

ReferenceContext.prototype.stencilMaskSeparate = function(face, mask) {
    var  setFront    = face == gl.FRONT || face == gl.FRONT_AND_BACK;
    var  setBack     = face == gl.BACK || face == gl.FRONT_AND_BACK;

    if (this.condtionalSetError(!setFront && !setBack, gl.INVALID_ENUM))
        return;

    if (setFront)   this.m_stencil[FaceType.FACETYPE_FRONT].writeMask = mask;
    if (setBack)    this.m_stencil[FaceType.FACETYPE_BACK].writeMask  = mask;
};

ReferenceContext.prototype.bindVertexArray = function(array){
    if (array)
        this.m_vertexArrayBinding = array;
    else
        this.m_vertexArrayBinding = this.m_defaultVAO;
};

ReferenceContext.prototype.createVertexArray = function() { return new VertexArray(this.m_limits.maxVertexAttribs); };

ReferenceContext.prototype.vertexAttribPointer = function(index, rawSize, type, normalized, stride, offset) {
    var allowBGRA    = false;
    var effectiveSize = (allowBGRA && rawSize == gl.BGRA) ? (4) : (rawSize);

    if (this.condtionalSetError(index >= this.m_limits.maxVertexAttribs, gl.INVALID_VALUE))
        return;
    if (this.condtionalSetError(effectiveSize <= 0 || effectiveSize > 4, gl.INVALID_VALUE))
        return;
    if (this.condtionalSetError(type != gl.BYTE                 &&  type != gl.UNSIGNED_BYTE    &&
                type != gl.SHORT                &&  type != gl.UNSIGNED_SHORT   &&
                type != gl.INT                  &&  type != gl.UNSIGNED_INT     &&
                type != gl.FIXED                &&  type != gl.DOUBLE           &&
                type != gl.FLOAT                &&  type != gl.HALF_FLOAT       &&
                type != gl.INT_2_10_10_10_REV   &&  type != gl.UNSIGNED_INT_2_10_10_10_REV, gl.INVALID_ENUM))
        return;
    if (this.condtionalSetError(normalized != true && normalized != false, gl.INVALID_ENUM))
        return;
    if (this.condtionalSetError(stride < 0, gl.INVALID_VALUE))
        return;
    if (this.condtionalSetError((type == gl.INT_2_10_10_10_REV || type == gl.UNSIGNED_INT_2_10_10_10_REV) && effectiveSize != 4, gl.INVALID_OPERATION))
        return;
    if (this.condtionalSetError(this.m_vertexArrayBinding != null && this.m_arrayBufferBinding == null && offset != 0, gl.INVALID_OPERATION))
        return;
    if (this.condtionalSetError(allowBGRA && rawSize == gl.BGRA && type != gl.INT_2_10_10_10_REV && type != gl.UNSIGNED_INT_2_10_10_10_REV && type != gl.UNSIGNED_BYTE, gl.INVALID_OPERATION))
        return;
    if (this.condtionalSetError(allowBGRA && rawSize == gl.BGRA && normalized == false, gl.INVALID_OPERATION))
        return;

    var array = this.m_vertexArrayBinding.m_arrays[index];

    array.size            = rawSize;
    array.stride          = stride;
    array.type            = type;
    array.normalized      = normalized;
    array.integer         = false;
    array.offset         = offset;

    array.bufferBinding   = this.m_arrayBufferBinding;
};

ReferenceContext.prototype.vertexAttribIPointer = function(index, size, type, stride, offset) {
    if (this.condtionalSetError(index >= this.m_limits.maxVertexAttribs, gl.INVALID_VALUE))
        return;
    if (this.condtionalSetError(size <= 0 || size > 4, gl.INVALID_VALUE))
        return;
    if (this.condtionalSetError(type != gl.BYTE                 &&  type != gl.UNSIGNED_BYTE    &&
                type != gl.SHORT                &&  type != gl.UNSIGNED_SHORT   &&
                type != gl.INT                  &&  type != gl.UNSIGNED_INT, gl.INVALID_ENUM))
        return;
    if (this.condtionalSetError(stride < 0, gl.INVALID_VALUE))
        return;
    if (this.condtionalSetError(this.m_vertexArrayBinding != null && this.m_arrayBufferBinding == null && offset != 0, gl.INVALID_OPERATION))
        return;

    var array = this.m_vertexArrayBinding.m_arrays[index];

    array.size            = size;
    array.stride          = stride;
    array.type            = type;
    array.normalized      = false;
    array.integer         = true;
    array.offset         = offset;

    array.bufferBinding   = this.m_arrayBufferBinding;
};

ReferenceContext.prototype.enableVertexAttribArray = function(index) {
     if (this.condtionalSetError(index >= this.m_limits.maxVertexAttribs, gl.INVALID_VALUE))
        return;

    this.m_vertexArrayBinding.m_arrays[index].enabled = true;
};

ReferenceContext.prototype.disableVertexAttribArray = function(index) {
     if (this.condtionalSetError(index >= this.m_limits.maxVertexAttribs, gl.INVALID_VALUE))
        return;

    this.m_vertexArrayBinding.m_arrays[index].enabled = false;
};

ReferenceContext.prototype.vertexAttribDivisor = function(index, divisor) {
      if (this.condtionalSetError(index >= this.m_limits.maxVertexAttribs, gl.INVALID_VALUE))
        return;

    this.m_vertexArrayBinding.m_arrays[index].divisor = divisor;
};

ReferenceContext.prototype.vertexAttrib1f = function(index, x) {
      if (this.condtionalSetError(index >= this.m_limits.maxVertexAttribs, gl.INVALID_VALUE))
        return;

    this.m_currentAttribs[index] = new GenericVec4(x, 0, 0, 1);
};

ReferenceContext.prototype.vertexAttrib2f = function(index, x, y) {
      if (this.condtionalSetError(index >= this.m_limits.maxVertexAttribs, gl.INVALID_VALUE))
        return;

    this.m_currentAttribs[index] = new GenericVec4(x, y, 0, 1);
};

ReferenceContext.prototype.vertexAttrib3f = function(index, x, y, z) {
      if (this.condtionalSetError(index >= this.m_limits.maxVertexAttribs, gl.INVALID_VALUE))
        return;

    this.m_currentAttribs[index] = new GenericVec4(x, y, z, 1);
};
ReferenceContext.prototype.vertexAttrib4f = function(index, x, y, z, w) {
      if (this.condtionalSetError(index >= this.m_limits.maxVertexAttribs, gl.INVALID_VALUE))
        return;

    this.m_currentAttribs[index] = new GenericVec4(x, y, z, w);
};

var isValidBufferTarget = function(target) {
    switch (target)
    {
        case  gl.ARRAY_BUFFER:
        case  gl.COPY_READ_BUFFER:
        case  gl.COPY_WRITE_BUFFER:
        case  gl.DRAW_INDIRECT_BUFFER:
        case  gl.ELEMENT_ARRAY_BUFFER:
        case  gl.PIXEL_PACK_BUFFER:
        case  gl.PIXEL_UNPACK_BUFFER:
        case  gl.TRANSFORM_FEEDBACK_BUFFER:
        case  gl.UNIFORM_BUFFER:
            return true;

        default:
            return false;
    }
}

ReferenceContext.prototype.setBufferBinding = function(target, buffer) {
    switch (target)
    {
        case  gl.ARRAY_BUFFER:               this.m_arrayBufferBinding                           = buffer;     break
        case  gl.COPY_READ_BUFFER:           this.m_copyReadBufferBinding                        = buffer;     break
        case  gl.COPY_WRITE_BUFFER:          this.m_copyWriteBufferBinding                       = buffer;     break
        case  gl.DRAW_INDIRECT_BUFFER:       this.m_drawIndirectBufferBinding                    = buffer;     break
        case  gl.ELEMENT_ARRAY_BUFFER:       this.m_vertexArrayBinding.m_elementArrayBufferBinding = buffer;     break
        case  gl.PIXEL_PACK_BUFFER:          this.m_pixelPackBufferBinding                       = buffer;     break
        case  gl.PIXEL_UNPACK_BUFFER:        this.m_pixelUnpackBufferBinding                     = buffer;     break
        case  gl.TRANSFORM_FEEDBACK_BUFFER:  this.m_transformFeedbackBufferBinding               = buffer;     break
        case  gl.UNIFORM_BUFFER:             this.m_uniformBufferBinding                         = buffer;     break
        default:
            throw new Error("Unrecognized target: " + target);
    }
};

ReferenceContext.prototype.getBufferBinding = function(target) {
    switch (target)
    {
        case  gl.ARRAY_BUFFER:               return this.m_arrayBufferBinding;
        case  gl.COPY_READ_BUFFER:           return this.m_copyReadBufferBinding;
        case  gl.COPY_WRITE_BUFFER:          return this.m_copyWriteBufferBinding;
        case  gl.DRAW_INDIRECT_BUFFER:       return this.m_drawIndirectBufferBinding;
        case  gl.ELEMENT_ARRAY_BUFFER:       return this.m_vertexArrayBinding.m_elementArrayBufferBinding;
        case  gl.PIXEL_PACK_BUFFER:          return this.m_pixelPackBufferBinding;
        case  gl.PIXEL_UNPACK_BUFFER:        return this.m_pixelUnpackBufferBinding;
        case  gl.TRANSFORM_FEEDBACK_BUFFER:  return this.m_transformFeedbackBufferBinding;
        case  gl.UNIFORM_BUFFER:             return this.m_uniformBufferBinding;
        default:
            throw new Error("Unrecognized target: " + target);
    }
};

ReferenceContext.prototype.bindBuffer = function(target, buffer) {
    if (this.condtionalSetError(!isValidBufferTarget(target),  gl.INVALID_ENUM))
        return;

    this.setBufferBinding(target, buffer);
};

ReferenceContext.prototype.createBuffer = function() { return new DataBuffer(); };

ReferenceContext.prototype.bufferData = function(target, input, usage) {
    if (this.condtionalSetError(!isValidBufferTarget(target), gl.INVALID_ENUM))
        return;
    var buffer = this.getBufferBinding(target);
    if (this.condtionalSetError(!buffer, gl.INVALID_OPERATION))
        return;

    if (typeof input == 'number') {
        if (this.condtionalSetError(input < 0, gl.INVALID_VALUE))
            return;
        buffer.setStorage(input);
    } else {
        buffer.setData(input);
    }
};

ReferenceContext.prototype.bufferSubData = function(target, offset, data) {
    if (this.condtionalSetError(!isValidBufferTarget(target), gl.INVALID_ENUM))
        return;
    if (this.condtionalSetError(offset < 0, gl.INVALID_VALUE))
        return;
    var buffer = this.getBufferBinding(target);
    if (this.condtionalSetError(!buffer, gl.INVALID_OPERATION))
        return;

    if (this.condtionalSetError(offset + data.byteLength > buffer.getSize(), gl.INVALID_VALUE))
        return;
    buffer.setSubData(offset, data);
};


ReferenceContext.prototype.readPixels = function(x, y, width, height, format, type, pixels) {
    var    src = this.getReadColorbuffer();

    // Map transfer format.
    var transferFmt = gluTextureUtil.mapGLTransferFormat(format, type);

    // Clamp input values
    var copyX         = deMath.clamp(x,      0, src.raw().getHeight());
    var copyY         = deMath.clamp(y,      0, src.raw().getDepth());
    var copyWidth     = deMath.clamp(width,  0, src.raw().getHeight()-x);
    var copyHeight    = deMath.clamp(height, 0, src.raw().getDepth()-y);

    var data;
    var offset;
    if (this.m_pixelPackBufferBinding) {
        if (this.condtionalSetError(typeof pixels !== 'number', gl.INVALID_VALUE))
            return;
        data = this.m_pixelPackBufferBinding.getData();
        offset = pixels;
    } else {
        data = pixels;
        offset = 0;
    }

    var dst = new tcuTexture.PixelBufferAccess({
        format: transferFmt,
        width: width,
        heigth: height,
        depth: 1,
        rowPitch: deMath.deAlign32(width*transferFmt.getPixelSize(), this.m_pixelPackAlignment),
        slicePitch: 0,
        data: data,
        offset: offset});

    src = tcuTextureUtil.getSubregion(src, copyX, copyY, 0, copyWidth, copyHeight, 1);
    src.resolveMultisampleColorBuffer(tcuTextureUtil.getSubregion(dst, 0, 0, 0, copyWidth, copyHeight, 1));
};

var nullAccess = function() {
    return new tcuTexture.PixelBufferAccess({
        width: 0,
        height: 0});
};

ReferenceContext.prototype.getFboAttachment = function(framebuffer, point) {
    var attachment = framebuffer.getAttachment(point);

    switch (attachment.type) {
        case AttachmentType.ATTACHMENTTYPE_TEXTURE: {
            var texture = attachment.object;

            if (texture.getType() == TextureType.TYPE_2D)
                return texture.getLevel(attachment.level);
            else if (texture.getType() == TextureType.TYPE_CUBE_MAP)
                return texture.getFace(attachment.level, texTargetToFace(attachment.texTarget));
            else if (texture.getType() == TextureType.TYPE_2D_ARRAY   ||
                     texture.getType() == TextureType.TYPE_3D         ||
                     texture.getType() == TextureType.TYPE_CUBE_MAP_ARRAY)
            {
                var level = texture.getLevel(attachment.level);

                return new tcuTexture.PixelBufferAccess({
                    format: level.getFormat(),
                    width: level.getWidth(),
                    height: level.getHeight(),
                    depth: 1,
                    rowPitch: level.getRowPitch(),
                    slicePitch: 0,
                    data: level.getDataPtr(),
                    offset: level.getSlicePitch() * attachment.layer});
            }
            else
                return nullAccess();
        }

        case AttachmentType.ATTACHMENTTYPE_RENDERBUFFER: {
            var rbo = attachment.object;
            return rbo.getAccess();
        }

        default:
            return nullAccess();
    }
}

ReferenceContext.prototype.getReadColorbuffer = function()  {
    if (this.m_readFramebufferBinding)
         return rrMultisamplePixelBufferAccess.fromSinglesampleAccess(this.getFboAttachment(this.m_readFramebufferBinding, AttachmentPoint.ATTACHMENTPOINT_COLOR0));
    else
        return this.m_defaultColorbuffer;
};

return {
    ReferenceContext: ReferenceContext
};

});
