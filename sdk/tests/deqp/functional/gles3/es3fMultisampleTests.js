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
goog.provide('functional.gles3.es3fMultisampleTests');
goog.require('framework.common.tcuTestCase');
goog.require('framework.delibs.debase.deMath');
goog.require('framework.delibs.debase.deRandom');
goog.require('framework.delibs.debase.deString');
goog.require('framework.opengl.gluShaderProgram');
goog.require('framework.common.tcuRGBA');
goog.require('framework.common.tcuSurface');
goog.require('framework.common.tcuTexture');

goog.scope(function() {
    /** @type {?WebGL2RenderingContext} */ var gl;
    var es3fMultisampleTests = functional.gles3.es3fMultisampleTests;
    var deMath = framework.delibs.debase.deMath;
    var deRandom = framework.delibs.debase.deRandom;
    var deString = framework.delibs.debase.deString;
    var gluShaderProgram = framework.opengl.gluShaderProgram;
    var tcuRGBA = framework.common.tcuRGBA;
    var tcuSurface = framework.common.tcuSurface;
    var tcuTestCase = framework.common.tcuTestCase;
    var tcuTexture = framework.common.tcuTexture;

    /** @const {number} */ es3fMultisampleTests.SQRT_HALF = 0.707107;

    /**
     * @constructor
     * @struct
     * @param {Array<number>} p0_
     * @param {Array<number>} p1_
     * @param {Array<number>} p2_
     * @param {Array<number>} p3_
     */
    es3fMultisampleTests.QuadCorners = function(p0_, p1_, p2_, p3_) {
        /** @type {Array<number>} */ this.p0 = p0_;
        /** @type {Array<number>} */ this.p1 = p1_;
        /** @type {Array<number>} */ this.p2 = p2_;
        /** @type {Array<number>} */ this.p3 = p3_;
    };

    /**
     * @param {number} defaultCount
     * @return {number}
     */
    es3fMultisampleTests.getIterationCount = function(defaultCount) {
        // The C++ test takes an argument from the command line.
        // Leaving this function in case we want to be able to take an argument from the URL
        return defaultCount;
    };

    /**
     * @param {number} a
     * @param {number} b
     * @param {number} c
     * @param {number} d
     * @return {number}
     */
    es3fMultisampleTests.min4 = function(a, b, c, d) {
           return Math.min(Math.min(Math.min(a, b), c), d);
    };

    /**
     * @param {number} a
     * @param {number} b
     * @param {number} c
     * @param {number} d
     * @return {number}
     */
    es3fMultisampleTests.max4 = function(a, b, c, d) {
           return Math.max(Math.max(Math.max(a, b), c), d);
    };

    /**
     * @param  {Array<number>} point
     * @param  {Array<number>} p0
     * @param  {Array<number>} p1
     * @param  {Array<number>} p2
     * @param  {Array<number>} p3
     * @return {boolean}
     */
    es3fMultisampleTests.isInsideQuad = function(point, p0, p1, p2, p3) {
        /** @type {number} */ var dot0 = (point[0] - p0[0]) * (p1[1] - p0[1]) + (point[1] - p0[1]) * (p0[0] - p1[0]);
        /** @type {number} */ var dot1 = (point[0] - p1[0]) * (p2[1] - p1[1]) + (point[1] - p1[1]) * (p1[0] - p2[0]);
        /** @type {number} */ var dot2 = (point[0] - p2[0]) * (p3[1] - p2[1]) + (point[1] - p2[1]) * (p2[0] - p3[0]);
        /** @type {number} */ var dot3 = (point[0] - p3[0]) * (p0[1] - p3[1]) + (point[1] - p3[1]) * (p3[0] - p0[0]);

        return (dot0 > 0) == (dot1 > 0) && (dot1 > 0) == (dot2 > 0) && (dot2 > 0) == (dot3 > 0);
    };

    /**
     * Check if a region in an image is unicolored.
     *
     * Checks if the pixels in img inside the convex quadilateral defined by
     * p0, p1, p2 and p3 are all (approximately) of the same color.
     *
     * @param  {tcuSurface.Surface} img
     * @param  {Array<number>} p0
     * @param  {Array<number>} p1
     * @param  {Array<number>} p2
     * @param  {Array<number>} p3
     * @return {boolean}
     */
    es3fMultisampleTests.isPixelRegionUnicolored = function(img, p0, p1, p2, p3) {
        /** @type {number} */ var xMin = deMath.clamp(es3fMultisampleTests.min4(p0[0], p1[0], p2[0], p3[0]), 0, img.getWidth() - 1);
        /** @type {number} */ var yMin = deMath.clamp(es3fMultisampleTests.min4(p0[1], p1[1], p2[1], p3[1]), 0, img.getHeight() - 1);
        /** @type {number} */ var xMax = deMath.clamp(es3fMultisampleTests.max4(p0[0], p1[0], p2[0], p3[0]), 0, img.getWidth() - 1);
        /** @type {number} */ var yMax = deMath.clamp(es3fMultisampleTests.max4(p0[1], p1[1], p2[1], p3[1]), 0, img.getHeight() - 1);
        /** @type {boolean} */ var insideEncountered = false; //!< Whether we have already seen at least one pixel inside the region.
        /** @type {tcuRGBA.RGBA} */ var insideColor; //!< Color of the first pixel inside the region.

        for (var y = yMin; y <= yMax; y++)
        for (var x = xMin; x <= xMax; x++) {
            if (es3fMultisampleTests.isInsideQuad([x, y], p0, p1, p2, p3)) {
                /** @type {tcuRGBA.RGBA} */ var pixColor = img.getPixel(x, y);

                if (insideEncountered)
                    if (!tcuRGBA.compareThreshold(pixColor, insideColor, tcuRGBA.newRGBAComponents(3, 3, 3, 3))) // Pixel color differs from already-detected color inside same region - region not unicolored.
                        return false;
                else {
                    insideEncountered = true;
                    insideColor = pixColor;
                }
            }
        }

        return true;
    };

    /**
     * [drawUnicolorTestErrors description]
     * @param  {tcuSurface.Surface} img
     * @param  {tcuTexture.PixelBufferAccess} errorImg
     * @param  {Array<number>} p0
     * @param  {Array<number>} p1
     * @param  {Array<number>} p2
     * @param  {Array<number>} p3
     * @return {boolean}
     */
    es3fMultisampleTests.drawUnicolorTestErrors = function(img, errorImg, p0, p1, p2, p3) {
        /** @type {number} */ var xMin = deMath.clamp(es3fMultisampleTests.min4(p0[0], p1[0], p2[0], p3[0]), 0, img.getWidth() - 1);
        /** @type {number} */ var yMin = deMath.clamp(es3fMultisampleTests.min4(p0[1], p1[1], p2[1], p3[1]), 0, img.getHeight() - 1);
        /** @type {number} */ var xMax = deMath.clamp(es3fMultisampleTests.max4(p0[0], p1[0], p2[0], p3[0]), 0, img.getWidth() - 1);
        /** @type {number} */ var yMax = deMath.clamp(es3fMultisampleTests.max4(p0[1], p1[1], p2[1], p3[1]), 0, img.getHeight() - 1);
        /** @type {tcuRGBA.RGBA} */ var refColor = img.getPixel(Math.floor((xMin + xMax) / 2), Math.floor((yMin + yMax) / 2));

    	for (var y = yMin; y <= yMax; y++)
    	for (var x = xMin; x <= xMax; x++) {
    		if (es3fMultisampleTests.isInsideQuad([x, y], p0, p1, p2, p3)) {
    			if (!tcuRGA.compareThreshold(img.getPixel(x, y), refColor, tcuRGBA.newRGBAComponents(3, 3, 3, 3))) {
    				img.setPixel(x, y, tcuRGBA.RGBA.red);
    				errorImg.setPixel([1.0, 0.0, 0.0, 1.0], x, y);
    			}
    		}
    	}

    	return true;
    };

    /**
     * @constructor
     * @struct
     * @param {number=} numSamples_
     * @param {boolean=} useDepth_
     * @param {boolean=} useStencil_
     */
    es3fMultisampleTests.FboParams = function(numSamples_, useDepth_, useStencil_) {
        /** @type {boolean} */ var useFbo_ = true;
        if (numSamples_ === undefined && useDepth_ === undefined && useStencil_ === undefined)
            useFbo_ = false;
        /** @type {boolean} */ this.useFbo = useFbo_;
        /** @type {number} */ this.numSamples = numSamples_ === undefined ? -1 : numSamples_;
        /** @type {boolean} */ this.useDepth = useDepth_ === undefined ? false : useDepth_;
        /** @type {boolean} */ this.useStencil = useStencil_ === undefined ? false : useStencil_;

    };

    /**
     * @constructor
     * @extends {tcuTestCase.DeqpTest}
     * @param {string} name
     * @param {string} desc
     * @param {number} desiredViewportSize
     * @param {es3fMultisampleTests.FboParams} fboParams
     */
    es3fMultisampleTests.MultisampleCase = function(name, desc, desiredViewportSize, fboParams) {
        tcuTestCase.DeqpTest.call(this, name, desc);
        /** @protected {number} */ this.m_numSamples = 0;
        /** @protected {number} */ this.m_viewportSize = 0;
        /** @private {number} */ this.m_desiredViewportSize = desiredViewportSize;
        /** @private {es3fMultisampleTests.FboParams} */ this.m_fboParams = fboParams;
        /** @private {number} */ this.m_msColorRbo = 0;
        /** @private {number} */ this.m_msDepthStencilRbo = 0;
        /** @private {number} */ this.m_resolveColorRbo = 0;
        /** @private {number} */ this.m_msFbo = 0;
        /** @private {number} */ this.m_resolveFbo = 0;
        /** @private {gluShaderProgram.ShaderProgram} */ this.m_program = null;;
        /** @private {number} */ this.m_attrPositionLoc = -1;
        /** @private {number} */ this.m_attrColorLoc = -1;
        /** @private {number} */ this.m_renderWidth = fboParams.useFbo ? 2 * desiredViewportSize : gl.drawingBufferWidth;
        /** @private {number} */ this.m_renderHeight = fboParams.useFbo ? 2 * desiredViewportSize : gl.drawingBufferHeigth;
        /** @private {number} */ this.m_viewportX = 0;
        /** @private {number} */ this.m_viewportY = 0;
        /** @private {deRandom.Random} */ this.m_rnd = new deRandom.Random(deString.deStringHash(this.name));
        if (this.m_fboParams.useFbo)
            assertMsgOptions(this.m_fboParams.numSamples >= 0, 'fboParams.numSamples < 0', false, true);
    };

    es3fMultisampleTests.MultisampleCase.prototype = Object.create(tcuTestCase.DeqpTest.prototype);

    /** Copy the constructor */
    es3fMultisampleTests.MultisampleCase.prototype.constructor = es3fMultisampleTests.MultisampleCase;

    /**
     * @private
     * @param {es3fMultisampleTests.MultisampleCase} other
     * @return {es3fMultisampleTests.MultisampleCase}
     */
    es3fMultisampleTests.newMultisampleCaseFromOther = function(other) {
    };

    es3fMultisampleTests.MultisampleCase.prototype.init = function() {

    };

    /**
     * @protected
     * @param  {Array<number>} p0
     * @param  {Array<number>} p1
     * @param  {Array<number>} p2
     * @param  {Array<number>} c0
     * @param  {Array<number>} c1
     * @param  {Array<number>} c2
     */
    es3fMultisampleTests.MultisampleCase.prototype.renderTriangle_pAsVec3cAsVec4 = function(p0, p1, p2, c0, c1, c2) {
        /** @type {Array<number>} */ var vertexPositions = [
            p0[0], p0[1], p0[2], 1.0,
            p1[0], p1[1], p1[2], 1.0,
            p2[0], p2[1], p2[2], 1.0
        ];
        /** @type {Array<number>} */ var vertexColors = [
            c0[0], c0[1], c0[2], c0[3],
            c1[0], c1[1], c1[2], c1[3],
            c2[0], c2[1], c2[2], c2[3]
        ];

        var posGLBuffer = gl.createBuffer();
        /** @type {goog.NumberArray} */ var posBuffer = new Float32Array(vertexPositions);
        checkMessage(gl.bindBuffer(gl.ARRAY_BUFFER, posGLBuffer), 'gl.bindBuffer()');
        checkMessage(gl.bufferData(gl.ARRAY_BUFFER, posBuffer, gl.STATIC_DRAW), 'gl.bufferData()');

        checkMessage((gl.enableVertexAttribArray(this.m_attrPositionLoc)), 'gl.enableVertexAttribArray()');
        checkMessage((gl.vertexAttribPointer(this.m_attrPositionLoc, 4, gl.FLOAT, false, 0, 0)), 'gl.vertexAttribPointer()');

        var colGLBuffer = gl.createBuffer();
        /** @type {goog.NumberArray} */ var colBuffer = new Float32Array(vertexColors);
        checkMessage(gl.bindBuffer(gl.ARRAY_BUFFER, colGLBuffer), 'gl.bindBuffer()');
        checkMessage(gl.bufferData(gl.ARRAY_BUFFER, colBuffer, gl.STATIC_DRAW), 'gl.bufferData()');

        checkMessage((gl.enableVertexAttribArray(this.m_attrColorLoc)), 'gl.enableVertexAttribArray()');
        checkMessage((gl.vertexAttribPointer(this.m_attrColorLoc, 4, gl.FLOAT, false, 0, 0)), 'gl.vertexAttribPointer()');

        checkMessage((gl.useProgram(this.m_program.getProgram())), 'gl.useProgram()');
        checkMessage((gl.drawArrays(gl.TRIANGLES, 0, 3)), 'gl.drawArrays()');
    };

    /**
     * @protected
     * @param  {Array<number>} p0
     * @param  {Array<number>} p1
     * @param  {Array<number>} p2
     * @param  {Array<number>} color
     */
    es3fMultisampleTests.MultisampleCase.prototype.renderTriangle_pAsVec3WithColor = function(p0, p1, p2, color) {
        this.renderTriangle_pAsVec3cAsVec4(p0, p1, p2, color, color, color);
    };

    /**
     * @protected
     * @param  {Array<number>} p0
     * @param  {Array<number>} p1
     * @param  {Array<number>} p2
     * @param  {Array<number>} c0
     * @param  {Array<number>} c1
     * @param  {Array<number>} c2
     */
    es3fMultisampleTests.MultisampleCase.prototype.renderTriangle_pAsVec2 = function(p0, p1, p2, c0, c1, c2) {
        this.renderTriangle_pAsVec3cAsVec4(
            [p0[0], p0[1], 0.0],
            [p1[0], p1[1], 0.0],
            [p2[0], p2[1], 0.0],
            c0, c1, c2);
    };

    /**
     * @protected
     * @param  {Array<number>} p0
     * @param  {Array<number>} p1
     * @param  {Array<number>} p2
     * @param  {Array<number>} color
     */
    es3fMultisampleTests.MultisampleCase.prototype.renderTriangle_pAsVec2WithColor = function(p0, p1, p2, color) {
        this.renderTriangle_pAsVec2(p0, p1, p2, color, color, color);
    };

    /**
     * @protected
     * @param  {Array<number>} p0
     * @param  {Array<number>} p1
     * @param  {Array<number>} p2
     * @param  {Array<number>} p3
     * @param  {Array<number>} c0
     * @param  {Array<number>} c1
     * @param  {Array<number>} c2
     * @param  {Array<number>} c3
     */
    es3fMultisampleTests.MultisampleCase.prototype.renderQuad = function(p0, p1, p2, p3, c0, c1, c2, c3) {
        this.renderTriangle_pAsVec2(p0, p1, p2, c0, c1, c2);
        this.renderTriangle_pAsVec2(p2, p1, p3, c2, c1, c3);
    };

    /**
     * @protected
     * @param  {Array<number>} p0
     * @param  {Array<number>} p1
     * @param  {Array<number>} p2
     * @param  {Array<number>} p3
     * @param  {Array<number>} color
     */
    es3fMultisampleTests.MultisampleCase.prototype.renderQuad_WithColor = function(p0, p1, p2, p3, color) {
        this.renderQuad(p0, p1, p2, p3, color, color, color, color);
    };

    /**
     * @protected
     * @param  {Array<number>} p0
     * @param  {Array<number>} p1
     * @param  {Array<number>} color
     */
    es3fMultisampleTests.MultisampleCase.prototype.renderLine = function(p0, p1, color) {
        /** @type {Array<number>} */ var vertexPositions = [
            p0[0], p0[1], 0.0, 1.0,
            p1[0], p1[1], 0.0, 1.0
        ];
        /** @type {Array<number>} */ var vertexColors = [
            color[0], color[1], color[2], color[3],
            color[0], color[1], color[2], color[3]
        ];

        var posGLBuffer = gl.createBuffer();
        /** @type {goog.NumberArray} */ var posBuffer = new Float32Array(vertexPositions);
        checkMessage(gl.bindBuffer(gl.ARRAY_BUFFER, posGLBuffer), 'gl.bindBuffer()');
        checkMessage(gl.bufferData(gl.ARRAY_BUFFER, posBuffer, gl.STATIC_DRAW), 'gl.bufferData()');

        checkMessage(gl.enableVertexAttribArray(this.m_attrPositionLoc), 'gl.enableVertexAttribArray()');
        checkMessage(gl.vertexAttribPointer(this.m_attrPositionLoc, 4, gl.FLOAT, false, 0, 0), 'gl.vertexAttribPointer()');

        var colGLBuffer = gl.createBuffer();
        /** @type {goog.NumberArray} */ var colBuffer = new Float32Array(vertexColors);
        checkMessage(gl.bindBuffer(gl.ARRAY_BUFFER, colGLBuffer), 'gl.bindBuffer()');
        checkMessage(gl.bufferData(gl.ARRAY_BUFFER, colBuffer, gl.STATIC_DRAW), 'gl.bufferData()');

        checkMessage(gl.enableVertexAttribArray(this.m_attrColorLoc), 'gl.enableVertexAttribArray()');
        checkMessage(gl.vertexAttribPointer(this.m_attrColorLoc, 4, gl.FLOAT, false, 0, 0), 'gl.vertexAttribPointer()');

        checkMessage(gl.useProgram(this.m_program.getProgram()), 'gl.useProgram()');
        checkMessage(gl.drawArrays(gl.LINES, 0, 2), 'gl.drawArrays()');
    };

    /**
     * @protected
     */
    es3fMultisampleTests.MultisampleCase.prototype.randomizeViewport = function() {
        this.m_viewportX = this.m_rnd.getInt(0, this.m_renderWidth - this.m_viewportSize);
        this.m_viewportY = this.m_rnd.getInt(0, this.m_renderHeight - this.m_viewportSize);

        checkMessage(gl.viewport(this.m_viewportX, this.m_viewportY, this.m_viewportSize, this.m_viewportSize), 'gl.viewport()');
    };

    /**
     * @protected
     * @return {tcuSurface.Surface}
     */
    es3fMultisampleTests.MultisampleCase.prototype.readImage = function() {
        /** @type {glsTextureTestUtil.RandomViewport} */
        var viewport = new glsTextureTestUtil.RandomViewport(gl.canvas, this.m_renderWidth, this.m_renderHeight, deString.deStringHash(this.name));
        /** @type {tcuSurface.Surface} */
        var dst = new tcuSurface.Surface(this.m_renderWidth, this.m_renderHeight);

        if (this.m_fboParams.useFbo) {
            checkMessage(gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.m_resolveFbo), 'gl.bindFramebuffer()');
            checkMessage(gl.blitFramebuffer(0, 0, this.m_renderWidth, this.m_renderHeight, 0, 0, this.m_renderWidth, this.m_renderHeight, gl.COLOR_BUFFER_BIT, gl.NEAREST), 'gl.blitFramebuffer()');
            checkMessage(gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.m_resolveFbo), 'gl.bindFramebuffer()');

            //glu::readPixels(this.m_context.getRenderContext(), this.m_viewportX, this.m_viewportY, dst.getAccess());
            dst.readViewport(gl, viewport);

            checkMessage(gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_msFbo), 'gl.bindFramebuffer()');
        }
        else {
            //glu::readPixels(this.m_context.getRenderContext(), this.m_viewportX, this.m_viewportY, dst.getAccess());
            dst.readViewport(gl, viewport);
        }
        return dst;
    };

    es3fMultisampleTests.MultisampleCase.prototype.init = function() {
        /** @type {string} */ vertShaderSource = '' +
            '#version 300 es\n' +
            'in highp vec4 a_position;\n' +
            'in mediump vec4 a_color;\n' +
            'out mediump vec4 v_color;\n' +
            'void main()\n' +
            '{\n' +
            '	gl_Position = a_position;\n' +
            '	v_color = a_color;\n' +
            '}\n';

    	/** @type {string} */ fragShaderSource = '' +
    		'#version 300 es\n' +
    		'in mediump vec4 v_color;\n' +
    		'layout(location = 0) out mediump vec4 o_color;\n' +
    		'void main()\n' +
    		'{\n' +
    		'	o_color = v_color;\n' +
    		'}\n';

    	// TestLog& log = m_testCtx.getLog();

        // TODO: what is the replacement for getNumSamples()?
    	if (!this.m_fboParams.useFbo && this.m_context.getRenderTarget().getNumSamples() <= 1)
    		throw new Error('No multisample buffers');

    	if (this.m_fboParams.useFbo) {
    		if (this.m_fboParams.numSamples > 0)
    			this.m_numSamples = this.m_fboParams.numSamples;
    		else {
    			//log << TestLog::Message << "Querying maximum number of samples for " << glu::getPixelFormatName(FBO_COLOR_FORMAT) << " with glGetInternalformativ()" << TestLog::EndMessage;
    			checkMessage(gl.getInternalformativ(gl.RENDERBUFFER, gl.RGBA8, gl.SAMPLES, 1, this.m_numSamples), 'gl.getInternalformativ()');
    		}

    		//log << TestLog::Message << "Using FBO of size (" << m_renderWidth << ", " << m_renderHeight << ") with " << m_numSamples << " samples" << TestLog::EndMessage;
    	}
    	else {
    		// Query and log number of samples per pixel.

    		this.m_numSamples = gl.getIntegerv(gl.SAMPLES);
    		//log << TestLog::Message << "GL_SAMPLES = " << m_numSamples << TestLog::EndMessage;
    	}

    	// Prepare program.

    	assertMsgOptions(!this.m_program, 'Program loaded when it should not be.', false, true);

    	this.m_program = new gluShaderProgram.ShaderProgram(
            gl,
            gluShaderProgram.makeVtxFragSources(vertShaderSource, fragShaderSource));

    	if (!this.m_program.isOk())
    		throw new Error('Failed to compile program');

    	checkMessage(this.m_attrPositionLoc = gl.getAttribLocation(this.m_program.getProgram(), "a_position"), 'gl.getAttribLocation()');
        checkMessage(this.m_attrColorLoc = gl.getAttribLocation(this.m_program.getProgram(), "a_color"), 'gl.getAttribLocation()');

    	if (this.m_attrPositionLoc < 0 || this.m_attrColorLoc < 0) {
    		this.m_program = null;
    		throw new Error('Invalid attribute locations');
    	}

    	if (this.m_fboParams.useFbo) {
    		// Setup ms color RBO.
            checkMessage(this.m_msColorRbo = gl.createRenderbuffer(), 'gl.genRenderbuffers()');
            checkMessage(gl.bindRenderbuffer(gl.RENDERBUFFER, this.m_msColorRbo), 'gl.bindRenderbuffer()');

    		// If glRenderbufferStorageMultisample() fails, check if it's because of a too high sample count.
    		// \note We don't do the check until now because some implementations can't handle the GL_SAMPLES query with glGetInternalformativ(),
    		//		 and we don't want that to be the cause of test case failure.
    		try {
    			checkMessage(gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.m_numSamples, gl.RGBA8, this.m_renderWidth, this.m_renderHeight), 'gl.renderbufferStorageMultisample()');
    		}
    		catch (e) {
    			/** @type {number} */ var maxSampleCount = -1;
    			GLU_CHECK_CALL(gl.getInternalformativ(gl.RENDERBUFFER, gl.RGBA8, gl.SAMPLES, 1, maxSampleCount));
    			if (maxSampleCount < this.m_numSamples)
    				throw new Error('Maximum sample count returned by gl.getInternalformativ() for ' + gluStrUtil.getPixelFormatName(gl.RGBA8) + ' is only ' + maxSampleCount);
    			else
    				throw new Error('Unspecified error');
    		}

    		if (this.m_fboParams.useDepth || this.m_fboParams.useStencil) {
    			// Setup ms depth & stencil RBO.
                checkMessage(this.m_msDepthStencilRbo = gl.createRenderbuffer(), 'gl.createRenderbuffer()');
                checkMessage(gl.bindRenderbuffer(gl.RENDERBUFFER, this.m_msDepthStencilRbo), 'gl.bindRenderbuffer()');
                checkMessage(gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.m_numSamples, gl.DEPTH24_STENCIL8, this.m_renderWidth, this.m_renderHeight), 'gl.renderbufferStorageMultisample()');
    		}

    		// Setup ms FBO.
            checkMessage(this.m_msFbo = gl.createFramebuffer(), 'gl.createFramebuffer()');
            checkMessage(gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_msFbo), 'gl.bindFramebuffer()');
            checkMessage(gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.m_msColorRbo), 'gl.framebufferRenderbuffer()');
            checkMessage(gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.m_msDepthStencilRbo), 'gl.framebufferRenderbuffer()');

    		// Setup resolve color RBO.
            checkMessage(this.m_resolveColorRbo = gl.createRenderbuffer(), 'gl.createRenderbuffer()');
            checkMessage(gl.bindRenderbuffer(gl.RENDERBUFFER, this.m_resolveColorRbo), 'gl.bindRenderbuffer()');
            checkMessage(gl.renderbufferStorage(gl.RENDERBUFFER, FBO_COLOR_FORMAT, this.m_renderWidth, this.m_renderHeight), 'gl.renderbufferStorage()');

    		// Setup resolve FBO.
            checkMessage(this.m_resolveFbo = gl.createFramebuffer(), 'gl.createFramebuffer()');
            checkMessage(gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_resolveFbo), 'gl.bindFramebuffer()');
            checkMessage(gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.m_resolveColorRbo), 'gl.framebufferRenderbuffer()');

    		// Use ms FBO.
            checkMessage(gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_msFbo), 'gl.bindFramebuffer()');
    	}

    	// Get suitable viewport size.

    	this.m_viewportSize = Math.min(this.m_desiredViewportSize, Math.min(this.m_renderWidth, this.m_renderHeight));
    	this.randomizeViewport();
    };

    /**
     * init
     */
    es3fMultisampleTests.MultisampleTests.prototype.init = function() {

    };

});
