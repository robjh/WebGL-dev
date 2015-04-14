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
    'framework/common/tcuTexture',
    'framework/opengl/gluShaderUtil',
    'framework/opengl/gluTextureUtil'], function(
        fboTestCase,
        fboTestUtil,
        tcuTestCase,
        tcuSurface,
        tcuTexture,
        gluShaderUtil,
        gluTextureUtil) {
    'use strict';

    /**
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {number} format
     * @param {Array<number>} size
     * @param {boolean} useDepth
     */
    var BasicFboStencilCase = function(name, desc, format, size, useDepth) {
        fboTestCase.FboTestCase.call(name, desc);
        /** @type {number} */ this.m_format = format;
        /** @type {Array<number>} */ this.m_size = size;
        /** @type {boolean} */ this.m_useDepth = useDepth;
    };

    BasicFboStencilCase.prototype = Object.create(fboTestCase.FboTestCase.prototype);
    BasicFboStencilCase.prototype.constructor = BasicFboStencilCase;

    BasicFboStencilCase.prototype.preCheck = function() {
        this.checkFormatSupport(this.m_format);
    };

    /**
     * @param {tcuSurface.Surface} dst
     */
    BasicFboStencilCase.prototype.render = function(dst) {
        /** @const {number} */ var colorFormat = fl.RGBA8;

        /** @type {fboTestUtil.GradientShader} */ var gradShader = new fboTestUtil.GradientShader(gluShaderUtil.DataType.FLOAT_VEC4);
        /** @type {fboTestUtil.FlatColorShader} */ var flatShader = new fboTestUtil.FlatColorShader(gluShaderUtil.DataType.FLOAT_VEC4);
        /** @type {number} */ var flatShaderID = getCurrentContext().createProgram(flatShader); // TODO: getCurrentContext
        /** @type {number} */ var gradShaderID = getCurrentContext().createProgram(gradShader);

        /** @type {number} */ var fbo = 0;
        /** @type {number} */ var colorRbo = 0;
        /** @type {number} */ var depthStencilRbo = 0;

        // Colorbuffer.
        colorRbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, colorRbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, colorFormat, this.m_size[0], this.m_size[1]);

        // Stencil (and depth) buffer.
        depthStencilRbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthStencilRbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, this.m_format, this.m_size[0], this.m_size[1]);

        // Framebuffer.
        fbo = gl.createFramebuffers();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colorRbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, depthStencilRbo);
        if (this.m_useDepth)
            glFramebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthStencilRbo);
        this.checkError();
        this.checkFramebufferStatus(gl.FRAMEBUFFER);

        gl.viewport(0, 0, this.m_size[0], this.m_size[1]);

        // Clear framebuffer.
        gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
        gl.clearBufferfi(gl.DEPTH_STENCIL, 0, 1.0, 0);

        // Render intersecting quads - increment stencil on depth pass
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS, 0, 0xff);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

        flatShader.setColor(getCurrentContext(), flatShaderID, [1.0, 0.0, 0.0, 1.0]);
        // TODO: drawQuad
        //sglr::drawQuad(*getCurrentContext(), flatShaderID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);

        gradShader.setGradient(getCurrentContext(), gradShaderID, [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);
        // TODO: drawQuad
        //sglr::drawQuad(*getCurrentContext(), gradShaderID, [-1.0, -1.0, -1.0], [1.0, 1.0, 1.0]);

        gl.disable(gl.DEPTH_TEST);

        // Draw quad with stencil test (stencil == 1 or 2 depending on depth) - decrement on stencil failure
        gl.stencilFunc(gl.EQUAL, this.m_useDepth ? 2 : 1, 0xff);
        gl.stencilOp(gl.DECR, gl.KEEP, gl.KEEP);

        flatShader.setColor(getCurrentContext(), flatShaderID, [0.0, 1.0, 0.0, 1.0]);
        // TODO: drawQuad
        //sglr::drawQuad(*getCurrentContext(), flatShaderID, [-0.5, -0.5, 0.0], [0.5, 0.5, 0.0]);

        // Draw quad with stencil test where stencil > 1 or 2 depending on depth buffer
        gl.stencilFunc(gl.GREATER, this.m_useDepth ? 1 : 2, 0xff);

        flatShader.setColor(getCurrentContext(), flatShaderID, [0.0, 0.0, 1.0, 1.0]);


        //sglr::drawQuad(*getCurrentContext(), flatShaderID, Vec3(-1.0f, -1.0f, 0.0f), Vec3(+1.0f, +1.0f, 0.0f));

        this.readPixels(dst, 0, 0, this.m_size[0], this.m_size[1], gluTextureUtil.mapGLInternalFormat(colorFormat), [1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 0.0, 0.0]);
    };

    /**
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {number} attachDepth
     * @param {number} useDepth
     */
    var DepthStencilAttachCase = function(name, desc, attachDepth, attachStencil) {
        fboTestCase.FboTestCase.call(name, desc);
        /** @type {number} */ this.m_attachDepth = attachDepth;
        /** @type {number} */ this.m_attachStencil = attachStencil;
        DE_ASSERT(this.m_attachDepth == gl.DEPTH_ATTACHMENT || this.m_attachDepth == gl.DEPTH_STENCIL_ATTACHMENT || this.m_attachDepth == gl.NONE);
        DE_ASSERT(this.m_attachStencil == gl.STENCIL_ATTACHMENT || this.m_attachStencil == gl.NONE);
        DE_ASSERT(this.m_attachDepth != gl.DEPTH_STENCIL || this.m_attachStencil == gl.NONE);
    };

    DepthStencilAttachCase.prototype = Object.create(fboTestCase.FboTestCase.prototype);
    DepthStencilAttachCase.prototype.constructor = DepthStencilAttachCase;

    /**
     * @param {tcuSurface.Surface} dst
     */
    DepthStencilAttachCase.prototype.render = function(dst) {
        /** @const {number} */ var colorFormat = gl.RGBA8;
        /** @const {number} */ var depthStencilFormat = gl.DEPTH24_STENCIL8;
        /** @const {number} */ var width = 128;
        /** @const {number} */ var height = 128;
        /** @const {boolean} */ var hasDepth = this.m_attachDepth == gl.DEPTH_STENCIL || this.m_attachDepth == gl.DEPTH_ATTACHMENT;
        //        const bool                hasStencil            = (m_attachDepth == GL_DEPTH_STENCIL || m_attachStencil == GL_DEPTH_STENCIL_ATTACHMENT);

        /** @type {fboTestUtil.GradientShader} */ var gradShader = fboTestUtil.GradientShader(gluShaderUtil.DataType.FLOAT_VEC4);
        /** @type {fboTestUtil.FlatColorShader} */ var flatShader = fboTestUtil.FlatColorShader(gluShaderUtil.DataType.FLOAT_VEC4);
        /** @type {number} */ var flatShaderID = getCurrentContext().createProgram(flatShader); // TODO: getCurrentContext
        /** @type {number} */ var gradShaderID = getCurrentContext().createProgram(gradShader);

        /** @type {number} */ var fbo = 0;
        /** @type {number} */ var colorRbo = 0;
        /** @type {number} */ var depthStencilRbo = 0;

        // Colorbuffer.
        colorRbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, colorRbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, colorFormat, width, height);

        // Depth-stencil buffer.
        depthStencilRbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthStencilRbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, depthStencilFormat, width, height);

        // Framebuffer.
        fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colorRbo);

        if (this.m_attachDepth != gl.NONE)
            glFramebufferRenderbuffer(gl.FRAMEBUFFER, this.m_attachDepth, gl.RENDERBUFFER, depthStencilRbo);
        if (this.m_attachStencil != gl.NONE)
            glFramebufferRenderbuffer(gl.FRAMEBUFFER, this.m_attachStencil, GL_RENDERBUFFER, depthStencilRbo);

        this.checkError();
        this.checkFramebufferStatus(gl.FRAMEBUFFER);

        gl.viewport(0, 0, width, height);

        // Clear framebuffer.
        gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
        gl.clearBufferfi(gl.DEPTH_STENCIL, 0, 1.0, 0);

        // Render intersecting quads - increment stencil on depth pass
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS, 0, 0xff);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

        flatShader.setColor(getCurrentContext(), flatShaderID, [1.0, 0.0, 0.0, 1.0]);
        // TODO: implement drawQuad
        //sglr::drawQuad(getCurrentContext(), flatShaderID, [-1.0, -1.0,  0.0], [1.0, 1.0, 0.0]);

        gradShader.setGradient(getCurrentContext(), gradShaderID, [0.0, 0.0, 0.0, 0.0], [1.0, 1.0, 1.0, 1.0]);
        // TODO: implement drawQuad
        //sglr::drawQuad(getCurrentContext(), gradShaderID, [-1.0, -1.0, -1.0], [1.0, 1.0, 1.0]);

        gl.disable(gl.DEPTH_TEST);

        // Draw quad with stencil test (stencil == 1 or 2 depending on depth) - decrement on stencil failure
        gl.stencilFunc(gl.EQUAL, hasDepth ? 2 : 1, 0xff);
        gl.stencilOp(gl.DECR, gl.KEEP, gl.KEEP);

        flatShader.setColor(getCurrentContext(), flatShaderID, [0.0, 1.0, 0.0, 1.0]);
        // TODO: implement drawQuad
        //sglr::drawQuad(getCurrentContext(), flatShaderID, [-0.5, -0.5, 0.0], [0.5, 0.5, 0.0]);

        // Draw quad with stencil test where stencil > 1 or 2 depending on depth buffer
        gl.stencilFunc(gl.GREATER, hasDepth ? 1 : 2, 0xff);

        flatShader.setColor(getCurrentContext(), flatShaderID, [0.0, 0.0, 1.0, 1.0]);
        // TODO: implement drawQuad
        //sglr::drawQuad(getCurrentContext(), flatShaderID, [-1.0, -1.0, 0.0], [1.0, 1.0, 0.0]);

        this.readPixels(dst, 0, 0, width, height, gluTextureUtil.mapGLInternalFormat(colorFormat), [1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 0.0, 0.0]);
    };

    /**
     * @constructor
     */
    var FboStencilTests = function() {
        tcuTestCase.DeqpTest.call('stencil', 'FBO Stencilbuffer tests');
    };

    FboStencilTests.prototype = Object.create(tcuTestCase.DeqpTest.prototype);
    FboStencilTests.prototype.constructor = FboStencilTests;

    FboStencilTests.prototype.init = function() {
        /** @const {Array<number>} */ var stencilFormats = [
            gl.DEPTH32F_STENCIL8,
            gl.DEPTH24_STENCIL8,
            gl.STENCIL_INDEX8
        ];
        var testGroup = tcuTestCase.runner.getState().testCases;
        // .basic
        /** @type {TestCaseGroup} */
        var basicGroup = new tcuTestCase.newTest('basic', 'Basic stencil tests');
        testGroup.addChild(basicGroup);

        for (var fmtNdx = 0; fmtNdx < stencilFormats.length; fmtNdx++) {
            /** @type {number} */ var format = stencilFormats[fmtNdx];
            /** @type {tcuTexture.TextureFormat} */ var texFmt = gluTextureUtil.mapGLInternalFormat(format);

            basicGroup.addChild(new BasicFboStencilCase(fboTestUtil.getFormatName(format), '', format, [111, 132], false));

            if (texFmt.order == tcuTexture.ChannelOrder.DS)
                basicGroup.addChild(new BasicFboStencilCase(fboTestUtil.getFormatName(format) + '_depth'), '', format, [111, 132], true);
        }

        // .attach
        /** @type {TestCaseGroup} */
        var attachGroup = new tcuTestCase.newTest('attach', 'Attaching depth stencil');
        testGroup.addChild(attachGroup);

        attachGroup.addChild(new DepthStencilAttachCase('depth_only', 'Only depth part of depth-stencil RBO attached', GL_DEPTH_ATTACHMENT, GL_NONE));
        attachGroup.addChild(new DepthStencilAttachCase('stencil_only', 'Only stencil part of depth-stencil RBO attached', GL_NONE, GL_STENCIL_ATTACHMENT));
        attachGroup.addChild(new DepthStencilAttachCase('depth_stencil_separate', 'Depth and stencil attached separately', GL_DEPTH_ATTACHMENT, GL_STENCIL_ATTACHMENT));
        attachGroup.addChild(new DepthStencilAttachCase('depth_stencil_attachment', 'Depth and stencil attached with DEPTH_STENCIL_ATTACHMENT', GL_DEPTH_STENCIL_ATTACHMENT, GL_NONE));
    };

    var run = function(context) {
        gl = context;
        //Set up root Test
        var state = tcuTestCase.runner.getState();

        var test = new FboStencilTests();
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
        FboStencilTests: FboStencilTests
    };
});
