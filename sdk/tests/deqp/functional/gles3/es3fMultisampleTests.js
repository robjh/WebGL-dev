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
goog.require('framework.opengl.gluStrUtil');
goog.require('framework.common.tcuImageCompare');
goog.require('framework.common.tcuRGBA');
goog.require('framework.common.tcuSurface');
goog.require('framework.common.tcuTexture');
goog.require('modules.shared.glsTextureTestUtil');

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
    var gluStrUtil = framework.opengl.gluStrUtil;
    var glsTextureTestUtil = modules.shared.glsTextureTestUtil;
    var tcuImageCompare = framework.common.tcuImageCompare;

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
    			if (!tcuRGBA.compareThreshold(img.getPixel(x, y), refColor, tcuRGBA.newRGBAComponents(3, 3, 3, 3))) {
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
        /** @type {number} */ this.m_numSamples = 0;
        /** @type {number} */ this.m_viewportSize = 0;
        /** @type {number} */ this.m_desiredViewportSize = desiredViewportSize;
        /** @type {es3fMultisampleTests.FboParams} */ this.m_fboParams = fboParams;
        /** @type {WebGLRenderbuffer} */ this.m_msColorRbo = null;
        /** @type {WebGLRenderbuffer} */ this.m_msDepthStencilRbo = null;
        /** @type {WebGLRenderbuffer} */ this.m_resolveColorRbo = null;
        /** @type {WebGLFramebuffer} */ this.m_msFbo = null;
        /** @type {WebGLFramebuffer} */ this.m_resolveFbo = null;
        /** @type {gluShaderProgram.ShaderProgram} */ this.m_program = null;
        /** @type {number} */ this.m_attrPositionLoc = -1;
        /** @type {number} */ this.m_attrColorLoc = -1;
        /** @type {number} */ this.m_renderWidth = fboParams.useFbo ? 2 * desiredViewportSize : gl.drawingBufferWidth;
        /** @type {number} */ this.m_renderHeight = fboParams.useFbo ? 2 * desiredViewportSize : gl.drawingBufferHeight;
        /** @type {number} */ this.m_viewportX = 0;
        /** @type {number} */ this.m_viewportY = 0;
        /** @type {deRandom.Random} */ this.m_rnd = new deRandom.Random(deString.deStringHash(this.name));
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
        /** @type {ArrayBufferView} */ var posBuffer = new Float32Array(vertexPositions);
        gl.bindBuffer(gl.ARRAY_BUFFER, posGLBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, posBuffer, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(this.m_attrPositionLoc);
        gl.vertexAttribPointer(this.m_attrPositionLoc, 4, gl.FLOAT, false, 0, 0);

        var colGLBuffer = gl.createBuffer();
        /** @type {ArrayBufferView} */ var colBuffer = new Float32Array(vertexColors);
        gl.bindBuffer(gl.ARRAY_BUFFER, colGLBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colBuffer, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(this.m_attrColorLoc);
        gl.vertexAttribPointer(this.m_attrColorLoc, 4, gl.FLOAT, false, 0, 0);

        gl.useProgram(this.m_program.getProgram());
        gl.drawArrays(gl.TRIANGLES, 0, 3);
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
        /** @type {ArrayBufferView} */ var posBuffer = new Float32Array(vertexPositions);
        gl.bindBuffer(gl.ARRAY_BUFFER, posGLBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, posBuffer, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(this.m_attrPositionLoc);
        gl.vertexAttribPointer(this.m_attrPositionLoc, 4, gl.FLOAT, false, 0, 0);

        var colGLBuffer = gl.createBuffer();
        /** @type {ArrayBufferView} */ var colBuffer = new Float32Array(vertexColors);
        gl.bindBuffer(gl.ARRAY_BUFFER, colGLBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colBuffer, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(this.m_attrColorLoc);
        gl.vertexAttribPointer(this.m_attrColorLoc, 4, gl.FLOAT, false, 0, 0);

        gl.useProgram(this.m_program.getProgram());
        gl.drawArrays(gl.LINES, 0, 2);
    };

    /**
     * @protected
     */
    es3fMultisampleTests.MultisampleCase.prototype.randomizeViewport = function() {
        this.m_viewportX = this.m_rnd.getInt(0, this.m_renderWidth - this.m_viewportSize);
        this.m_viewportY = this.m_rnd.getInt(0, this.m_renderHeight - this.m_viewportSize);

        gl.viewport(this.m_viewportX, this.m_viewportY, this.m_viewportSize, this.m_viewportSize);
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
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.m_resolveFbo);
            gl.blitFramebuffer(0, 0, this.m_renderWidth, this.m_renderHeight, 0, 0, this.m_renderWidth, this.m_renderHeight, gl.COLOR_BUFFER_BIT, gl.NEAREST);
            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.m_resolveFbo);

            //glu::readPixels(this.m_context.getRenderContext(), this.m_viewportX, this.m_viewportY, dst.getAccess());
            dst.readViewport(gl, viewport);

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_msFbo);
        }
        else {
            //glu::readPixels(this.m_context.getRenderContext(), this.m_viewportX, this.m_viewportY, dst.getAccess());
            dst.readViewport(gl, viewport);
        }
        return dst;
    };

    es3fMultisampleTests.MultisampleCase.prototype.init = function() {
        /** @type {string} */ var vertShaderSource = '' +
            '#version 300 es\n' +
            'in highp vec4 a_position;\n' +
            'in mediump vec4 a_color;\n' +
            'out mediump vec4 v_color;\n' +
            'void main()\n' +
            '{\n' +
            '	gl_Position = a_position;\n' +
            '	v_color = a_color;\n' +
            '}\n';

    	/** @type {string} */ var fragShaderSource = '' +
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
    			bufferedLogToConsole('Querying maximum number of samples for ' + gluStrUtil.getPixelFormatName(gl.RGBA8) + ' with gl.getInternalformatParameter()');
    			// TODO: check call. Was getInternalformativ
    			this.m_numSamples = /** @type {number} */ (gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA8, gl.SAMPLES));
    		}

    		bufferedLogToConsole('Using FBO of size (' + this.m_renderWidth + ', ' + this.m_renderHeight + ') with ' + this.m_numSamples + ' samples');
    	}
    	else {
    		// Query and log number of samples per pixel.

    		this.m_numSamples = /** @type {number} */ (gl.getParameter(gl.SAMPLES)); // TODO: check this call. Was getIntegerv
    	    bufferedLogToConsole('gl.SAMPLES =' + m_numSamples);
    	}

    	// Prepare program.

    	assertMsgOptions(!this.m_program, 'Program loaded when it should not be.', false, true);

    	this.m_program = new gluShaderProgram.ShaderProgram(
            gl,
            gluShaderProgram.makeVtxFragSources(vertShaderSource, fragShaderSource));

    	if (!this.m_program.isOk())
    		throw new Error('Failed to compile program');

        this.m_attrPositionLoc = gl.getAttribLocation(this.m_program.getProgram(), 'a_position');
        this.m_attrColorLoc = gl.getAttribLocation(this.m_program.getProgram(), 'a_color');

    	if (this.m_attrPositionLoc < 0 || this.m_attrColorLoc < 0) {
    		this.m_program = null;
    		throw new Error('Invalid attribute locations');
    	}

    	if (this.m_fboParams.useFbo) {
    		// Setup ms color RBO.
    		this.m_msColorRbo = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.m_msColorRbo);

    		// If glRenderbufferStorageMultisample() fails, check if it's because of a too high sample count.
    		// \note We don't do the check until now because some implementations can't handle the gl.SAMPLES query with glGetInternalformativ(),
    		//		 and we don't want that to be the cause of test case failure.
    		try {
    			gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.m_numSamples, gl.RGBA8, this.m_renderWidth, this.m_renderHeight);
    		}
    		catch (e) {
    			/** @type {number} */ var maxSampleCount = /** @type {number} */ (gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA8, gl.SAMPLES));
    			if (maxSampleCount < this.m_numSamples)
    				throw new Error('Maximum sample count returned by gl.getInternalformativ() for ' + gluStrUtil.getPixelFormatName(gl.RGBA8) + ' is only ' + maxSampleCount);
    			else
    				throw new Error('Unspecified error');
    		}

    		if (this.m_fboParams.useDepth || this.m_fboParams.useStencil) {
    			// Setup ms depth & stencil RBO.
                this.m_msDepthStencilRbo = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, this.m_msDepthStencilRbo);
                gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.m_numSamples, gl.DEPTH24_STENCIL8, this.m_renderWidth, this.m_renderHeight);
    		}

    		// Setup ms FBO.
            this.m_msFbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_msFbo);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.m_msColorRbo);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.m_msDepthStencilRbo);

    		// Setup resolve color RBO.
            this.m_resolveColorRbo = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.m_resolveColorRbo);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, this.m_renderWidth, this.m_renderHeight);

    		// Setup resolve FBO.
            this.m_resolveFbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_resolveFbo);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.m_resolveColorRbo);

    		// Use ms FBO.
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_msFbo);
    	}

    	// Get suitable viewport size.

    	this.m_viewportSize = Math.min(this.m_desiredViewportSize, Math.min(this.m_renderWidth, this.m_renderHeight));
    	this.randomizeViewport();
    };



    /**
     * Base class for cases testing the value of sample count.
     *
     * Draws a test pattern (defined by renderPattern() of an inheriting class)
     * and counts the number of distinct colors in the resulting image. That
     * number should be at least the value of sample count plus one. This is
     * repeated with increased values of m_currentIteration until this correct
     * number of colors is detected or m_currentIteration reaches
     * m_maxNumIterations.
     *
     * @extends {es3fMultisampleTests.MultisampleCase}
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {es3fMultisampleTests.FboParams} fboParams
     */
    es3fMultisampleTests.NumSamplesCase = function(name, desc, fboParams) {
        es3fMultisampleTests.MultisampleCase.call(this, name, desc, 256, fboParams);
        /** @type {number} */ var DEFAULT_MAX_NUM_ITERATIONS = 16;
        /** @type {number} */ this.m_currentIteration = 0;
        /** @type {number} */ this.m_maxNumIterations = es3fMultisampleTests.getIterationCount(DEFAULT_MAX_NUM_ITERATIONS);
        /** @type {Array<tcuRGBA.RGBA>} */ this.m_detectedColors;
    };

    es3fMultisampleTests.NumSamplesCase.prototype = Object.create(es3fMultisampleTests.MultisampleCase.prototype);

    /** Copy the constructor */
    es3fMultisampleTests.NumSamplesCase.prototype.constructor = es3fMultisampleTests.NumSamplesCase;

    /**
     * @return {return tcuTestCase.IterateResult}
     */
    es3fMultisampleTests.NumSamplesCase.prototype.iterate = function() {
        //TestLog&		log				= m_testCtx.getLog();
    	/** @type {tcuSurface.Surface} */ var renderedImg = new tcuSurface.Surface(this.m_viewportSize, this.m_viewportSize);

    	this.randomizeViewport();

    	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    	gl.clear(gl.COLOR_BUFFER_BIT);

    	this.renderPattern();

    	// Read and log rendered image.

        renderedImg = this.readImage();

    	//log << TestLog::Image("RenderedImage", "Rendered image", renderedImg, QP_IMAGE_COMPRESSION_MODE_PNG);

    	// Detect new, previously unseen colors from image.

    	/** @type {number} */ var requiredNumDistinctColors = this.m_numSamples + 1;

    	for (var y = 0; y < renderedImg.getHeight() && this.m_detectedColors.length < requiredNumDistinctColors; y++)
    	for (var x = 0; x < renderedImg.getWidth() && this.m_detectedColors.length < requiredNumDistinctColors; x++) {
    		/** @type {tcuRGBA.RGBA} */ var color = renderedImg.getPixel(x, y);

    		/** @type {number} */ var i;
    		for (i = 0; i < this.m_detectedColors.length; i++) {
    			if (tcuRGBA.compareThreshold(color, this.m_detectedColors[i], tcuRGBA.newRGBAComponents(3, 3, 3, 3)))
    				break;
    		}

    		if (i === this.m_detectedColors.length)
    			this.m_detectedColors.push(color); // Color not previously detected.
    	}

    	// Log results.

    		bufferedLogToConsole('Number of distinct colors detected so far: ' + (this.m_detectedColors.length >= requiredNumDistinctColors ? 'at least ' : '') + this.m_detectedColors.length);


    	if (this.m_detectedColors.length < requiredNumDistinctColors) {
    		// Haven't detected enough different colors yet.

    		this.m_currentIteration++;

    		if (this.m_currentIteration >= this.m_maxNumIterations) {
    			bufferedLogToConsole('Failure: Number of distinct colors detected is lower than sample count+1');
    			testFailedOptions('Failed', false);
    			return tcuTestCase.IterateResult.STOP;
    		}
    		else {
    			bufferedLogToConsole('The number of distinct colors detected is lower than sample count+1 - trying again with a slightly altered pattern');
    			return tcuTestCase.IterateResult.CONTINUE;
    		}
    	}
    	else {
    		bufferedLogToConsole('Success: The number of distinct colors detected is at least sample count+1');
    	    testPassedOptions('Passed', true);
    		return tcuTestCase.IterateResult.STOP;
    	}
    };

    /**
    * @extends {es3fMultisampleTests.NumSamplesCase}
    * @constructor
    * @param {string} name
    * @param {string} desc
    * @param {numFboSamples=} numFboSamples
    */
    es3fMultisampleTests.PolygonNumSamplesCase = function(name, desc, numFboSamples) {
        numFboSamples = numFboSamples === undefined ? 0 : numFboSamples;
        /** @type {es3fMultisampleTests.FboParams} */
        var params = numFboSamples >= 0 ? new FboParams(numFboSamples, false, false) : new FboParams();
        es3fMultisampleTests.NumSamplesCase.call(this, name, desc, params);
    };

    es3fMultisampleTests.PolygonNumSamplesCase.prototype = Object.create(es3fMultisampleTests.NumSamplesCase.prototype);

    /** Copy the constructor */
    es3fMultisampleTests.PolygonNumSamplesCase.prototype.constructor = es3fMultisampleTests.PolygonNumSamplesCase;

    es3fMultisampleTests.PolygonNumSamplesCase.prototype.renderPattern = function() {
        // The test pattern consists of several triangles with edges at different angles.

    	/** @type {number} */ var numTriangles = 25;
    	for (var i = 0; i < numTriangles; i++) {
            /** @type {number} */ var angle0 = 2.0 * Math.PI * i / numTriangles + 0.001 * this.m_currentIteration;
            /** @type {number} */ var angle1 = 2.0 * Math.PI * (i + 0.5) / numTriangles + 0.001 * this.m_currentIteration;

    		this.renderTriangle_pAsVec2WithColor(
                [0.0, 0.0],
    			[Math.cos(angle0) * 0.95, Math.sin(angle0) * 0.95],
    			[Math.cos(angle1) * 0.95, Math.sin(angle1) * 0.95],
    			[1.0, 1.0, 1.0, 1.0]);
    	}
    };

    /**
    * @extends {es3fMultisampleTests.NumSamplesCase}
    * @constructor
    * @param {string} name
    * @param {string} desc
    * @param {numFboSamples=} numFboSamples
    */
    es3fMultisampleTests.LineNumSamplesCase = function(name, desc, numFboSamples) {
        numFboSamples = numFboSamples === undefined ? 0 : numFboSamples;
        /** @type {es3fMultisampleTests.FboParams} */
        var params = numFboSamples >= 0 ? new FboParams(numFboSamples, false, false) : new FboParams();
        es3fMultisampleTests.NumSamplesCase.call(this, name, desc, params);
    };

    es3fMultisampleTests.LineNumSamplesCase.prototype = Object.create(es3fMultisampleTests.NumSamplesCase.prototype);

    /** Copy the constructor */
    es3fMultisampleTests.LineNumSamplesCase.prototype.constructor = es3fMultisampleTests.LineNumSamplesCase;

    es3fMultisampleTests.LineNumSamplesCase.prototype.renderPattern = function() {
        // The test pattern consists of several lines at different angles.

        // We scale the number of lines based on the viewport size. This is because a gl line's thickness is
        // constant in pixel units, i.e. they get relatively thicker as viewport size decreases. Thus we must
        // decrease the number of lines in order to decrease the extent of overlap among the lines in the
        // center of the pattern.
        /** @type {number} */ var numLines = Math.floor(100.0 * Math.sqrt(this.m_viewportSize / 256.0));

        for (int i = 0; i < numLines; i++) {
            /** @type {number} */ var angle = 2.0 * Math.PI * i / numLines + 0.001 * this.m_currentIteration;
            this.renderLine([0.0, 0.0], [Math.cos(angle) * 0.95, Math.sin(angle) * 0.95], [1.0, 1.0, 1.0, 1.0]);
        }
    };

    /**
     * Case testing behaviour of common edges when multisampling.
     *
     * Draws a number of test patterns, each with a number of quads, each made
     * of two triangles, rotated at different angles. The inner edge inside the
     * quad (i.e. the common edge of the two triangles) still should not be
     * visible, despite multisampling - i.e. the two triangles forming the quad
     * should never get any common coverage bits in any pixel.
     *
     * @extends {es3fMultisampleTests.MultisampleCase}
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {es3fMultisampleTests.CaseType} caseType
     * @param {number} numFboSamples
     */
    es3fMultisampleTests.CommonEdgeCase = function(name, desc, caseType, numFboSamples) {
        /** @type {number} */ var cases = caseType === es3fMultisampleTests.CommonEdgeCase.CaseType.SMALL_QUADS ? 128 : 32;
        numFboSamples = numFboSamples === undefined ? 0 : numFboSamples;
        /** @type {es3fMultisampleTests.FboParams} */
        var params = numFboSamples >= 0 ? new FboParams(numFboSamples, false, false) : new FboParams();

        es3fMultisampleTests.MultisampleCase.call(this, name, desc, cases, params);
        /** @type {number} */ var DEFAULT_SMALL_QUADS_ITERATIONS = 16;
        /** @type {number} */ var DEFAULT_BIGGER_THAN_VIEWPORT_QUAD_ITERATIONS = 64; // 8*8
        /** @type {es3fMultisampleTests.CaseType} */ this.m_caseType = caseType;
        /** @type {number} */ this.m_currentIteration = 0;
        /** @type {number} */
        this.m_numIterations = caseType === es3fMultisampleTests.CommonEdgeCase.CaseType.SMALL_QUADS ? es3fMultisampleTests.getIterationCount(DEFAULT_SMALL_QUADS_ITERATIONS) :
                               caseType === es3fMultisampleTests.CommonEdgeCase.CaseType.BIGGER_THAN_VIEWPORT_QUAD ? es3fMultisampleTests.getIterationCount(DEFAULT_BIGGER_THAN_VIEWPORT_QUAD_ITERATIONS) :
                               8;
    };

    es3fMultisampleTests.CommonEdgeCase.prototype = Object.create(es3fMultisampleTests.MultisampleCase.prototype);

    /** Copy the constructor */
    es3fMultisampleTests.CommonEdgeCase.prototype.constructor = es3fMultisampleTests.CommonEdgeCase;

    /**
     * @enum {number}
     */
    es3fMultisampleTests.CommonEdgeCase.CaseType = {
        SMALL_QUADS: 0,				  //!< Draw several small quads per iteration.
        BIGGER_THAN_VIEWPORT_QUAD: 1, //!< Draw one bigger-than-viewport quad per iteration.
        FIT_VIEWPORT_QUAD: 2		  //!< Draw one exactly viewport-sized, axis aligned quad per iteration.
    };

    es3fMultisampleTests.CommonEdgeCase.prototype.init = function() {
        es3fMultisampleTests.MultisampleCase.prototype.init.call(this);

    	if (this.m_caseType === es3fMultisampleTests.CommonEdgeCase.CaseType.SMALL_QUADS) {
    		// Check for a big enough viewport. With too small viewports the test case can't analyze the resulting image well enough.

            /** @type {number} */ var minViewportSize = 32;

    		if (this.m_viewportSize < minViewportSize)
    			throw new Error('Render target width or height too low (is ' + this.m_viewportSize + ', should be at least ' + minViewportSize + ')');
    	}

    	gl.enable(gl.BLEND);
    	gl.blendEquation(gl.FUNC_ADD);
    	gl.blendFunc(gl.ONE, gl.ONE);
    	bufferedLogToConsole('Additive blending enabled in order to detect (erroneously) overlapping samples');
    };

    /**
     * @return {tcuTestCase.IterateResult}
     */
    es3fMultisampleTests.CommonEdgeCase.prototype.iterate = function() {
    	var log = bufferedLogToConsole;
    	/** @type {tcuSurface.Surface} */ var renderedImg = new tcuSurface.Suface(this.m_viewportSize, this.m_viewportSize);
    	/** @type {tcuSurface.Surface} */ var errorImg = new tcuSurface.Suface(this.m_viewportSize, this.m_viewportSize);


    	this.randomizeViewport();

    	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    	gl.clear(gl.COLOR_BUFFER_BIT);

    	// Draw test pattern. Test patterns consist of quads formed with two triangles.
    	// After drawing the pattern, we check that the interior pixels of each quad are
    	// all the same color - this is meant to verify that there are no artifacts on the inner edge.

    	/** @type {Array<es3fMultisampleTests.QuadCorners>} */ var unicoloredRegions;

        /** @type {Array<Array<number>>} */ var corners;

    	if (this.m_caseType == es3fMultisampleTests.CommonEdgeCase.CaseType.SMALL_QUADS) {
    		// Draw several quads, rotated at different angles.

    		/** @type {number} */ var quadDiagLen = 2.0 / 3.0 * 0.9; // \note Fit 3 quads in both x and y directions.
    		/** @type {number} */ var angleCos;
    		/** @type {number} */ var angleSin;

    		// \note First and second iteration get exact 0 (and 90, 180, 270) and 45 (and 135, 225, 315) angle quads, as they are kind of a special case.

    		if (this.m_currentIteration === 0) {
    			angleCos = 1.0;
    			angleSin = 0.0;
    		}
    		else if (this.m_currentIteration === 1) {
    			angleCos = Math.SQRT1_2;
    			angleSin = Math.SQRT1_2;
    		}
    		else {
                /** @type {number} */ var angle = 0.5 * Math.PI * (this.m_currentIteration - 1) / (this.m_numIterations - 1);
    			angleCos = Math.cos(angle);
    			angleSin = Math.sin(angle);
    		}

    		/** @type{Array<Array<number>>} */ var corners = [
    			deMath.scale([angleCos, angleSin], 0.5 * quadDiagLen),
    			deMath.scale([-angleSin, angleCos], 0.5 * quadDiagLen),
    			deMath.scale([-angleCos, -angleSin], 0.5 * quadDiagLen),
    			deMath.scale([angleSin, -angleCos], 0.5 * quadDiagLen)
    		];

    		// Draw 8 quads.
    		// First four are rotated at angles angle+0, angle+90, angle+180 and angle+270.
    		// Last four are rotated the same angles as the first four, but the ordering of the last triangle's vertices is reversed.

    		for (var quadNdx = 0; quadNdx < 8; quadNdx++) {
    			/** @type {Array<number>} */
                var center = deMath.addScalarToVector(
                    deMath.scale([quadNdx % 3, quadNdx / 3], (2.0 - quadDiagLen)/ 2.0),
                    (-0.5 * (2.0 - quadDiagLen)));

    			this.renderTriangle_pAsVec2WithColor(
                    deMath.add(corners[(0 + quadNdx) % 4], center),
    				deMath.add(corners[(1 + quadNdx) % 4], center),
    				deMath.add(corners[(2 + quadNdx) % 4], center),
    				[0.5, 0.5, 0.5, 1.0]);

    			if (quadNdx >= 4) {
    				this.renderTriangle(
                        deMath.add(corners[(3 + quadNdx) % 4], center),
    					deMath.add(corners[(2 + quadNdx) % 4], center),
    					deMath.add(corners[(0 + quadNdx) % 4], center),
                        [0.5, 0.5, 0.5, 1.0]);
    			}
    			else {
                    this.renderTriangle(
                        deMath.add(corners[(0 + quadNdx) % 4], center),
    					deMath.add(corners[(2 + quadNdx) % 4], center),
    					deMath.add(corners[(3 + quadNdx) % 4], center),
                        [0.5, 0.5, 0.5, 1.0]);
    			}

    			// The size of the "interior" of a quad is assumed to be approximately unicolorRegionScale*<actual size of quad>.
    			// By "interior" we here mean the region of non-boundary pixels of the rendered quad for which we can safely assume
    			// that it has all coverage bits set to 1, for every pixel.
                /** @type {number} */ var unicolorRegionScale = 1.0 - 6.0 * 2.0 / this.m_viewportSize / quadDiagLen;
    			unicoloredRegions.push(
                    new es3fMultisampleTests.QuadCorners(
                        deMath.add(center, deMath.scale(corners[0], unicolorRegionScale)),
    					deMath.add(center, deMath.scale(corners[1], unicolorRegionScale)),
    					deMath.add(center, deMath.scale(corners[2], unicolorRegionScale)),
    					deMath.add(center, deMath.scale(corners[3], unicolorRegionScale))));
    		}
    	}
    	else if (this.m_caseType === es3fMultisampleTests.CaseType.BIGGER_THAN_VIEWPORT_QUAD) {
    		// Draw a bigger-than-viewport quad, rotated at an angle depending on m_currentIteration.

            /** @type {number} */ var quadBaseAngleNdx = this.m_currentIteration / 8;
            /** @type {number} */ var quadSubAngleNdx = this.m_currentIteration % 8;
            /** @type {number} */ var angleCos;
            /** @type {number} */ var angleSin;

    		if (quadBaseAngleNdx === 0) {
    			angleCos = 1.0;
    			angleSin = 0.0;
    		}
    		else if (quadBaseAngleNdx === 1) {
    			angleCos = Math.SQRT1_2;
    			angleSin = Math.SQRT1_2;
    		}
    		else {
                /** @type {number} */ var angle = 0.5 * Math.PI * (this.m_currentIteration - 1) / (this.m_numIterations - 1);
    			angleCos = Math.cos(angle);
    			angleSin = Math.sin(angle);
    		}

            /** @type {number} */ var quadDiagLen = 2.5 / Math.max(angleCos, angleSin);

            corners = [
    			deMath.scale([angleCos, angleSin], 0.5 * quadDiagLen),
    			deMath.scale([-angleSin, angleCos], 0.5 * quadDiagLen),
    			deMath.scale([-angleCos, -angleSin], 0.5 * quadDiagLen),
    			deMath.scale([angleSin, -angleCos], 0.5 * quadDiagLen)
    		];

            es3fMultisampleTests.renderTriangle_pAsVec2WithColor(
                corners[(0 + quadSubAngleNdx) % 4],
    			corners[(1 + quadSubAngleNdx) % 4],
    			corners[(2 + quadSubAngleNdx) % 4],
    			[0.5, 0.5, 0.5, 1.0]);

    		if (quadSubAngleNdx >= 4) {
                es3fMultisampleTests.renderTriangle_pAsVec2WithColor(
                    corners[(3 + quadSubAngleNdx) % 4],
    				corners[(2 + quadSubAngleNdx) % 4],
    				corners[(0 + quadSubAngleNdx) % 4],
    				[0.5, 0.5, 0.5, 1.0]);
    		}
    		else {
                es3fMultisampleTests.renderTriangle_pAsVec2WithColor(
                    corners[(0 + quadSubAngleNdx) % 4],
    				corners[(2 + quadSubAngleNdx) % 4],
    				corners[(3 + quadSubAngleNdx) % 4],
    				[0.5, 0.5, 0.5, 1.0]);
    		}

            /** @type {number} */ var unicolorRegionScale = 1.0 - 6.0 * 2.0 / this.m_viewportSize / quadDiagLen;
    		unicoloredRegions.push(
                new es3fMultisampleTests.QuadCorners(
                    deMath.scale(corners[0], unicolorRegionScale),
    				deMath.scale(corners[1], unicolorRegionScale),
    				deMath.scale(corners[2], unicolorRegionScale),
    				deMath.scale(corners[3], unicolorRegionScale)));
    	}
    	else if (this.m_caseType === es3fMultisampleTests.CaseType.FIT_VIEWPORT_QUAD) {
    		// Draw an exactly viewport-sized quad, rotated by multiples of 90 degrees angle depending on m_currentIteration.

            /** @type {number} */ var quadSubAngleNdx = this.m_currentIteration % 8;

    		corners = [
    			[1.0, 1.0],
    			[-1.0, 1.0],
    			[-1.0, -1.0],
    			[1.0, -1.0]
            ];

            es3fMultisampleTests.renderTriangle_pAsVec2WithColor(
                corners[(0 + quadSubAngleNdx) % 4],
    			corners[(1 + quadSubAngleNdx) % 4],
    			corners[(2 + quadSubAngleNdx) % 4],
    			[0.5, 0.5, 0.5, 1.0]);

    		if (quadSubAngleNdx >= 4) {
                es3fMultisampleTests.renderTriangle_pAsVec2WithColor(
                    corners[(3 + quadSubAngleNdx) % 4],
    				corners[(2 + quadSubAngleNdx) % 4],
    				corners[(0 + quadSubAngleNdx) % 4],
    				[0.5, 0.5, 0.5, 1.0]);
    		}
    		else {
                es3fMultisampleTests.renderTriangle_pAsVec2WithColor(
                    corners[(0 + quadSubAngleNdx) % 4],
    				corners[(2 + quadSubAngleNdx) % 4],
    				corners[(3 + quadSubAngleNdx) % 4],
    				[0.5, 0.5, 0.5, 1.0]);
    		}

    		unicoloredRegions.push(new es3fMultisampleTests.QuadCorners(corners[0], corners[1], corners[2], corners[3]));
    	}
    	else
    		throw new Error('CaseType not supported.');

    	// Read pixels and check unicolored regions.

        renderedImg = this.readImage();

        errorImg.getAccess().clear([0.0, 1.0, 0.0, 1.0]);

    	//log << TestLog::Image("RenderedImage", "Rendered image", renderedImg, QP_IMAGE_COMPRESSION_MODE_PNG);

    	/** @type {boolean} */ var errorsDetected = false;
    	for (var i = 0; i < (int)unicoloredRegions.length; i++) {
            /** @type {es3fMultisampleTests.QuadCorners} */ var region = unicoloredRegions[i];
    		/** @type {Array<number>} */ var p0Win = deMath.scale(deMath.addScalarToVector(region.p0, 1.0), 0.5 * (this.m_viewportSize - 1) + 0.5);
    		/** @type {Array<number>} */ var p1Win = deMath.scale(deMath.addScalarToVector(region.p1, 1.0), 0.5 * (this.m_viewportSize - 1) + 0.5);
    		/** @type {Array<number>} */ var p2Win = deMath.scale(deMath.addScalarToVector(region.p2, 1.0), 0.5 * (this.m_viewportSize - 1) + 0.5);
    		/** @type {Array<number>} */ var p3Win = deMath.scale(deMath.addScalarToVector(region.p3, 1.0), 0.5 * (this.m_viewportSize - 1) + 0.5);
            /** @type {boolean} */ var errorsInCurrentRegion = !es3fMultisampleTests.isPixelRegionUnicolored(renderedImg, p0Win, p1Win, p2Win, p3Win);

    		if (errorsInCurrentRegion)
                es3fMultisampleTests.drawUnicolorTestErrors(renderedImg, errorImg.getAccess(), p0Win, p1Win, p2Win, p3Win);

    		errorsDetected = errorsDetected || errorsInCurrentRegion;
    	}

    	this.m_currentIteration++;

    	if (errorsDetected) {
    		log('Failure: Not all quad interiors seem unicolored - common-edge artifacts?');
    		log('Erroneous pixels are drawn red in the following image');
    		// log << TestLog::Image("RenderedImageWithErrors",	"Rendered image with errors marked",	renderedImg,	QP_IMAGE_COMPRESSION_MODE_PNG);
    		// log << TestLog::Image("ErrorsOnly",					"Image with error pixels only",			errorImg,		QP_IMAGE_COMPRESSION_MODE_PNG);
            testFailedOptions('Failed: ' + (this.m_currentIteration - 1), false);
            return tcuTestCase.IterateResult.STOP;
    	}
    	else if (m_currentIteration < m_numIterations) {
    		log('Quads seem OK - moving on to next pattern');
            return tcuTestCase.IterateResult.CONTINUE;
    	}
    	else {
    		log('Success: All quad interiors seem unicolored (no common-edge artifacts)');
            testPassedOptions('Passed: ' + (this.m_currentIteration - 1), true);
            return tcuTestCase.IterateResult.STOP;
    	}
    };

    /**
     * Test that depth values are per-sample.
     *
     * Draws intersecting, differently-colored polygons and checks that there
     * are at least sample count+1 distinct colors present, due to some of the
     * samples at the intersection line belonging to one and some to another
     * polygon.
     *
     * @extends {es3fMultisampleTests.NumSamplesCase}
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {numFboSamples=} numFboSamples
     */
    es3fMultisampleTests.SampleDepthCase = function(name, desc, numFboSamples) {
        numFboSamples = numFboSamples === undefined ? 0 : numFboSamples;
        /** @type {es3fMultisampleTests.FboParams} */
        var params = numFboSamples >= 0 ? new FboParams(numFboSamples, true, false) : new FboParams();
        es3fMultisampleTests.NumSamplesCase.call(this, name, desc, params);
    };

    es3fMultisampleTests.SampleDepthCase.prototype = Object.create(es3fMultisampleTests.NumSamplesCase.prototype);

    /** Copy the constructor */
    es3fMultisampleTests.SampleDepthCase.prototype.constructor = es3fMultisampleTests.SampleDepthCase;

    es3fMultisampleTests.SampleDepthCase.prototype.init = function() {
        es3fMultisampleTests.MultisampleCase.prototype.init.call(this);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);

        bufferedLogToConsole('Depth test enabled, depth func is gl.LESS');
        bufferedLogToConsole('Drawing several bigger-than-viewport black or white polygons intersecting each other');
    };

    es3fMultisampleTests.SampleDepthCase.prototype.renderPattern = function() {
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
    	gl.clearDepthf(1.0);
    	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		/** @type {number} */ var numPolygons = 50;

		for (var i = 0; i < numPolygons; i++) {
            /** @type {Array<number>} */ var color = i % 2 == 0 ? [1.0, 1.0, 1.0, 1.0] : [0.0, 0.0, 0.0, 1.0];
            /** @type {number} */ var angle = 2.0 * Math.PI * i / numPolygons + 0.001f * this.m_currentIteration;
            /** @type {Array<number>} */ var pt0 = [3.0 * Math.cos(angle + 2.0 * Math.PI * 0.0 / 3.0), 3.0 * Math.sin(angle + 2.0 * Math.PI * 0.0 / 3.0), 1.0];
            /** @type {Array<number>} */ var pt1 = [3.0 * Math.cos(angle + 2.0 * Math.PI * 1.0 / 3.0), 3.0 * Math.sin(angle + 2.0 * Math.PI * 1.0 / 3.0), 0.0];
            /** @type {Array<number>} */ var pt2 = [3.0 * Math.cos(angle + 2.0 * Math.PI * 2.0 / 3.0), 3.0 * Math.sin(angle + 2.0 * Math.PI * 2.0 / 3.0), 0.0];

            es3fMultisampleTests.renderTriangle_pAsVec3WithColor(pt0, pt1, pt2, color);
		}
    };

    /**
     * Test that stencil buffer values are per-sample.
     *
     * Draws a unicolored pattern and marks drawn samples in stencil buffer;
     * then clears and draws a viewport-size quad with that color and with
     * proper stencil test such that the resulting image should be exactly the
     * same as after the pattern was first drawn.
     *
     * @extends {es3fMultisampleTests.MultisampleCase}
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {number=} numFboSamples
     */
    es3fMultisampleTests.SampleStencilCase = function(name, desc, numFboSamples) {
        numFboSamples = numFboSamples === undefined ? 0 : numFboSamples;
        /** @type {es3fMultisampleTests.FboParams} */
        var params = numFboSamples >= 0 ? new FboParams(numFboSamples, false, true) : new FboParams();
        es3fMultisampleTests.MultisampleCase.call(this, name, desc, 256, params);
    };

    es3fMultisampleTests.SampleStencilCase.prototype = Object.create(es3fMultisampleTests.MultisampleCase.prototype);

    /** Copy the constructor */
    es3fMultisampleTests.SampleStencilCase.prototype.constructor = es3fMultisampleTests.SampleStencilCase;

    /**
     * @return {tcuTestCase.IterateResult}
     */
    es3fMultisampleTests.SampleStencilCase.prototype.iterate = function() {
        var log = bufferedLogToConsole;
    	/** @type {tcuSurface.Surface} */ var renderedImgFirst = new tcuSurface.Surface(this.m_viewportSize, this.m_viewportSize);
    	/** @type {tcuSurface.Surface} */ var renderedImgSecond = new tcuSurface.Surface(this.m_viewportSize, this.m_viewportSize);

    	this.randomizeViewport();

    	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    	gl.clearStencil(0);
    	gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    	gl.enable(gl.STENCIL_TEST);
    	gl.stencilFunc(gl.ALWAYS, 1, 1);
    	gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);

    	log('Drawing a pattern with gl.stencilFunc(gl.ALWAYS, 1, 1) and gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE)');

		/** @type {number} */ var numTriangles = 25;
		for (var i = 0; i < numTriangles; i++) {
            /** @type {number} */ var angle0 = 2.0 * Math.PI * i / numTriangles;
            /** @type {number} */ var angle1 = 2.0 * Math.PI * (i + 0.5) / numTriangles;

            es3fMultisampleTests.renderTriangle_pAsVec2WithColor(
                [0.0, 0.0],
				[Math.cos(angle0) * 0.95, Math.sin(angle0) * 0.95],
				[Math.cos(angle1) * 0.95, Math.sin(angle1) * 0.95],
				[1.0, 1.0, 1.0, 1.0]);
		}

        renderedImgFirst = this.readImage();
    	// log << TestLog::Image("RenderedImgFirst", "First image rendered", renderedImgFirst, QP_IMAGE_COMPRESSION_MODE_PNG);

    	log('Clearing color buffer to black');

    	gl.clear(gl.COLOR_BUFFER_BIT);
    	gl.stencilFunc(gl.EQUAL, 1, 1);
    	gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

		log('Checking that color buffer was actually cleared to black');

		/** @type {tcuSurface.Surface} */ var clearedImg = new tcuSurface.Surface(this.m_viewportSize, this.m_viewportSize);
        clearedImg = this.readImage();

		for (var y = 0; y < clearedImg.getHeight(); y++)
		for (var x = 0; x < clearedImg.getWidth(); x++) {
			/** @type {tcuRGBA.RGBA} */ var clr = new tcuRGBA.RGBA(clearedImg.getPixel(x, y));
			if (!clr.equals(tcuRGBA.RGBA.black)) {
				log('Failure: first non-black pixel, color ' + clr.toString() + ', detected at coordinates (' + x + ', ' + y + ')');
				//log << TestLog::Image('ClearedImg', 'Image after clearing, erroneously non-black', clearedImg);
                testFailedOptions("Failed", false);
				return tcuTestCase.IterateResult.STOP;
			}
		}

    	log('Drawing a viewport-sized quad with gl.stencilFunc(gl.EQUAL, 1, 1) and gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP) - should result in same image as the first');

        es3fMultisampleTests.renderQuad_WithColor(
            [-1.0, -1.0],
    		[1.0, -1.0],
    		[-1.0, 1.0],
    		[1.0, 1.0],
    		[1.0, 1.0, 1.0, 1.0]);

        renderedImgSecond = this.readImage();
    	// log << TestLog::Image('RenderedImgSecond', 'Second image rendered', renderedImgSecond, QP_IMAGE_COMPRESSION_MODE_PNG);
        function(imageSetName, imageSetDesc, reference, result, threshold, logMode)
    	/** @type {boolean} */
        var passed = tcuImageCompare.pixelThresholdCompare(
    	    'ImageCompare',
    	    'Image comparison',
    	    renderedImgFirst,
    	    renderedImgSecond,
    	    [0,0,0,0]);

    	if (passed) {
    		log('Success: The two images rendered are identical');
            testPassedOptions('Passed', true);
        }
        else
            testFailedOptions('Failed', false);

    	return tcuTestCase.IterateResult.STOP;
    };

    /**
     * Tests coverage mask generation proportionality property.
     *
     * Tests that the number of coverage bits in a coverage mask created by
     * GL_SAMPLE_ALPHA_TO_COVERAGE or GL_SAMPLE_COVERAGE is, on average,
     * proportional to the alpha or coverage value, respectively. Draws
     * multiple frames, each time increasing the alpha or coverage value used,
     * and checks that the average color is changing appropriately.
     *
     * @extends {es3fMultisampleTests.MultisampleCase}
     * @constructor
     * @param {string} name
     * @param {string} desc
     * @param {es3fMultisampleTests.MaskProportionalityCase.CaseType} type
     * @param {number=} numFboSamples
     */
    es3fMultisampleTests.MaskProportionalityCase = function(name, desc, type, numFboSamples) {
        numFboSamples = numFboSamples === undefined ? 0 : numFboSamples;
        /** @type {es3fMultisampleTests.FboParams} */
        var params = numFboSamples >= 0 ? new FboParams(numFboSamples, false, false) : new FboParams();
        es3fMultisampleTests.MultisampleCase.call(this, name, desc, 32, params);
        /** @type {es3fMultisampleTests.MaskProportionalityCase.CaseType} */ this.m_type = type;
        /** @type {number} */ this.m_numIterations;
        /** @type {number} */ this.m_currentIteration = 0;
        /** @type {number} */ this.m_previousIterationColorSum = -1;


    };

    es3fMultisampleTests.MaskProportionalityCase.prototype = Object.create(es3fMultisampleTests.MultisampleCase.prototype);

    /** Copy the constructor */
    es3fMultisampleTests.MaskProportionalityCase.prototype.constructor = es3fMultisampleTests.MaskProportionalityCase;

    /**
     * @enum {number}
     */
    es3fMultisampleTests.MaskProportionalityCase.CaseType = {
        ALPHA_TO_COVERAGE: 0,
        SAMPLE_COVERAGE: 1,
        SAMPLE_COVERAGE_INVERTED: 2,
    };

    es3fMultisampleTests.MaskProportionalityCase.prototype.init = function() {
        es3fMultisampleTests.MultisampleCase.prototype.init.call(this);

        if (this.m_type == es3fMultisampleTests.MaskProportionalityCase.CaseType.ALPHA_TO_COVERAGE) {
            gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
            bufferedLogToConsole('gl.SAMPLE_ALPHA_TO_COVERAGE is enabled');
        }
        else {
            assertMsgOptions(
                this.m_type == es3fMultisampleTests.MaskProportionalityCase.CaseType.SAMPLE_COVERAGE ||
                this.m_type == es3fMultisampleTests.MaskProportionalityCase.CaseType.SAMPLE_COVERAGE_INVERTED
                'CaseType should be SAMPLE_COVERAGE or SAMPLE_COVERAGE_INVERTED', false, true);

            gl.enable(gl.SAMPLE_COVERAGE);
            bufferedLogToConsole('gl.SAMPLE_COVERAGE is enabled');
        }

        this.m_numIterations = Math.max(2, es3fMultisampleTests.getIterationCount(this.m_numSamples * 5));

        this.randomizeViewport(); // \note Using the same viewport for every iteration since coverage mask may depend on window-relative pixel coordinate.
    };

    /**
     * @return {tcuTestCase.IterateResult}
     */
    es3fMultisampleTests.MaskProportionalityCase.prototype.iterate = function() {
        var log = bufferedLogToConsole;
    	/** @type {tcuSurface.Surface} */ var renderedImg = new tcuSurface.Surface(this.m_viewportSize, this.m_viewportSize);
        /** @type {number} */ var numPixels = renderedImg.getWidth() * renderedImg.getHeight();

    	log("Clearing color to black");
    	gl.colorMask(true, true, true, true);
    	gl.clearColor(0.0f, 0.0f, 0.0f, 1.0f);
    	gl.clear(gl.COLOR_BUFFER_BIT);

    	if (this.m_type === es3fMultisampleTests.MaskProportionalityCase.CaseType.ALPHA_TO_COVERAGE) {
    		gl.colorMask(true, true, true, false);
    		log("Using color mask TRUE, TRUE, TRUE, FALSE");
    	}

    	// Draw quad.

		/** @type {Array<number>} */ var pt0 = [-1.0, -1.0];
		/** @type {Array<number>} */ var pt1 = [1.0, -1.0];
		/** @type {Array<number>} */ var pt2 = [-1.0, 1.0];
		/** @type {Array<number>} */ var pt3 = [1.0, 1.0];
		/** @type {Array<number>} */ var quadColor = [1.0, 0.0, 0.0, 1.0];
        /** @type {number} */ var alphaOrCoverageValue	= this.m_currentIteration / (this.m_numIterations-1);

		if (this.m_type === es3fMultisampleTests.MaskProportionalityCase.CaseType.ALPHA_TO_COVERAGE) {
			log("Drawing a red quad using alpha value " + alphaOrCoverageValue);
			quadColor[3] = alphaOrCoverageValue;
		}
		else {
			assertMsgOptions(
                this.m_type === es3fMultisampleTests.MaskProportionalityCase.CaseType.SAMPLE_COVERAGE ||
                this.m_type === es3fMultisampleTests.MaskProportionalityCase.CaseType.SAMPLE_COVERAGE_INVERTED
                'CaeType should be SAMPLE_COVERAGE or SAMPLE_COVERAGE_INVERTED', false, true);

            /** @type {boolean} */ var isInverted = (this.m_type === es3fMultisampleTests.MaskProportionalityCase.CaseType.SAMPLE_COVERAGE_INVERTED);
            /** @type {number} */ var coverageValue	= isInverted ? 1.0 - alphaOrCoverageValue : alphaOrCoverageValue;
			log("Drawing a red quad using sample coverage value " + coverageValue + (isInverted ? " (inverted)" : ""));
			gl.sampleCoverage(coverageValue, isInverted ? true : false);
		}

		this.renderQuad_WithColor(pt0, pt1, pt2, pt3, quadColor);

    	// Read ang log image.

        renderedImg = this.readImage();

    	// log << TestLog::Image("RenderedImage", "Rendered image", renderedImg, QP_IMAGE_COMPRESSION_MODE_PNG);

    	// Compute average red component in rendered image.

        /** @type {number} */ var sumRed = 0;

    	for (var y = 0; y < renderedImg.getHeight(); y++)
    	for (var x = 0; x < renderedImg.getWidth(); x++)
    		sumRed += renderedImg.getPixel(x, y).getRed();

    	log("Average red color component: " + (sumRed / 255.0 / numPixels));

    	// Check if average color has decreased from previous frame's color.

    	if (sumRed < this.m_previousIterationColorSum) {
    		log("Failure: Current average red color component is lower than previous");
    		testFailedOptions('Failed', false);
    		return tcuTestCase.IterateResult.STOP;
    	}

    	// Check if coverage mask is not all-zeros if alpha or coverage value is 0 (or 1, if inverted).

    	if (this.m_currentIteration == 0 && sumRed != 0)
    	{
    		log("Failure: Image should be completely black");
    		testFailedOptions('Failed', false);
    		return tcuTestCase.IterateResult.STOP;
    	}

    	if (this.m_currentIteration == this.m_numIterations-1 && sumRed != 0xff*numPixels)
    	{
    		log("Failure: Image should be completely red");

    		testFailedOptions('Failed', false);
    		return tcuTestCase.IterateResult.STOP;
    	}

    	this.m_previousIterationColorSum = sumRed;

    	this.m_currentIteration++;

    	if (this.m_currentIteration >= this.m_numIterations)
    	{
    		log("Success: Number of coverage mask bits set appears to be, on average, proportional to " +
    			(this.m_type == es3fMultisampleTests.MaskProportionalityCase.CaseType.ALPHA_TO_COVERAGE ? "alpha" :
                this.m_type == es3fMultisampleTests.MaskProportionalityCase.CaseType.SAMPLE_COVERAGE ? "sample coverage value" :
                "inverted sample coverage value"));

    		testPassedOptions('Passed', true);
    		return tcuTestCase.IterateResult.STOP;
    	}
    	else
    		return tcuTestCase.IterateResult.CONTINUE;
    };

    /**
     * Run test
     * @param {WebGL2RenderingContext} context
     */
     es3fMultisampleTests.run = function(context) {
        gl = context;
        //Set up Test Root parameters
        var testName = 'multisample';
        var testDescription = 'Multisample Tests';
        var state = tcuTestCase.runner;

        state.testName = testName;
        state.setRoot(tcuTestCase.newTest(testName, testDescription, null));

        //Set up name and description of this test series.
        setCurrentTestName(testName);
        description(testDescription);

        try {
            //Create test cases
            es3fMultisampleTests.init();
            //Run test cases
            tcuTestCase.runTestCases();
        }
        catch (err) {
            testFailedOptions('Failed to es3fMultisampleTests.run tests', false);
            tcuTestCase.runner.terminate();
        }
    };

});
