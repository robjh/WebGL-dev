/*-------------------------------------------------------------------------
 * drawElements Quality Program OpenGL ES Utilities
 * ------------------------------------------------
 *
 * Copyright 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

'use strict';
goog.provide('functional.gles3.es3fFboColorbufferTests');
goog.require('framework.common.tcuSurface');
goog.require('framework.common.tcuTestCase');
goog.require('framework.common.tcuTexture');
goog.require('framework.opengl.gluTextureUtil');
goog.require('functional.gles3.es3fFboTestCase');
goog.require('functional.gles3.es3fFboTestUtil');
goog.require('framework.common.tcuRGBA');
goog.require('framework.delibs.debase.deRandom');
goog.require('framework.common.tcuImageCompare');
goog.require('framework.common.tcuTextureUtil');
goog.require('framework.referencerenderer.rrUtil');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.opengl.gluShaderUtil');


goog.scope(function() {
var es3fFboColorbufferTests = functional.gles3.es3fFboColorbufferTests;
var es3fFboTestCase = functional.gles3.es3fFboTestCase;
var es3fFboTestUtil = functional.gles3.es3fFboTestUtil;
var tcuTestCase = framework.common.tcuTestCase;
var tcuSurface = framework.common.tcuSurface;
var tcuTexture = framework.common.tcuTexture;
var gluTextureUtil = framework.opengl.gluTextureUtil;
var tcuRGBA = framework.common.tcuRGBA;
var deRandom = framework.delibs.debase.deRandom;
var tcuImageCompare = framework.common.tcuImageCompare;
var tcuTextureUtil = framework.common.tcuTextureUtil;
var rrUtil = framework.referencerenderer.rrUtil;
var deMath = framework.delibs.debase.deMath;
var gluShaderUtil = framework.opengl.gluShaderUtil;

/** @type {WebGL2RenderingContext} */ var gl;


/** @const*/  var MIN_THRESHOLD = new tcuRGBA.RGBA([12, 12, 12, 12]);

var setParentClass = function(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};

/**
 * @param {deRandom.Random} rnd
 * @param {Array<number>} minVal
 * @param {Array<number>} maxVal
 * @return {Array<number>}
 */
es3fFboColorbufferTests.randomVector = function(rnd, minVal, maxVal)
{
    var res = [];
    for (var ndx = 0; ndx < minVal.length; ndx++)
        res[ndx] = rnd.getFloat(minVal[ndx], maxVal[ndx]);
    return res;
};

/**
 * @param {deRandom.Random} rnd
 * @return {Array<number>}
 */
es3fFboColorbufferTests.generateRandomColor = function(rnd)
{
    var retVal = [];

    for (var i = 0; i < 3; ++i)
        retVal[i] = rnd.getFloat();
    retVal[3] = 1;

    return retVal;
};

/**
 * @constructor
 * @extends {es3fFboTestCase.FboTestCase}
 * @param {string} name
 * @param {string} desc
 * @param {number} format
 */
es3fFboColorbufferTests.FboColorbufferCase = function(name, desc, format) {
    es3fFboTestCase.FboTestCase.call(this, name, desc);
    this.m_format = format;
};

setParentClass(es3fFboColorbufferTests.FboColorbufferCase, es3fFboTestCase.FboTestCase);

/**
 * @param {tcuSurface.Surface} reference
 * @param {tcuSurface.Surface} result
 * @return {boolean}
 */
es3fFboColorbufferTests.FboColorbufferCase.prototype.compare = function(reference, result)
    {
        /** @type {tcuRGBA.RGBA} */ var  threshold = tcuRGBA.max(es3fFboTestUtil.getFormatThreshold(this.m_format), MIN_THRESHOLD);

        bufferedLogToConsole("Comparing images, threshold: " + threshold);

        return tcuImageCompare.bilinearCompare("Result", "Image comparison result", reference.getAccess(), result.getAccess(), threshold);
    };

/**
 * @constructor
 * @extends {es3fFboColorbufferTests.FboColorbufferCase}
 * @param {string} name
 * @param {string} desc
 * @param {number} format
 * @param {number} width
 * @param {number} height
 */
es3fFboColorbufferTests.FboColorClearCase = function(name, desc, format, width, height) {
    es3fFboColorbufferTests.FboColorbufferCase.call(this, name, desc, format);
    this.m_width = width;
    this.m_height = height;
};

setParentClass(es3fFboColorbufferTests.FboColorClearCase, es3fFboColorbufferTests.FboColorbufferCase);


es3fFboColorbufferTests.FboColorClearCase.prototype.preCheck = function()
    {
        this.checkFormatSupport(this.m_format);
    }

es3fFboColorbufferTests.FboColorClearCase.prototype.render = function (dst)
    {
        var ctx = this.getCurrentContext();
        var fboFormat   = gluTextureUtil.mapGLInternalFormat(this.m_format);
        var fmtClass    = tcuTexture.getTextureChannelClass(fboFormat.type);
        var fmtInfo     = tcuTextureUtil.getTextureFormatInfo(fboFormat);
        var rnd = new deRandom.Random(17);
        var numClears   = 16;

        var fbo = ctx.createFramebuffer();
        var rbo = ctx.createRenderbuffer();

        ctx.bindRenderbuffer(gl.RENDERBUFFER, rbo);
        ctx.renderbufferStorage(gl.RENDERBUFFER, this.m_format, this.m_width, this.m_height);
        this.checkError();

        ctx.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        ctx.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbo);
        this.checkError();
        this.checkFramebufferStatus(gl.FRAMEBUFFER);

        ctx.viewport(0, 0, this.m_width, this.m_height);

        // Initialize to transparent black.
        switch (fmtClass)
        {
            case tcuTexture.TextureChannelClass.FLOATING_POINT:
            case tcuTexture.TextureChannelClass.SIGNED_FIXED_POINT:
            case tcuTexture.TextureChannelClass.UNSIGNED_FIXED_POINT:
                ctx.clearBufferfv(gl.COLOR, 0, new Float32Array(4));
                break;

            case tcuTexture.TextureChannelClass.UNSIGNED_INTEGER:
                ctx.clearBufferuiv(gl.COLOR, 0, new Uint32Array(4));
                break;

            case tcuTexture.TextureChannelClass.SIGNED_INTEGER:
                ctx.clearBufferiv(gl.COLOR, 0, new Int32Array(4));
                break;

            default:
                throw new Error('Invalid channelclass ' + fmtClass);
        }

        // Do random scissored clears.
        ctx.enable(gl.SCISSOR_TEST);
        for (var ndx = 0; ndx < numClears; ndx++)
        {
            var x       = rnd.getInt(0, this.m_width     - 1);
            var y       = rnd.getInt(0, this.m_height    - 1);
            var w       = rnd.getInt(1, this.m_width     - x);
            var h       = rnd.getInt(1, this.m_height    - y);
            var color   = es3fFboColorbufferTests.randomVector(rnd, fmtInfo.valueMin, fmtInfo.valueMax);

            ctx.scissor(x, y, w, h);
            ctx.clearBufferfv(gl.COLOR, 0, color);

            switch (fmtClass)
            {
                case tcuTexture.TextureChannelClass.FLOATING_POINT:
                case tcuTexture.TextureChannelClass.SIGNED_FIXED_POINT:
                case tcuTexture.TextureChannelClass.UNSIGNED_FIXED_POINT:
                    ctx.clearBufferfv(gl.COLOR, 0, color);
                    break;

                case tcuTexture.TextureChannelClass.UNSIGNED_INTEGER:
                    ctx.clearBufferuiv(gl.COLOR, 0, color);
                    break;

                case tcuTexture.TextureChannelClass.SIGNED_INTEGER:
                    ctx.clearBufferiv(gl.COLOR, 0, color);
                    break;

                default:
                    throw new Error('Invalid channelclass ' + fmtClass);
            }
        }

        // Read results from renderbuffer.
        this.readPixelsUsingFormat(dst, 0, 0, this.m_width, this.m_height, fboFormat, fmtInfo.lookupScale, fmtInfo.lookupBias);
        this.checkError();
    }

/**
 * @constructor
 * @extends {es3fFboColorbufferTests.FboColorbufferCase}
 * @param {string} name
 * @param {string} desc
 * @param {number} tex0Fmt
 * @param {Array<number>} tex0Size
 * @param {number} tex1Fmt
 * @param {Array<number>} tex1Size
 */
es3fFboColorbufferTests.FboColorMultiTex2DCase = function(name, desc, tex0Fmt, tex0Size, tex1Fmt, tex1Size) {
    es3fFboColorbufferTests.FboColorbufferCase.call(this, name, desc, tex0Fmt);
    this.m_tex0Fmt = tex0Fmt;
    this.m_tex0Size = tex0Size;
    this.m_tex1Fmt = tex1Fmt;
    this.m_tex1Size = tex1Size;
};

setParentClass(es3fFboColorbufferTests.FboColorMultiTex2DCase, es3fFboColorbufferTests.FboColorbufferCase);

es3fFboColorbufferTests.FboColorMultiTex2DCase.prototype.preCheck = function()
    {
        this.checkFormatSupport(this.m_tex0Fmt);
        this.checkFormatSupport(this.m_tex1Fmt);
    };

es3fFboColorbufferTests.FboColorMultiTex2DCase.prototype.render = function (dst)
    {
        var ctx = this.getCurrentContext();
        var texFmt0   = gluTextureUtil.mapGLInternalFormat(this.m_tex0Fmt);
        var texFmt1   = gluTextureUtil.mapGLInternalFormat(this.m_tex1Fmt);
        var fmtInfo0     = tcuTextureUtil.getTextureFormatInfo(texFmt0);
        var fmtInfo1     = tcuTextureUtil.getTextureFormatInfo(texFmt1);


        /** @type {es3fFboTestUtil.Texture2DShader} */
        var texToFbo0Shader = new es3fFboTestUtil.Texture2DShader(
            [gluShaderUtil.DataType.SAMPLER_2D], es3fFboTestUtil.getFragmentOutputType(texFmt0),
            deMath.subtract(fmtInfo0.valueMax, fmtInfo0.valueMin),
            fmtInfo0.valueMin);

        /** @type {es3fFboTestUtil.Texture2DShader} */
        var texToFbo1Shader = new es3fFboTestUtil.Texture2DShader(
            [gluShaderUtil.DataType.SAMPLER_2D], es3fFboTestUtil.getFragmentOutputType(texFmt1),
            deMath.subtract(fmtInfo1.valueMax, fmtInfo1.valueMin),
            fmtInfo1.valueMin);

        /** @type {es3fFboTestUtil.Texture2DShader} */
        var multiTexShader = new es3fFboTestUtil.Texture2DShader(
            [gluTextureUtil.getSampler2DType(texFmt0), gluTextureUtil.getSampler2DType(texFmt1)],
            gluShaderUtil.DataType.FLOAT_VEC4);

        var texToFbo0ShaderID = ctx.createProgram(texToFbo0Shader);
        var texToFbo1ShaderID = ctx.createProgram(texToFbo1Shader);
        var multiTexShaderID  = ctx.createProgram(multiTexShader);

        // Setup shaders
        multiTexShader.setTexScaleBias(0, deMath.scale(fmtInfo0.lookupScale, 0.5), deMath.scale(fmtInfo0.lookupBias, 0.5));
        multiTexShader.setTexScaleBias(1, deMath.scale(fmtInfo1.lookupScale, 0.5), deMath.scale(fmtInfo1.lookupBias, 0.5));
        texToFbo0Shader.setUniforms(ctx, texToFbo0ShaderID);
        texToFbo1Shader.setUniforms(ctx, texToFbo1ShaderID);
        multiTexShader.setUniforms (ctx, multiTexShaderID);

        var fbo0 = ctx.createFramebuffer();
        var fbo1 = ctx.createFramebuffer();
        var tex0 = ctx.createTexture();
        var tex1 = ctx.createTexture();

        for (var ndx = 0; ndx < 2; ndx++)
        {
            var transferFmt     = gluTextureUtil.getTransferFormat(ndx ? texFmt1 : texFmt0);
            var format          = ndx ? this.m_tex1Fmt : this.m_tex0Fmt;
            var isFilterable    = gluTextureUtil.isGLInternalColorFormatFilterable(format);
            var size            = ndx ? this.m_tex1Size : this.m_tex0Size;
            var fbo             = ndx ? fbo1 : fbo0;
            var tex             = ndx ? tex1 : tex0;

            ctx.bindTexture(gl.TEXTURE_2D, tex);
            ctx.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_S,      gl.CLAMP_TO_EDGE);
            ctx.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_T,      gl.CLAMP_TO_EDGE);
            ctx.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_MIN_FILTER,  isFilterable ? gl.LINEAR : gl.NEAREST);
            ctx.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_MAG_FILTER,  isFilterable ? gl.LINEAR : gl.NEAREST);
            ctx.texImage2D(gl.TEXTURE_2D, 0, format, size[0], size[1], 0, transferFmt.format, transferFmt.dataType, null);

            ctx.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            ctx.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            this.checkError();
            this.checkFramebufferStatus(gl.FRAMEBUFFER);
        }

        // Render textures to both framebuffers.
        for (var ndx = 0; ndx < 2; ndx++)
        {
            var format      = gl.RGBA;
            var dataType    = gl.UNSIGNED_BYTE;
            var texW        = 128;
            var texH        = 128;
            var tmpTex;
            var fbo         = ndx ? fbo1 : fbo0;
            var viewport    = ndx ? this.m_tex1Size : this.m_tex0Size;
            var data = new tcuTexture.TextureLevel(gluTextureUtil.mapGLTransferFormat(format, dataType), texW, texH, 1);

            if (ndx == 0)
                tcuTextureUtil.fillWithComponentGradients(data.getAccess(), [0, 0, 0, 0], [1, 1, 1, 1]);
            else
                tcuTextureUtil.fillWithGrid(data.getAccess(), 8, [0.2, 0.7, 0.1, 1.0], [0.7, 0.1, 0.5, 0.8]);

            tmpTex = ctx.createTexture();
            ctx.bindTexture(gl.TEXTURE_2D, tmpTex);
            ctx.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_S,      gl.CLAMP_TO_EDGE);
            ctx.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_T,      gl.CLAMP_TO_EDGE);
            ctx.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
            ctx.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_MAG_FILTER,  gl.LINEAR);
            ctx.texImage2D(gl.TEXTURE_2D, 0, format, texW, texH, 0, format, dataType, data.getAccess().getDataPtr());

            ctx.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            ctx.viewport(0, 0, viewport[0], viewport[1]);
            rrUtil.drawQuad(ctx, ndx ? texToFbo1ShaderID : texToFbo0ShaderID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);
        }

        // Render to framebuffer.
        ctx.bindFramebuffer(gl.FRAMEBUFFER, null);
        ctx.viewport(0, 0, ctx.getWidth(), ctx.getHeight());
        ctx.activeTexture(gl.TEXTURE0);
        ctx.bindTexture(gl.TEXTURE_2D, tex0);
        ctx.activeTexture(gl.TEXTURE1);
        ctx.bindTexture(gl.TEXTURE_2D, tex1);
        rrUtil.drawQuad(ctx, multiTexShaderID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);

        this.readPixels(dst, 0, 0, ctx.getWidth(), ctx.getHeight());
    };

/**
 * @constructor
 * @extends {es3fFboColorbufferTests.FboColorbufferCase}
 * @param {string} name
 * @param {string} desc
 * @param {number} texFmt
 * @param {Array<number>} texSize
 */
es3fFboColorbufferTests.FboColorTexCubeCase = function(name, desc, texFmt, texSize) {
    es3fFboColorbufferTests.FboColorbufferCase.call(this, name, desc, texFmt);
    this.m_texSize = texSize;
};

setParentClass(es3fFboColorbufferTests.FboColorTexCubeCase, es3fFboColorbufferTests.FboColorbufferCase);

es3fFboColorbufferTests.FboColorTexCubeCase.prototype.preCheck = function()
    {
        this.checkFormatSupport(this.m_format);
    }

es3fFboColorbufferTests.FboColorTexCubeCase.prototype.render = function (dst)
    {
        var ctx = this.getCurrentContext();
        var texFmt   = gluTextureUtil.mapGLInternalFormat(this.m_format);
        var fmtInfo     = tcuTextureUtil.getTextureFormatInfo(texFmt);

        var cubeGLFaces = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        var cubeTexFaces = [
            tcuTexture.CubeFace.CUBEFACE_POSITIVE_X,
            tcuTexture.CubeFace.CUBEFACE_POSITIVE_Y,
            tcuTexture.CubeFace.CUBEFACE_POSITIVE_Z,
            tcuTexture.CubeFace.CUBEFACE_NEGATIVE_X,
            tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Y,
            tcuTexture.CubeFace.CUBEFACE_NEGATIVE_Z
        ];

        var rnd = new deRandom.Random(21);

        /** @type {es3fFboTestUtil.Texture2DShader} */
        var texToFboShader = new es3fFboTestUtil.Texture2DShader(
            [gluShaderUtil.DataType.SAMPLER_2D], es3fFboTestUtil.getFragmentOutputType(texFmt),
            deMath.subtract(fmtInfo.valueMax, fmtInfo.valueMin),
            fmtInfo.valueMin);

        /** @type {es3fFboTestUtil.TextureCubeShader} */
        var cubeTexShader = new es3fFboTestUtil.TextureCubeShader(
            gluTextureUtil.getSamplerCubeType(texFmt),
            gluShaderUtil.DataType.FLOAT_VEC4);

        var texToFboShaderID    = ctx.createProgram(texToFboShader);
        var cubeTexShaderID     = ctx.createProgram(cubeTexShader);

        // Setup shaders
        texToFboShader.setUniforms(ctx, texToFboShaderID);
        cubeTexShader.setTexScaleBias(fmtInfo.lookupScale, fmtInfo.lookupBias);

        // Framebuffers.
        var fbos = [];
        var tex;

        {
            var transferFmt     = gluTextureUtil.getTransferFormat(texFmt);
            var isFilterable    = gluTextureUtil.isGLInternalColorFormatFilterable(this.m_format);
            var size            = this.m_texSize;


            tex = ctx.createTexture();

            ctx.bindTexture(gl.TEXTURE_CUBE_MAP,      tex);
            ctx.texParameteri(gl.TEXTURE_CUBE_MAP,    gl.TEXTURE_WRAP_S,      gl.CLAMP_TO_EDGE);
            ctx.texParameteri(gl.TEXTURE_CUBE_MAP,    gl.TEXTURE_WRAP_T,      gl.CLAMP_TO_EDGE);
            ctx.texParameteri(gl.TEXTURE_CUBE_MAP,    gl.TEXTURE_MIN_FILTER,  isFilterable ? gl.LINEAR : gl.NEAREST);
            ctx.texParameteri(gl.TEXTURE_CUBE_MAP,    gl.TEXTURE_MAG_FILTER,  isFilterable ? gl.LINEAR : gl.NEAREST);

            // Generate an image and FBO for each cube face
            for (var ndx = 0; ndx < cubeGLFaces.length; ndx++)
                ctx.texImage2D(cubeGLFaces[ndx], 0, this.m_format, size[0], size[1], 0, transferFmt.format, transferFmt.dataType, null);
            this.checkError();

            for (var ndx = 0; ndx < cubeGLFaces.length; ndx++)
            {
                var layerFbo = ctx.createFramebuffer();
                ctx.bindFramebuffer(gl.FRAMEBUFFER, layerFbo);
                ctx.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, cubeGLFaces[ndx], tex, 0);
                this.checkError();
                this.checkFramebufferStatus(gl.FRAMEBUFFER);

                fbos.push(layerFbo);
            }
        }

        // Render test images to random cube faces
        var order = [];

        for (var n = 0; n < fbos.length; n++)
            order.push(n);
        rnd.shuffle(order);

        for (var ndx = 0; ndx < 4; ndx++)
        {
            var face        = order[ndx];
            var format      = gl.RGBA;
            var dataType    = gl.UNSIGNED_BYTE;
            var texW        = 128;
            var texH        = 128;
            var tmpTex;
            var fbo         = fbos[face];
            var viewport    = this.m_texSize;
            var data = new tcuTexture.TextureLevel(gluTextureUtil.mapGLTransferFormat(format, dataType), texW, texH, 1);

            tcuTextureUtil.fillWithGrid(data.getAccess(), 8, es3fFboColorbufferTests.generateRandomColor(rnd), [0, 0, 0, 0]);

            tmpTex = ctx.createTexture();
            ctx.bindTexture(gl.TEXTURE_2D, tmpTex);
            ctx.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_S,      gl.CLAMP_TO_EDGE);
            ctx.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_T,      gl.CLAMP_TO_EDGE);
            ctx.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
            ctx.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_MAG_FILTER,  gl.LINEAR);
            ctx.texImage2D(gl.TEXTURE_2D, 0, format, texW, texH, 0, format, dataType, data.getAccess().getDataPtr());

            ctx.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            ctx.viewport(0, 0, viewport[0], viewport[1]);
            rrUtil.drawQuad(ctx, texToFboShaderID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);
            this.checkError();

            // Render to framebuffer
            {
                var p0  = [(ndx % 2) - 1.0, Math.floor(ndx / 2) - 1.0, 0.0];
                var p1  = deMath.add(p0, [1.0, 1.0, 0.0]);

                ctx.bindFramebuffer(gl.FRAMEBUFFER, null);
                ctx.viewport(0, 0, ctx.getWidth(), ctx.getHeight());

                ctx.activeTexture(gl.TEXTURE0);
                ctx.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

                cubeTexShader.setFace(cubeTexFaces[face]);
                cubeTexShader.setUniforms(ctx, cubeTexShaderID);

                rrUtil.drawQuad(ctx, cubeTexShaderID, p0, p1);
                this.checkError();
            }
        }

        this.readPixels(dst, 0, 0, ctx.getWidth(), ctx.getHeight());
    };


// class FboColorTex2DArrayCase : public FboColorbufferCase
// {
// public:
//     FboColorTex2DArrayCase (Context& context, const char* name, const char* description, deUint32 texFmt, const IVec3& texSize)
//         : FboColorbufferCase    (context, name, description, texFmt)
//         , m_texSize             (texSize)
//     {
//     }

// protected:
//     void preCheck (void)
//     {
//         checkFormatSupport(m_format);
//     }

//     void render (tcu::Surface& dst)
//     {
//         de::Random              rnd                 (deStringHash(getName()) ^ 0xed607a89);
//         tcu::TextureFormat      texFmt              = glu::mapGLInternalFormat(m_format);
//         tcu::TextureFormatInfo  fmtInfo             = tcu::getTextureFormatInfo(texFmt);

//         Texture2DShader         texToFboShader      (DataTypes() << glu::TYPE_SAMPLER_2D, getFragmentOutputType(texFmt), fmtInfo.valueMax-fmtInfo.valueMin, fmtInfo.valueMin);
//         Texture2DArrayShader    arrayTexShader      (glu::getSampler2DArrayType(texFmt), glu::TYPE_FLOAT_VEC4);

//         deUint32                texToFboShaderID    = getCurrentContext()->createProgram(&texToFboShader);
//         deUint32                arrayTexShaderID    = getCurrentContext()->createProgram(&arrayTexShader);

//         // Setup textures
//         texToFboShader.setUniforms(*getCurrentContext(), texToFboShaderID);
//         arrayTexShader.setTexScaleBias(fmtInfo.lookupScale, fmtInfo.lookupBias);

//         // Framebuffers.
//         std::vector<deUint32>   fbos;
//         deUint32                tex;

//         {
//             glu::TransferFormat     transferFmt     = glu::getTransferFormat(texFmt);
//             bool                    isFilterable    = glu::isGLInternalColorFormatFilterable(m_format);
//             const IVec3&            size            = m_texSize;


//             glGenTextures(1, &tex);

//             glBindTexture(gl.TEXTURE_2D_ARRAY,      tex);
//             glTexParameteri(gl.TEXTURE_2D_ARRAY,    gl.TEXTURE_WRAP_S,      gl.CLAMP_TO_EDGE);
//             glTexParameteri(gl.TEXTURE_2D_ARRAY,    gl.TEXTURE_WRAP_T,      gl.CLAMP_TO_EDGE);
//             glTexParameteri(gl.TEXTURE_2D_ARRAY,    gl.TEXTURE_WRAP_R,      gl.CLAMP_TO_EDGE);
//             glTexParameteri(gl.TEXTURE_2D_ARRAY,    gl.TEXTURE_MIN_FILTER,  isFilterable ? gl.LINEAR : gl.NEAREST);
//             glTexParameteri(gl.TEXTURE_2D_ARRAY,    gl.TEXTURE_MAG_FILTER,  isFilterable ? gl.LINEAR : gl.NEAREST);
//             glTexImage3D(gl.TEXTURE_2D_ARRAY, 0, m_format, size.x(), size.y(), size.z(), 0, transferFmt.format, transferFmt.dataType, DE_NULL);

//             // Generate an FBO for each layer
//             for (int ndx = 0; ndx < m_texSize.z(); ndx++)
//             {
//                 deUint32            layerFbo;

//                 glGenFramebuffers(1, &layerFbo);
//                 glBindFramebuffer(gl.FRAMEBUFFER, layerFbo);
//                 glFramebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, tex, 0, ndx);
//                 checkError();
//                 checkFramebufferStatus(gl.FRAMEBUFFER);

//                 fbos.push_back(layerFbo);
//             }
//         }

//         // Render test images to random texture layers
//         std::vector<int>        order;

//         for (size_t n = 0; n < fbos.size(); n++)
//             order.push_back((int)n);
//         rnd.shuffle(order.begin(), order.end());

//         for (size_t ndx = 0; ndx < order.size(); ndx++)
//         {
//             const int           layer       = order[ndx];
//             const deUint32      format      = gl.RGBA;
//             const deUint32      dataType    = gl.UNSIGNED_BYTE;
//             const int           texW        = 128;
//             const int           texH        = 128;
//             deUint32            tmpTex      = 0;
//             const deUint32      fbo         = fbos[layer];
//             const IVec3&        viewport    = m_texSize;
//             tcu::TextureLevel   data        (glu::mapGLTransferFormat(format, dataType), texW, texH, 1);

//             tcu::fillWithGrid(data.getAccess(), 8, generateRandomColor(rnd), Vec4(0.0f));

//             glGenTextures(1, &tmpTex);
//             glBindTexture(gl.TEXTURE_2D, tmpTex);
//             glTexParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_S,      gl.CLAMP_TO_EDGE);
//             glTexParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_T,      gl.CLAMP_TO_EDGE);
//             glTexParameteri(gl.TEXTURE_2D,  gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
//             glTexParameteri(gl.TEXTURE_2D,  gl.TEXTURE_MAG_FILTER,  gl.LINEAR);
//             glTexImage2D(gl.TEXTURE_2D, 0, format, texW, texH, 0, format, dataType, data.getAccess().getDataPtr());

//             glBindFramebuffer(gl.FRAMEBUFFER, fbo);
//             glViewport(0, 0, viewport.x(), viewport.y());
//             sglr::drawQuad(*getCurrentContext(), texToFboShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));
//             checkError();

//             // Render to framebuffer
//             {
//                 const Vec3      p0  = Vec3(float(ndx % 2) - 1.0f, float(ndx / 2) - 1.0f, 0.0f);
//                 const Vec3      p1  = p0 + Vec3(1.0f, 1.0f, 0.0f);

//                 glBindFramebuffer(gl.FRAMEBUFFER, 0);
//                 glViewport(0, 0, getWidth(), getHeight());

//                 glActiveTexture(gl.TEXTURE0);
//                 glBindTexture(gl.TEXTURE_2D_ARRAY, tex);

//                 arrayTexShader.setLayer(layer);
//                 arrayTexShader.setUniforms(*getCurrentContext(), arrayTexShaderID);

//                 sglr::drawQuad(*getCurrentContext(), arrayTexShaderID, p0, p1);
//                 checkError();
//             }
//         }

//         readPixels(dst, 0, 0, getWidth(), getHeight());
//     }

// private:
//     IVec3           m_texSize;
// };

// class FboColorTex3DCase : public FboColorbufferCase
// {
// public:
//     FboColorTex3DCase (Context& context, const char* name, const char* description, deUint32 texFmt, const IVec3& texSize)
//         : FboColorbufferCase    (context, name, description, texFmt)
//         , m_texSize             (texSize)
//     {
//     }

// protected:
//     void preCheck (void)
//     {
//         checkFormatSupport(m_format);
//     }

//     void render (tcu::Surface& dst)
//     {
//         de::Random              rnd             (deStringHash(getName()) ^ 0x74d947b2);
//         tcu::TextureFormat      texFmt          = glu::mapGLInternalFormat(m_format);
//         tcu::TextureFormatInfo  fmtInfo         = tcu::getTextureFormatInfo(texFmt);

//         Texture2DShader         texToFboShader  (DataTypes() << glu::TYPE_SAMPLER_2D, getFragmentOutputType(texFmt), fmtInfo.valueMax-fmtInfo.valueMin, fmtInfo.valueMin);
//         Texture3DShader         tdTexShader     (glu::getSampler3DType(texFmt), glu::TYPE_FLOAT_VEC4);

//         deUint32                texToFboShaderID= getCurrentContext()->createProgram(&texToFboShader);
//         deUint32                tdTexShaderID   = getCurrentContext()->createProgram(&tdTexShader);

//         // Setup shaders
//         texToFboShader.setUniforms(*getCurrentContext(), texToFboShaderID);
//         tdTexShader.setTexScaleBias(fmtInfo.lookupScale, fmtInfo.lookupBias);

//         // Framebuffers.
//         std::vector<deUint32>   fbos;
//         deUint32                tex;

//         {
//             glu::TransferFormat     transferFmt     = glu::getTransferFormat(texFmt);
//             const IVec3&            size            = m_texSize;

//             glGenTextures(1, &tex);

//             glBindTexture(gl.TEXTURE_3D,        tex);
//             glTexParameteri(gl.TEXTURE_3D,  gl.TEXTURE_WRAP_S,      gl.CLAMP_TO_EDGE);
//             glTexParameteri(gl.TEXTURE_3D,  gl.TEXTURE_WRAP_T,      gl.CLAMP_TO_EDGE);
//             glTexParameteri(gl.TEXTURE_3D,  gl.TEXTURE_WRAP_R,      gl.CLAMP_TO_EDGE);
//             glTexParameteri(gl.TEXTURE_3D,  gl.TEXTURE_MIN_FILTER,  gl.NEAREST);
//             glTexParameteri(gl.TEXTURE_3D,  gl.TEXTURE_MAG_FILTER,  gl.NEAREST);
//             glTexImage3D(gl.TEXTURE_3D, 0, m_format, size.x(), size.y(), size.z(), 0, transferFmt.format, transferFmt.dataType, DE_NULL);

//             // Generate an FBO for each layer
//             for (int ndx = 0; ndx < m_texSize.z(); ndx++)
//             {
//                 deUint32            layerFbo;

//                 glGenFramebuffers(1, &layerFbo);
//                 glBindFramebuffer(gl.FRAMEBUFFER, layerFbo);
//                 glFramebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, tex, 0, ndx);
//                 checkError();
//                 checkFramebufferStatus(gl.FRAMEBUFFER);

//                 fbos.push_back(layerFbo);
//             }
//         }

//         // Render test images to random texture layers
//         std::vector<int> order;

//         for (size_t n = 0; n < fbos.size(); n++)
//             order.push_back((int)n);
//         rnd.shuffle(order.begin(), order.end());

//         for (size_t ndx = 0; ndx < order.size(); ndx++)
//         {
//             const int           layer       = order[ndx];
//             const deUint32      format      = gl.RGBA;
//             const deUint32      dataType    = gl.UNSIGNED_BYTE;
//             const int           texW        = 128;
//             const int           texH        = 128;
//             deUint32            tmpTex      = 0;
//             const deUint32      fbo         = fbos[layer];
//             const IVec3&        viewport    = m_texSize;
//             tcu::TextureLevel   data        (glu::mapGLTransferFormat(format, dataType), texW, texH, 1);

//             tcu::fillWithGrid(data.getAccess(), 8, generateRandomColor(rnd), Vec4(0.0f));

//             glGenTextures(1, &tmpTex);
//             glBindTexture(gl.TEXTURE_2D, tmpTex);
//             glTexParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_S,      gl.CLAMP_TO_EDGE);
//             glTexParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_T,      gl.CLAMP_TO_EDGE);
//             glTexParameteri(gl.TEXTURE_2D,  gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
//             glTexParameteri(gl.TEXTURE_2D,  gl.TEXTURE_MAG_FILTER,  gl.LINEAR);
//             glTexImage2D(gl.TEXTURE_2D, 0, format, texW, texH, 0, format, dataType, data.getAccess().getDataPtr());

//             glBindFramebuffer(gl.FRAMEBUFFER, fbo);
//             glViewport(0, 0, viewport.x(), viewport.y());
//             sglr::drawQuad(*getCurrentContext() , texToFboShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));
//             checkError();

//             // Render to framebuffer
//             {
//                 const Vec3      p0  = Vec3(float(ndx % 2) - 1.0f, float(ndx / 2) - 1.0f, 0.0f);
//                 const Vec3      p1  = p0 + Vec3(1.0f, 1.0f, 0.0f);

//                 glBindFramebuffer(gl.FRAMEBUFFER, 0);
//                 glViewport(0, 0, getWidth(), getHeight());

//                 glActiveTexture(gl.TEXTURE0);
//                 glBindTexture(gl.TEXTURE_3D, tex);

//                 tdTexShader.setDepth(float(layer) / float(m_texSize.z()-1));
//                 tdTexShader.setUniforms(*getCurrentContext(), tdTexShaderID);

//                 sglr::drawQuad(*getCurrentContext(), tdTexShaderID, p0, p1);
//                 checkError();
//             }
//         }

//         readPixels(dst, 0, 0, getWidth(), getHeight());
//     }

// private:
//     IVec3           m_texSize;
// };

// class FboBlendCase : public FboColorbufferCase
// {
// public:
//     FboBlendCase (Context& context, const char* name, const char* desc, deUint32 format, IVec2 size, deUint32 funcRGB, deUint32 funcAlpha, deUint32 srcRGB, deUint32 dstRGB, deUint32 srcAlpha, deUint32 dstAlpha)
//         : FboColorbufferCase    (context, name, desc, format)
//         , m_size                (size)
//         , m_funcRGB             (funcRGB)
//         , m_funcAlpha           (funcAlpha)
//         , m_srcRGB              (srcRGB)
//         , m_dstRGB              (dstRGB)
//         , m_srcAlpha            (srcAlpha)
//         , m_dstAlpha            (dstAlpha)
//     {
//     }

// protected:
//     void preCheck (void)
//     {
//         checkFormatSupport(m_format);
//     }

//     void render (tcu::Surface& dst)
//     {
//         // \note Assumes floating-point or fixed-point format.
//         tcu::TextureFormat          fboFmt          = glu::mapGLInternalFormat(m_format);
//         Texture2DShader             texShader       (DataTypes() << glu::TYPE_SAMPLER_2D, glu::TYPE_FLOAT_VEC4);
//         GradientShader              gradShader      (glu::TYPE_FLOAT_VEC4);
//         deUint32                    texShaderID     = getCurrentContext()->createProgram(&texShader);
//         deUint32                    gradShaderID    = getCurrentContext()->createProgram(&gradShader);
//         deUint32                    fbo             = 0;
//         deUint32                    rbo             = 0;

//         // Setup shaders
//         texShader.setUniforms (*getCurrentContext(), texShaderID);
//         gradShader.setGradient(*getCurrentContext(), gradShaderID, tcu::Vec4(0.0f), tcu::Vec4(1.0f));

//         glGenFramebuffers(1, &fbo);
//         glGenRenderbuffers(1, &rbo);

//         glBindRenderbuffer(gl.RENDERBUFFER, rbo);
//         glRenderbufferStorage(gl.RENDERBUFFER, m_format, m_size.x(), m_size.y());
//         checkError();

//         glBindFramebuffer(gl.FRAMEBUFFER, fbo);
//         glFramebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rbo);
//         checkError();
//         checkFramebufferStatus(gl.FRAMEBUFFER);

//         glViewport(0, 0, m_size.x(), m_size.y());

//         // Fill framebuffer with grid pattern.
//         {
//             const deUint32      format      = gl.RGBA;
//             const deUint32      dataType    = gl.UNSIGNED_BYTE;
//             const int           texW        = 128;
//             const int           texH        = 128;
//             deUint32            gridTex     = 0;
//             tcu::TextureLevel   data        (glu::mapGLTransferFormat(format, dataType), texW, texH, 1);

//             tcu::fillWithGrid(data.getAccess(), 8, Vec4(0.2f, 0.7f, 0.1f, 1.0f), Vec4(0.7f, 0.1f, 0.5f, 0.8f));

//             glGenTextures(1, &gridTex);
//             glBindTexture(gl.TEXTURE_2D, gridTex);
//             glTexParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_S,      gl.CLAMP_TO_EDGE);
//             glTexParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_T,      gl.CLAMP_TO_EDGE);
//             glTexParameteri(gl.TEXTURE_2D,  gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
//             glTexParameteri(gl.TEXTURE_2D,  gl.TEXTURE_MAG_FILTER,  gl.LINEAR);
//             glTexImage2D(gl.TEXTURE_2D, 0, format, texW, texH, 0, format, dataType, data.getAccess().getDataPtr());

//             sglr::drawQuad(*getCurrentContext(), texShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));
//         }

//         // Setup blend.
//         glEnable(gl.BLEND);
//         glBlendEquationSeparate(m_funcRGB, m_funcAlpha);
//         glBlendFuncSeparate(m_srcRGB, m_dstRGB, m_srcAlpha, m_dstAlpha);

//         // Render gradient with blend.
//         sglr::drawQuad(*getCurrentContext(), gradShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));

//         readPixels(dst, 0, 0, m_size.x(), m_size.y(), fboFmt, Vec4(1.0f), Vec4(0.0f));
//     }

// private:
//     IVec2       m_size;
//     deUint32    m_funcRGB;
//     deUint32    m_funcAlpha;
//     deUint32    m_srcRGB;
//     deUint32    m_dstRGB;
//     deUint32    m_srcAlpha;
//     deUint32    m_dstAlpha;
// };

/**
 * @constructor
 * @extends {tcuTestCase.DeqpTest}
 */
es3fFboColorbufferTests.FboColorbufferTests = function() {
    tcuTestCase.DeqpTest.call(this, 'color', 'Colorbuffer tests');
};

setParentClass(es3fFboColorbufferTests.FboColorbufferTests, tcuTestCase.DeqpTest);

es3fFboColorbufferTests.FboColorbufferTests.prototype.init = function()
{
    var colorFormats = [
        // RGBA formats
        gl.RGBA32I,
        gl.RGBA32UI,
        gl.RGBA16I,
        gl.RGBA16UI,
        gl.RGBA8,
        gl.RGBA8I,
        gl.RGBA8UI,
        gl.SRGB8_ALPHA8,
        gl.RGB10_A2,
        gl.RGB10_A2UI,
        gl.RGBA4,
        gl.RGB5_A1,

        // RGB formats
        gl.RGB8,
        gl.RGB565,

        // RG formats
        gl.RG32I,
        gl.RG32UI,
        gl.RG16I,
        gl.RG16UI,
        gl.RG8,
        gl.RG8I,
        gl.RG8UI,

        // R formats
        gl.R32I,
        gl.R32UI,
        gl.R16I,
        gl.R16UI,
        gl.R8,
        gl.R8I,
        gl.R8UI,

        // gl.EXT_color_buffer_float
        gl.RGBA32F,
        gl.RGBA16F,
        gl.R11F_G11F_B10F,
        gl.RG32F,
        gl.RG16F,
        gl.R32F,
        gl.R16F,

        // gl.EXT_color_buffer_half_float
        gl.RGB16F
    ];

    // .clear
    {
                /** @type {tcuTestCase.DeqpTest} */
        var clearGroup = tcuTestCase.newTest("clear", "Color clears");
        this.addChild(clearGroup);

        for (var ndx = 0; ndx < colorFormats.length; ndx++)
            clearGroup.addChild(new es3fFboColorbufferTests.FboColorClearCase(es3fFboTestUtil.getFormatName(colorFormats[ndx]), "", colorFormats[ndx], 129, 117));
    }

    // .tex2d
    {
        var tex2DGroup = tcuTestCase.newTest("tex2d", "Texture 2D tests");
        this.addChild(tex2DGroup);

        for (var ndx = 0; ndx < colorFormats.length; ndx++)
            tex2DGroup.addChild(new es3fFboColorbufferTests.FboColorMultiTex2DCase(es3fFboTestUtil.getFormatName(colorFormats[ndx]), "",
                                                            colorFormats[ndx], [129, 117],
                                                            colorFormats[ndx], [99, 128]));
    }

    // .texcube
    {
        var texCubeGroup = tcuTestCase.newTest("texcube", "Texture cube map tests");
        this.addChild(texCubeGroup);

        for (var ndx = 0; ndx < colorFormats.length; ndx++)
            texCubeGroup.addChild(new es3fFboColorbufferTests.FboColorTexCubeCase(es3fFboTestUtil.getFormatName(colorFormats[ndx]), "",
                                                           colorFormats[ndx], [128, 128]));
    }

    // // .tex2darray
    // {
    //     tcu::TestCaseGroup* tex2DArrayGroup = new tcu::TestCaseGroup(m_testCtx, "tex2darray", "Texture 2D array tests");
    //     addChild(tex2DArrayGroup);

    //     for (int fmtNdx = 0; fmtNdx < DE_LENGTH_OF_ARRAY(colorFormats); fmtNdx++)
    //         tex2DArrayGroup->addChild(new FboColorTex2DArrayCase(m_context, getFormatName(colorFormats[fmtNdx]), "",
    //                                                              colorFormats[fmtNdx], IVec3(128, 128, 5)));
    // }

    // // .tex3d
    // {
    //     tcu::TestCaseGroup* tex3DGroup = new tcu::TestCaseGroup(m_testCtx, "tex3d", "Texture 3D tests");
    //     addChild(tex3DGroup);

    //     for (int fmtNdx = 0; fmtNdx < DE_LENGTH_OF_ARRAY(colorFormats); fmtNdx++)
    //         tex3DGroup->addChild(new FboColorTex3DCase(m_context, getFormatName(colorFormats[fmtNdx]), "",
    //                                                    colorFormats[fmtNdx], IVec3(128, 128, 5)));
    // }

    // // .blend
    // {
    //     tcu::TestCaseGroup* blendGroup = new tcu::TestCaseGroup(m_testCtx, "blend", "Blending tests");
    //     addChild(blendGroup);

    //     for (int fmtNdx = 0; fmtNdx < DE_LENGTH_OF_ARRAY(colorFormats); fmtNdx++)
    //     {
    //         deUint32                    format      = colorFormats[fmtNdx];
    //         tcu::TextureFormat          texFmt      = glu::mapGLInternalFormat(format);
    //         tcu::TextureChannelClass    fmtClass    = tcu::getTextureChannelClass(texFmt.type);
    //         string                      fmtName     = getFormatName(format);

    //         if (texFmt.type == tcu::TextureFormat::FLOAT                ||
    //             fmtClass    == tcuTexture.TextureChannelClass.SIGNED_INTEGER  ||
    //             fmtClass    == tcuTexture.TextureChannelClass.UNSIGNED_INTEGER)
    //             continue; // Blending is not supported.

    //         blendGroup->addChild(new FboBlendCase(m_context, (fmtName + "_src_over").c_str(), "", format, IVec2(127, 111), gl.FUNC_ADD, gl.FUNC_ADD, gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE));
    //     }
    // }
};

    /**
    * Run test
    * @param {WebGL2RenderingContext} context
    */
    es3fFboColorbufferTests.run = function(context) {
    	gl = context;
    	//Set up Test Root parameters
    	var state = tcuTestCase.runner;
    	state.setRoot(new es3fFboColorbufferTests.FboColorbufferTests());

    	//Set up name and description of this test series.
    	setCurrentTestName(state.testCases.fullName());
    	description(state.testCases.getDescription());

    	try {
    		//Run test cases
    		tcuTestCase.runTestCases();
    	}
    	catch (err) {
    		testFailedOptions('Failed to es3fFboColorbufferTests.run tests', false);
    		tcuTestCase.runner.terminate();
    	}
    };

});