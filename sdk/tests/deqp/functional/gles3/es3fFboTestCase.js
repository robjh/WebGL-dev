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
goog.provide('functional.gles3.es3fFboTestCase');
goog.require('framework.common.tcuTestCase');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.common.tcuSurface');
goog.require('framework.common.tcuTexture');
goog.require('framework.referencerenderer.rrRenderer');
goog.require('framework.opengl.simplereference.sglrReferenceContext');
goog.require('framework.common.tcuPixelFormat');
goog.require('framework.common.tcuImageCompare');
goog.require('framework.delibs.debase.deString');


goog.scope(function() {

var es3fFboTestCase = functional.gles3.es3fFboTestCase;
var tcuTestCase = framework.common.tcuTestCase;
var deMath = framework.delibs.debase.deMath;
var tcuSurface = framework.common.tcuSurface;
var tcuTexture = framework.common.tcuTexture;
var rrRenderer = framework.referencerenderer.rrRenderer;
var sglrReferenceContext = framework.opengl.simplereference.sglrReferenceContext;
var tcuPixelFormat = framework.common.tcuPixelFormat;
var tcuImageCompare = framework.common.tcuImageCompare;
var deString = framework.delibs.debase.deString;


    /**
    * es3fFboTestCase.FboTestCase class, inherits from TestCase and sglrContextWrapper
    * @constructor
    * @extends {tcuTestCase.DeqpTest}
    * @param {string} name
    * @param {string} description
    * @param {boolean} useScreenSizedViewport
    */
    es3fFboTestCase.FboTestCase = function(name, description, useScreenSizedViewport /*= false */) {
        tcuTestCase.DeqpTest.call(this, name, description);
        /** @type {number} */ this.m_viewportWidth = useScreenSizedViewport === undefined ? gl.drawingBufferWidth : 128;
        /** @type {number} */ this.m_viewportHeight = useScreenSizedViewport === undefined ? gl.drawingBufferHeight : 128;
        /** @type {Context} */ this.m_context = gl; // from TestCase
        /** @type {sglrReferenceContext.ReferenceContext|sglrGLContext.GLContext} */ this.m_curCtx = null; // from sglrContextWrapper
    };

    es3fFboTestCase.FboTestCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    es3fFboTestCase.FboTestCase.prototype.constructor = es3fFboTestCase.FboTestCase;

    /**
     * Sets the current context (inherited from sglrContextWrapper)
     * @param {Context} context
     */
    es3fFboTestCase.FboTestCase.prototype.setContext = function(context) {
        this.m_curCtx = context;
    };

    /**
     * Gets the current context (inherited from sglrContextWrapper)
     * @return {Context}
     */
    es3fFboTestCase.FboTestCase.prototype.getCurrentContext = function() {
        return this.m_curCtx;
    };

    /**
    * @param {tcuSurface.Surface} reference
    * @param {tcuSurface.Surface} result
    */
    es3fFboTestCase.FboTestCase.prototype.compare = function(reference, result) {
        return tcuImageCompare.fuzzyCompare('Result', 'Image comparison result', reference, result, 0.05, null /*tcu::COMPARE_LOG_RESULT*/);
    };

    /**
    * @param {number} sizedFormat deUint32
    */
    es3fFboTestCase.FboTestCase.prototype.checkFormatSupport = function(sizedFormat) {
        /** @const @type {boolean} */ var isCoreFormat = isRequiredFormat(sizedFormat);
        /** @const @type {Array<string>} */ var requiredExts = (!isCoreFormat) ? getEnablingExtensions(sizedFormat) : [];

        // Check that we don't try to use invalid formats.
        DE_ASSERT(isCoreFormat || !deString.deIsStringEmpty(requiredExts));
        if (!deString.deIsStringEmpty(requiredExts) && !isAnyExtensionSupported(this.m_context, requiredExts))
            throw new Error('Format not supported');
    };

    /**
    * @param {number} sizedFormat deUint32
    * @param {number} numSamples
    */
    es3fFboTestCase.FboTestCase.prototype.checkSampleCount = function(sizedFormat, numSamples) {
        /** @const @type {number} */ var minSampleCount = getMinimumSampleCount(sizedFormat);

        if (numSamples > minSampleCount) {
            // Exceeds spec-mandated minimum - need to check.
            /** @const @type {Array<number>} */ var supportedSampleCounts = querySampleCounts(this.m_context.getRenderContext().getFunctions(), sizedFormat);

            if (supportedSampleCounts.indexOf(numSamples) == -1)
                throw new Error('Sample count not supported');
        }
    };

    /**
    * @param {tcuSurface.Surface} dst
    * @param {number} x
    * @param {number} y
    * @param {number} width
    * @param {number} height
    * @param {tcuTextureTextureFormat} format
    * @param {Array<number>} scale Vec4
    * @param {Array<number>} bias Vec4
    */
    es3fFboTestCase.FboTestCase.prototype.readPixelsUsingFormat = function(dst, x, y, width, height, format, scale, bias) {
        fboTestUtil.readPixels(getCurrentContext(), dst, x, y, width, height, format, scale, bias);
    };

    /**
    * @param {tcuSurface.Surface} dst
    * @param {number} x
    * @param {number} y
    * @param {number} width
    * @param {number} height
    */
    es3fFboTestCase.FboTestCase.prototype.readPixels = function(dst, x, y, width, height) {
        getCurrentContext().readPixels(dst, x, y, width, height);
    };

    /**
    * @param {number} target deUint32
    */
    es3fFboTestCase.FboTestCase.prototype.checkFramebufferStatus = function(target) {
        /** @type {number} */ var status = gl.checkFramebufferStatus(target);
        if (status != gl.FRAMEBUFFER_COMPLETE)
            throw new Error('Framebuffer Status: ' + status);
    };

    es3fFboTestCase.FboTestCase.prototype.checkError = function() {
        /** @type {number} */ var err = gl.getError();
            if (err != gl.NO_ERROR)
                throw new Error('glError: ' + err);
    };

    /**
    * @param {tcuTexture.TextureFormat} format
    * @param {Array<number>} value Vec4
    */
    es3fFboTestCase.FboTestCase.prototype.clearColorBuffer = function(format, value) {
        if (value === undefined) value = [0.0, 0.0, 0.0, 0.0];
        fboTestUtil.clearColorBuffer(getCurrentContext(), format, value);
    };


    es3fFboTestCase.FboTestCase.prototype.iterate = function() {

        var renderCtx = gl;

        //const tcu::RenderTarget&    renderTarget    = renderCtx.getRenderTarget();

        /** @type {RenderTarget} */ var renderTarget = renderCtx.getRenderTarget();

        //TestLog&                    log                = m_testCtx.getLog();

        // Viewport.
        /** @type {deRandom.Random} */ var rnd = new deRandom.Random(deString.deStringHash(this.name));
        /** @type {number} */ var width = Math.min(renderTarget.getWidth(), this.m_viewportWidth);
        /** @type {number} */ var height = Math.min(renderTarget.getHeight(), this.m_viewportHeight);
        /** @type {number} */ var x = rnd.getInt(0, renderTarget.getWidth() - width);
        /** @type {number} */ var y = rnd.getInt(0, renderTarget.getHeight() - height);

        // Surface format and storage is choosen by render().
        /** @type {tcuSurface.Surface} */ var reference = new tcuSurface.Surface(width, height);
        /** @type {tcuSurface.Surface} */ var result = new tcuSurface.Surface(width, height);

        // Call preCheck() that can throw exception if some requirement is not met.
        this.preCheck();

        // Render using GLES3.
        try {
            /** @type {GLContext} */ var context = new sglrReferenceContext.GLContext(
                                                            renderCtx,
                                                            null /*log*/,
                                                            sglrReferenceContext.GLContext.LOG_CALLS,
                                                            [x, y, width, height]);
            this.setContext(context);
            this.render(result);

            // Check error.
            /** @type {number} */ var err = gl.getError();
            if (err != gl.NO_ERROR)
                throw new Error('glError: err');

            this.setContext(null);
        }
        catch (/** @const @type {fboTestUtil.FboIncompleteException} */ e) {
            if (e.getReason() == gl.FRAMEBUFFER_UNSUPPORTED) {
                // log << e;
                // m_testCtx.setTestResult(QP_TEST_RESULT_NOT_SUPPORTED, 'Not supported');
                assertMsgOptions(false, 'Not supported', true, false);
                return tcuTestCase.IterateResult.STOP;
            }
            else
                throw new Error('Error: ' + e);
        }

        // Render reference.
        /** @type {sglrReferenceContext.ReferenceContextBuffers} */
        var buffers = new sglrReferenceContext.ReferenceContextBuffers(new tcuPixelFormat.PixelFormat(
                                                                            8,
                                                                            8,
                                                                            8,
                                                                            renderTarget.getPixelFormat().alphaBits ? 8 : 0),
                                                                       renderTarget.getDepthBits(),
                                                                       renderTarget.getStencilBits(),
                                                                       width,
                                                                       height);
        /** @type {sglrReferenceContext.ReferenceContext} */
        var context = new sglrReferenceContext.ReferenceContext(new sglrReferenceContext.ReferenceContextLimits(renderCtx),
                                                                buffers.getColorbuffer(),
                                                                buffers.getDepthbuffer(),
                                                                buffers.getStencilbuffer());

        this.setContext(context);
        render(reference);
        this.setContext(null);


        /** @type {boolean} */ var isOk = this.compare(reference, result);

        assertMsgOptions(isOk, '', true, false);

        return tcuTestCase.IterateResult.STOP;
    };


    /**
    * @param {number} format deUint32
    * @return {boolean}
    */
    es3fFboTestCase.FboTestCase.isRequiredFormat = function(format) {
        switch (format) {
            // Color-renderable formats
            case gl.RGBA32I:
            case gl.RGBA32UI:
            case gl.RGBA16I:
            case gl.RGBA16UI:
            case gl.RGBA8:
            case gl.RGBA8I:
            case gl.RGBA8UI:
            case gl.SRGB8_ALPHA8:
            case gl.RGB10_A2:
            case gl.RGB10_A2UI:
            case gl.RGBA4:
            case gl.RGB5_A1:
            case gl.RGB8:
            case gl.RGB565:
            case gl.RG32I:
            case gl.RG32UI:
            case gl.RG16I:
            case gl.RG16UI:
            case gl.RG8:
            case gl.RG8I:
            case gl.RG8UI:
            case gl.R32I:
            case gl.R32UI:
            case gl.R16I:
            case gl.R16UI:
            case gl.R8:
            case gl.R8I:
            case gl.R8UI:
                return true;

            // Depth formats
            case gl.DEPTH_COMPONENT32F:
            case gl.DEPTH_COMPONENT24:
            case gl.DEPTH_COMPONENT16:
                return true;

            // Depth+stencil formats
            case gl.DEPTH32F_STENCIL8:
            case gl.DEPTH24_STENCIL8:
                return true;

            // Stencil formats
            case gl.STENCIL_INDEX8:
                return true;

            default:
                return false;
        }
    };

    /**
    * @param {number} format deUint32
    * @return {Array<string>}
    */
    es3fFboTestCase.FboTestCase.getEnablingExtensions = function(format) {
        /** @return {Array<string>} */ var out = [];

        DE_ASSERT(!isRequiredFormat(format));

        switch (format) {
            case gl.RGB16F:
                out.push('GL_EXT_color_buffer_half_float');
                break;

            case gl.RGBA16F:
            case gl.RG16F:
            case gl.R16F:
                out.push('GL_EXT_color_buffer_half_float');

            case gl.RGBA32F:
            case gl.RGB32F:
            case gl.R11F_G11F_B10F:
            case gl.RG32F:
            case gl.R32F:
                out.push('GL_EXT_color_buffer_float');

            default:
                break;
        }

        return out;
    };

    /**
    * @param {Context} context
    * @param {Array<string>} requiredExts
    * @return {boolean}
    */
    es3fFboTestCase.FboTestCase.isAnyExtensionSupported = function(context, requiredExts) {
        for (var iter in requiredExts) {
            /** @const @type {string} */ var extension = iter;

            if (context.getContextInfo().isExtensionSupported(extension))
                return true;
        }

        return false;
    };


 });
