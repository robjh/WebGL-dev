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

goog.scope(function() {

var es3fTextureShadowTests = functional.gles3.es3fTextureShadowTests;
var tcuTestCase = framework.common.tcuTestCase;
var glsTextureTestUtil = modules.shared.glsTextureTestUtil;
var gluShaderUtil = framework.opengl.gluShaderUtil;
var gluTexture = framework.opengl.gluTexture;
var gluTextureUtil = framework.opengl.gluTextureUtil;
var tcuTexture = framework.common.tcuTexture;
var tcuImageCompare = framework.common.tcuImageCompare;
var tcuTextureUtil = framework.common.tcuTextureUtil;
var tcuRGBA = framework.common.tcuRGBA;
var deMath = framework.delibs.debase.deMath;
var tcuPixelFormat = framework.common.tcuPixelFormat;
var tcuSurface = framework.common.tcuSurface;
var tcuTexCompareVerifier = framework.common.tcuTexCompareVerifier;
var tcuTexLookupVerifier = framework.common.tcuTexLookupVerifier;

    es3fTextureShadowTests.version = '300 es';

    /**
     * @param {tcuTexture.TextureFormat} format
     * @return {boolean}
     */
    es3fTextureShadowTests.isFloatingPointDepthFormat = function(format) {
        // Only two depth and depth-stencil formats are floating point
        return (format.order == tcuTexture.ChannelOrder.D && format.type == tcuTexture.ChannelType.FLOAT) || (format.order == tcuTexture.ChannelOrder.DS && format.type == tcuTexture.ChannelType.FLOAT_UNSIGNED_INT_24_8_REV);
    };

    /**
     * @param {tcuTexture.Texture2D} target
     * @return {tcuTexture.Texture2D}
     */
    es3fTextureShadowTests.clampFloatingPointTextureTexture2D = function(target) {
        //TODO: Implement

        return target;
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

            es3fTextureShadowTests.clampFloatingPointTextureTexture2D(clampedSource);

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
            tcuImageCompare.displayImages(result);

        return numFailedPixels == 0;

    };

    /** @enum */
    es3fTextureShadowTests.text2D = {
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
    es3fTextureShadowTests.SimpleFilterCase = function() {
        /** @type {tcuTexture.Texture2D} */ this.texture = null;
        /** @type {number} */ this.ref = 0.0;
    };

    /**
     * @constructor
     * @struct
     */
    es3fTextureShadowTests.FilterCase = function(tex, ref, minCoord, maxCoord) {
        /** @type {tcuTexture.Texture2D} */ this.texture = tex;
        /** @type {Array<number>} */ this.minCoord = minCoord;
        /** @type {Array<number>} */ this.maxCoord = maxCoord;
        /** @type {number} */ this.ref = ref;
    };

    /**
     * @constructor
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
        this.m_textures[0] = new tcuTexture.Texture2D(this.m_format, this.m_width, this.m_height);
        this.m_textures[1] = new tcuTexture.Texture2D(this.m_format, this.m_width, this.m_height);

        var numLevels = this.m_textures[0].getRefTexture().getNumLevels();

        for (var levelNdx = 0; levelNdx < numLevels; levelNdx++) {
            this.m_textures[0].getRefTexture().allocLevel(levelNdx);
            tcuTextureUtil.fillWithComponentGradients(this.m_textures[0].getRefTexture().getLevel(levelNdx), [-0.5, -0.5, -0.5, 2.0], [1, 1, 1, 0]);
        }

        for (levelNdx = 0; levelNdx < numLevels; levelNdx++) {
            var step = 0x00ffffff / numLevels;
            var rgb = step * levelNdx;
            var colorA = 0xff000000 | rgb;
            var colorB = 0xff000000 | ~rgb;

            this.m_textures[1].getRefTexture().allocLevel(levelNdx);
            tcuTextureUtil.fillWithGrid(this.m_textures[0].getRefTexture().getLevel(levelNdx), 4, tcuRGBA.newRGBAFromValue(colorA).toVec(), tcuRGBA.newRGBAFromValue(colorB).toVec());
        }

        for (var i = 0; i < this.m_textures.length; i++)
            this.m_textures[i].upload();

        var refInRangeUpper = (this.m_compareFunc == gl.EQUAL || this.m_compareFunc == gl.NOTEQUAL) ? 1.0 : 0.5;
        var refInRangeLower = (this.m_compareFunc == gl.EQUAL || this.m_compareFunc == gl.NOTEQUAL) ? 1.0 : 0.5;

        var refOutOfBoundsUpper = 1.1;
        var refOutOfBoundsLower = -0.1;

        numLevels = this.m_textures[0].getRefTexture().getNumLevels();

        var cases = [];
        cases[0] = new es3fTextureShadowTests.TestCase;
        cases[0].texNdx = 0;
        cases[0].ref = refInRangeUpper;
        cases[0].lodX = 1.6;
        cases[0].lodY = 2.9;
        cases[0].oX = -1.0;
        cases[0].oY = -2.7;
        cases[1] = new es3fTextureShadowTests.TestCase;
        cases[1].texNdx = 0;
        cases[1].ref = refInRangeLower;
        cases[1].lodX = -2.0;
        cases[1].lodY = -1.35;
        cases[1].oX = -0.2;
        cases[1].oY = 0.7;
        cases[2] = new es3fTextureShadowTests.TestCase;
        cases[2].texNdx = 1;
        cases[2].ref = refInRangeUpper;
        cases[2].lodX = 0.14;
        cases[2].lodY = 0.275;
        cases[2].oX = -1.5;
        cases[2].oY = -1.1;
        cases[3] = new es3fTextureShadowTests.TestCase;
        cases[3].texNdx = 1;
        cases[3].ref = refInRangeLower;
        cases[3].lodX = -0.92;
        cases[3].lodY = -2.64;
        cases[3].oX = 0.4;
        cases[3].oY = -0.1;
        cases[4] = new es3fTextureShadowTests.TestCase;
        cases[4].texNdx = 1;
        cases[4].ref = refOutOfBoundsUpper;
        cases[4].lodX = -0.39;
        cases[4].lodY = -0.52;
        cases[4].oX = 0.65;
        cases[4].oY = 0.87;
        cases[5] = new es3fTextureShadowTests.TestCase;
        cases[5].texNdx = 1;
        cases[5].ref = refOutOfBoundsLower;
        cases[5].lodX = -1.55;
        cases[5].lodY = 0.65;
        cases[5].oX = 0.35;
        cases[5].oY = 0.91;

        var viewportW = Math.min(es3fTextureShadowTests.text2D.VIEWPORT_WIDTH, gl.canvas.width);
        var viewportH = Math.min(es3fTextureShadowTests.text2D.VIEWPORT_HEIGHT, gl.canvas.height);

        for (var caseNdx = 0; caseNdx < cases.length; caseNdx++) {
            var texNdx = deMath.clamp(caseNdx[caseNdx].texNdx, 0, this.m_textures.length - 1);
            var ref = cases[caseNdx].ref;
            var lodX = cases[caseNdx].lodX;
            var lodY = cases[caseNdx].lodY;
            var oX = cases[caseNdx].oX;
            var oY = cases[caseNdx].oY;
            var sX = Math.exp(lodX * Math.log(2)) * viewportW / this.m_textures[texNdx].getWidth();
            var sY = Math.exp(lodY * Math.log(2)) * viewportH / this.m_textures[texNdx].getHeight();

            this.m_cases.push(new es3fTextureShadowTests.FilterCase(this.m_textures[texNdx], ref, [oX, oY], [oX + sX, oY + sY]));
        }

        this.m_caseNdx = 0;
    };

    es3fTextureShadowTests.Texture2DShadowCase.prototype.iterate = function() {

        var viewport = new glsTextureTestUtil.RandomViewport(document.getElementById('canvas'), es3fTextureShadowTests.text2D.VIEWPORT_WIDTH, es3fTextureShadowTests.text2D.VIEWPORT_HEIGHT);
        var curCase = this.m_cases[this.m_caseNdx];
        var sampleParams = new glsTextureTestUtil.ReferenceParams(glsTextureTestUtil.textureType.TEXTURETYPE_2D);
        var rendered = new tcuSurface.Surface(viewport.width, viewport.height);
        var texCoord = [];

        if (viewport.width < es3fTextureShadowTests.text2D.MIN_VIEWPORT_WIDTH || viewport.height < es3fTextureShadowTests.text2D.MIN_VIEWPORT_HEIGHT)
            throw new Error('Too small render target');

        // Setup params for reference.
        sampleParams.sampler = gluTextureUtil.mapGLSampler(this.m_wrapS, this.m_wrapT, gl.NEAREST, this.m_minFilter, this.m_magFilter);
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
     * @param {tcuRGBA.RGBA} c
     * @return {Array<number>}
     */
    es3fTextureShadowTests.toVec4 = function(c) {
        return [c.getRed() / 255.0, c.getGreen() / 255.0, c.getBlue() / 255.0, c.getAlpha() / 255.0];
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
        /** @type {tcuTestCase.DeqpTest} */ var testGroup = state.TestCases;

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
    };

    es3fTextureShadowTests.run = function(context) {
        gl = context;
        //Set up Test Root parameters
        var testName = 'texture_shadow';
        var testDescription = 'Texture Shadow Test';
        var state = tcuTestCase.runner;

        state.testName = testName;
        state.TestCases = tcuTestCase.newTest(testName, testDescription, null);

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
