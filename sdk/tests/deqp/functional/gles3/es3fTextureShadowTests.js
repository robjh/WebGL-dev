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
'use strict';
goog.provide('functional.gles3.es3fTextureShadowTests');
goog.require('framework.common.tcuImageCompare');
goog.require('framework.common.tcuLogImage');
goog.require('framework.common.tcuPixelFormat');
goog.require('framework.common.tcuRGBA');
goog.require('framework.common.tcuSurface');
goog.require('framework.common.tcuTestCase');
goog.require('framework.common.tcuTexCompareVerifier');
goog.require('framework.common.tcuTexLookupVerifier');
goog.require('framework.common.tcuTexture');
goog.require('framework.common.tcuTextureUtil');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.opengl.gluShaderUtil');
goog.require('framework.opengl.gluTexture');
goog.require('framework.opengl.gluTextureUtil');
goog.require('modules.shared.glsTextureTestUtil');
goog.require('framework.referencerenderer.rrMultisamplePixelBufferAccess');
goog.require('framework.delibs.debase.deString');

goog.scope(function() {

var es3fTextureShadowTests = functional.gles3.es3fTextureShadowTests;
var tcuTestCase = framework.common.tcuTestCase;
var glsTextureTestUtil = modules.shared.glsTextureTestUtil;
var gluShaderUtil = framework.opengl.gluShaderUtil;
var gluTexture = framework.opengl.gluTexture;
var gluTextureUtil = framework.opengl.gluTextureUtil;
var tcuTexture = framework.common.tcuTexture;
var tcuImageCompare = framework.common.tcuImageCompare;
var tcuLogImage = framework.common.tcuLogImage;
var tcuTextureUtil = framework.common.tcuTextureUtil;
var tcuRGBA = framework.common.tcuRGBA;
var deMath = framework.delibs.debase.deMath;
var tcuPixelFormat = framework.common.tcuPixelFormat;
var tcuSurface = framework.common.tcuSurface;
var tcuTexCompareVerifier = framework.common.tcuTexCompareVerifier;
var tcuTexLookupVerifier = framework.common.tcuTexLookupVerifier;
var rrMultisamplePixelBufferAccess = framework.referencerenderer.rrMultisamplePixelBufferAccess;
var deString = framework.delibs.debase.deString;

    es3fTextureShadowTests.version = '300 es';

    var DE_ASSERT = function(x) {
        if (!x)
            throw new Error('Assert failed');
    };

    /**
     * @param {number} a
     * @return {number}
     */
     es3fTextureShadowTests.deLog2Floor32 = function(a) {
        return 31 - deMath.clz32(a);
    };

    /**
     * @param {tcuTexture.TextureFormat} format
     * @return {boolean}
     */
    es3fTextureShadowTests.isFloatingPointDepthFormat = function(format) {
        // Only two depth and depth-stencil formats are floating point
        return (format.order == tcuTexture.ChannelOrder.D && format.type == tcuTexture.ChannelType.FLOAT) || (format.order == tcuTexture.ChannelOrder.DS && format.type == tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV);
    };

    /**
     * @param {tcuTexture.PixelBufferAccess} access
     */
    es3fTextureShadowTests.clampFloatingPointTexture = function (access) {
        DE_ASSERT(es3fTextureShadowTests.isFloatingPointDepthFormat(access.getFormat()));
        for (var z = 0; z < access.getDepth(); ++z)
            for (var y = 0; y < access.getHeight(); ++y)
                for (var x = 0; x < access.getWidth(); ++x)
                    access.setPixDepth(deMath.clamp(access.getPixDepth(x, y, z), 0.0, 1.0), x, y, z);
    };

    /**
     * @param {tcuTexture.Texture2D} target
     */
    es3fTextureShadowTests.clampFloatingPointTexture2D = function(target) {
        for (var level = 0; level < target.getNumLevels(); ++level)
        if (!target.isLevelEmpty(level))
            es3fTextureShadowTests.clampFloatingPointTexture(target.getLevel(level));
    };

    /**
     * @param {?} textureType
     * @param {tcuTexture.ConstPixelBufferAccess} result
     * @param {tcuTexture.Texture2D} src
     * @param {Array<number>} texCoord
     * @param {glsTextureTestUtil.ReferenceParams} sampleParams
     * @param {tcuTexCompareVerifier.TexComparePrecision} comparePrec
     * @param {tcuTexLookupVerifier.LodPrecision} lodPrecision
     * @param {tcuPixelFormat.PixelFormat} pixelFormat
     */
    es3fTextureShadowTests.verifyTexCompareResult = function(textureType, result, src, texCoord, sampleParams, comparePrec, lodPrecision, pixelFormat) {
        var reference = new tcuSurface.Surface(result.getWidth(), result.getHeight());
        var errorMask = new tcuSurface.Surface(result.getWidth(), result.getHeight());
        var nonShadowThreshold = deMath.swizzle(tcuTexLookupVerifier.computeFixedPointThreshold(glsTextureTestUtil.getBitsVec(pixelFormat)), [1, 2, 3]);
        var numFailedPixels;

        if (es3fTextureShadowTests.isFloatingPointDepthFormat(src.getFormat())) {
            var clampedSource = new tcuTexture.Texture2D(src.getFormat(), src.getWidth(), src.getHeight());

            es3fTextureShadowTests.clampFloatingPointTexture2D(clampedSource);

            // sample clamped values
            glsTextureTestUtil.sampleTexture2D(new glsTextureTestUtil.SurfaceAccess(reference, pixelFormat), clampedSource.m_view, texCoord, sampleParams);
            numFailedPixels = glsTextureTestUtil.computeTextureCompareDiff(result, reference.getAccess(), errorMask.getAccess(), clampedSource.m_view, texCoord, sampleParams, comparePrec, lodPrecision, nonShadowThreshold);
        } else{
            // sample raw values (they are guaranteed to be in [0, 1] range as the format cannot represent any other values)
            glsTextureTestUtil.sampleTexture2D(new glsTextureTestUtil.SurfaceAccess(reference, pixelFormat), src.m_view, texCoord, sampleParams);
            numFailedPixels = glsTextureTestUtil.computeTextureCompareDiff(result, reference.getAccess(), errorMask.getAccess(), src.m_view, texCoord, sampleParams, comparePrec, lodPrecision, nonShadowThreshold);
        }

        if (numFailedPixels > 0)
            bufferedLogToConsole('ERROR: Result verification failed, got ' + numFailedPixels + ' invalid pixels!');

        if (numFailedPixels > 0)
            tcuImageCompare.displayImages(result, reference.getAccess(), errorMask.getAccess());
        else
            tcuImageCompare.displayImages(result, null);

        return numFailedPixels == 0;

    };

    /** @enum */
    es3fTextureShadowTests.tex2D = {
        VIEWPORT_WIDTH: 64,
        VIEWPORT_HEIGHT: 64,
        MIN_VIEWPORT_WIDTH: 64,
        MIN_VIEWPORT_HEIGHT: 64
    };

    /**
     * @constructor
     * @struct
     */
    es3fTextureShadowTests.Format = function() {
        /** @type {string} */ this.name;
        /** @type {number} */ this.format;
    };

    /**
     * @constructor
     * @struct
     */
    es3fTextureShadowTests.Filter = function() {
        /** @type {string} */ this.name;
        /** @type {number} */ this.minFilter;
        /** @type {number} */ this.magFilter;
    };

    /**
     * @param {tcuRGBA.RGBA} c
     * @return {Array<number>}
     */
    es3fTextureShadowTests.toVec4 = function(c) {
        return [c.getRed() / 255.0, c.getGreen() / 255.0, c.getBlue() / 255.0, c.getAlpha() / 255.0];
    };

    /**
     * @constructor
     * @struct
     */
    es3fTextureShadowTests.CompareFunc = function() {
        /** @type {string} */ this.name;
        /** @type {number} */ this.func;
    };

    /**
     * @constructor
     * @struct
     */
    es3fTextureShadowTests.TestCase = function() {
        /** @type {number} */ this.texNdx;
        /** @type {number} */ this.ref;
        /** @type {number} */ this.lodX;
        /** @type {number} */ this.lodY;
        /** @type {number} */ this.oX;
        /** @type {number} */ this.oY;
    };

    /**
     * @constructor
     * @struct
     */
    es3fTextureShadowTests.FilterCase = function() {
        /** @type {?tcuTexture.Texture2D|?tcuTexture.TextureCube|?tcuTexture.Texture2DArray} */ this.texture = null;
        /** @type {Array<number>} */ this.minCoord = [];
        /** @type {Array<number>} */ this.maxCoord = [];
        /** @type {number} */ this.ref = 0.0;
    };

    /**
     * @param {?tcuTexture.Texture2D|?tcuTexture.TextureCube|?tcuTexture.Texture2DArray} tex
     * @param {number} ref
     * @param {Array<number>} minCoord
     * @param {Array<number>} maxCoord
     * @return {es3fTextureShadowTests.FilterCase}
     */
    es3fTextureShadowTests.newFilterCaseWithValues = function(tex, ref, minCoord, maxCoord) {
        var fcase = new es3fTextureShadowTests.FilterCase();

        fcase.texture = tex;
        fcase.minCoord = minCoord;
        fcase.maxCoord = maxCoord;
        fcase.ref = ref;

        return fcase;
    };

    /**
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {number} minFilter
     * @param {number} magFilter
     * @param {number} wrapS
     * @param {number} wrapT
     * @param {number} format
     * @param {number} width
     * @param {number} height
     * @param {number} compareFunc
     * @extends {tcuTestCase.DeqpTest}
     */
    es3fTextureShadowTests.Texture2DShadowCase = function(name, desc, minFilter, magFilter, wrapS, wrapT, format, width, height, compareFunc) {
        tcuTestCase.DeqpTest.call(this, name, desc);
        this.m_minFilter = minFilter;
        this.m_magFilter = magFilter;
        this.m_wrapS = wrapS;
        this.m_wrapT = wrapT;
        this.m_format = format;
        this.m_width = width;
        this.m_height = height;
        this.m_compareFunc = compareFunc;
        this.m_renderer = new glsTextureTestUtil.TextureRenderer(es3fTextureShadowTests.version, gluShaderUtil.precision.PRECISION_HIGHP);
        this.m_caseNdx = 0;
        this.m_cases = [];
    };

    es3fTextureShadowTests.Texture2DShadowCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fTextureShadowTests.Texture2DShadowCase.prototype.constructor = es3fTextureShadowTests.Texture2DShadowCase;

    es3fTextureShadowTests.Texture2DShadowCase.prototype.init = function() {

        // Create 2 textures.
        this.m_textures = [];
        this.m_textures[0] = gluTexture.texture2DFromInternalFormat(gl, this.m_format, this.m_width, this.m_height);
        this.m_textures[1] = gluTexture.texture2DFromInternalFormat(gl, this.m_format, this.m_width, this.m_height);

        var numLevels = this.m_textures[0].getRefTexture().getNumLevels();

        debug('Generating component gradient texture levels');
        for (var levelNdx = 0; levelNdx < numLevels; levelNdx++) {
            this.m_textures[0].getRefTexture().allocLevel(levelNdx);
            tcuTextureUtil.fillWithComponentGradients(this.m_textures[0].getRefTexture().getLevel(levelNdx), [-0.5, -0.5, -0.5, 2.0], [1, 1, 1, 0]);
            tcuLogImage.logImageWithInfo(this.m_textures[0].getRefTexture().getLevel(levelNdx), 'Level-' + levelNdx);
        }

        debug('Generating grid texture levels');
        for (levelNdx = 0; levelNdx < numLevels; levelNdx++) {
            var step = 0x00ffffff / numLevels;
            var rgb = step * levelNdx;
            var colorA = 0xff000000 | rgb;
            var colorB = 0xff000000 | ~rgb;

            this.m_textures[1].getRefTexture().allocLevel(levelNdx);
            tcuTextureUtil.fillWithGrid(this.m_textures[0].getRefTexture().getLevel(levelNdx), 4, tcuRGBA.newRGBAFromValue(colorA).toVec(), tcuRGBA.newRGBAFromValue(colorB).toVec());
            tcuLogImage.logImageWithInfo(this.m_textures[0].getRefTexture().getLevel(levelNdx), 'Level-' + levelNdx);
        }

        debug('Uploading textures');
        for (var i = 0; i < this.m_textures.length; i++)
            this.m_textures[i].upload();

        var refInRangeUpper = (this.m_compareFunc == gl.EQUAL || this.m_compareFunc == gl.NOTEQUAL) ? 1.0 : 0.5;
        var refInRangeLower = (this.m_compareFunc == gl.EQUAL || this.m_compareFunc == gl.NOTEQUAL) ? 1.0 : 0.5;

        var refOutOfBoundsUpper = 1.1;
        var refOutOfBoundsLower = -0.1;

        numLevels = this.m_textures[0].getRefTexture().getNumLevels();

        var cases = [];
        cases[0] = new es3fTextureShadowTests.TestCase();
        cases[0].texNdx = 0;
        cases[0].ref = refInRangeUpper;
        cases[0].lodX = 1.6;
        cases[0].lodY = 2.9;
        cases[0].oX = -1.0;
        cases[0].oY = -2.7;
        cases[1] = new es3fTextureShadowTests.TestCase();
        cases[1].texNdx = 0;
        cases[1].ref = refInRangeLower;
        cases[1].lodX = -2.0;
        cases[1].lodY = -1.35;
        cases[1].oX = -0.2;
        cases[1].oY = 0.7;
        cases[2] = new es3fTextureShadowTests.TestCase();
        cases[2].texNdx = 1;
        cases[2].ref = refInRangeUpper;
        cases[2].lodX = 0.14;
        cases[2].lodY = 0.275;
        cases[2].oX = -1.5;
        cases[2].oY = -1.1;
        cases[3] = new es3fTextureShadowTests.TestCase();
        cases[3].texNdx = 1;
        cases[3].ref = refInRangeLower;
        cases[3].lodX = -0.92;
        cases[3].lodY = -2.64;
        cases[3].oX = 0.4;
        cases[3].oY = -0.1;
        cases[4] = new es3fTextureShadowTests.TestCase();
        cases[4].texNdx = 1;
        cases[4].ref = refOutOfBoundsUpper;
        cases[4].lodX = -0.39;
        cases[4].lodY = -0.52;
        cases[4].oX = 0.65;
        cases[4].oY = 0.87;
        cases[5] = new es3fTextureShadowTests.TestCase();
        cases[5].texNdx = 1;
        cases[5].ref = refOutOfBoundsLower;
        cases[5].lodX = -1.55;
        cases[5].lodY = 0.65;
        cases[5].oX = 0.35;
        cases[5].oY = 0.91;

        var viewportW = Math.min(es3fTextureShadowTests.tex2D.VIEWPORT_WIDTH, gl.canvas.width);
        var viewportH = Math.min(es3fTextureShadowTests.tex2D.VIEWPORT_HEIGHT, gl.canvas.height);

        for (var caseNdx = 0; caseNdx < cases.length; caseNdx++) {
            var texNdx = deMath.clamp(cases[caseNdx].texNdx, 0, this.m_textures.length - 1);
            var ref = cases[caseNdx].ref;
            var lodX = cases[caseNdx].lodX;
            var lodY = cases[caseNdx].lodY;
            var oX = cases[caseNdx].oX;
            var oY = cases[caseNdx].oY;
            var sX = Math.exp(lodX * Math.log(2)) * viewportW / this.m_textures[texNdx].getRefTexture().getWidth();
            var sY = Math.exp(lodY * Math.log(2)) * viewportH / this.m_textures[texNdx].getRefTexture().getHeight();

            this.m_cases.push(es3fTextureShadowTests.newFilterCaseWithValues(this.m_textures[texNdx], ref, [oX, oY], [oX + sX, oY + sY]));
        }

        this.m_caseNdx = 0;
    };

    es3fTextureShadowTests.Texture2DShadowCase.prototype.iterate = function() {

        var viewport = new glsTextureTestUtil.RandomViewport(document.getElementById('canvas'), es3fTextureShadowTests.tex2D.VIEWPORT_WIDTH, es3fTextureShadowTests.tex2D.VIEWPORT_HEIGHT);
        var curCase = this.m_cases[this.m_caseNdx];
        var sampleParams = new glsTextureTestUtil.ReferenceParams(glsTextureTestUtil.textureType.TEXTURETYPE_2D);
        var rendered = new tcuSurface.Surface(viewport.width, viewport.height);
        var texCoord = [];

        if (viewport.width < es3fTextureShadowTests.tex2D.MIN_VIEWPORT_WIDTH || viewport.height < es3fTextureShadowTests.tex2D.MIN_VIEWPORT_HEIGHT)
            throw new Error('Too small render target');

        // Setup params for reference.
        sampleParams.sampler = gluTextureUtil.mapGLSampler(this.m_wrapS, this.m_wrapT, gl.CLAMP_TO_EDGE, this.m_minFilter, this.m_magFilter);
        sampleParams.sampler.compare = gluTextureUtil.mapGLCompareFunc(this.m_compareFunc);
        sampleParams.samplerType = glsTextureTestUtil.samplerType.SAMPLERTYPE_SHADOW;
        sampleParams.lodMode = glsTextureTestUtil.lodMode.EXACT;
        sampleParams.ref = curCase.ref;

        bufferedLogToConsole('Compare reference value = ' + sampleParams.ref);

        // Compute texture coordinates.
        bufferedLogToConsole('Texture coordinates: ' + curCase.minCoord + ' -> ' + curCase.maxCoord);

        texCoord = glsTextureTestUtil.computeQuadTexCoord2D(curCase.minCoord, curCase.maxCoord);

        gl.bindTexture(gl.TEXTURE_2D, curCase.texture.getGLTexture());
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.m_minFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.m_magFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.m_wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.m_wrapT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, this.m_compareFunc);

        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        this.m_renderer.renderQuad(0, texCoord, sampleParams);
        gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, rendered.getAccess().getDataPtr());

        var pixelFormat = new tcuPixelFormat.PixelFormat(8, 8, 8, 8);
        var lodPrecision = new tcuTexLookupVerifier.LodPrecision(18, 6);
        var texComparePrecision = new tcuTexCompareVerifier.TexComparePrecision([20, 20, 0], [7, 7, 0], 5, 16, pixelFormat.redBits - 1);

        var isHighQuality = es3fTextureShadowTests.verifyTexCompareResult(tcuTexture.Texture2D, rendered.getAccess(), curCase.texture.getRefTexture(),
                                                      texCoord, sampleParams, texComparePrecision, lodPrecision, pixelFormat);

        if (!isHighQuality) {
            bufferedLogToConsole('Warning: Verification assuming high-quality PCF filtering failed.');

            lodPrecision.lodBits = 4;
            texComparePrecision.uvwBits = [4, 4, 0];
            texComparePrecision.pcfBits = 0;

            var isOk = es3fTextureShadowTests.verifyTexCompareResult(tcuTexture.Texture2D, rendered.getAccess(), curCase.texture.getRefTexture(),
                                                     texCoord, sampleParams, texComparePrecision, lodPrecision, pixelFormat);

            if (!isOk) {
                bufferedLogToConsole('ERROR: Verification against low precision requirements failed, failing test case.');
                testFailedOptions('Image verification failed', false);
            } else
                testPassedOptions('Low-quality result', true);
        }

        this.m_caseNdx += 1;
        return this.m_caseNdx < this.m_cases.length ? tcuTestCase.IterateResult.CONTINUE : tcuTestCase.IterateResult.STOP;
    };

    /**
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {number} minFilter
     * @param {number} magFilter
     * @param {number} wrapS
     * @param {number} wrapT
     * @param {number} format
     * @param {number} size
     * @param {number} compareFunc
     * @extends {tcuTestCase.DeqpTest}
     */
    es3fTextureShadowTests.TextureCubeShadowCase = function (name, desc, minFilter, magFilter, wrapS, wrapT, format, size, compareFunc) {
        tcuTestCase.DeqpTest.call(this, name, desc);
        this.m_minFilter = minFilter;
        this.m_magFilter = magFilter;
        this.m_wrapS = wrapS;
        this.m_wrapT = wrapT;
        this.m_format = format;
        this.m_size = size;
        this.m_compareFunc = compareFunc;
        this.m_renderer = new glsTextureTestUtil.TextureRenderer(es3fTextureShadowTests.version, gluShaderUtil.precision.PRECISION_HIGHP);
        this.m_caseNdx = 0;
        this.m_cases = []
    };

    es3fTextureShadowTests.TextureCubeShadowCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fTextureShadowTests.TextureCubeShadowCase.prototype.constructor = es3fTextureShadowTests.TextureCubeShadowCase;

    es3fTextureShadowTests.TextureCubeShadowCase.prototype.init = function() {
        DE_ASSERT(!this.m_gradientTex && !this.m_gridTex);

        var numLevels = es3fTextureShadowTests.deLog2Floor32(this.m_size)+1;
        /** @type {tcuTexture.TextureFormat} */ var texFmt = gluTextureUtil.mapGLInternalFormat(this.m_format);
        /** @type {tcuTextureUtil.TextureFormatInfo} */    var fmtInfo = tcuTextureUtil.getTextureFormatInfo(texFmt);
        /** @type {Array<number>} */ var cBias = fmtInfo.valueMin;
        /** @type {Array<number>} */ var cScale = deMath.subtract(fmtInfo.valueMax, fmtInfo.valueMin);

        // Create textures.
        this.m_gradientTex = gluTexture.cubeFromInternalFormat(gl, this.m_format, this.m_size);
        this.m_gridTex = gluTexture.cubeFromInternalFormat(gl, this.m_format, this.m_size);

        // Fill first with gradient texture.
        var gradients = [[[-1.0, -1.0, -1.0, 2.0], [1.0, 1.0, 1.0, 0.0]], // negative x
            [[ 0.0, -1.0, -1.0, 2.0], [1.0, 1.0, 1.0, 0.0]], // positive x
            [[-1.0,  0.0, -1.0, 2.0], [1.0, 1.0, 1.0, 0.0]], // negative y
            [[-1.0, -1.0,  0.0, 2.0], [1.0, 1.0, 1.0, 0.0]], // positive y
            [[-1.0, -1.0, -1.0, 0.0], [1.0, 1.0, 1.0, 1.0]], // negative z
            [[ 0.0,  0.0,  0.0, 2.0], [1.0, 1.0, 1.0, 0.0]]]  // positive z

        for (var face in tcuTexture.CubeFace) {
            for (var levelNdx = 0; levelNdx < numLevels; levelNdx++) {
                this.m_gradientTex.getRefTexture().allocLevel(tcuTexture.CubeFace[face], levelNdx)
                tcuTextureUtil.fillWithComponentGradients(this.m_gradientTex.getRefTexture().getLevelFace(levelNdx, tcuTexture.CubeFace[face]), deMath.add(deMath.multiply(gradients[tcuTexture.CubeFace[face]][0], cScale), cBias), deMath.add(deMath.multiply(gradients[tcuTexture.CubeFace[face]][1], cScale), cBias));
            }
        }

        // Fill second with grid texture.
        for (var face in tcuTexture.CubeFace) {
            for (var levelNdx = 0; levelNdx < numLevels; levelNdx++)
            {
                var step    = 0x00ffffff / (numLevels * Object.keys(tcuTexture.CubeFace).length);
                var rgb        = step*levelNdx*face;
                var colorA    = 0xff000000 | rgb;
                var colorB    = 0xff000000 | ~rgb;

                this.m_gridTex.getRefTexture().allocLevel(tcuTexture.CubeFace[face], levelNdx);
                tcuTextureUtil.fillWithGrid(this.m_gridTex.getRefTexture().getLevelFace(levelNdx, tcuTexture.CubeFace[face]), 4, deMath.add(deMath.multiply(tcuRGBA.newRGBAFromValue(colorA).toVec(),cScale), cBias), deMath.add(deMath.multiply(tcuRGBA.newRGBAFromValue(colorB).toVec(), cScale), cBias));
            }
        }

        // Upload.
        //this.m_gradientTex.upload();
        //this.m_gridTex.upload();

        var refInRangeUpper = (this.m_compareFunc == gl.EQUAL || this.m_compareFunc == gl.NOTEQUAL) ? 1.0 : 0.5;
        var refInRangeLower = (this.m_compareFunc == gl.EQUAL || this.m_compareFunc == gl.NOTEQUAL) ? 0.0 : 0.5;
        var refOutOfBoundsUpper = 1.1;
        var refOutOfBoundsLower = -0.1;
        var singleSample = new rrMultisamplePixelBufferAccess.MultisamplePixelBufferAccess().getNumSamples() == 0;
        //var singleSample = this.m_context.getRenderTarget().getNumSamples() == 0;

        if (singleSample)
            this.m_cases.push(es3fTextureShadowTests.newFilterCaseWithValues(this.m_gradientTex, refInRangeUpper, [-1.25, -1.2], [1.2, 1.25]));    // minification
        else
            this.m_cases.push(es3fTextureShadowTests.newFilterCaseWithValues(this.m_gradientTex,    refInRangeUpper, [-1.19, -1.3], [1.1, 1.35]));    // minification - w/ tuned coordinates to avoid hitting triangle edges

        this.m_cases.push(es3fTextureShadowTests.newFilterCaseWithValues(this.m_gradientTex, refInRangeLower, [0.8, 0.8], [1.25, 1.20]));    // magnification
        this.m_cases.push(es3fTextureShadowTests.newFilterCaseWithValues(this.m_gridTex, refInRangeUpper, [-1.19, -1.3], [1.1, 1.35]));    // minification
        this.m_cases.push(es3fTextureShadowTests.newFilterCaseWithValues(this.m_gridTex, refInRangeLower, [-1.2, -1.1], [-0.8, -0.8]));    // magnification
        this.m_cases.push(es3fTextureShadowTests.newFilterCaseWithValues(this.m_gridTex, refOutOfBoundsUpper, [-0.61, -0.1], [0.9, 1.18]));    // reference value clamp, upper

        if (singleSample)
            this.m_cases.push(es3fTextureShadowTests.newFilterCaseWithValues(this.m_gridTex, refOutOfBoundsLower, [-0.75, 1.0], [0.05, 0.75]));    // reference value clamp, lower
        else
            this.m_cases.push(es3fTextureShadowTests.newFilterCaseWithValues(this.m_gridTex, refOutOfBoundsLower, [-0.75, 1.0], [0.25, 0.75]));    // reference value clamp, lower

        this.m_caseNdx = 0;
    };

    es3fTextureShadowTests.TextureCubeShadowCase.prototype.iterate = function () {
        var viewportSize = 28;
        var viewport = new glsTextureTestUtil.RandomViewport(document.getElementById('canvas'), viewportSize, viewportSize, deString.deStringHash(this.fullName()) ^ deMath.deMathHash(this.m_caseNdx));
        var curCase = this.m_cases[this.m_caseNdx];
        var sampleParams = new glsTextureTestUtil.ReferenceParams(glsTextureTestUtil.textureType.TEXTURETYPE_2D);

        if (viewport.width < viewportSize || viewport.height < viewportSize)
            throw new Error('Too small render target');

        // Setup texture
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, curCase.texture.getGLTexture());
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, this.m_minFilter);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, this.m_magFilter);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, this.m_wrapS);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, this.m_wrapT);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_COMPARE_FUNC, this.m_compareFunc);

        // Other state
        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

        // Params for reference computation.
        sampleParams.sampler = gluTextureUtil.mapGLSampler(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, this.m_minFilter, this.m_magFilter);
        sampleParams.sampler.seamlessCubeMap = true;
        sampleParams.sampler.compare = gluTextureUtil.mapGLCompareFunc(this.m_compareFunc);
        sampleParams.samplerType = glsTextureTestUtil.samplerType.SAMPLERTYPE_SHADOW;
        sampleParams.lodMode = glsTextureTestUtil.lodMode.EXACT;
        sampleParams.ref = curCase.ref;

        bufferedLogToConsole (
            "Compare reference value =  " + sampleParams.ref + "\n" +
            "Coordinates: " + curCase.minCoord + " -> " + curCase.maxCoord);

        for (var faceNdx in tcuTexture.CubeFace) {
            var face = tcuTexture.CubeFace[faceNdx];
            var result = new tcuSurface.Surface(viewport.width, viewport.height);
            var texCoord = [];

            texCoord = glsTextureTestUtil.computeQuadTexCoordCubeFace(face, curCase.minCoord, curCase.maxCoord);

            this.m_renderer.renderQuad(0, texCoord, sampleParams);

            gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, result.getAccess().getDataPtr());

            var pixelFormat = new tcuPixelFormat.PixelFormat(8, 8, 8, 8);
            /** @type {tcuTexLookupVerifier.LodPrecision} */ var lodPrecision;
            /** @type {tcuTexCompareVerifier.TexComparePrecision} */ var texComparePrecision;

            lodPrecision.derivateBits = 10;
            lodPrecision.lodBits = 5;
            texComparePrecision.coordBits = [10,10,10];
            texComparePrecision.uvwBits = [6,6,0];
            texComparePrecision.pcfBits = 5;
            texComparePrecision.referenceBits = 16;
            texComparePrecision.resultBits = pixelFormat.redBits-1;

            var isHighQuality = es3fTextureShadowTests.verifyTexCompareResult(tcuTexture.TextureCube, result.getAccess(), curCase.texture.getRefTexture(),
                                                     texCoord, sampleParams, texComparePrecision, lodPrecision, pixelFormat);

            if (!isHighQuality) {
                bufferedLogToConsole('Warning: Verification assuming high-quality PCF filtering failed.');

                lodPrecision.lodBits = 4;
                texComparePrecision.uvwBits = [4,4,0];
                texComparePrecision.pcfBits    = 0;

                var isOk = es3fTextureShadowTests.verifyTexCompareResult(tcuTexture.TextureCube, result.getAccess(), curCase.texture.getRefTexture(),
                                                                                                  texCoord, sampleParams, texComparePrecision, lodPrecision, pixelFormat);
                if (!isOk) {
                    bufferedLogToConsole('ERROR: Verification against low precision requirements failed, failing test case.');
                    testFailedOptions('Image verification failed', false);
                } else
                    testPassedOptions('Low-quality result', true);
            }
        }

        this.m_caseNdx += 1;
        return this.m_caseNdx < this.m_cases.length ? tcuTestCase.IterateResult.CONTINUE : tcuTestCase.IterateResult.STOP;
    };

    /**
     * Testure2DArrayShadowCase
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
     * @param {number} minFilter
     * @param {number} magFilter
     * @param {number} wrapS
     * @param {number} wrapT
     * @param {number} format
     * @param {number} width
     * @param {number} height
     * @param {number} numLayers
     * @param {number} compareFunc
     */
    es3fTextureShadowTests.Texture2DArrayShadowCase = function (name, desc, minFilter, magFilter, wrapS, wrapT, format, width, height, numLayers, compareFunc) {
        tcuTestCase.DeqpTest.call(this, name, desc);
        /** @type {number} */ this.m_minFilter = minFilter;
        /** @type {number} */ this.m_magFilter = magFilter;
        /** @type {number} */ this.m_wrapS = wrapS;
        /** @type {number} */ this.m_wrapT = wrapT;
        /** @type {number} */ this.m_format = format;
        /** @type {number} */ this.m_width = width;
        /** @type {number} */ this.m_height = height;
        /** @type {number} */ this.m_numLayers = numLayers;
        /** @type {number} */ this.m_compareFunc = compareFunc;
        /** @type {?tcuTexture.Texture2DArray} */ this.m_gradientTex = null;
        /** @type {?tcuTexture.Texture2DArray} */ this.m_gridTex = null;
        /** @type {glsTextureTestUtil.TextureRenderer} */ this.m_renderer = new glsTextureTestUtil.TextureRenderer(es3fTextureShadowTests.version, gluShaderUtil.precision.PRECISION_HIGHP);
        /** @type {Array<es3fTextureShadowTests.FilterCase>} */ this.m_cases = [];
        /** @type {number} */ this.m_caseNdx = 0;
    };

    es3fTextureShadowTests.Texture2DArrayShadowCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fTextureShadowTests.Texture2DArrayShadowCase.prototype.constructor = es3fTextureShadowTests.Texture2DArrayShadowCase;

    /**
     * init
     */
    es3fTextureShadowTests.Texture2DArrayShadowCase.prototype.init = function () {
        /** @type {tcuTexture.TextureFormat} */ var texFmt = gluTextureUtil.mapGLInternalFormat(this.m_format);
        /** @type {tcuTextureUtil.TextureFormatInfo} */ var fmtInfo = tcuTextureUtil.getTextureFormatInfo(texFmt);
        /** @type {Array<number>}*/ var cScale = deMath.subtract(fmtInfo.valueMax, fmtInfo.valueMin);
        /** @type {Array<number>}*/ var cBias = fmtInfo.valueMin;
        /** @type {number}*/ var numLevels = deMath.logToFloor(Math.max(this.m_width, this.m_height)) + 1;

        // Create textures.
        this.m_gradientTex = gluTexture.texture2DArrayFromInternalFormat(gl, this.m_format, this.m_width, this.m_height, this.m_numLayers);
        this.m_gridTex = gluTexture.texture2DArrayFromInternalFormat(gl, this.m_format, this.m_width, this.m_height, this.m_numLayers);

        // Fill first gradient texture.
        for (var levelNdx = 0; levelNdx < numLevels; levelNdx++) {
            /** @type {Array<number>}*/ var gMin = deMath.add(deMath.multiply([-0.5, -0.5, -0.5, 2.0], cScale), cBias);
            /** @type {Array<number>}*/ var gMax = deMath.add(deMath.multiply([ 1.0,  1.0,  1.0, 0.0], cScale), cBias);

            this.m_gradientTex.allocLevel(levelNdx);
            tcuTextureUtil.fillWithComponentGradients(
                /** @type {tcuTexture.PixelBufferAccess} */ (this.m_gradientTex.getView().getLevel(levelNdx)), gMin, gMax);
        }

        // Fill second with grid texture.
        for (var levelNdx = 0; levelNdx < numLevels; levelNdx++) {
            /** @type {number}*/ var step = Math.floor(0x00ffffff / numLevels);
            /** @type {number}*/ var rgb = step * levelNdx;
            /** @type {number}*/ var colorA = deMath.binaryOp(0xff000000, rgb, deMath.BinaryOp.OR);
            /** @type {number}*/ var colorB = deMath.binaryOp(0xff000000, deMath.binaryNot(rgb), deMath.BinaryOp.OR);

            this.m_gridTex.allocLevel(levelNdx);
            tcuTextureUtil.fillWithGrid(
                /** @type {tcuTexture.PixelBufferAccess} */ (this.m_gridTex.getView().getLevel(levelNdx)), 4,
                deMath.add(deMath.multiply(tcuRGBA.newRGBAFromValue(colorA).toVec(), cScale), cBias),
                deMath.add(deMath.multiply(tcuRGBA.newRGBAFromValue(colorB).toVec(), cScale), cBias)
            );
        }

        // Upload.
        this.m_gradientTex.upload();
        this.m_gridTex.upload();

        // Compute cases.
        /** @type {number} */ var refInRangeUpper = (this.m_compareFunc == gl.EQUAL || this.m_compareFunc == gl.NOTEQUAL) ? 1.0 : 0.5;
        /** @type {number} */ var refInRangeLower = (this.m_compareFunc == gl.EQUAL || this.m_compareFunc == gl.NOTEQUAL) ? 0.0 : 0.5;
        /** @type {number} */ var refOutOfBoundsUpper = 1.1; // !< lookup function should clamp values to [0, 1] range
        /** @type {number} */ var refOutOfBoundsLower = -0.1;

        /** @type {Array<{texNdx: number, ref: number, lodX: number, lodY: number, oX: number, oY: number}>} */
        var cases = [
            { texNdx: 0, ref: refInRangeUpper, lodX: 1.6,  lodY: 2.9, oX:-1.0, oY:-2.7 },
            { texNdx: 0, ref: refInRangeLower, lodX: -2.0, lodY: -1.35, oX: -0.2, oY: 0.7 },
            { texNdx: 1, ref: refInRangeUpper, lodX: 0.14, lodY: 0.275, oX: -1.5, oY: -1.1 },
            { texNdx: 1, ref: refInRangeLower, lodX: -0.92, lodY: -2.64, oX: 0.4, oY: -0.1 },
            { texNdx: 1, ref: refOutOfBoundsUpper, lodX: -0.49, lodY: -0.22, oX: 0.45, oY: 0.97 },
            { texNdx: 1, ref: refOutOfBoundsLower, lodX: -0.85, lodY: 0.75, oX: 0.25, oY: 0.61 }
        ];

        var viewportW = Math.min(es3fTextureShadowTests.tex2D.VIEWPORT_WIDTH, gl.canvas.width);
        var viewportH = Math.min(es3fTextureShadowTests.tex2D.VIEWPORT_HEIGHT, gl.canvas.height);

        /** @type {number} */ var minLayer = -0.5;
        /** @type {number} */ var maxLayer = this.m_numLayers;

        for (var caseNdx = 0; caseNdx < cases.length; caseNdx++) {
            var tex = cases[caseNdx].texNdx > 0 ? this.m_gridTex : this.m_gradientTex;
            /** @type {number} */ var ref = cases[caseNdx].ref;
            /** @type {number} */ var lodX = cases[caseNdx].lodX;
            /** @type {number} */ var lodY = cases[caseNdx].lodY;
            /** @type {number} */ var oX = cases[caseNdx].oX;
            /** @type {number} */ var oY = cases[caseNdx].oY;
            /** @type {number} */ var sX = Math.exp(lodX * Math.LN2) * viewportW / tex.getRefTexture().getWidth();
            /** @type {number} */ var sY = Math.exp(lodY * Math.LN2) * viewportH / tex.getRefTexture().getHeight();

            this.m_cases.push(es3fTextureShadowTests.newFilterCaseWithValues(tex, ref, [oX, oY, minLayer], [oX+sX, oY+sY, maxLayer]));
        }

        this.m_caseNdx = 0;
        testPassed('');
    };

    /**
     * @return {tcuTestCase.IterateResult}
     */
    es3fTextureShadowTests.Texture2DArrayShadowCase.prototype.iterate = function () {
        var viewport = new glsTextureTestUtil.RandomViewport(document.getElementById('canvas'), es3fTextureShadowTests.tex2D.VIEWPORT_WIDTH, es3fTextureShadowTests.tex2D.VIEWPORT_HEIGHT, deString.deStringHash(this.fullName()) ^ deMath.deMathHash(this.m_caseNdx));
        var curCase = this.m_cases[this.m_caseNdx];
        var sampleParams = new glsTextureTestUtil.ReferenceParams(glsTextureTestUtil.textureType.TEXTURETYPE_2D);
        var rendered = new tcuSurface.Surface(viewport.width, viewport.height);
        var texCoord = [];

        var texCoord = [curCase.minCoord[0], curCase.minCoord[1], curCase.minCoord[2],
            curCase.minCoord[0], curCase.maxCoord[1], (curCase.minCoord[2] + curCase.maxCoord[2]) / 2.0,
            curCase.maxCoord[0], curCase.minCoord[1], (curCase.minCoord[2] + curCase.maxCoord[2]) / 2.0,
            curCase.maxCoord[0], curCase.maxCoord[1], curCase.maxCoord[2]];

        if (viewport.width < es3fTextureShadowTests.tex2D.MIN_VIEWPORT_WIDTH || viewport.height < es3fTextureShadowTests.tex2D.MIN_VIEWPORT_HEIGHT)
            throw new Error('Too small render target');

        sampleParams.sampler = gluTextureUtil.mapGLSampler(this.m_wrapS, this.m_wrapT, this.m_minFilter, this.m_magFilter);
        sampleParams.sampler.compare = gluTextureUtil.mapGLCompareFunc(this.m_compareFunc);
        sampleParams.samplerType = glsTextureTestUtil.samplerType.SAMPLERTYPE_SHADOW;
        sampleParams.lodMode = glsTextureTestUtil.lodMode.EXACT;
        sampleParams.ref = curCase.ref;

        bufferedLogToConsole (
            "Compare reference value =  " + sampleParams.ref + "\n" +
            "Texture Coordinates: " + curCase.minCoord + " -> " + curCase.maxCoord
        );

        gl.bindTexture(gl.TEXTURE_2D_ARRAY, curCase.texture.getGLTexture());
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, this.m_minFilter);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, this.m_magFilter);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, this.m_wrapS);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, this.m_wrapT);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_COMPARE_FUNC, this.m_compareFunc);

        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        this.m_renderer.renderQuad(0, texCoord[0], sampleParams);
        gl.readPixels(viewport.x, viewport.y, viewport.width, viewport.height, gl.RGBA, gl.UNSIGNED_BYTE, rendered.getAccess().getDataPtr());

        var pixelFormat = new tcuPixelFormat.PixelFormat(8, 8, 8, 8);
        /** @type {tcuTexLookupVerifier.LodPrecision} */ var lodPrecision;
        /** @type {tcuTexCompareVerifier.TexComparePrecision} */ var texComparePrecision;

        lodPrecision.derivateBits = 18;
        lodPrecision.lodBits = 6;
        texComparePrecision.coordBits = [20,20,20];
        texComparePrecision.uvwBits = [7,7,7];
        texComparePrecision.pcfBits = 5;
        texComparePrecision.referenceBits = 16;
        texComparePrecision.resultBits = pixelFormat.redBits - 1;

        var isHighQuality = es3fTextureShadowTests.verifyTexCompareResult(tcuTexture.Texture2DArray, rendered.getAccess(), curCase.texture.getRefTexture(),
                                                          texCoord[0], sampleParams, texComparePrecision, lodPrecision, pixelFormat);

        if (!isHighQuality) {
            bufferedLogToConsole('Warning: Verification assuming high-quality PCF filtering failed');

            lodPrecision.lodBits = 4;
            texComparePrecision.uvwBits = [4,4,4];
            texComparePrecision.pcfBits = 0;

            var isOk = es3fTextureShadowTests.verifyTexCompareResult(tcuTexture.Texture2DArray, rendered.getAccess(), curCase.texture.getRefTexture(),
                                                                                              texCoord, sampleParams, texComparePrecision, lodPrecision, pixelFormat);

            if (!isOk) {
                bufferedLogToConsole('ERROR: Verification against low precision requirements failed, failing test case.');
                testFailedOptions('Image verification failed', false);
            } else
                testPassedOptions('Low-quality result', true);
        }

        this.m_caseNdx += 1;
        return this.m_caseNdx < this.m_cases.length ? tcuTestCase.IterateResult.CONTINUE : tcuTestCase.IterateResult.STOP;
    };

    es3fTextureShadowTests.init = function() {
        /** @type {Array<es3fTextureShadowTests.Format>} */ var formats = [];
        formats[0] = new es3fTextureShadowTests.Format();
        formats[0].name = 'depth_component16';
        formats[0].format = gl.DEPTH_COMPONENT16;
        formats[1] = new es3fTextureShadowTests.Format();
        formats[1].name = 'depth_component32f';
        formats[1].format = gl.DEPTH_COMPONENT32F;
        formats[2] = new es3fTextureShadowTests.Format();
        formats[2].name = 'depth24_stencil8';
        formats[2].format = gl.DEPTH24_STENCIL8;

        /** @type {Array<es3fTextureShadowTests.Filter>} */ var filters = [];
        filters[0] = new es3fTextureShadowTests.Filter();
        filters[0].name = 'nearest';
        filters[0].minFilter = gl.NEAREST;
        filters[0].magFilter = gl.NEAREST;
        filters[1] = new es3fTextureShadowTests.Filter();
        filters[1].name = 'linear';
        filters[1].minFilter = gl.LINEAR;
        filters[1].magFilter = gl.LINEAR;
        filters[2] = new es3fTextureShadowTests.Filter();
        filters[2].name = 'nearest_mipmap_nearest';
        filters[2].minFilter = gl.NEAREST_MIPMAP_NEAREST;
        filters[2].magFilter = gl.LINEAR;
        filters[3] = new es3fTextureShadowTests.Filter();
        filters[3].name = 'linear_mipmap_nearest';
        filters[3].minFilter = gl.LINEAR_MIPMAP_NEAREST;
        filters[3].magFilter = gl.LINEAR;
        filters[4] = new es3fTextureShadowTests.Filter();
        filters[4].name = 'nearest_mipmap_linear';
        filters[4].minFilter = gl.NEAREST_MIPMAP_LINEAR;
        filters[4].magFilter = gl.LINEAR;
        filters[5] = new es3fTextureShadowTests.Filter();
        filters[5].name = 'linear_mipmap_linear';
        filters[5].minFilter = gl.LINEAR_MIPMAP_LINEAR;
        filters[5].magFilter = gl.LINEAR;

        /** @type {Array<es3fTextureShadowTests.CompareFunc>} */ var compareFuncs = [];
        compareFuncs[0] = new es3fTextureShadowTests.CompareFunc();
        compareFuncs[0].name = 'less_or_equal';
        compareFuncs[0].func = gl.LEQUAL;
        compareFuncs[1] = new es3fTextureShadowTests.CompareFunc();
        compareFuncs[1].name = 'greater_or_equal';
        compareFuncs[1].func = gl.GEQUAL;
        compareFuncs[2] = new es3fTextureShadowTests.CompareFunc();
        compareFuncs[2].name = 'less';
        compareFuncs[2].func = gl.LESS;
        compareFuncs[3] = new es3fTextureShadowTests.CompareFunc();
        compareFuncs[3].name = 'greater';
        compareFuncs[3].func = gl.GREATER;
        compareFuncs[4] = new es3fTextureShadowTests.CompareFunc();
        compareFuncs[4].name = 'equal';
        compareFuncs[4].func = gl.EQUAL;
        compareFuncs[5] = new es3fTextureShadowTests.CompareFunc();
        compareFuncs[5].name = 'not_equal';
        compareFuncs[5].func = gl.NOTEQUAL;
        compareFuncs[6] = new es3fTextureShadowTests.CompareFunc();
        compareFuncs[6].name = 'always';
        compareFuncs[6].func = gl.ALWAYS;
        compareFuncs[7] = new es3fTextureShadowTests.CompareFunc();
        compareFuncs[7].name = 'never';
        compareFuncs[7].func = gl.NEVER;

        var state = tcuTestCase.runner;
        /** @type {tcuTestCase.DeqpTest} */ var testGroup = state.testCases;

        var group2D = tcuTestCase.newTest('2d', '2D texture shadow lookup tests');
        testGroup.addChild(group2D);

        for (var filterNdx = 0; filterNdx < filters.length; filterNdx++) {
            var filterGroup = tcuTestCase.newTest(filters[filterNdx].name, '');
            group2D.addChild(filterGroup);

            for (var compareNdx = 0; compareNdx < compareFuncs.length; compareNdx++) {
                for (var formatNdx = 0; formatNdx < formats.length; formatNdx++) {
                    /** @type {number} */ var minFilter = filters[filterNdx].minFilter;
                    /** @type {number} */ var magFilter = filters[filterNdx].magFilter;
                    /** @type {number} */ var format = formats[formatNdx].format;
                    /** @type {number} */ var compareFunc = compareFuncs[compareNdx].func;
                    /** @type {number} */ var wrapS = gl.REPEAT;
                    /** @type {number} */ var wrapT = gl.REPEAT;
                    /** @type {number} */ var width = 32;
                    /** @type {number} */ var height = 64;
                    /** @type {string} */ var name = compareFuncs[compareNdx].name + '_' + formats[formatNdx].name;

                    filterGroup.addChild(new es3fTextureShadowTests.Texture2DShadowCase(name, '', minFilter, magFilter, wrapS, wrapT, format, width, height, compareFunc));
                }
            }
        }

        var groupCube = tcuTestCase.newTest('cube', 'Cube map texture shadow lookup tests');
        testGroup.addChild(groupCube);

        for (filterNdx = 0; filterNdx < filters.length; filterNdx++) {
            filterGroup = tcuTestCase.newTest(filters[filterNdx].name, '');
            groupCube.addChild(filterGroup);

            for (compareNdx = 0; compareNdx < compareFuncs.length; compareNdx++) {
                for (formatNdx = 0; formatNdx < formats.length; formatNdx++) {
                    minFilter = filters[filterNdx].minFilter;
                    magFilter = filters[filterNdx].magFilter;
                    format = formats[formatNdx].format;
                    compareFunc = compareFuncs[compareNdx].func;
                    wrapS = gl.REPEAT;
                    wrapT = gl.REPEAT;
                    var size = 32;
                    name = compareFuncs[compareNdx].name + '_' + formats[formatNdx].name;

                    filterGroup.addChild(new es3fTextureShadowTests.TextureCubeShadowCase(name, '', minFilter, magFilter, wrapS, wrapT, format, size, compareFunc));
                }
            }
        }

    };

    es3fTextureShadowTests.run = function(context) {
        gl = context;
        //Set up Test Root parameters
        var testName = 'texture_shadow';
        var testDescription = 'Texture Shadow Test';
        var state = tcuTestCase.runner;

        state.testName = testName;
        state.testCases = tcuTestCase.newTest(testName, testDescription, null);

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Create test cases
            es3fTextureShadowTests.init();
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            bufferedLogToConsole(err);
            tcuTestCase.runner.terminate();
        }
    };
});
