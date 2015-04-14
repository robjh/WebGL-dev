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
    'framework/common/tcuTestCase',
    'framework/delibs/debase/deMath',
    'framework/common/tcuSurface',
    'framework/common/tcuTexture',
    '/framework/referencerenderer/rrRenderer',
    'framework/opengl/simplereference/sglrReferenceContext',
    'framework/common/tcuPixelFormat',
    'framework/common/tcuImageCompare',
    'framework/delibs/debase/deString'], function(
    tcuTestCase,
    deMath,
    tcuSurface,
    tcuTexture,
    rrRenderer,
    sglrReferenceContext,
    tcuPixelFormat,
    tcuImageCompare,
    deString) {
    'use strict';

    /**
    * FboTestCase class, inherits from TestCase and sglrContextWrapper
    * @constructor
    * @param {string} name
    * @param {string} description
    * @param {boolean} useScreenSizedViewport
    */
    var FboTestCase = function(name, description, useScreenSizedViewport /*= false */) {
        tcuTestCase.DeqpTest.call(this, name, description);
        /** @type {number} */ this.m_viewportWidth = useScreenSizedViewport === undefined ? gl.drawingBufferWidth : 128;
        /** @type {number} */ this.m_viewportHeight = useScreenSizedViewport === undefined ? gl.drawingBufferHeight : 128;
    };

    FboTestCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    FboTestCase.prototype.constructor = FboTestCase;

    /**
    * @param {tcuSurface.Surface} reference
    * @param {tcuSurface.Surface} result
    */
    FboTestCase.prototype.compare = function(reference, result) {
        return tcuImageCompare.fuzzyCompare('Result', 'Image comparison result', reference, result, 0.05, null /*tcu::COMPARE_LOG_RESULT*/);
    };

    /**
    * @param {number} sizedFormat deUint32
    */
    FboTestCase.prototype.checkFormatSupport = function(sizedFormat) {
        /** @const @type {boolean} */ var isCoreFormat = isRequiredFormat(sizedFormat);
        /** @const @type {Array<string>} */ var requiredExts = (!isCoreFormat) ? getEnablingExtensions(sizedFormat) : [];

        // Check that we don't try to use invalid formats.
        DE_ASSERT(isCoreFormat || !deString.deIsStringEmpty(requiredExts));
        // TODO: implement m_context
        if (!deString.deIsStringEmpty(requiredExts) && !isAnyExtensionSupported(this.m_context, requiredExts))
            throw new Error('Format not supported');
    };

    /**
    * @param {number} sizedFormat deUint32
    * @param {number} numSamples
    */
    FboTestCase.prototype.checkSampleCount = function(sizedFormat, numSamples) {
        /** @const @type {number} */ var minSampleCount = getMinimumSampleCount(sizedFormat);
        // TODO: implement
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
    FboTestCase.prototype.readPixelsUsingFormat = function(dst, x, y, width, height, format, scale, bias) {
        // TODO: implement fboTestUtil.readPixels, getCurrentContext
        fboTestUtil.readPixels(getCurrentContext(), dst, x, y, width, height, format, scale, bias);
    };

    /**
    * @param {tcuSurface.Surface} dst
    * @param {number} x
    * @param {number} y
    * @param {number} width
    * @param {number} height
    */
    FboTestCase.prototype.readPixels = function(dst, x, y, width, height) {
        // TODO: implement getCurrentContext
        getCurrentContext().readPixels(dst, x, y, width, height);
    };

    /**
    * @param {number} target deUint32
    */
    FboTestCase.prototype.checkFramebufferStatus = function(target) {
        /** @type {number} */ var status = gl.checkFramebufferStatus(target);
        if (status != gl.FRAMEBUFFER_COMPLETE)
            throw new Error('Framebuffer Status: ' + status);
    };

    FboTestCase.prototype.checkError = function() {
        /** @type {number} */ var err = gl.getError();
            if (err != gl.NO_ERROR)
                throw new Error('glError: ' + err);
    };

    /**
    * @param {tcuTexture.TextureFormat} format
    * @param {Array<number>} value Vec4
    */
    FboTestCase.prototype.clearColorBuffer = function(format, value) {
        if (value === undefined) value = [0.0, 0.0, 0.0, 0.0];
        // TODO: implement getCurrentContext
        fboTestUtil.clearColorBuffer(getCurrentContext(), format, value);
    };


    FboTestCase.prototype.iterate = function() {

        var renderCtx = gl;

        //const tcu::RenderTarget&    renderTarget    = renderCtx.getRenderTarget();
        /** @type {rrRenderer.RenderTarget} */ var renderTarget = new rrRenderer.RenderTarget(); // TODO: implement

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
        preCheck(); // TODO: implement

        // Render using GLES3.
        try {
            /** @type {GLContext} */ var context = new sglrReferenceContext.GLContext(
                                                            renderCtx,
                                                            null /*log*/,
                                                            sglrReferenceContext.GLContext.LOG_CALLS,
                                                            [x, y, width, height]);
            setContext(context);
            render(result);

            // Check error.
            /** @type {number} */ var err = gl.getError();
            if (err != gl.NO_ERROR)
                throw new Error('glError: err');

            setContext(null);
        }
        catch (/** @const @type {fboTestUtil.FboIncompleteException} */ e) {
            if (e.getReason() == gl.FRAMEBUFFER_UNSUPPORTED) {
                // log << e;
                // m_testCtx.setTestResult(QP_TEST_RESULT_NOT_SUPPORTED, 'Not supported');
                assertMsgOptions(false, 'Not supported', true, false);
                return tcuTestCase.runner.IterateResult.STOP;
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

        setContext(context);
        render(reference);
        setContext(null);


        /** @type {boolean} */ var isOk = compare(reference, result);

        assertMsgOptions(isOk, '', true, false);

        return tcuTestCase.runner.IterateResult.STOP;
    };


    /**
    * @param {number} format deUint32
    * @return {boolean}
    */
    FboTestCase.isRequiredFormat = function(format) {
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
    FboTestCase.getEnablingExtensions = function(format) {
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
    FboTestCase.isAnyExtensionSupported = function(context, requiredExts) {
        for (var iter in requiredExts) {
            /** @const @type {string} */ var extension = iter;

            if (context.getContextInfo().isExtensionSupported(extension))
                return true;
        }

        return false;
    };

    return {
        FboTestCase: FboTestCase
    };
 });
