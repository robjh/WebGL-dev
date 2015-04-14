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
define([
    'functional/gles3/es3fFboTestCase',
    'functional/gles3/es3fFboTestUtil',
    'framework/common/tcuTestCase',
    'framework/common/tcuSurface',
    'framework/common/tcuRGBA',
    'framework/common/tcuImageCompare',
    'framework/common/tcuTexture',
    'framework/common/tcuTextureUtil',
    'framework/delibs/debase/deMath',
    'framework/opengl/gluTextureUtil'], function(
        fboTestCase,
        fboTestUtil, 
        tcuTestCase, 
        tcuSurface, 
        tcuRGBA, 
        tcuImageCompare, 
        tcuTexture, 
        tcuTextureUtil, 
        deMath, 
        gluTextureUtil) {
    'use strict';

    /** @type {WebGL2RenderingContext} */ var gl;
    /**
    * BlitRectCase class, inherits from FboTestCase
    * @constructor
    * @param {string} name
    * @param {string} description
    * @param {number} filter deUint32
    * @param {Array<number>} srcSize
    * @param {Array<number>} srcRect
    * @param {Array<number>} dstSize
    * @param {Array<number>} dstRect
    * @param {number} cellSize
    */
    var BlitRectCase = function(name, desc, filter, srcSize, srcRect, dstSize, dstRect, cellSize) {
        fboTestCase.FboTestCase.call(name, desc);
        /** @const {number} */ this.m_filter = filter;
        /** @const {Array<number>} */ this.m_srcSize = srcSize;
        /** @const {Array<number>} */ this.m_srcRect = srcRect;
        /** @const {Array<number>} */ this.m_dstSize = dstSize;
        /** @const {Array<number>} */ this.m_dstRect = dstRect;
        /** @const {number} */ this.m_cellSize = cellSize === undefined ? 8 : cellSize;
        /** @const {Array<number>} */ this.m_gridCellColorA = [0.2, 0.7, 0.1, 1.0];
        /** @const {Array<number>} */ this.m_gridCellColorB = [0.7, 0.1, 0.5, 0.8];
    };

    BlitRectCase.prototype = Object.create(fboTestCase.FboTestCase.prototype);
    BlitRectCase.prototype.constructor = BlitRectCase;

    /**
    * @param {tcuSurface.Surface} dst
    */
    BlitRectCase.prototype.render = function(dst) {
        /** @type {number} */ var colorFormat = gl.RGBA8;

        //TODO: implement Texture2DShader, Texture2DShader
        /** @type {fboTestUtil.GradientShader} */
        var gradShader = new fboTestUtil.GradientShader(
            gluShaderUtil.DataType.TYPE_FLOAT_VEC4);
        /** @type {fboTestUtil.Texture2DShader} */
        var texShader = new fboTestUtil.Texture2DShader(
            [gluShaderUtil.DataType.TYPE_SAMPLER_2D],
            gluShaderUtil.DataType.TYPE_FLOAT_VEC4);

        // TODO: implement getCurrentContext()
        /** @type {number} */ var gradShaderID = getCurrentContext().createProgram(gradShader);
        /** @type {number} */ var texShaderID = getCurrentContext().createProgram(texShader);

        /** @type {Framebuffer} */ var srcFbo;
        /** @type {Framebuffer} */ var dstFbo;
        /** @type {Renderbuffer} */ var srcRbo;
        /** @type {Renderbuffer} */ var dstRbo;

        // Setup shaders
        gradShader.setGradient(getCurrentContext(), gradShaderID, [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);
        texShader.setUniforms(getCurrentContext(), texShaderID);

        // Create framebuffers.

        /** @type {Array<number>} */ var size;

        // source framebuffers
        srcFbo = gl.createFramebuffer();
        srcRbo = gl.createRenderbuffer();
        size = this.m_srcSize;

        gl.bindRenderbuffer(gl.RENDERBUFFER, srcRbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, colorFormat, size[0], size[1]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, srcFbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, srcRbo);
        this.checkError();
        this.checkFramebufferStatus(gl.FRAMEBUFFER);

        // destination framebuffers
        dstFbo = gl.createFramebuffer();
        dstRbo = gl.createRenderbuffer();
        size = this.m_dstSize;

        gl.bindRenderbuffer(gl.RENDERBUFFER, dstRbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, colorFormat, size[0], size[1]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, dstRbo);
        this.checkError();
        this.checkFramebufferStatus(gl.FRAMEBUFFER);


        // Fill destination with gradient.
        gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo);
        gl.viewport(0, 0, this.m_dstSize[0], this.m_dstSize[1]);

        //TODO: implement drawQuad
        //sglr.drawQuad(*getCurrentContext(), gradShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(1.0f, 1.0f, 0.0f));

        // Fill source with grid pattern.
        /** @const {number} */ var format = gl.RGBA;
        /** @const {number} */ var dataType = gl.UNSIGNED_BYTE;
        /** @const {number} */ var texW = this.m_srcSize[0];
        /** @const {number} */ var texH = this.m_srcSize[1];
        /** @type {number} */ var gridTex = 0;
        /** @type {tcuTexture.TextureLevel} */ var data = new tcuTexture.TextureLevel(gluTextureUtil.mapGLTransferFormat(format, dataType), texW, texH, 1);

        tcuTextureUtil.fillWithGrid(data.getAccess(), this.m_cellSize, this.m_gridCellColorA, this.m_gridCellColorB);

        gridTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, gridTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, texW, texH, 0, format, dataType, data.getAccess().getDataPtr());

        gl.bindFramebuffer(gl.FRAMEBUFFER, srcFbo);
        gl.viewport(0, 0, this.m_srcSize[0], this.m_srcSize[1]);
        // TODO: implement drawQuad
        // sglr.drawQuad(getCurrentContext(), texShaderID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);

        // Perform copy.
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, srcFbo);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dstFbo);
        gl.blitFramebuffer(this.m_srcRect[0], this.m_srcRect[1], this.m_srcRect[2], this.m_srcRect[3],
                           this.m_dstRect[0], this.m_dstRect[1], this.m_dstRect[2], this.m_dstRect[3],
                           gl.COLOR_BUFFER_BIT, this.m_filter);

        // Read back results.
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, dstFbo);

        this.readPixelsUsingFormat(dst, 0, 0, this.m_dstSize[0], this.m_dstSize[1],
                                          gluTextureUtil.mapGLInternalFormat(colorFormat),
                                          [1.0, 1.0, 1.0, 1.0],
                                          [0.0, 0.0, 0.0, 0.0]);
    };

    /**
    * @param {tcuSurface.Surface} reference
    * @param {tcuSurface.Surface} result
    * @return {boolean}
    */
    BlitRectCase.prototype.compare = function(reference, result) {
        // TODO: implement
        // Use pixel-threshold compare for rect cases since 1px off will mean failure.
        //tcu::RGBA threshold = TestCase::m_context.getRenderTarget().getPixelFormat().getColorThreshold() + tcu::RGBA(7,7,7,7);
        /** @type {tcuRGBA.RGBA} */ var threshold = tcuRGBA.newRGBAComponents(7, 7, 7, 7);
        return tcuImageCompare.pixelThresholdCompare('Result', 'Image comparison result', reference, result, threshold, null /*tcu::COMPARE_LOG_RESULT*/);
    };

    /**
    * BlitNearestFilterConsistencyCase class, inherits from FboTestCase
    * @constructor
    * @param {string} name
    * @param {string} desc
    * @param {Array<number>} srcSize
    * @param {Array<number>} srcRect
    * @param {Array<number>} dstSize
    * @param {Array<number>} dstRect
    */
    var BlitNearestFilterConsistencyCase = function(name, desc, srcSize, srcRect, dstSize, dstRect) {
        BlitRectCase.call(name, desc, gl.NEAREST, srcSize, srcRect, dstSize, dstRect, 1);
    };

    BlitNearestFilterConsistencyCase.prototype = Object.create(BlitRectCase.prototype);
    BlitNearestFilterConsistencyCase.prototype.constructor = BlitNearestFilterConsistencyCase;

    /**
    * @param {tcuSurface.Surface} reference
    * @param {tcuSurface.Surface} result
    * @return {boolean}
    */
    BlitNearestFilterConsistencyCase.prototype.compare = function(reference, result) {
        DE_ASSERT(reference.getWidth() == result.getWidth());
        DE_ASSERT(reference.getHeight() == result.getHeight());

        // Image origin must be visible (for baseColor)
        DE_ASSERT(Math.min(this.m_dstRect[0], this.m_dstRect[2]) >= 0);
        DE_ASSERT(Math.min(this.m_dstRect[1], this.m_dstRect[3]) >= 0);
        /** @const {tcuRGBA.RGBA} */ var cellColorA = tcuRGBA.newRGBAFromArray(m_gridCellColorA);
        /** @const {tcuRGBA.RGBA} */ var cellColorB = tcuRGBA.newRGBAFromArray(m_gridCellColorB);
        // TODO: implement
        // const tcu::RGBA        threshold        = TestCase::m_context.getRenderTarget().getPixelFormat().getColorThreshold() + tcu::RGBA(7,7,7,7);
        /** @type {tcuRGBA.RGBA} */ var threshold = tcuRGBA.newRGBAComponents(7, 7, 7, 7);
        /** @const {Array<number>} */  //IVec4.xyzw
        var destinationArea = [
            deMath.clamp(Math.min(this.m_dstRect[0], this.m_dstRect[2]), 0, result.getWidth()),
            deMath.clamp(Math.min(this.m_dstRect[1], this.m_dstRect[3]), 0, result.getHeight()),
            deMath.clamp(Math.max(this.m_dstRect[0], this.m_dstRect[2]), 0, result.getWidth()),
            deMath.clamp(Math.max(this.m_dstRect[1], this.m_dstRect[3]), 0, result.getHeight())];

        /** @const {tcuRGBA.RGBA} */ var baseColor = result.getPixel(destinationArea[0], destinationArea[1]);

        /** @const {boolean} */ var signConfig = tcuRGBA.compareThreshold(baseColor, cellColorA, threshold);

        /** @type {boolean} */ var error = false;
        /** @type {tcuSurface.Surface} */ var errorMask = new tcuSurface.Surface(result.getWidth(), result.getHeight());
        /** @type {Array<boolean>} */ var horisontalSign = [];
        /** @type {Array<boolean>} */ var verticalSign = [];

        tcuTextureUtil.clear(errorMask.getAccess(), [0.0, 1.0, 0.0, 1.0]);

        // Checking only area in our destination rect

        // m_testCtx.getLog()
        //     << tcu::TestLog::Message
        //     << 'Verifying consistency of NEAREST filtering. Verifying rect ' << m_dstRect << '.\n'
        //     << 'Rounding direction of the NEAREST filter at the horisontal texel edge (x = n + 0.5) should not depend on the y-coordinate.\n'
        //     << 'Rounding direction of the NEAREST filter at the vertical texel edge (y = n + 0.5) should not depend on the x-coordinate.\n'
        //     << 'Blitting a grid (with uniform sized cells) should result in a grid (with non-uniform sized cells).'
        //     << tcu::TestLog::EndMessage;

        // Verify that destination only contains valid colors

        /** @type {tcuRGBA.RGBA} */ var color;

        for (var dy = 0; dy < destinationArea[3] - destinationArea[1]; ++dy) {
            for (var dx = 0; dx < destinationArea[2] - destinationArea[0]; ++dx) {
                color = result.getPixel(destinationArea[0] + dx, destinationArea[1] + dy);

                /** @const {boolean} */
                var isValidColor =
                            tcuRGBA.compareThreshold(color, cellColorA, threshold) ||
                            tcuRGBA.compareThreshold(color, cellColorB, threshold);

                if (!isValidColor) {
                    errorMask.setPixel(destinationArea[0] + dx, destinationArea[1] + dy, tcuRGBA.RGBA.red);
                    error = true;
                }
            }
        }

        if (error) {
            // m_testCtx.getLog()
            //     << tcu::TestLog::Message
            //     << 'Image verification failed, destination rect contains unexpected values. '
            //     << 'Expected either ' << cellColorA << ' or ' << cellColorB << '.'
            //     << tcu::TestLog::EndMessage
            //     << tcu::TestLog::ImageSet('Result', 'Image verification result')
            //     << tcu::TestLog::Image('Result',    'Result',        result)
            //     << tcu::TestLog::Image('ErrorMask',    'Error mask',    errorMask)
            //     << tcu::TestLog::EndImageSet;
            return false;
        }

        // Detect result edges by reading the first row and first column of the blitted area.
        // Blitting a grid should result in a grid-like image. ('sign changes' should be consistent)

        for (var dx = 0; dx < destinationArea[2] - destinationArea[0]; ++dx) {
            color = result.getPixel(destinationArea[0] + dx, destinationArea[1]);
            if (tcuRGBA.compareThreshold(color, cellColorA, threshold))
                horisontalSign[dx] = true;
            else if (tcuRGBA.compareThreshold(color, cellColorB, threshold))
                horisontalSign[dx] = false;
            else
                DE_ASSERT(false);
        }
        for (var dy = 0; dy < destinationArea[3] - destinationArea[1]; ++dy) {
            color = result.getPixel(destinationArea[0], destinationArea[1] + dy);

            if (tcuRGBA.compareThreshold(color, cellColorA, threshold))
                verticalSign[dy] = true;
            else if (tcuRGBA.compareThreshold(color, cellColorB, threshold))
                verticalSign[dy] = false;
            else
                DE_ASSERT(false);
        }

        // Verify grid-like image

        for (var dy = 0; dy < destinationArea[3] - destinationArea[1]; ++dy) {
            for (var dx = 0; dx < destinationArea[2] - destinationArea[0]; ++dx) {
                color = result.getPixel(destinationArea[0] + dx, destinationArea[1] + dy);
                /** @const {boolean} */ var resultSign = tcuRGBA.compareThreshold(cellColorA, color, threshold);
                /** @const {boolean} */ var correctSign = (horisontalSign[dx] == verticalSign[dy]) == signConfig;

                if (resultSign != correctSign) {
                    errorMask.setPixel(destinationArea[0] + dx, destinationArea[1] + dy, tcuRGBA.RGBA.red);
                    error = true;
                }
            }
        }
        // Report result

        // if (error)
        // {
        //     m_testCtx.getLog()
        //         << tcu::TestLog::Message
        //         << 'Image verification failed, nearest filter is not consistent.'
        //         << tcu::TestLog::EndMessage
        //         << tcu::TestLog::ImageSet('Result', 'Image verification result')
        //         << tcu::TestLog::Image('Result',    'Result',        result)
        //         << tcu::TestLog::Image('ErrorMask',    'Error mask',    errorMask)
        //         << tcu::TestLog::EndImageSet;
        // }
        // else
        // {
        //     m_testCtx.getLog()
        //         << tcu::TestLog::Message
        //         << 'Image verification passed.'
        //         << tcu::TestLog::EndMessage
        //         << tcu::TestLog::ImageSet('Result', 'Image verification result')
        //         << tcu::TestLog::Image('Result', 'Result', result)
        //         << tcu::TestLog::EndImageSet;
        // }

        return !error;
    };

    /**
    * FramebufferBlitTests class, inherits from TestCase
    * @constructor
    * @param {string} name
    * @param {string} description
    * @param {boolean} useScreenSizedViewport
    */
    var FramebufferBlitTests = function(name, description, useScreenSizedViewport) {
        // TODO: check this constructos
        tcuTestCase.DeqpTest.call(this, name, description);
    };

    FramebufferBlitTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    FramebufferBlitTests.prototype.constructor = FramebufferBlitTests;

    FramebufferBlitTests.prototype.init = function() {
        /** @const {Array.number} */ var colorFormats = [
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

            // GL_EXT_color_buffer_float
            gl.RGBA32F,
            gl.RGBA16F,
            gl.R11F_G11F_B10F,
            gl.RG32F,
            gl.RG16F,
            gl.R32F,
            gl.R16F
        ];

        /** @const {Array.number} */ var depthStencilFormats = [
            gl.DEPTH_COMPONENT32F,
            gl.DEPTH_COMPONENT24,
            gl.DEPTH_COMPONENT16,
            gl.DEPTH32F_STENCIL8,
            gl.DEPTH24_STENCIL8,
            gl.STENCIL_INDEX8
        ];

        // .rect
        /** @constructor
         * @param {name} name
         * @param {srcRect} srcRect
         * @param {dstRect} dstRect
         */
        var CopyRect = function(name, srcRect, dstRect) {
            /** @const {string} */ this.name = name;
            /** @type {Array<number>} */ this.srcRect = srcRect;
            /** @type {Array<number>} */ this.dstRect = dstRect;
        };

        /** @const {Array<CopyRect>} */ var copyRects = [
            new CopyRect('basic', [10, 20, 65, 100], [45, 5, 100, 85]),
            new CopyRect('scale', [10, 20, 65, 100], [25, 30, 125, 94]),
            new CopyRect('out_of_bounds', [-10, -15, 100, 63], [50, 30, 136, 144])
        ];

        /** @const {Array<CopyRect>} */ var filterConsistencyRects = [

            new CopyRect('mag', [20, 10, 74, 88], [10, 10, 91, 101]),
            new CopyRect('min', [10, 20, 78, 100], [20, 20, 71, 80]),
            new CopyRect('out_of_bounds_mag', [21, 10, 73, 82], [11, 43, 141, 151]),
            new CopyRect('out_of_bounds_min', [11, 21, 77, 97], [80, 82, 135, 139])
        ];

        /** @constructor
         * @param {name} name
         * @param {srcRect} srcSwizzle
         * @param {dstRect} dstSwizzle
         */
        var Swizzle = function(name, srcSwizzle, dstSwizzle) {
            /** @const {string} */ this.name = name;
            /** @type {Array<number>} */ this.srcSwizzle = srcSwizzle;
            /** @type {Array<number>} */ this.dstSwizzle = dstSwizzle;
        };

        /** @const {Array<Swizzle>} */ var swizzles = [
            new Swizzle(null, [0, 1, 2, 3], [0, 1, 2, 3]),
            new Swizzle('reverse_src_x', [2, 1, 0, 3], [0, 1, 2, 3]),
            new Swizzle('reverse_src_y', [0, 3, 2, 1], [0, 1, 2, 3]),
            new Swizzle('reverse_dst_x', [0, 1, 2, 3], [2, 1, 0, 3]),
            new Swizzle('reverse_dst_y', [0, 1, 2, 3], [0, 3, 2, 1]),
            new Swizzle('reverse_src_dst_x', [2, 1, 0, 3], [2, 1, 0, 3]),
            new Swizzle('reverse_src_dst_y', [0, 3, 2, 1], [0, 3, 2, 1])
        ];

        /** @const {Array<number>} */ var srcSize = [127, 119];
        /** @const {Array<number>} */ var dstSize = [132, 128];

        // Blit rectangle tests.
        /** @type {TestCaseGroup} */ var rectGroup = new tcuTestCase.newTest('rect', 'Blit rectangle tests');
        testGroup.addChild(rectGroup);
        for (var rectNdx = 0; rectNdx < copyRects.length; rectNdx++) {
            for (var swzNdx = 0; swzNdx < swizzles.length; swzNdx++) {
                /** @type {string} */ var name = copyRects[rectNdx].name + (swizzles[swzNdx].name ? ('_' + swizzles[swzNdx].name) : '');
                /** @type {Array<number>} */ var srcSwz = swizzles[swzNdx].srcSwizzle;
                /** @type {Array<number>} */ var dstSwz = swizzles[swzNdx].dstSwizzle;
                /** @type {Array<number>} */ var srcRect = copyRects[rectNdx].srcRect.swizzle(srcSwz[0], srcSwz[1], srcSwz[2], srcSwz[3]);
                /** @type {Array<number>} */ var dstRect = copyRects[rectNdx].dstRect.swizzle(dstSwz[0], dstSwz[1], dstSwz[2], dstSwz[3]);

                rectGroup.addChild(new BlitRectCase((name + '_nearest'), '', gl.NEAREST, srcSize, srcRect, dstSize, dstRect));
                rectGroup.addChild(new BlitRectCase((name + '_linear'), '', gl.LINEAR, srcSize, srcRect, dstSize, dstRect));
            }
        }

        // Nearest filter tests
        for (var rectNdx = 0; rectNdx < filterConsistencyRects.length; rectNdx++) {
            for (var swzNdx = 0; swzNdx < swizzles.length; swzNdx++) {
                /** @type {string} */ var name = 'nearest_consistency_' + filterConsistencyRects[rectNdx].name + (swizzles[swzNdx].name ? ('_' + swizzles[swzNdx].name) : '');
                /** @type {Array<number>} */ var srcSwz = swizzles[swzNdx].srcSwizzle;
                /** @type {Array<number>} */ var dstSwz = swizzles[swzNdx].dstSwizzle;
                /** @type {Array<number>} */ var srcRect = filterConsistencyRects[rectNdx].srcRect.swizzle(srcSwz[0], srcSwz[1], srcSwz[2], srcSwz[3]);
                /** @type {Array<number>} */ var dstRect = filterConsistencyRects[rectNdx].dstRect.swizzle(dstSwz[0], dstSwz[1], dstSwz[2], dstSwz[3]);

                rectGroup.addChild(new BlitNearestFilterConsistencyCase(name, 'Test consistency of the nearest filter', srcSize, srcRect, dstSize, dstRect));
            }
        }

        // .conversion
        /** @type {TestCaseGroup} */ var conversionGroup = new tcuTestCase.newTest('conversion', 'Color conversion tests');
        testGroup.addChild(conversionGroup);

        for (var srcFmtNdx = 0; srcFmtNdx < colorFormats.length; srcFmtNdx++) {
            for (var dstFmtNdx = 0; dstFmtNdx < colorFormats.length; dstFmtNdx++) {
                /** @type {number} */ var srcFormat = colorFormats[srcFmtNdx];
                /** @type {tcuTexture.TextureFormat} */ var srcTexFmt = gluTextureUtil.mapGLInternalFormat(srcFormat);
                /** @type {tcuTextureUtil.TextureChannelClass} */ var srcType = tcuTextureUtil.getTextureChannelClass(srcTexFmt.type);
                /** @type {number} */ var dstFormat = colorFormats[dstFmtNdx];
                /** @type {tcuTexture.TextureFormat} */ var dstTexFmt = gluTextureUtil.mapGLInternalFormat(dstFormat);
                /** @type {tcuTextureUtil.TextureChannelClass} */ var dstType = tcuTextureUtil.getTextureChannelClass(dstTexFmt.type);

                if (((srcType == tcuTextureUtil.TextureChannelClass.FLOATING_POINT || srcType == tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT) !=
                     (dstType == tcuTextureUtil.TextureChannelClass.FLOATING_POINT || dstType == tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT)) ||
                    ((srcType == tcuTextureUtil.TextureChannelClass.SIGNED_INTEGER) != (dstType == tcuTextureUtil.TextureChannelClass.SIGNED_INTEGER)) ||
                    ((srcType == tcuTextureUtil.TextureChannelClass.UNSIGNED_INTEGER) != (dstType == tcuTextureUtil.TextureChannelClass.UNSIGNED_INTEGER)))
                    continue; // Conversion not supported.

                /** @type {string} */ var name = getFormatName(srcFormat) + '_to_' + getFormatName(dstFormat);

                conversionGroup.addChild(new BlitColorConversionCase(name, '', srcFormat, dstFormat, [127, 113]));
            }
        }

        // .depth_stencil
        /** @type {TestCaseGroup} */ var depthStencilGroup = new tcuTestCase.newTest('depth_stencil', 'Depth and stencil blits');
        testGroup.addChild(depthStencilGroup);

        for (var fmtNdx = 0; fmtNdx < DE_LENGTH_OF_ARRAY(depthStencilFormats); fmtNdx++) {
            /** @type {number} */ var format = depthStencilFormats[fmtNdx];
            /** @type {tcuTexture.TextureFormat} */ var texFmt = gluTextureUtil.mapGLInternalFormat(format);
            /** @type {string} */ var fmtName = getFormatName(format);
            /** @type {boolean} */ var depth = texFmt.order == tcuTexture.ChannelOrder.D || texFmt.order == tcuTexture.ChannelOrder.DS;
            /** @type {boolean} */ var stencil = texFmt.order == tcuTexture.ChannelOrder.S || texFmt.order == tcuTexture.ChannelOrder.DS;
            /** @type {number} */ var buffers = (depth ? gl.DEPTH_BUFFER_BIT : 0) | (stencil ? gl.STENCIL_BUFFER_BIT : 0);

            depthStencilGroup.addChild(new BlitDepthStencilCase((fmtName + '_basic'), '', format, buffers, [128, 128], [0, 0, 128, 128], buffers, [128, 128], [0, 0, 128, 128], buffers));
            depthStencilGroup.addChild(new BlitDepthStencilCase((fmtName + '_scale'), '', format, buffers, [127, 119], [10, 30, 100, 70], buffers, [111, 130], [20, 5, 80, 130], buffers));

            if (depth && stencil) {
                depthStencilGroup.addChild(new BlitDepthStencilCase((fmtName + '_depth_only'), '', format, buffers, [128, 128], [0, 0, 128, 128], buffers, [128, 128], [0, 0, 128, 128], gl.DEPTH_BUFFER_BIT));
                depthStencilGroup.addChild(new BlitDepthStencilCase((fmtName + '_stencil_only'), '', format, buffers, [128, 128], [0, 0, 128, 128], buffers, [128, 128], [0, 0, 128, 128], gl.STENCIL_BUFFER_BIT));
            }
        }

        // .default_framebuffer
        /**
         * @constructor
         * @param {string} name
         * @param {BlitArea} area
         */
        var Area = function(name, area) {
            /** @type {string} name */ this.name = name;
            /** @type {BlitArea} area */ this.area = area;
        };

        /** @type {Array<Area>} */ var areas = [
            new Area('scale', DefaultFramebufferBlitCase.AREA_SCALE),
            new Area('out_of_bounds', DefaultFramebufferBlitCase.AREA_OUT_OF_BOUNDS)
        ];

        /** @type {TestCaseGroup} */ var defaultFbGroup = new tcuTestCase.newTest('default_framebuffer', 'Blits with default framebuffer');
        testGroup.addChild(defaultFbGroup);

        for (var fmtNdx = 0; fmtNdx < colorFormats.length; fmtNdx++) {
            /** @const {number} */ var format = colorFormats[fmtNdx];
            /** @const {tcuTexture.TextureFormat} */ var texFmt = gluTextureUtil.mapGLInternalFormat(format);
            /** @const {tcuTextureUtil.TextureChannelClass} */ var fmtClass = tcuTextureUtil.getTextureChannelClass(texFmt.type);
            /** @const {number} */ var filter = gluTextureUtil.isGLInternalColorFormatFilterable(format) ? gl.LINEAR : gl.NEAREST;
            /** @const {boolean} */ var filterable = gluTextureUtil.isGLInternalColorFormatFilterable(format);

            if (fmtClass != tcuTextureUtil.TextureChannelClass.FLOATING_POINT &&
                fmtClass != tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT &&
                fmtClass != tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT)
                continue; // Conversion not supported.

            defaultFbGroup.addChild(new BlitDefaultFramebufferCase(getFormatName(format), '', format, filter));

            for (var areaNdx = 0; areaNdx < areas.length; areaNdx++) {
                /** @const {string} */ var name = areas[areaNdx].name;
                /** @const {boolean} */ var addLinear = filterable;
                /** @const {boolean} */ var addNearest = !addLinear || (areas[areaNdx].area != DefaultFramebufferBlitCase.AREA_OUT_OF_BOUNDS); // No need to check out-of-bounds with different filtering

                if (addNearest) {

                    defaultFbGroup.addChild(new DefaultFramebufferBlitCase((getFormatName(format) + '_nearest_' + name + '_blit_from_default'), '', format, gl.NEAREST, DefaultFramebufferBlitCase.BLIT_DEFAULT_TO_TARGET, areas[areaNdx].area));
                    defaultFbGroup.addChild(new DefaultFramebufferBlitCase((getFormatName(format) + '_nearest_' + name + '_blit_to_default'), '', format, gl.NEAREST, DefaultFramebufferBlitCase.BLIT_TO_DEFAULT_FROM_TARGET, areas[areaNdx].area));
                }

                if (addLinear) {
                    defaultFbGroup.addChild(new DefaultFramebufferBlitCase((getFormatName(format) + '_linear_' + name + '_blit_from_default'), '', format, gl.LINEAR, DefaultFramebufferBlitCase.BLIT_DEFAULT_TO_TARGET, areas[areaNdx].area));
                    defaultFbGroup.addChild(new DefaultFramebufferBlitCase((getFormatName(format) + '_linear_' + name + '_blit_to_default'), '', format, gl.LINEAR, DefaultFramebufferBlitCase.BLIT_TO_DEFAULT_FROM_TARGET, areas[areaNdx].area));
                }
            }
        }
    };

    /**
     * @param {tcuTexture.ChannelOrder} order
     * @return {Array<boolean>}
     */
    var getChannelMask = function(order) {
        switch (order) {
            case tcuTexture.ChannelOrder.R: return [true, false, false, false];
            case tcuTexture.ChannelOrder.RG: return [true, true, false, false];
            case tcuTexture.ChannelOrder.RGB: return [true, true, true, false];
            case tcuTexture.ChannelOrder.RGBA: return [true, true, true, true];
            case tcuTexture.ChannelOrder.sRGB: return [true, true, true, false];
            case tcuTexture.ChannelOrder.sRGBA: return [true, true, true, true];
            default:
                DE_ASSERT(false);
                return [false, false, false, false];
        }
    };

    /**
     * BlitColorConversionCase class, inherits from FboTestCase
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {number} srcFormat
     * @param {number} dstFormat
     * @param {Array<number>} size
     */
    var BlitColorConversionCase = function(name, desc, srcFormat, dstFormat, size) {
        fboTestCase.FboTestCase.call(name, desc);
        /** @type {number} */ this.m_srcFormat = srcFormat;
        /** @type {number} */ this.m_dstFormat = dstFormat;
        /** @type {Array<number>} */ this.m_size = size;
    };

    BlitColorConversionCase.prototype = Object.create(fboTestCase.FboTestCase.prototype);
    BlitColorConversionCase.prototype.constructor = BlitColorConversionCase;

    BlitColorConversionCase.prototype.preCheck = function() {
        this.checkFormatSupport(this.m_srcFormat);
        this.checkFormatSupport(this.m_dstFormat);
    };

    /**
     * @param {tcuSurface.Surface} dst
     */
    BlitColorConversionCase.prototype.render = function(dst) {
        // TODO: implement
        /** @type {tcuTexture.TextureFormat} */ var srcFormat = new gluTextureUtil.mapGLInternalFormat(this.m_srcFormat);
        /** @type {tcuTexture.TextureFormat} */ var srcFormat = new gluTextureUtil.mapGLInternalFormat(this.m_dstFormat);

        /** @type {gluShaderUtil.DataType} */ var srcOutputType = getFragmentOutputType(srcFormat);
        /** @type {gluShaderUtil.DataType} */ var srcOutputType = getFragmentOutputType(dstFormat);

        // Compute ranges \note Doesn't handle case where src or dest is not subset of the another!
        /** @type {tcuTextureUtil.TextureFormatInfo} */ var srcFmtRangeInfo = tcuTextureUtil.getTextureFormatInfo(srcFormat);
        /** @type {tcuTextureUtil.TextureFormatInfo} */ var dstFmtRangeInfo = tcuTextureUtil.getTextureFormatInfo(dstFormat);

        /** @type {Array<boolean>} */ var copyMask = deMath.logicalAndBool(getChannelMask(srcFormat.order), getChannelMask(dstFormat.order));
        /** @type {Array<boolean>} */ var srcIsGreater = deMath.greaterThan(srcFmtRangeInfo.valueMax - srcFmtRangeInfo.valueMin, dstFmtRangeInfo.valueMax - dstFmtRangeInfo.valueMin);

        /** @type {tcuTexture.TextureFormatInfo} */ var srcRangeInfo =
                                                    (tcuTextureUtil.select(dstFmtRangeInfo.valueMin, srcFmtRangeInfo.valueMin, deMath.logicalAndBool(copyMask, srcIsGreater)),
                                                     tcuTextureUtil.select(dstFmtRangeInfo.valueMax, srcFmtRangeInfo.valueMax, deMath.logicalAndBool(copyMask, srcIsGreater)),
                                                     tcuTextureUtil.select(dstFmtRangeInfo.lookupScale, srcFmtRangeInfo.lookupScale, deMath.logicalAndBool(copyMask, srcIsGreater)),
                                                     tcuTextureUtil.select(dstFmtRangeInfo.lookupBias, srcFmtRangeInfo.lookupBias, deMath.logicalAndBool(copyMask, srcIsGreater)));
        /** @type {tcuTexture.TextureFormatInfo} */ var dstRangeInfo =
                                                    (tcuTextureUtil.select(dstFmtRangeInfo.valueMin, srcFmtRangeInfo.valueMin, deMath.logicalOrBool(deMath.logicalNotBool(copyMask), srcIsGreater)),
                                                     tcuTextureUtil.select(dstFmtRangeInfo.valueMax, srcFmtRangeInfo.valueMax, deMath.logicalOrBool(deMath.logicalNotBool(copyMask), srcIsGreater)),
                                                     tcuTextureUtil.select(dstFmtRangeInfo.lookupScale, srcFmtRangeInfo.lookupScale, deMath.logicalOrBool(deMath.logicalNotBool(copyMask), srcIsGreater)),
                                                     tcuTextureUtil.select(dstFmtRangeInfo.lookupBias, srcFmtRangeInfo.lookupBias, deMath.logicalOrBool(deMath.logicalNotBool(copyMask), srcIsGreater)));

        // Shaders.
        // TODO: implement GradientShader
        /** @type {fboTestUtil.GradientShader} */
        var gradientToSrcShader = new fboTestUtil.GradientShader(srcOutputType);
        /** @type {fboTestUtil.GradientShader} */
        var gradientToDstShader = new fboTestUtil.GradientShader(dstOutputType);

        /** @type {number} */ var gradShaderSrcID = getCurrentContext().createProgram(gradientToSrcShader);
        /** @type {number} */ var gradShaderDstID = getCurrentContext().createProgram(gradientToDstShader);

        /** @type {number} */ var srcFbo;
        /** @type {number} */ var dstFbo;
        /** @type {number} */ var srcRbo;
        /** @type {number} */ var dstRbo;

        // Create framebuffers.
        // Source framebuffers
        srcFbo = gl.createFramebuffer();
        srcRbo = gl.createRenderbuffer();

        gl.bindRenderbuffer(gl.RENDERBUFFER, srcRbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, this.m_srcFormat, this.m_size[0], this.m_size[1]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, srcFbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, srcRbo);
        this.checkError();
        this.checkFramebufferStatus(gl.FRAMEBUFFER);

        // Destination framebuffers
        dstFbo = gl.createFramebuffer();
        dstRbo = gl.createRenderbuffer();

        gl.bindRenderbuffer(gl.RENDERBUFFER, dstRbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, this.m_dstFormat, this.m_size[0], this.m_size[1]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, dstRbo);
        this.checkError();
        this.checkFramebufferStatus(gl.FRAMEBUFFER);

        gl.viewport(0, 0, m_size[0], m_size[1]);

        // Render gradients.
        // TODO: implement getCurrentContext, drawQuad
        gl.bindFramebuffer(gl.FRAMEBUFFER, srcFbo);
        gradientToDstShader.setGradient(getCurrentContext(), gradShaderDstID, dstRangeInfo.valueMax, dstRangeInfo.valueMin);

        // sglr.drawQuad(getCurrentContext(), gradShaderDstID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo);
        gradientToSrcShader.setGradient(getCurrentContext(), gradShaderSrcID, srcRangeInfo.valueMin, dstRangeInfo.valueMax);
        // sglr.drawQuad(getCurrentContext(), gradShaderSrcID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);

        // Execute copy.
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, srcFbo);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dstFbo);
        gl.blitFramebuffer(0, 0, this.m_size[0], this.m_size[1], 0, 0, this.m_size[0], this.m_size[1], gl.COLOR_BUFFER_BIT, gl.NEAREST);
        this.checkError();

        // Read results.
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, dstFbo);
        this.readPixelsUsingFormat(dst, 0, 0, this.m_size[0], this.m_size[1], dstFormat, dstRangeInfo.lookupScale, dstRangeInfo.lookupBias);
    };

    /**
     * @param {tcuSurface.Surface} reference
     * @param {tcuSurface.Surface} result
     */
    BlitColorConversionCase.prototype.compare = function(reference, result) {
        /** @const {tcuTexture.TextureFormat} */ var srcFormat = gluTextureUtil.mapGLInternalFormat(m_srcFormat);
        /** @const {tcuTexture.TextureFormat} */ var dstFormat = gluTextureUtil.mapGLInternalFormat(m_dstFormat);
        /** @const {boolean} */ var srcIsSRGB = (srcFormat.order == tcuTexture.ChannelOrder.sRGBA);
        /** @const {boolean} */ var dstIsSRGB = (dstFormat.order == tcuTexture.ChannelOrder.sRGBA);
        /** @type {tcuRGBA.RGBA} */ var threshold = new tcuRGBA.RGBA();

        if (dstIsSRGB)
            threshold = fboTestUtil.getToSRGBConversionThreshold(srcFormat, dstFormat);
        else {
            /** @const {tcuRGBA.RGBA} */ var srcMaxDiff = fboTestUtil.getFormatThreshold(srcFormat) * (srcIsSRGB ? 2 : 1);
            /** @const {tcuRGBA.RGBA} */ var dstMaxDiff = fboTestUtil.getFormatThreshold(dstFormat);
            threshold = tcuRGBA.max(srcMaxDiff, dstMaxDiff);
        }

        // m_testCtx.getLog() << tcu::TestLog::Message << 'threshold = ' << threshold << tcu::TestLog::EndMessage;
        return tcuImageCompare.pixelThresholdCompare('Result', 'Image comparison result', reference, result, threshold, null /*tcu::COMPARE_LOG_RESULT*/);
    };

    /**
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {number} format deUint32
     * @param {number} srcBuffers deUint32
     * @param {Array<number>} srcSize IVec2
     * @param {Array<number>} srcRect IVec4
     * @param {number} dstBuffers deUint32
     * @param {Array<number>} dstSize IVec2
     * @param {Array<number>} dstRect IVec4
     * @param {number} copyBuffers deUint32
     */
    var BlitDepthStencilCase = function(name, desc, format, srcBuffers, srcSize, srcRect, dstBuffers, dstSize, dstRect, copyBuffers) {
        fboTestCase.FboTestCase(this, name, desc);
        /** @type {number} */ this.m_format = format;
        /** @type {number} */ this.m_srcBuffers = srcBuffers;
        /** @type {Array<number>} */ this.m_srcSize = srcSize;
        /** @type {Array<number>} */ this.m_srcRect = srcRect;
        /** @type {number} */ this.m_dstBuffers = dstBuffers;
        /** @type {Array<number>} */ this.m_dstSize = dstSize;
        /** @type {Array<number>} */ this.m_dstRect = dstRect;
        /** @type {number} */ this.m_copyBuffers = copyBuffers;
    };

    BlitDepthStencilCase.prototype = Object.create(fboTestCase.FboTestCase.prototype);
    BlitDepthStencilCase.prototype.constructor = BlitDepthStencilCase;

    /**
     * @protected
     */
    BlitDepthStencilCase.prototype.preCheck = function() {
        this.checkFormatSupport(this.m_format);
    };

    /**
     * @protected
     * @param {tcuSurface.Surface} dst
     */
    BlitDepthStencilCase.prototype.render = function(dst) {
        /** @const {number} */ var colorFormat = gl.RGBA8;
        // TODO:implement GradientShader, Texture2DShader, FlatColorShader
        /** @type {GradientShader} */
        var gradShader = new fboTestUtil.GradientShader(gluShaderUtil.DataType.FLOAT_VEC4);
        /** @type {Texture2DShader} */
        var texShader = new fboTestUtil.Texture2DShader(
            [gluShaderUtil.DataType.SAMPLER_2D] ,
            gluShaderUtil.DataType.FLOAT_VEC4);
        /** @type {FlatColorShader} */
        var flatShader = new fboTestUtil.FlatColorShader(gluShaderUtil.DataType.FLOAT_VEC4);

        // TODO: implement getCurrentContext
        /** @type {number} */ var flatShaderID = getCurrentContext().createProgram(flatShader);
        /** @type {number} */ var texShaderID = getCurrentContext().createProgram(texShader);
        /** @type {number} */ var gradShaderID = getCurrentContext().createProgram(gradShader);

        /** @type {number} */ var srcFbo = 0;
        /** @type {number} */ var dstFbo = 0;
        /** @type {number} */ var srcColorRbo = 0;
        /** @type {number} */ var dstColorRbo = 0;
        /** @type {number} */ var srcDepthStencilRbo = 0;
        /** @type {number} */ var dstDepthStencilRbo = 0;

        // setup shaders
        gradShader.setGradient(getCurrentContext(), gradShaderID, [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);
        texShader.setUniforms(getCurrentContext(), texShaderID);

        // Create framebuffers
        // Source framebuffers
        srcFbo = gl.createFramebuffer();
        srcColorRbo = gl.createRenderbuffer();
        srcDepthStencilRbo = gl.createRenderbuffer();

        gl.bindRenderbuffer(gl.RENDERBUFFER, srcColorRbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, colorFormat, this.m_srcSize[0], this.m_srcSize[1]);

        gl.bindRenderbuffer(gl.RENDERBUFFER, srcDepthStencilRbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, this.m_format, this.m_srcSize[0], this.m_srcSize[1]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, srcFbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, srcColorRbo);

        if (this.m_srcBuffers & gl.DEPTH_BUFFER_BIT)
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, srcDepthStencilRbo);
        if (this.m_srcBuffers & gl.STENCIL_BUFFER_BIT)
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, srcDepthStencilRbo);

        this.checkError();
        this.checkFramebufferStatus(gl.FRAMEBUFFER);

        // Clear depth to 1 and stencil to 0.
        gl.ClearBufferfi(gl.DEPTH_STENCIL, 0, 1.0, 0);

        // Destination framebuffers
        dstFbo = gl.createFramebuffer();
        dstColorRbo = gl.createRenderbuffer();
        dstDepthStencilRbo = gl.createRenderbuffer();

        gl.bindRenderbuffer(gl.RENDERBUFFER, dstColorRbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, colorFormat, this.m_dstSize[0], this.m_dstSize[1]);

        gl.bindRenderbuffer(gl.RENDERBUFFER, dstDepthStencilRbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, this.m_format, this.m_dstSize[0], this.m_dstSize[1]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, dstColorRbo);

        if (this.m_dstBuffers & gl.DEPTH_BUFFER_BIT)
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, dstDepthStencilRbo);
        if (this.m_dstBuffers & gl.STENCIL_BUFFER_BIT)
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, dstDepthStencilRbo);

        this.checkError();
        this.checkFramebufferStatus(gl.FRAMEBUFFER);

        // Clear depth to 1 and stencil to 0.
        gl.ClearBufferfi(gl.DEPTH_STENCIL, 0, 1.0, 0);

        // Fill source with gradient, depth = [-1..1], stencil = 7
        gl.bindFramebuffer(gl.FRAMEBUFFER, srcFbo);
        gl.viewport(0, 0, this.m_srcSize[0], this.m_srcSize[1]);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.STENCIL_TEST);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        gl.stencilFunc(gl.ALWAYS, 7, 0xff);

        // TODO: implement drawQuad
        //sglr.drawQuad(getCurrentContext(), gradShaderID, [-1.0, -1.0, -1.0], [1.0, 1.0, 1.0]);

        // Fill destination with grid pattern, depth = 0 and stencil = 1
        /** @const {number} */ var format = gl.RGBA;
        /** @const {number} */ var dataType = gl.UNSIGNED_BYTE;
        /** @const {number} */ var texW = this.m_srcSize[0];
        /** @const {number} */ var texH = this.m_srcSize[1];
        /** @type {number} */ var gridTex = 0;
        /** @type {tcuTexture.TextureLevel} */ var data = new tcuTexture.TextureLevel(gluTextueUtil.mapGLTransferFormat(format, dataType), texW, texH, 1);

        tcuTextureUtil.fillWithGrid(data.getAccess(), 8, [0.2, 0.7, 0.1, 1.0], [0.7, 0.1, 0.5, 0.8]);

        gridTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, gridTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, texW, texH, 0, format, dataType, data.getAccess().getDataPtr());

        gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo);
        gl.viewport(0, 0, this.m_dstSize[0], this.m_dstSize[1]);
        gl.stencilFunc(gl.ALWAYS, 1, 0xff);
        // TODO: implement drawQuad
        //sglr.drawQuad(getCurrentContext(), texShaderID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);

        // Perform copy.
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, srcFbo);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dstFbo);
        gl.blitFramebuffer(this.m_srcRect[0], this.m_srcRect[1], this.m_srcRect[2], this.m_srcRect[3], this.m_dstRect[0], this.m_dstRect[1], this.m_dstRect[2], this.m_dstRect[3], this.m_copyBuffers, gl.NEAREST);

        // Render blue color where depth < 0, decrement on depth failure.
        gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo);
        gl.viewport(0, 0, this.m_dstSize[0], this.m_dstSize[1]);
        gl.stencilOp(gl.KEEP, gl.DECR, gl.KEEP);
        gl.stencilFunc(gl.ALWAYS, 0, 0xff);

        flatShader.setColor(getCurrentContext(), flatShaderID, [0.0, 0.0, 1.0, 1.0]);
        // TODO: implement drawQuad
        sglr.drawQuad(getCurrentContext(), flatShaderID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);

        if (this.m_dstBuffers & gl.STENCIL_BUFFER_BIT) {
            // Render green color where stencil == 6.
            gl.disable(gl.DEPTH_TEST);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            gl.stencilFunc(gl.EQUAL, 6, 0xff);
            // TODO: implement drawQuad
            flatShader.setColor(getCurrentContext(), flatShaderID, [0.0, 1.0, 0.0, 1.0]);
            //sglr.drawQuad(*getCurrentContext(), flatShaderID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);
        }
        this.readPixelsUsingFormat(dst, 0, 0, this.m_dstSize[0], this.m_dstSize[1], gluTextureUtil.mapGLInternalFormat(colorFormat), [1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 0.0, 0.0]);

    };

    /**
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {number} format
     * @param {number} filter
     */
    var BlitDefaultFramebufferCase = function(name, desc, format, filter) {
        fboTestCase.FboTestCase(this, name, desc);
        /** @const {number} */ this.m_format;
        /** @const {number} */ this.m_filter;
    };

    BlitDefaultFramebufferCase.prototype = Object.create(fboTestCase.FboTestCase.prototype);
    BlitDefaultFramebufferCase.prototype.constructor = BlitDefaultFramebufferCase;

    /**
     * @protected
     */
    BlitDefaultFramebufferCase.prototype.preCheck = function() {
        // TODO: m_context?
        if (m_context.getRenderTarget().getNumSamples() > 0)
            throw new Error('Not supported in MSAA config');

        this.checkFormatSupport(m_format);
    };

    /**
     * @protected
     * @param {tcuSurface.Surface} dst
     */
    BlitDefaultFramebufferCase.prototype.render = function(dst) {
        // // TODO: implement
        /** @type {tcuTexture.TextureFormat} */ var colorFormat = gluTextureUtil.mapGLInternalFormat(m_format);
        /** @type {gluTextureUtil.TransferFormat} */ var transferFmt = gluTextureUtil.getTransferFormat(colorFormat);
        // TODO: implement GradientShader, Texture2DShader
        /** @type {fboTestUtil.GradientShader} */ var gradShader = new fboTestUtil.GradientShader(gluShaderUtil.DataType.FLOAT_VEC4);
        /** @type {fboTestUtil.Texture2DShader} */ var texShader = new fboTestUtil.Texture2DShader([gluTextureUtil.getSampler2DType(colorFormat)], gluShaderUtil.DataType.FLOAT_VEC4);
        // TODO: implement getCurrentContext
        /** @type {number} */ var gradShaderID = getCurrentContext().createProgram(gradShader);
        /** @type {number} */ var texShaderID = getCurrentContext().createProgram(texShader);
        /** @type {number} */ var fbo = 0;
        /** @type {number} */ var tex = 0;
        /** @const {number} */ var texW = 128;
        /** @const {number} */ var texH = 128;

        // Setup shaders
        gradShader.setGradient(getCurrentContext(), gradShaderID, [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);
        texShader.setUniforms(getCurrentContext(), texShaderID);

        // FBO
        fbo = gl.createFramebuffer();
        tex = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.m_filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.m_filter);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.m_format, texW, texH, 0, transferFmt.format, transferFmt.dataType, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        this.checkError();
        this.checkFramebufferStatus(gl.FRAMEBUFFER);

        // Render gradient to screen.
        // TODO: context...
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_context.getRenderContext().getDefaultFramebuffer());

        //TODO: implement drawQuad
        // sglr.drawQuad(getCurrentContext(), gradShaderID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);

        // Blit gradient from screen to fbo.
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, fbo);
        gl.blitFramebuffer(0, 0, getWidth(), getHeight(), 0, 0, texW, texH, gl.COLOR_BUFFER_BIT, this.m_filter);

        // Fill left half of viewport with quad that uses texture.
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.m_context.getRenderContext().getDefaultFramebuffer());
        gl.clearBufferfv(gl.COLOR, 0, [1.0, 0.0, 0.0, 1.0]);
        // TODO: implement drawQuad
        /// sglr.drawQuad(getCurrentContext(), texShaderID, [-1.0, -1.0, 0.0], [0.0, 1.0, 0.0]);

        // Blit fbo to right half.
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo);
        gl.blitFramebuffer(0, 0, texW, texH, Math.floor(getWidth() / 2), 0, getWidth(), getHeight(), gl.COLOR_BUFFER_BIT, this.m_filter);

        // TODO: context
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, m_context.getRenderContext().getDefaultFramebuffer());
        this.readPixels(dst, 0, 0, getWidth(), getHeight());
    };

    /**
     * @protected
     * @param {tcuSurface.Surface} reference
     * @param {tcuSurface.Surface} result
     */
    BlitDefaultFramebufferCase.prototype.compare = function(reference, result) {
        // TODO: implement
        /** @const {tcuRGBA.RGBA} */
        var threshold = tcuRGBA.max(fboTestUtil.getFormatThreshold(m_format), tcuRGBA.newRGBAComponents(12, 12, 12, 12));

        //m_testCtx.getLog() << TestLog::Message << 'Comparing images, threshold: ' << threshold << TestLog::EndMessage;

        return tcu.bilinearCompare('Result', 'Image comparison result', reference.getAccess(), result.getAccess(), threshold, null /*tcu::COMPARE_LOG_RESULT*/);
    };

    /** @enum BlitDirection */
    var BlitDirection = {
        BLIT_DEFAULT_TO_TARGET: 0,
        BLIT_TO_DEFAULT_FROM_TARGET: 1
    };

    /** @enum BlitArea */
    var BlitArea = {
        AREA_SCALE: 0,
        AREA_OUT_OF_BOUNDS: 1
    };

    /**
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {string} format
     * @param {string} filter
     * @param {BlitDirection} dir
     * @param {BlitArea} area
     */
    var DefaultFramebufferBlitCase = function(name, desc, format, filter, dir, area) {
        BlitDefaultFramebufferCase(this, name, desc, format, filter);
        /** @const {BlitDirection} */ this.m_blitDir = dir;
        /** @const {BlitArea} */ this.m_blitArea = area;
        /** @type {Array<number>} */ this.m_srcRect = [-1, -1, -1, -1];
        /** @type {Array<number>} */ this.m_dstRect = [-1, -1, -1, -1];
        /** @type {Array<number>} */ this.m_interestingArea = [-1, -1, -1, -1];
        DE_ASSERT(dir < Object.keys(BlitDirection).length);
        DE_ASSERT(area < Object.keys(BlitArea).length);
    };

    DefaultFramebufferBlitCase.prototype = Object.create(BlitDefaultFramebufferCase.prototype);
    DefaultFramebufferBlitCase.prototype.constructor = DefaultFramebufferBlitCase;

    DefaultFramebufferBlitCase.prototype.init = function() {
        //TODO: implement
        // requirements
        /** @const {number} */ var minViewportSize = 128;
        if (this.m_context.getRenderTarget().getWidth() < minViewportSize ||
            this.m_context.getRenderTarget().getHeight() < minViewportSize)
            throw new Error('Viewport size ' + minViewportSize + 'x' + minViewportSize + ' required');

        // prevent viewport randoming
        this.m_viewportWidth = this.m_context.getRenderTarget().getWidth();
        this.m_viewportHeight = this.m_context.getRenderTarget().getHeight();

        // set proper areas
        if (this.m_blitArea == BlitArea.AREA_SCALE) {
            this.m_srcRect = [10, 20, 65, 100];
            this.m_dstRect = [25, 30, 125, 94];
            this.m_interestingArea = [0, 0, 128, 128];
        }
        else if (this.blitArea == BlitArea.AREA_OUT_OF_BOUNDS) {
            /** @const {Array<number>} */
            var ubound = (this.m_blitDir == BlitDirection.BLIT_DEFAULT_TO_TARGET) ?
                         ([128, 128]) :
                         ([this.m_context.getRenderTarget().getWidth(), this.m_context.getRenderTarget().getHeight()]);

            this.m_srcRect = [-10, -15, 100, 63];
            this.m_dstRect = deMath.add(deMath.swizzle(ubound, [0, 1, 0, 1]), [-75, -99, 8, 16]);
            this.m_interestingArea = [ubound[0] - 128, ubound[1] - 128, ubound[0], ubound[1]];
        }
        else
            DE_ASSERT(false);
    };

    /**
     * @param {tcuSurface.Surface} dst
     */
    DefaultFramebufferBlitCase.prototype.render = function(dst) {
        // TOOD: implement
        /** @type {tcuTexture.TextureFormat} */ var colorFormat = gluTextureUtil.mapGLInternalFormat(m_format);
        /** @type {gluTextureUtil.TransferFormat} */ var transferFmt = gluTextureUtil.getTransferFormat(colorFormat);
        /** @const {tcuTextureUtil.TextureChannelClass} */
        var targetClass = (m_blitDir == BLIT_DEFAULT_TO_TARGET) ?
            (tcuTextureUtil.getTextureChannelClass(colorFormat.type)) :
            (tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT);

        /** @type {number} */ var fbo = 0;
        /** @type {number} */ var fboTex = 0;
        /** @const {number} */ var fboTexW = 128;
        /** @const {number} */ var fboTexH = 128;
        /** @const {number} */ var sourceWidth = (this.m_blitDir == BlitDirection.BLIT_DEFAULT_TO_TARGET) ? (getWidth()) : (fboTexW);
        /** @const {number} */ var sourceHeight = (this.m_blitDir == BlitDirection.BLIT_DEFAULT_TO_TARGET) ? (getHeight()) : (fboTexH);
        /** @const {number} */ var gridRenderWidth = Math.min(256, sourceWidth);
        /** @const {number} */ var gridRenderHeight = Math.min(256, sourceHeight);

        /** @type {number} */ var targetFbo = -1;
        /** @type {number} */ var sourceFbo = -1;

        // FBO
        fbo = gl.createFramebuffer();
        fboTex = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, fboTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.m_filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.m_filter);
        gl.texImage2D(GL_TEXTURE_2D, 0, m_format, fboTexW, fboTexH, 0, transferFmt.format, transferFmt.dataType, DE_NULL);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);
        this.checkError();
        this.checkFramebufferStatus(gl.FRAMEBUFFER);

        targetFbo = (this.m_blitDir == BlitDirection.BLIT_DEFAULT_TO_TARGET) ? (fbo) : (this.m_context.getRenderContext().getDefaultFramebuffer());
        sourceFbo = (this.m_blitDir == BlitDirection.BLIT_DEFAULT_TO_TARGET) ? (this.m_context.getRenderContext().getDefaultFramebuffer()) : (fbo);

        // Render grid to source framebuffer
        // TODO: implement Texture2DShader
        /** @type {fboTestUtil.Texture2DShader} */
        var texShader = new fboTestUtil.Texture2DShader(
            [gluShaderUtil.DataType.TYPE_SAMPLER_2D],
            gluShaderUtil.DataType.TYPE_FLOAT_VEC4);
        /** @const {number} */ var texShaderID = getCurrentContext().createProgram(texShader);
        /** @const {number} */ var internalFormat = gl.RGBA8;
        /** @const {number} */ var format = gl.RGBA;
        /** @const {number} */ var dataType = gl.UNSIGNED_BYTE;
        /** @const {number} */ var gridTexW = 128;
        /** @const {number} */ var gridTexH = 128;
        /** @type {number} */ var gridTex = 0;
        /** @type {tcuTexture.TextureLevel} */ var data = new tcuTexture.TextureLevel(gluTextueUtil.mapGLTransferFormat(format, dataType), gridTexW, gridTexH, 1);

        tcuTextureUtil.fillWithGrid(data.getAccess(), 9, [0.9, 0.5, 0.1, 0.9], [0.2, 0.8, 0.2, 0.7]);

        gridTex = gl.createTexture();
        gl.BindTexture(gl.TEXTURE_2D, gridTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, gridTexW, gridTexH, 0, format, dataType, data.getAccess().getDataPtr());

        gl.BindFramebuffer(gl.FRAMEBUFFER, sourceFbo);
        glViewport(0, 0, gridRenderWidth, gridRenderHeight);
        glClearBufferfv(gl.COLOR, 0, [1.0, 0.0, 0.0, 1.0]);

        // TODO: implement setUniforms
        texShader.setUniforms(getCurrentContext(), texShaderID);
        // TODO: implement drawQuad
        //sglr.drawQuad(*getCurrentContext(), texShaderID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);
        gl.useProgram(null);

        // Blit source framebuffer to destination

        gl.bindFramebuffer(GL_READ_FRAMEBUFFER, sourceFbo);
        gl.bindFramebuffer(GL_DRAW_FRAMEBUFFER, targetFbo);
        this.checkError();

        if (targetClass == tcuTextureUtil.TextureChannelClass.SIGNED_FIXED_POINT ||
            targetClass == tcuTextureUtil.TextureChannelClass.UNSIGNED_FIXED_POINT ||
            targetClass == tcuTextureUtil.TextureChannelClass.FLOATING_POINT)
            gl.clearBufferfv(gl.COLOR, 0, [1.0, 1.0, 0.0, 1.0]);
        else if (targetClass == tcuTextureUtil.TextureChannelClass.SIGNED_INTEGER)
            gl.clearBufferiv(gl.COLOR, 0, [0, 0, 0, 0]);
        else if (targetClass == tcuTextureUtil.TextureChannelClass.UNSIGNED_INTEGER)
            gl.clearBufferuiv(gl.COLOR, 0, [0, 0, 0, 0]);
        else
            DE_ASSERT(false);

        gl.blitFramebuffer(this.m_srcRect[0], this.m_srcRect[1], this.m_srcRect[2], this.m_srcRect[3], this.m_dstRect[0], this.m_dstRect[1], this.m_dstRect[2], this.m_dstRect[3], gl.COLOR_BUFFER_BIT, this.m_filter);
        this.checkError();

        // Read target

        gl.bindFramebuffer(gl.FRAMEBUFFER, targetFbo);

        if (this.m_blitDir == BlitDirection.BLIT_TO_DEFAULT_FROM_TARGET)
            this.readPixels(dst, this.m_interestingArea[0], this.m_interestingArea[1], this.m_interestingArea[2] - this.m_interestingArea[0], this.m_interestingArea[3] - this.m_interestingArea[1]);
        else
            this.readPixelsUsingFormat(dst, this.m_interestingArea[0], this.m_interestingArea[1], this.m_interestingArea[2] - this.m_interestingArea[0], this.m_interestingArea[3] - this.m_interestingArea[1], colorFormat, [1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 0.0, 0.0]);

        this.checkError();
    };

    var run = function(context) {
        gl = context;
        //Set up root Test
        var state = tcuTestCase.runner.getState();

        var test = new FramebufferBlitTests();
        var testName = test.fullName();
        var testDescription = test.getDescription();
        state.testCases = test;
        state.testName = testName;

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Create test cases
            test.init();
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            testFailedOptions('Failed to run tests', false);
            tcuTestCase.runner.terminate();
        }
    };

    return {
        run: run
    };

});
